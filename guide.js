let bookingId = null
let tempProgress = {}

// ===============================
// 🔥 INIT
// ===============================
async function loadGuideBooking(){

const guide = JSON.parse(localStorage.getItem("guide"))

if(!guide){
window.location.href = "account.html"
return
}

// 🔥 GET BOOKINGS
const { data } = await supabaseClient
.from("bookings")
.select("*")
.order("created_at",{ascending:false})

let found = null

for(const b of data){

let extra = {}

try{
extra = JSON.parse(b.extra_details || "{}")
}catch(e){}

// ✅ MATCH
if(extra.guideId === guide.id){
found = b
break
}
}

if(!found){

// 🎯 SHOW ONLY GUIDE CARD
document.getElementById("bookingBox").innerHTML = `

<div class="card">

<img src="${guide.photo || 'user.png'}" class="avatar">

<div class="name">
${guide.name}

${guide.verified ? `
<span class="tick">
<svg viewBox="0 0 24 24" width="18">
<path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.67-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z" fill="#1DA1F2"/>
<path d="M9.5 14.58l-2.79-2.79-1.21 1.21 4 4 8-8-1.21-1.21z" fill="#fff"/>
</svg>
</span>` : ""}

</div>

<div class="role">Guide</div>
<div class="exp">${guide.experience || "5+ Years Experience"}</div>
<div class="rating-number">⭐ ${guide.rating || "4.5"}</div>

<div class="badge">No Trip Assigned</div>

</div>

<div class="box">
<h3>🚫 No Trip Assigned</h3>
<p>Admin ne abhi tak koi booking assign nahi ki hai.</p>
</div>

`

return
}

bookingId = found.id

// ===============================
// 🔥 LOAD OLD PROGRESS
// ===============================
let updates = {}

try{
updates = JSON.parse(found.guide_updates || "{}")
}catch(e){}

tempProgress = updates.progress || {}

// ===============================
// 🔥 PARSE DATA
// ===============================
let parsed = {}
let extra = {}

try{
parsed = JSON.parse(found.traveller_details || "{}")
extra = JSON.parse(found.extra_details || "{}")
}catch(e){}

let travellers = parsed.travellers || []
let validTravellers = travellers.filter(t => Number(t.age) > 1)

// ===============================
// 🎯 GUIDE CARD (SAME LIKE BADGE PAGE)
// ===============================
let tick = guide.verified 
? `
<span class="tick">
<svg viewBox="0 0 24 24" width="18" height="18">
<path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.67-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z" fill="#1DA1F2"/>
<path d="M9.5 14.58l-2.79-2.79-1.21 1.21 4 4 8-8-1.21-1.21z" fill="#ffffff"/>
</svg>
</span>
` : ""

let guideCard = `
<div class="card">

<img src="${guide.photo || 'user.png'}" class="avatar">

<div class="name">${guide.name} ${tick}</div>

<div class="role">Guide</div>

<div class="exp">${guide.experience || "5+ Years Experience"}</div>

<div class="rating-number">⭐ ${guide.rating || "4.5"}</div>

<div class="badge">Assigned Trip</div>

</div>
`

// ===============================
// 📅 TIMETABLE
// ===============================
let timetableHtml = ""

if(extra.timetable && Array.isArray(extra.timetable)){

timetableHtml = extra.timetable.map(d=>{

let key = "day_"+d.day
let noteKey = "note_"+d.day
let completed = tempProgress[key]

// TASK FIX
let tasks = []
if(Array.isArray(d.tasks)){
tasks = d.tasks
}else if(typeof d.tasks === "string"){
tasks = d.tasks.split(",")
}

tasks = tasks.map(t=>t.trim()).filter(t=>t)

return `
<div class="day-box ${completed ? "done" : ""}">

<h4>Day ${d.day} ${d.title ? "- "+d.title : ""}</h4>

${d.time ? `<div>⏰ ${d.time}</div>` : ""}

${tasks.map(t=>`<div>• ${t}</div>`).join("")}

<br>

<label>
<input type="checkbox"
${completed ? "checked disabled" : ""}
onchange="tempProgress['${key}']=this.checked">
 Mark Complete
</label>

<br>

<textarea
placeholder="Write note..."
${completed ? "disabled" : ""}
oninput="tempProgress['${noteKey}']=this.value"
>${tempProgress[noteKey] || ""}</textarea>

${completed ? `<div style="color:red;font-weight:bold">Day ${d.day} Completed</div>` : ""}

</div>
`
}).join("")
}

// ===============================
// 🎯 FINAL UI
// ===============================
document.getElementById("bookingBox").innerHTML = `

${guideCard}

<div class="box">

<h3>${found.package_name}</h3>
<p>Status: ${found.status}</p>
<p>Total: ₹${found.total_price}</p>

<h4>👥 Travellers</h4>

${validTravellers.map(t=>`
<div class="traveller">
${t.name} | ${t.gender} | ${t.age} yrs
</div>
`).join("")}

</div>

${timetableHtml ? `<div class="box"><h3>📅 Timetable</h3>${timetableHtml}</div>` : ""}

`
}

// ===============================
// 💾 SAVE
// ===============================
async function saveUpdate(){

if(!bookingId){
alert("No booking found")
return
}

const { data } = await supabaseClient
.from("bookings")
.select("guide_updates")
.eq("id", bookingId)
.single()

let updates = {}

try{
updates = JSON.parse(data?.guide_updates || "{}")
}catch(e){}

updates.progress = tempProgress
updates.time = new Date().toLocaleString()

await supabaseClient
.from("bookings")
.update({
guide_updates: JSON.stringify(updates)
})
.eq("id", bookingId)

document.getElementById("msg").innerText = "Updated ✅"

setTimeout(()=>{
location.reload()
},1000)
}

loadGuideBooking()