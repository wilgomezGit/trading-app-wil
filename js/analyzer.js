// js/analyzer.js — WilTrader: Auto Performance Analysis Engine
window.AnalyzerModule = (function () {

  function analyze(trades) {
    var insights = [];
    var valid = trades.filter(function (t) { return t.resultado !== null && t.resultado !== undefined; });
    if (valid.length < 3) {
      return [{ icon: '📊', type: 'info', text: 'Registra al menos 3 trades para activar el análisis automático.' }];
    }

    /* ── Emotion analysis ── */
    var byEmotion = {};
    valid.forEach(function (t) {
      var e = t.emotion || 'Sin emoción';
      if (!byEmotion[e]) byEmotion[e] = { wins: 0, total: 0, pnl: 0 };
      if (t.resultado > 0) byEmotion[e].wins++;
      byEmotion[e].total++;
      byEmotion[e].pnl += (t.usdValue || 0);
    });
    var eEntries = Object.entries(byEmotion).filter(function (kv) { return kv[1].total >= 2; });
    if (eEntries.length >= 2) {
      eEntries.sort(function (a, b) { return (a[1].wins / a[1].total) - (b[1].wins / b[1].total); });
      var worst = eEntries[0], best = eEntries[eEntries.length - 1];
      insights.push({
        icon: '🧠', type: 'warning',
        text: 'Pierdes más cuando tienes <strong>' + worst[0] + '</strong> (' + (worst[1].wins / worst[1].total * 100).toFixed(0) + '% winrate). ' +
              'Tu mejor estado emocional es <strong>' + best[0] + '</strong> (' + (best[1].wins / best[1].total * 100).toFixed(0) + '% winrate).'
      });
    }

    /* ── Session analysis ── */
    var bySession = {};
    valid.forEach(function (t) {
      var s = t.session || 'Sin sesión';
      if (!bySession[s]) bySession[s] = { wins: 0, total: 0 };
      if (t.resultado > 0) bySession[s].wins++;
      bySession[s].total++;
    });
    var sEntries = Object.entries(bySession).filter(function (kv) { return kv[1].total >= 2; });
    if (sEntries.length >= 1) {
      sEntries.sort(function (a, b) { return (b[1].wins / b[1].total) - (a[1].wins / a[1].total); });
      var bestS = sEntries[0];
      insights.push({
        icon: '🕐', type: 'success',
        text: 'Tu sesión más rentable es <strong>' + bestS[0] + '</strong> con un ' + (bestS[1].wins / bestS[1].total * 100).toFixed(0) + '% de winrate.'
      });
      if (sEntries.length >= 2) {
        var worstS = sEntries[sEntries.length - 1];
        if ((worstS[1].wins / worstS[1].total) < 0.4) {
          insights.push({
            icon: '⚠️', type: 'warning',
            text: 'Considera evitar la sesión <strong>' + worstS[0] + '</strong> — solo ' + (worstS[1].wins / worstS[1].total * 100).toFixed(0) + '% winrate.'
          });
        }
      }
    }

    /* ── Instrument analysis ── */
    var byInst = {};
    valid.forEach(function (t) {
      var k = t.activo || 'Desconocido';
      if (!byInst[k]) byInst[k] = { pnl: 0, count: 0 };
      byInst[k].pnl += (t.usdValue || 0);
      byInst[k].count++;
    });
    var instEntries = Object.entries(byInst);
    if (instEntries.length >= 2) {
      instEntries.sort(function (a, b) { return b[1].pnl - a[1].pnl; });
      var bestI = instEntries[0];
      insights.push({
        icon: '📈', type: 'success',
        text: 'Tu instrumento más rentable es <strong>' + bestI[0] + '</strong> con $' + bestI[1].pnl.toFixed(2) + ' acumulado en ' + bestI[1].count + ' trades.'
      });
    }

    /* ── Long vs Short ── */
    var longs  = valid.filter(function (t) { return t.direction === 'Long'; });
    var shorts = valid.filter(function (t) { return t.direction === 'Short'; });
    if (longs.length >= 2 && shorts.length >= 2) {
      var lwr = (longs.filter(function (t)  { return t.resultado > 0; }).length / longs.length  * 100).toFixed(0);
      var swr = (shorts.filter(function (t) { return t.resultado > 0; }).length / shorts.length * 100).toFixed(0);
      insights.push({
        icon: '↕️', type: 'info',
        text: 'Long winrate: <strong>' + lwr + '%</strong> &nbsp;|&nbsp; Short winrate: <strong>' + swr + '%</strong>. ' +
              'Eres mejor en posiciones <strong>' + (parseInt(lwr) >= parseInt(swr) ? 'Long' : 'Short') + '</strong>.'
      });
    }

    /* ── Consecutive losses ── */
    var maxStreak = 0, streak = 0;
    valid.forEach(function (t) {
      if (t.resultado < 0) { streak++; if (streak > maxStreak) maxStreak = streak; } else { streak = 0; }
    });
    if (maxStreak >= 3) {
      insights.push({
        icon: '🚨', type: 'danger',
        text: 'Tuviste una racha de <strong>' + maxStreak + ' pérdidas consecutivas</strong>. Considera pausar y revisar tu plan cuando pierdas 3 trades seguidos.'
      });
    }

    /* ── R:R analysis ── */
    var rrTrades = valid.filter(function (t) { return t.rr && t.rr > 0; });
    if (rrTrades.length >= 3) {
      var avgRR = (rrTrades.reduce(function (s, t) { return s + t.rr; }, 0) / rrTrades.length).toFixed(2);
      insights.push({
        icon: '⚡', type: parseFloat(avgRR) >= 1.5 ? 'success' : 'warning',
        text: 'Tu R:R promedio es <strong>1:' + avgRR + '</strong>. ' +
              (parseFloat(avgRR) < 1.5 ? 'Mejora tus TPs para alcanzar al menos 1:1.5.' : '¡Excelente manejo de riesgo/recompensa!')
      });
    }

    if (!insights.length) {
      insights.push({ icon: '✅', type: 'success', text: 'Sin patrones negativos detectados. ¡Sigue así!' });
    }
    return insights;
  }

  return { analyze };
})();
