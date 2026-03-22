// js/stats.js — WilTrader: Statistics & Metrics computation
window.StatsModule = (function () {

  function _usd(t) {
    if (t.usdValue !== undefined && t.usdValue !== null) return Number(t.usdValue);
    var pv = window.InstrumentsModule ? InstrumentsModule.getPointValue(t.activo) : 50;
    return (!t.resultado && t.resultado !== 0) ? 0 : Number(t.resultado) * pv * (t.contracts || 1);
  }

  function computeEquity(trades) {
    var acc = 0;
    return trades.map(function (t) { acc += _usd(t); return acc; });
  }

  function computeDrawdown(equity) {
    var peak = -Infinity;
    return equity.map(function (v) {
      if (v > peak) peak = v;
      return peak > 0 ? ((v - peak) / peak) * 100 : 0;
    });
  }

  function computeMetrics(trades) {
    var valid = trades.filter(function (t) { return t.resultado !== null && t.resultado !== undefined; });
    var wins   = valid.filter(function (t) { return t.resultado > 0; });
    var losses = valid.filter(function (t) { return t.resultado < 0; });
    var totalPnl = valid.reduce(function (s, t) { return s + _usd(t); }, 0);
    var grossW   = wins.reduce(function (s, t)   { return s + _usd(t); }, 0);
    var grossL   = Math.abs(losses.reduce(function (s, t) { return s + _usd(t); }, 0));
    var equity   = computeEquity(valid);
    var dd       = computeDrawdown(equity);
    var maxDD    = dd.length ? Math.min.apply(null, dd) : 0;
    var rrs      = valid.filter(function (t) { return t.rr && t.rr > 0; }).map(function (t) { return t.rr; });
    var avgRR    = rrs.length ? (rrs.reduce(function (a, b) { return a + b; }, 0) / rrs.length) : null;
    var winRate  = valid.length ? wins.length / valid.length : 0;
    var avgW     = wins.length   ? grossW / wins.length   : 0;
    var avgL     = losses.length ? grossL / losses.length : 0;
    var expect   = valid.length  ? (winRate * avgW) - ((1 - winRate) * avgL) : 0;
    var usdVals  = valid.map(function (t) { return _usd(t); });
    var bestTrade  = usdVals.length ? Math.max.apply(null, usdVals) : 0;
    var worstTrade = usdVals.length ? Math.min.apply(null, usdVals) : 0;
    return {
      totalPnl:    totalPnl,
      winRate:     valid.length ? (winRate * 100).toFixed(1) : '0.0',
      profitFactor: grossL ? (grossW / grossL).toFixed(2) : null,
      count:       trades.length,
      maxDrawdown: maxDD.toFixed(2),
      avgRR:       avgRR !== null ? avgRR.toFixed(2) : null,
      expectancy:  expect.toFixed(2),
      bestTrade:   bestTrade,
      worstTrade:  worstTrade
    };
  }

  function groupBy(trades, key) {
    return trades.reduce(function (acc, t) {
      var k = t[key] || 'Sin clasificar';
      if (!acc[k]) acc[k] = [];
      acc[k].push(t);
      return acc;
    }, {});
  }

  function winRateByKey(trades, key) {
    var groups = groupBy(trades, key);
    return Object.keys(groups).map(function (k) {
      var ts    = groups[k];
      var valid = ts.filter(function (t) { return t.resultado !== null && t.resultado !== undefined; });
      var wins  = valid.filter(function (t) { return t.resultado > 0; });
      return { label: k, winRate: valid.length ? (wins.length / valid.length * 100).toFixed(1) : '0', count: valid.length };
    });
  }

  function equityByInstrument(trades) {
    var groups = groupBy(trades.filter(function (t) { return t.resultado !== null && t.resultado !== undefined; }), 'activo');
    return Object.keys(groups).map(function (inst) {
      var acc = 0;
      var data = groups[inst].map(function (t) { acc += _usd(t); return acc; });
      return { label: inst, data: data, count: groups[inst].length };
    });
  }

  function pnlHistogram(trades) {
    var vals = trades.filter(function (t) { return t.resultado !== null && t.resultado !== undefined; }).map(function (t) { return _usd(t); });
    if (!vals.length) return { labels: [], data: [] };
    var mn = Math.floor(Math.min.apply(null, vals) / 100) * 100 - 100;
    var mx = Math.ceil(Math.max.apply(null, vals) / 100) * 100 + 100;
    var step = Math.max(50, Math.round((mx - mn) / 10 / 50) * 50);
    var bins = [], counts = [], colors = [];
    for (var b = mn; b < mx; b += step) {
      var lo = b, hi = b + step;
      bins.push((lo >= 0 ? '+' : '') + lo + ' / ' + (hi >= 0 ? '+' : '') + hi);
      var c = vals.filter(function (v) { return v >= lo && v < hi; }).length;
      counts.push(c);
      colors.push(lo >= 0 ? 'rgba(34,197,94,0.75)' : 'rgba(239,68,68,0.75)');
    }
    return { labels: bins, data: counts, colors: colors };
  }

  function groupByPeriod(trades, periodType) {
    var valid = trades.filter(function(t) { return t.resultado !== null && t.resultado !== undefined; });
    var groups = {}, order = [];
    valid.forEach(function(t) {
      var fecha = t.fecha || '0000-00-00';
      var key;
      if (periodType === 'weekly') {
        var d = new Date(fecha + 'T00:00:00');
        var startOfYear = new Date(d.getFullYear(), 0, 1);
        var wn = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
        key = d.getFullYear() + '-W' + String(wn).padStart(2, '0');
      } else if (periodType === 'monthly') {
        key = fecha.slice(0, 7);
      } else {
        key = fecha; // daily
      }
      if (!groups[key]) { groups[key] = []; order.push(key); }
      groups[key].push(t);
    });
    order = order.filter(function(k, i) { return order.indexOf(k) === i; }).sort();
    var cumPnl = 0;
    return order.map(function(key) {
      var ts     = groups[key];
      var wins   = ts.filter(function(t) { return t.resultado > 0; });
      var losses = ts.filter(function(t) { return t.resultado < 0; });
      var netPnl = ts.reduce(function(s, t) { return s + _usd(t); }, 0);
      var grossW = wins.reduce(function(s, t)   { return s + _usd(t); }, 0);
      var grossL = Math.abs(losses.reduce(function(s, t) { return s + _usd(t); }, 0));
      cumPnl += netPnl;
      var rrs    = ts.filter(function(t) { return t.rr && t.rr > 0; });
      var usdArr = ts.map(function(t) { return _usd(t); });
      var winArr = usdArr.filter(function(v){ return v > 0; });
      var losArr = usdArr.filter(function(v){ return v < 0; });
      return {
        period:  key,
        count:   ts.length,
        cumPnl:  cumPnl,
        netPnl:  netPnl,
        grossW:  grossW,
        grossL:  grossL,
        winRate: ts.length ? (wins.length / ts.length * 100).toFixed(1) : '0',
        avgW:    wins.length   ? (grossW / wins.length).toFixed(2)   : null,
        avgL:    losses.length ? (grossL / losses.length).toFixed(2) : null,
        avgRR:   rrs.length    ? (rrs.reduce(function(s,t){ return s+t.rr; },0) / rrs.length).toFixed(2) : null,
        lrgW:    winArr.length ? Math.max.apply(null, winArr) : 0,
        lrgL:    losArr.length ? Math.min.apply(null, losArr) : 0,
        wins:    wins.length,
        losses:  losses.length
      };
    });
  }

  return { computeMetrics, computeEquity, computeDrawdown, groupBy, winRateByKey, equityByInstrument, pnlHistogram, groupByPeriod };
})();
