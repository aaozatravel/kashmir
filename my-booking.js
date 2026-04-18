async function loadBookings(){

const { data:{user} } = await supabaseClient.auth.getUser()

if(!user){
  window.location.href="login.html"
  return
}

// 🔥 FETCH BOOKINGS
const { data, error } = await supabaseClient
.from("bookings")
.select("*")
.eq("user_email", user.email)
.order("created_at",{ascending:false})

if(error){
console.log(error)
return
}

let container = document.getElementById("bookingContainer")

// ❌ NO BOOKINGS
if(!data || data.length === 0){
container.innerHTML = `
<div class="empty">
<img src="logo.jpg">
<h2>No Bookings Yet</h2>
<p>You haven't booked any tour yet.</p>
<a href="tour.html">Explore Tours</a>
</div>
`
return
}

let html = ""

// 🔁 LOOP BOOKINGS
for(const b of data){

// 🔐 SAFE PARSE
let parsed = {}
let extra = {}

try{
parsed = JSON.parse(b.traveller_details || "{}")
}catch(e){}

try{
extra = JSON.parse(b.extra_details || "{}")
}catch(e){}

// 📦 DATA
let travellers = parsed.travellers || []
let details = parsed.package_details || {}

let validTravellers = travellers.filter(t => Number(t.age) > 1)

// 🏨 ROOMS FIX
let singleRoom = parsed.single_room || b.single_room || 0
let doubleRoom = parsed.double_room || b.double_room || 0

// ===============================
// 👨‍✈️ GUIDE (OPTIMIZED)
// ===============================
let guideHtml = ""

if(extra.guideId){

try{

const { data: guide } = await supabaseClient
.from("guides")
.select("name,phone,photo,verified")
.eq("id", extra.guideId)
.single()

if(guide){

let badge = guide.verified === true 
? `
<span class="badge-svg">
<svg viewBox="0 0 24 24">
<path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.67-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z" fill="#1DA1F2"/>
<path d="M9.5 14.58l-2.79-2.79-1.21 1.21 4 4 8-8-1.21-1.21z" fill="#ffffff"/>
</svg>
</span>` : ""

guideHtml = `
<div class="box">
<h4>👨‍✈️ Guide</h4>
<img src="${guide.photo || 'user.png'}" class="profile">
<div class="guide-name">${guide.name} ${badge}</div>
<div class="guide-phone">📞 ${guide.phone || "-"}</div>
</div>
`
}

}catch(e){
console.log("Guide error", e)
}
}

// ===============================
// 🚗 CAB
// ===============================
let cabHtml = extra.cabName ? `
<div class="box">
<h4>🚗 Cab</h4>
${extra.cabPhoto ? `<img src="${extra.cabPhoto}" class="wide-img">` : ""}
<div>${extra.cabName}</div>
<div>${extra.cabNumber || "-"}</div>
</div>` : ""

// ===============================
// 🧑 DRIVER
// ===============================
let driverHtml = extra.driverName ? `
<div class="box">
<h4>🧑 Driver</h4>
${extra.driverPhoto ? `<img src="${extra.driverPhoto}" class="profile">` : ""}
<div>${extra.driverName}</div>
<div>📞 ${extra.driverPhone || "-"}</div>
</div>` : ""

// ===============================
// 🏨 HOTELS (SAFE)
// ===============================
let hotelsHtml = ""

if(extra.hotels && Array.isArray(extra.hotels)){

hotelsHtml = extra.hotels.map(h=>{

if(!h || (!h.name && !h.address && !h.room && !h.phone && !h.photo)){
return ""
}

return `
<div class="hotel">

${h.photo ? `<img src="${h.photo}" class="hotel-img">` : ""}

<div><b>Day ${h.day || "-"}</b></div>

${h.name ? `<div>${h.name}</div>` : ""}
${h.address ? `<div>${h.address}</div>` : ""}
${h.room ? `<div>Room: ${h.room}</div>` : ""}
${h.phone ? `<div>📞 ${h.phone}</div>` : ""}

</div>
`
}).join("")
}

let timetableHtml = ""

if(extra.timetable && Array.isArray(extra.timetable)){

timetableHtml = extra.timetable.map(d=>{

// 🔥 CHECK COMPLETED FROM GUIDE UPDATES
let done = false

if(b.guide_updates){
let upd = {}

try{
upd = typeof b.guide_updates === "string"
? JSON.parse(b.guide_updates)
: b.guide_updates
}catch(e){}

// 🔥 IMPORTANT FIX (progress inside)
if(upd.progress){
done = upd.progress["day_"+d.day]
}
}

// 🔥 SAFE TASKS
let tasks = []

if(Array.isArray(d.tasks)){
tasks = d.tasks
}else if(typeof d.tasks === "string"){
tasks = d.tasks.split(",")
}

tasks = tasks.map(t=>t.trim()).filter(t=>t !== "")

// 🔥 FINAL UI
return `
<div class="day-box ${done ? "done" : ""}">

<h4>📅 Day ${d.day || "-"}</h4>

${d.title ? `<div><b>${d.title}</b></div>` : ""}

${d.time ? `<div>⏰ ${d.time}</div>` : ""}

${tasks.length ? `
<div style="margin-top:5px">
${tasks.map(t=>`<div>• ${t}</div>`).join("")}
</div>` : ""}

${done ? `<div style="color:red;font-weight:bold;margin-top:5px">✔ Day Completed</div>` : ""}

</div>
`
}).join("")
}


// ===============================
// 📢 GUIDE UPDATES (NEW 🔥)
// ===============================
let updateHtml = ""

if(b.guide_updates){

let upd = {}

try{
upd = typeof b.guide_updates === "string" 
? JSON.parse(b.guide_updates) 
: b.guide_updates
}catch(e){}

if(upd.note){
updateHtml = `
<div class="box">
<h4>📢 Guide Update</h4>
<div><b>Status:</b> ${upd.status || "-"}</div>
<div>${upd.note}</div>
<small>${upd.time || ""}</small>
</div>
`
}
}

// ===============================
// 🎯 FINAL CARD
// ===============================
html += `
<div class="card">

<h2>${b.package_name}</h2>
<div class="status">Status: ${b.status}</div>

<div class="section-title">📍 Places</div>
<div>${(details.places || []).join(", ")}</div>

<div class="section-title">🎯 Activities</div>
<div>${(details.activities || []).join(", ")}</div>

<div class="section-title">🚗 Services</div>
<div>${(details.services || []).join(", ")}</div>

<div class="section-title">📸 Media</div>
<div>${(details.media || []).join(", ")}</div>

<div class="section-title">👤 Travellers</div>

${validTravellers.map(t=>`
<div class="traveller">
<div>${t.name}</div>
<div>${t.gender}</div>
<div>${t.age} yrs</div>
<div>${t.phone || "-"}</div>
<div>₹${b.package_price}</div>
</div>
`).join("")}

<div class="section-title">🏨 Rooms</div>
<div>Single: ${singleRoom}</div>
<div>Double: ${doubleRoom}</div>

${guideHtml}
${cabHtml}
${driverHtml}

${hotelsHtml ? `<div class="section-title">🏨 Hotels</div>${hotelsHtml}` : ""}
${timetableHtml ? `<div class="section-title">📅 Timetable</div>${timetableHtml}` : ""}

${updateHtml}

<div class="total">Grand Total ₹${b.total_price}</div>

</div>
`
}

container.innerHTML = html
}

loadBookings()