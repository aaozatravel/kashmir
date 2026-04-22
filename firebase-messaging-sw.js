// 🔥 Firebase libraries
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// 🔥 Firebase config
firebase.initializeApp({
  apiKey: "AIzaSyDsvicAWi9h6I5cevqigyjcjZ7AYy-7Css",
  authDomain: "aaoza-travel.firebaseapp.com",
  projectId: "aaoza-travel",
  storageBucket: "aaoza-travel.firebasestorage.app",
  messagingSenderId: "740306935887",
  appId: "1:740306935887:web:39a018dbae69104d1e0a3a",
  measurementId: "G-RJ6LKGNBNL"
});

// 🔔 Messaging init
const messaging = firebase.messaging();

// 🔥 BACKGROUND NOTIFICATION
messaging.onBackgroundMessage(function(payload) {

  console.log("📩 Background Message:", payload);

  const title = payload.notification?.title || "Aaoza Travel";
  const options = {
    body: payload.notification?.body || "New update",
    icon: "/logo.jpg",
    badge: "/logo.jpg",
    data: payload.data || {}
  };

  self.registration.showNotification(title, options);
});

// 🔥 CLICK EVENT (IMPORTANT)
self.addEventListener("notificationclick", function(event) {

  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(clientList) {

      for (let client of clientList) {
        if (client.url && "focus" in client) {
          return client.focus();
        }
      }

      // 👉 agar app open nahi hai to open karo
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
