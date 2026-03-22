// js/instruments.js — WilTrader: Multi-instrument management
window.InstrumentsModule = (function () {
  var DEFAULTS = [
    { id: 'SP500',  label: 'SP500 (E-mini)', unit: 'puntos', pointValue: 50 },
    { id: 'XAUUSD', label: 'XAUUSD (Oro)',   unit: 'pips',   pointValue: 10 },
    { id: 'USDJPY', label: 'USDJPY',          unit: 'pips',   pointValue: 9  }
  ];
  var _list = DEFAULTS.slice();

  async function load() {
    try {
      var snap = await db.collection('instruments').get();
      snap.docs.forEach(function (d) {
        var c = Object.assign({ id: d.id }, d.data());
        if (!_list.find(function (i) { return i.id === c.id; })) _list.push(c);
      });
    } catch (e) { console.warn('Instruments load error:', e.message); }
    return _list;
  }

  async function add(data) {
    await db.collection('instruments').doc(data.id).set({
      label: data.label, unit: data.unit, pointValue: data.pointValue
    });
    if (!_list.find(function (i) { return i.id === data.id; })) _list.push(data);
    return data;
  }

  function getAll() { return _list.slice(); }

  function getById(id) {
    return _list.find(function (i) { return i.id === id; }) || DEFAULTS[0];
  }

  function getPointValue(id) { return getById(id).pointValue || 50; }
  function getUnit(id)       { return getById(id).unit || 'puntos'; }

  function populateSelect(sel, withAll, selectedId) {
    var prev = selectedId !== undefined ? selectedId : sel.value;
    sel.innerHTML = '';
    if (withAll) {
      var a = document.createElement('option'); a.value = ''; a.textContent = 'Todos';
      sel.appendChild(a);
    }
    _list.forEach(function (inst) {
      var o = document.createElement('option');
      o.value = inst.id; o.textContent = inst.label;
      if (inst.id === prev) o.selected = true;
      sel.appendChild(o);
    });
  }

  return { load, add, getAll, getById, getPointValue, getUnit, populateSelect };
})();
