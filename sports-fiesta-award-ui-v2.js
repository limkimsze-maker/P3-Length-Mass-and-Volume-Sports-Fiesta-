/* SPORTS FIESTA AWARD UI V2 — authoritative 1/11 + Player 1 final gold rules */
(() => {
  if (window.__sportsFiestaAwardUiV2) return;
  window.__sportsFiestaAwardUiV2 = true;
  const KEY = 'sportsFiestaHubProgress_v1';
  const PENDING = 'sportsFiestaPendingAward_v1';

  function winnerQualified(x) {
    const lm = Number(x?.lastMode), lw = x?.lastWinner;
    return lm === 2 && (lw === 'p1' || lw === 'p2' || Number(lw) === 1 || Number(lw) === 2);
  }

  function migrate() {
    let d = {};
    try { d = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) {}
    let changed = false;
    for (let i = 1; i <= 11; i++) {
      const x = d[i];
      if (!x || typeof x !== 'object' || x.awardRules === 'v1') continue;
      const qualified = !!x.perfectSingle || winnerQualified(x);
      x.pieceEarned = qualified;
      x.awardQualified = qualified;
      x.awardRules = 'v1';
      d[i] = x;
      changed = true;
    }
    if (changed) {
      localStorage.setItem(KEY, JSON.stringify(d));
      if (typeof window.renderAll === 'function') setTimeout(() => window.renderAll(), 0);
    }

    try {
      const raw = localStorage.getItem(PENDING);
      if (raw) {
        const p = JSON.parse(raw);
        const qualifies = Number(p.mode) === 1 ? !!p.perfect : (p.winner === 'p1' || p.winner === 'p2');
        if (!qualifies) localStorage.removeItem(PENDING);
      }
    } catch (_) { localStorage.removeItem(PENDING); }
  }

  function installUiOverride() {
    const base = window.showMedalCeremony;
    if (typeof base !== 'function' || base.__awardUiV2) return false;
    const wrapped = function(preview = false, winner = 'p1', kind = 'gold') {
      kind = kind === 'piece' ? 'piece' : 'gold';
      if (kind === 'piece' && winner === 'tie') return false;
      if (kind === 'gold') winner = 'p1';
      const out = base.call(this, preview, winner, kind);
      const banner = document.querySelector('#medalCeremony .mc-banner');
      const player = document.getElementById('mcPlayer');
      const sub = document.getElementById('mcSub');
      const msg = document.getElementById('mcMessage');
      if (banner) banner.textContent = kind === 'piece' ? '🏅 1/11 MEDAL AWARD 🏅' : '🏆 GOLD MEDAL CEREMONY 🏆';
      if (player) player.alt = winner === 'p2' ? 'Player 2 on the rostrum' : 'Player 1 on the rostrum';
      if (!preview && kind === 'piece') {
        if (sub) sub.textContent = '1/11 of the Sports Fiesta medal earned!';
        if (msg) msg.textContent = winner === 'p2'
          ? 'Player 2 wins and earns 1/11 of the medal!'
          : 'Player 1 earns 1/11 of the medal!';
      }
      if (!preview && kind === 'gold') {
        if (sub) sub.textContent = 'Player 1 completed all 11 lessons perfectly!';
        if (msg) msg.textContent = '🏆 Player 1 receives the Sports Fiesta GOLD MEDAL! 🏆';
      }
      return out;
    };
    wrapped.__awardUiV2 = true;
    window.showMedalCeremony = wrapped;
    return true;
  }

  function installRecordOverride() {
    if (!window.SportsFiestaAward || typeof window.SportsFiestaAward.record !== 'function') return false;
    if (window.SportsFiestaAward.record.__awardRulesV1) return true;
    const record = function(id, mode, winner, perfect) {
      id = Number(id); mode = Number(mode) || 1;
      if (!id) return;
      let d = {};
      try { d = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) {}
      const old = d[id] || {};
      const priorQualified = old.awardRules === 'v1' ? !!old.pieceEarned : (!!old.perfectSingle || winnerQualified(old));
      const winnerNum = winner === 'p2' ? 2 : winner === 'p1' ? 1 : 0;
      const qualifies = mode === 1 ? !!perfect : winnerNum > 0;
      const pieceEarned = priorQualified || qualifies;
      d[id] = {
        ...old, completed: true, pieceEarned, awardQualified: pieceEarned,
        perfectSingle: !!old.perfectSingle || (mode === 1 && !!perfect),
        verified: true, source: 'game-v5', awardRules: 'v1',
        updatedAt: new Date().toISOString(), lastMode: mode,
        lastWinner: mode === 2 ? winnerNum : (old.lastWinner ?? 0),
        lastAwardWinner: qualifies ? (mode === 1 ? 1 : winnerNum) : (old.lastAwardWinner ?? 0)
      };
      localStorage.setItem(KEY, JSON.stringify(d));
      if (qualifies) localStorage.setItem(PENDING, JSON.stringify({practiceId:id, mode, winner:mode===1?'p1':winner, perfect:!!perfect, time:Date.now()}));
      else localStorage.removeItem(PENDING);
    };
    record.__awardRulesV1 = true;
    window.SportsFiestaAward.record = record;
    return true;
  }

  function setup() {
    migrate();
    let tries = 0;
    const t = setInterval(() => {
      const a = installUiOverride();
      const b = installRecordOverride();
      if ((a && b) || ++tries > 40) clearInterval(t);
    }, 50);
    installUiOverride();
    installRecordOverride();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();
