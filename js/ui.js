// js/ui.js — WilTrader: UI Utilities
window.UI = (function () {

  /* ── Toast ── */
  let _toastContainer;
  function _getToastContainer() {
    if (!_toastContainer) {
      _toastContainer = document.createElement('div');
      _toastContainer.className = 'toast-container';
      document.body.appendChild(_toastContainer);
    }
    return _toastContainer;
  }

  function toast(message, type) {
    type = type || 'success';
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.innerHTML = '<span class="toast-icon">' + (icons[type] || 'ℹ️') + '</span><span>' + message + '</span>';
    _getToastContainer().appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 400);
    }, 3500);
  }

  /* ── Confirm Modal ── */
  function confirmDialog(title, message) {
    return new Promise(function (resolve) {
      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML =
        '<div class="modal-box">' +
          '<h3 class="modal-title">' + title + '</h3>' +
          '<p class="modal-msg">' + message + '</p>' +
          '<div class="modal-actions">' +
            '<button class="btn ghost" id="_mCancel">Cancelar</button>' +
            '<button class="btn btn-danger" id="_mConfirm">Confirmar</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);
      requestAnimationFrame(function () { overlay.classList.add('show'); });
      function close(val) {
        overlay.classList.remove('show');
        setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
        resolve(val);
      }
      overlay.querySelector('#_mConfirm').onclick = function () { close(true); };
      overlay.querySelector('#_mCancel').onclick = function () { close(false); };
      overlay.onclick = function (e) { if (e.target === overlay) close(false); };
    });
  }

  /* ── Add Instrument Modal ── */
  function instrumentDialog() {
    return new Promise(function (resolve) {
      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML =
        '<div class="modal-box">' +
          '<h3 class="modal-title">➕ Nuevo Instrumento</h3>' +
          '<div class="modal-form">' +
            '<label>ID (sin espacios)<input type="text" id="_mi_id" placeholder="NASDAQ" style="text-transform:uppercase"></label>' +
            '<label>Nombre completo<input type="text" id="_mi_lbl" placeholder="Nasdaq 100 (E-mini)"></label>' +
            '<label>Unidad<select id="_mi_unit"><option value="puntos">Puntos</option><option value="pips">Pips</option></select></label>' +
            '<label>Valor por punto/pip (USD)<input type="number" id="_mi_pv" placeholder="20" min="0.01" step="0.01"></label>' +
          '</div>' +
          '<div class="modal-actions">' +
            '<button class="btn ghost" id="_miCancel">Cancelar</button>' +
            '<button class="btn" id="_miSave">Guardar</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);
      requestAnimationFrame(function () { overlay.classList.add('show'); });
      function close(val) {
        overlay.classList.remove('show');
        setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
        resolve(val);
      }
      overlay.querySelector('#_miSave').onclick = function () {
        var id = overlay.querySelector('#_mi_id').value.trim().toUpperCase();
        var lbl = overlay.querySelector('#_mi_lbl').value.trim();
        var unit = overlay.querySelector('#_mi_unit').value;
        var pv = parseFloat(overlay.querySelector('#_mi_pv').value);
        if (!id || !lbl || isNaN(pv) || pv <= 0) {
          toast('Completa todos los campos correctamente.', 'warning'); return;
        }
        close({ id: id, label: lbl, unit: unit, pointValue: pv });
      };
      overlay.querySelector('#_miCancel').onclick = function () { close(null); };
      overlay.onclick = function (e) { if (e.target === overlay) close(null); };
    });
  }

  /* ── Spinner ── */
  var _spinner;
  function setLoading(active) {
    if (!_spinner) {
      _spinner = document.createElement('div');
      _spinner.className = 'spinner-overlay';
      _spinner.innerHTML = '<div class="spinner"></div>';
      document.body.appendChild(_spinner);
    }
    _spinner.style.display = active ? 'flex' : 'none';
  }

  /* ── Formatters ── */
  function formatUSD(n) {
    var abs = Math.abs(n);
    var s = '$' + abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return n < 0 ? '-' + s : s;
  }
  function colorClass(val) {
    if (val > 0) return 'text-win';
    if (val < 0) return 'text-loss';
    return 'text-be';
  }
  function nowDate() {
    return new Date().toISOString().slice(0, 10);
  }
  function nowTime() {
    return new Date().toTimeString().slice(0, 5);
  }

  return { toast, confirmDialog, instrumentDialog, setLoading, formatUSD, colorClass, nowDate, nowTime };
})();
