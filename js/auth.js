// js/auth.js — WilTrader: Firebase Authentication helpers & guard
(function () {
  var auth = firebase.auth();
  window.WilAuth = auth;

  /* ── Auth guard: call on every protected page ── */
  window.requireAuth = function (onAuthed) {
    auth.onAuthStateChanged(function (user) {
      if (user) {
        // Authenticated — show the app and call callback
        var loading = document.getElementById('authLoading');
        if (loading) loading.style.display = 'none';
        var appRoot = document.getElementById('appRoot');
        if (appRoot) appRoot.style.display = '';
        if (typeof onAuthed === 'function') onAuthed(user);
      } else {
        // Not authenticated — redirect to login
        window.location.href = 'login.html';
      }
    });
  };

  /* ── Login ── */
  window.wilLogin = function (email, password) {
    return auth.signInWithEmailAndPassword(email, password);
  };

  /* ── Logout ── */
  window.wilLogout = function () {
    return auth.signOut().then(function () {
      window.location.href = 'login.html';
    });
  };

  /* ── Current user display name ── */
  window.getCurrentUser = function () {
    return auth.currentUser;
  };
})();
