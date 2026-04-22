import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyDsvicAWi9h6I5cevqigyjcjZ7AYy-7Css",
  authDomain: "aaoza-travel.firebaseapp.com",
  projectId: "aaoza-travel",
  storageBucket: "aaoza-travel.firebasestorage.app",
  messagingSenderId: "740306935887",
  appId: "1:740306935887:web:39a018dbae69104d1e0a3a"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 🔔 INIT NOTIFICATION
export async function initNotifications(){

  // permission lo
  const permission = await Notification.requestPermission();

  if(permission !== "granted"){
    console.log("Permission denied");
    return null;
  }

  // token lo
  const token = await getToken(messaging, {
    vapidKey: "BPUNLjKkw3KbtU4XR2rPlXMvBJgp0nQJUIYKd8KLL2yqTrzNdOwthPXzRIdFRxT-u2d8w14ikBfQh2bdo-KTmXk"
  });

  console.log("TOKEN:", token);
  return token;
}
