// js/firebase.js — WilTrader: Shared Firebase initialization
(function () {
  const cfg = {
    apiKey: "AIzaSyDYGM2kwuG5AhyjzMy_cnH1YEzLbOkBdh4",
    authDomain: "wiltraderdashboard.firebaseapp.com",
    projectId: "wiltraderdashboard",
    storageBucket: "wiltraderdashboard.firebasestorage.app",
    messagingSenderId: "665739004897",
    appId: "1:665739004897:web:32d97c260294b378f160a0"
  };
  if (!firebase.apps.length) firebase.initializeApp(cfg);
  window.db = firebase.firestore();
  try {
    window.storage = firebase.storage();
  } catch (e) {
    window.storage = null;
    console.warn('Firebase Storage no disponible:', e.message);
  }
})();
