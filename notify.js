export default async (req, res) => {

  const { token } = await req.json()

  const response = await fetch("https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send", {
    method: "POST",
    headers: {
      "Authorization": "Bearer YOUR_SERVER_KEY",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: {
        token: token,
        notification: {
          title: "Booking Accepted 🎉",
          body: "Aapki booking accept ho gayi"
        }
      }
    })
  })

  const data = await response.json()

  return new Response(JSON.stringify(data), { status: 200 })
}