async function loadUserBookings(){

const { data: { user } } = await supabaseClient.auth.getUser()

if(!user){
window.location.href = "login.html"
return
}

const { data, error } = await supabaseClient
.from("bookings")
.select("*")
.eq("user_email", user.email)
.order("created_at",{ascending:false})

if(error){
document.getElementById("userBookingContainer").innerHTML =
"<p>Error loading bookings</p>"
return
}

let html = ""

data.forEach(b=>{

let parsed = {}
try{
parsed = JSON.parse(b.traveller_details || "{}")
}catch(e){}

let travellers = parsed.travellers || []
let total = parsed.total || 0
let activities = parsed.activities || []
let departure = parsed.departure || "-"
let adults = parsed.adults || travellers.length || 1

let gondola = parsed.gondola || []
let gondolaPrice = parsed.gondola_price || 0

let places = parsed.places || []
let placesTotal = parsed.places_total || 0

let travellerNames = travellers.map(t=>t.name).join(", ")

/* places html */
let placesHtml = "-"
if(Array.isArray(places) && places.length){
placesHtml = ""
places.forEach(p=>{

let name = p.name || p.place || "-"
let price = Number(p.price || p.cost || 0)
let travellersCount = Number(p.travellers || adults || 1)
let totalPlace = p.total || (price * travellersCount)

placesHtml += `
<p>
${name} - ₹${price} x ${travellersCount} = ₹${totalPlace}
</p>
`
})
}

/* day wise hotel */
let hotelDaysHtml = "-"

let hotelDays = b.hotel_days

if(!hotelDays){
hotelDays = []
}

// string parse
if(typeof hotelDays === "string"){
try{
hotelDays = JSON.parse(hotelDays)
}catch(e){
hotelDays = []
}
}

// object to array
if(!Array.isArray(hotelDays) && typeof hotelDays === "object"){
hotelDays = Object.values(hotelDays)
}

if(Array.isArray(hotelDays) && hotelDays.length){
hotelDaysHtml = ""

hotelDays.forEach(d=>{

let contact = d.contact || d.phone || d.mobile || "-"

hotelDaysHtml += `
<div style="border:1px solid #eee;padding:10px;margin-bottom:8px;border-radius:8px;background:#fafafa">
<div><b>${d.day || "-"}</b></div>
<div>🏨 Hotel: ${d.hotel || "-"}</div>
<div>🛏 Room: ${d.room || "-"}</div>
<div>📞 Contact: ${contact}</div>
</div>
`
})
}

html += `
<div class="booking-card">

<img src="${(b.package_image || '').replace('images/','').replace('tour-images/','')}" class="booking-img">

<div class="booking-content">

<h2 class="tour-title">${b.tour_name}</h2>

<div class="section">
<h3>Trip Details</h3>
<p><b>Month:</b> ${b.travel_month}</p>
<p><b>Departure:</b> ${departure}</p>
<p><b>Travellers:</b> ${travellerNames}</p>
<p><b>Adults:</b> ${adults}</p>
<p><b>Activities:</b> ${activities.map(a => a.name).join(", ") || "-"}</p>
<p><b>Gondola:</b> ${gondola.join(", ") || "-"}</p>
<p><b>Gondola Price:</b> ₹ ${gondolaPrice}</p>

<p><b>Places:</b></p>
${placesHtml}

<p><b>Places Price:</b> ₹ ${placesTotal}</p>

</div>

<div class="section">
<h3>Status</h3>
<p class="status status-${b.status}">
${b.status || "pending"}
</p>
</div>

<div class="section">
<h3>Guide Details</h3>
<p><b>Name:</b> ${b.guide_name || "Not Assigned"}</p>
<p><b>Phone:</b> ${b.guide_phone || "-"}</p>
<p><b>Email:</b> ${b.guide_email || "-"}</p>

${b.guide_id_card ? `
<div class="guide-id">
<img src="${b.guide_id_card}" alt="Guide ID">
</div>
` : ""}

</div>

<div class="section">
<h3>Hotel Details</h3>
<p><b>Hotel:</b> ${b.hotel_name || "Pending"}</p>
<p><b>Room No:</b> ${b.room_number || "-"}</p>
<p><b>Hotel Contact:</b> ${b.hotel_contact || "-"}</p>
</div>

<div class="section">
<h3>Day Wise Hotel</h3>
${hotelDaysHtml}
</div>

<div class="price-box">
₹ ${total}
</div>

<div class="invoice-btn">
<button onclick="downloadInvoice('${b.id}')">
📄 Download Invoice
</button>
</div>

</div>
</div>
`
})

document.getElementById("userBookingContainer").innerHTML = html

}

/* invoice function */
function downloadInvoice(id){
localStorage.setItem("invoiceBookingId", id)
window.open("invoice.html", "_blank")
}
