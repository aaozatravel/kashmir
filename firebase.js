import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyDsvicAWi9h6I5cevqigyjcjZ7AYy-7Css",
  authDomain: "aaoza-travel.firebaseapp.com",
  projectId: "aaoza-travel",
  messagingSenderId: "740306935887",
  appId: "1:740306935887:web:39a018dbae69104d1e0a3a"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 🔔 Permission + Token
export async function initNotifications(){

  const permission = await Notification.requestPermission();

  if(permission === "granted"){

    const token = await getToken(messaging, {
      vapidKey: "BPUNLjKkw3KbtU4XR2rPlXMvBJgp0nQJUIYKd8KLL2yqTrzNdOwthPXzRIdFRxT-u2d8w14ikBfQh2bdo-KTmXk"
    });

    console.log("USER TOKEN:", token);

    // 🔥 Supabase me save karo
    const { data:{user} } = await supabaseClient.auth.getUser();

    if(user && token){
      await supabaseClient
      .from("users")   // 👈 ensure table exists
      .update({ fcm_token: token })
      .eq("email", user.email);
    }
  }
}

// 📲 Foreground notification (improved UI)
onMessage(messaging, (payload)=>{

  const title = payload.notification?.title || "Notification";
  const body = payload.notification?.body || "";

  // 🔥 better than alert
  const box = document.createElement("div");
  box.innerHTML = `
    <div style="
      position:fixed;
      top:20px;
      right:20px;
      background:#111;
      color:#fff;
      padding:12px 16px;
      border-radius:8px;
      box-shadow:0 5px 15px rgba(0,0,0,0.3);
      z-index:9999;
      font-size:14px;
    ">
      <b>${title}</b><br>${body}
    </div>
  `;

  document.body.appendChild(box);

  setTimeout(()=> box.remove(), 4000);
});