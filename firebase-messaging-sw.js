importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDsvicAWi9h6I5cevqigyjcjZ7AYy-7Css",
  authDomain: "aaoza-travel.firebaseapp.com",
  projectId: "aaoza-travel",
  storageBucket: "aaoza-travel.firebasestorage.app",
  messagingSenderId: "740306935887",
  appId: "1:740306935887:web:39a018dbae69104d1e0a3a",
  measurementId: "G-RJ6LKGNBNL"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/logo.jpg'
  });
});