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

for (const b of data){
let admin = b.admin_details || {}
let status = b.status || "pending"
let guidePhoto = ""
let guidePhone = ""
let guideName = ""

if(admin.guide){
const { data: guideData } = await supabaseClient
.from("guides")
.select("*")
.eq("email", admin.guide)
.single()

if(guideData){
guidePhoto = guideData.photo || ""
guidePhone = guideData.phone || ""
guideName = guideData.name || admin.guide
}
}
if(status === "accepted") status = "assigned"
let parsed = {}
try{
parsed = JSON.parse(b.traveller_details || "{}")
}catch(e){}

let travellers = parsed.travellers || []
let activities = parsed.activities || []
let gondola = parsed.gondola || []
let places = parsed.places || []

let adults = parsed.adults || 0
let child = parsed.child || 0
let travellersCount = adults + child

let gondolaPrice = parsed.gondola_price || 0
let activitiesTotal = (activities || [])
.reduce((t,a)=> t + Number(a.price || 0),0)

/* correct places calculation */
let placesTotal = 0
places.forEach(p=>{
let price = Number(p.total || 0)
placesTotal += price
})

/* departure price */
let departurePrice =
Number(String(parsed.selectedPrice || parsed.departure_price || 0)
.replace(/[₹,]/g,""))

let singleRoom = parsed.single_room || 0
let doubleRoom = parsed.double_room || 0

let singleTotal = singleRoom * 6999
let doubleTotal = doubleRoom * 8999

let baseTotal =
Number(gondolaPrice) +
Number(placesTotal) +
Number(departurePrice) +
Number(activitiesTotal)

let grandTotal = 0

/* travellers table */
let travellersHtml = ""

travellers.forEach(t=>{

let price = baseTotal
let phone = t.phone || "Not required"

if(t.age <= 1) return  // ignore infant

grandTotal += price

travellersHtml += `
<tr>
<td>${t.name}</td>
<td>${t.age}</td>
<td>${t.gender}</td>
<td>${phone}</td>
<td>₹ ${price}</td>
</tr>
`
})

/* accommodation */
let accommodationTotal = singleTotal + doubleTotal
grandTotal += accommodationTotal

/* day wise hotel */
let hotelDaysHtml = "-"
let hotelDays = b.hotel_days || []

if(typeof hotelDays === "string"){
try{ hotelDays = JSON.parse(hotelDays) }catch(e){}
}

if(Array.isArray(hotelDays)){
hotelDaysHtml = ""
hotelDays.forEach(d=>{
hotelDaysHtml += `
<div>
<b>${d.day}</b> - ${d.hotel} - Room ${d.room} - ${d.contact}
</div>
`
})
}

html += `
<div class="booking-card">

<img src="${b.package_image}" class="booking-img">

<h2>${b.tour_name}</h2>

<div class="status status-${status}">
Status: ${status}
</div>

<table class="trip-table">
<tr><th colspan="2">Trip Details</th></tr>
<tr><td>Activities</td><td>
${activities.map(a=>`${a.name} ₹${a.price}`).join(", ")}
<br><b>Total:</b> ₹${activitiesTotal}
</td></tr>
<tr><td>Gondola</td><td>${gondola.join(", ")} - ₹${gondolaPrice}</td></tr>
<tr><td>Places</td><td>
${places.map(p=>`${p.name} ₹${p.price}`).join(", ")}
<br><b>Total:</b> ₹${placesTotal}
</td></tr>
<tr><td>Departure</td><td>
${parsed.departure || "-"} - ₹${departurePrice}
</td></tr>
<tr><td>Subtotal</td><td>₹ ${baseTotal}</td></tr>
</table>

<h3>Travellers</h3>
<table class="traveller-table">
<tr>
<th>Name</th>
<th>Age</th>
<th>Gender</th>
<th>Phone</th>
<th>Price</th>
</tr>
${travellersHtml}
</table>

<h3>Accommodation</h3>
<div>
Single Bedroom x ${singleRoom} = ₹ ${singleTotal}<br>
Double Bedroom x ${doubleRoom} = ₹ ${doubleTotal}
</div>

<h3>Guide</h3>  
<div>  
<img src="${guidePhoto}" style="width:120px"><br>
${guideName || "Pending"}<br>
${guidePhone || "-"}<br>
${admin.guide || "-"}
</div>

<h3>Cab</h3>  
<div>  
Cab: ${admin.cab_name || "-"}<br>
Cab Number: ${admin.cab_number || "-"}<br>  
Driver: ${admin.driver_name || "-"}<br>  
Phone: ${admin.driver_phone || "-"}<br>  
<img src="${admin.cab_photo || ""}" style="width:100%"><br>  
<img src="${admin.driver_photo || ""}" style="width:120px">  
</div>

<h3>Day Wise Hotel</h3>

<div>
<b>Day1</b><br>
<img src="${admin.hotel1_photo || ""}" style="width:100%"><br>
${admin.hotel1 || "-"}<br>
${admin.hotel1_address || "-"}<br>
${admin.hotel1_contact || "-"}<br>
Room: ${admin.hotel1_room || "-"}
</div><br>

<div>
<b>Day2</b><br>
<img src="${admin.hotel2_photo || ""}" style="width:100%"><br>
${admin.hotel2 || "-"}<br>
${admin.hotel2_address || "-"}<br>
${admin.hotel2_contact || "-"}<br>
Room: ${admin.hotel2_room || "-"}
</div><br>

<div>
<b>Day3</b><br>
<img src="${admin.hotel3_photo || ""}" style="width:100%"><br>
${admin.hotel3 || "-"}<br>
${admin.hotel3_address || "-"}<br>
${admin.hotel3_contact || "-"}<br>
Room: ${admin.hotel3_room || "-"}
</div><br>

<div>
<b>Day4</b><br>
<img src="${admin.hotel4_photo || ""}" style="width:100%"><br>
${admin.hotel4 || "-"}<br>
${admin.hotel4_address || "-"}<br>
${admin.hotel4_contact || "-"}<br>
Room: ${admin.hotel4_room || "-"}
</div><br>

<div>
<b>Day5</b><br>
<img src="${admin.hotel5_photo || ""}" style="width:100%"><br>
${admin.hotel5 || "-"}<br>
${admin.hotel5_address || "-"}<br>
${admin.hotel5_contact || "-"}<br>
Room: ${admin.hotel5_room || "-"}
</div>

<h2>Grand Total</h2>
<div class="price-box">
₹ ${grandTotal}
</div>

${status === "assigned" ? `
<button onclick="downloadInvoice('${b.id}')">
Download Invoice
</button>
` : `
<div style="margin-top:10px;padding:10px;background:#f5f5f5;border-radius:8px;text-align:center;font-weight:600">
${status === "waiting" ? "Waiting for confirmation" :
status === "rejected" ? "Booking Rejected" :
"Pending"}
</div>
`}

</div>
`
}

document.getElementById("userBookingContainer").innerHTML = html
}

function downloadInvoice(id){
localStorage.setItem("invoiceBookingId", id)
window.open("invoice.html", "_blank")
}

loadUserBookings()

supabaseClient
.channel('booking_updates')
.on(
'postgres_changes',
{ event: '*', schema: 'public', table: 'bookings' },
payload => {
loadUserBookings()
}
)
.subscribe()
