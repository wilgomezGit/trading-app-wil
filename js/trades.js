// js/trades.js — WilTrader: Trade CRUD + Firebase Storage screenshot upload
window.TradesModule = (function () {

  async function save(data) {
    data.timestamp = firebase.firestore.FieldValue.serverTimestamp();
    var ref = await db.collection('trades').add(data);
    return ref.id;
  }

  async function load(filters) {
    filters = filters || {};
    try {
      var snap = await db.collection('trades').orderBy('timestamp', 'asc').get();
      var trades = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
      if (filters.activo)    trades = trades.filter(function (t) { return t.activo    === filters.activo; });
      if (filters.emotion)   trades = trades.filter(function (t) { return t.emotion   === filters.emotion; });
      if (filters.session)   trades = trades.filter(function (t) { return t.session   === filters.session; });
      if (filters.direction) trades = trades.filter(function (t) { return t.direction === filters.direction; });
      if (filters.dateFrom)  trades = trades.filter(function (t) { return t.fecha >= filters.dateFrom; });
      if (filters.dateTo)    trades = trades.filter(function (t) { return t.fecha <= filters.dateTo; });
      return trades;
    } catch (e) {
      UI.toast('Error cargando trades: ' + e.message, 'error');
      return [];
    }
  }

  async function remove(id) {
    await db.collection('trades').doc(id).delete();
  }

  async function uploadScreenshot(file) {
    if (!window.storage) throw new Error('Firebase Storage no está habilitado en este proyecto.');
    var ext = file.name.split('.').pop();
    var path = 'screenshots/' + Date.now() + '_' + Math.random().toString(36).substr(2) + '.' + ext;
    var ref = storage.ref(path);
    await ref.put(file);
    return ref.getDownloadURL();
  }

  return { save, load, remove, uploadScreenshot };
})();
