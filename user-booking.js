async function loadUserBookings(){

  const { data: { user }, error: authError } =
  await supabaseClient.auth.getUser()

  if(!user || authError){
    window.location.href = "login.html"
    return
  }

  const { data, error } = await supabaseClient
    .from("bookings")
    .select("*")
    .eq("user_email", user.email)
    .order("created_at",{ascending:false})

  if(error || !data){
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

    let gondolaPrice = Number(parsed.gondola_price || 0)

    let activitiesTotal = parsed.activity_total || 0

    let placesTotal = parsed.places_total || 0

    let departurePrice = Number(b.departure_price || 0)

    let singleRoom = Number(parsed.single_room || 0)
    let doubleRoom = Number(parsed.double_room || 0)

    let singleTotal = singleRoom * 6999
    let doubleTotal = doubleRoom * 8999

    // ✅ FINAL CALCULATION (ONLY ONCE)
    let travellerCount = travellers.length

let baseTotalPerPerson =
  gondolaPrice +
  placesTotal +
  departurePrice +
  activitiesTotal

let baseTotal = baseTotalPerPerson * travellerCount

    let accommodationTotal = singleTotal + doubleTotal

    let grandTotal = baseTotal + accommodationTotal

    // travellers table
    let travellersHtml = ""

    travellers.forEach(t=>{
      if(t.age <= 1) return

      travellersHtml += `
      <tr>
        <td>${t.name}</td>
        <td>${t.age}</td>
        <td>${t.gender}</td>
        <td>${t.phone || "-"}</td>
        <td>₹ ${baseTotalPerPerson}</td>
      </tr>
      `
    })

    html += `
    <div class="booking-card">

      <img src="${b.package_image}" class="booking-img">

      <h2>${b.tour_name}</h2>

      <div class="status status-${status}">
        Status: ${status}
      </div>

      <table class="trip-table">
        <tr><th colspan="2">Trip Details</th></tr>

        <tr>
          <td>Activities</td>
          <td>
            ${activities.map(a=>`${a.name} ₹${a.price}`).join(", ")}
            <br><b>Total:</b> ₹${activitiesTotal}
          </td>
        </tr>

        <tr>
          <td>Gondola</td>
          <td>${gondola.join(", ")} - ₹${gondolaPrice}</td>
        </tr>

        <tr>
          <td>Places</td>
          <td>
            ${places.map(p=>`${p.name} ₹${p.price}`).join(", ")}
            <br><b>Total:</b> ₹${placesTotal}
          </td>
        </tr>

        <tr>
          <td>Departure</td>
          <td>${parsed.departure || "-"} - ₹${departurePrice}</td>
        </tr>

        <tr>
  <td>Subtotal</td>
  <td>₹ ${baseTotalPerPerson}</td>
</tr>
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
      </div>

      <h3>Grand Total</h3>
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
