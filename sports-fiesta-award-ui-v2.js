/* SPORTS FIESTA AWARD UI V3 — authoritative 1/11 pieces + Player 1 final gold */
(() => {
  if (window.__sportsFiestaAwardUiV3) return;
  window.__sportsFiestaAwardUiV3 = true;
  const KEY = 'sportsFiestaHubProgress_v1';
  const PENDING = 'sportsFiestaPendingAward_v1';

  function winnerQualified(x) {
    const lm = Number(x?.lastMode), lw = x?.lastWinner;
    return lm === 2 && (lw === 'p1' || lw === 'p2' || Number(lw) === 1 || Number(lw) === 2);
  }

  function recordQualified(x) {
    if (!x || typeof x !== 'object') return false;
    if (x.awardRules === 'v1' || x.awardRules === 'v2') return x.pieceEarned === true;
    return x.perfectSingle === true || winnerQualified(x);
  }

  function readData() {
    let d = {};
    try { d = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) {}
    return d;
  }

  function migrate() {
    const d = readData();
    let changed = false;
    for (let i = 1; i <= 11; i++) {
      const x = d[i];
      if (!x || typeof x !== 'object') continue;
      if (x.awardRules === 'v1' || x.awardRules === 'v2') continue;
      const qualified = x.perfectSingle === true || winnerQualified(x);
      x.pieceEarned = qualified;
      x.awardQualified = qualified;
      x.awardRules = 'v2';
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

  function latestRecord() {
    const d = readData();
    let best = null;
    for (let i = 1; i <= 11; i++) {
      const x = d[i];
      if (!x || typeof x !== 'object') continue;
      const stamp = Date.parse(x.updatedAt || '') || 0;
      if (!best || stamp > best.stamp) best = { id:i, x, stamp };
    }
    return best;
  }

  function pieceCount() {
    const d = readData();
    let pieces = 0;
    for (let i = 1; i <= 11; i++) if (recordQualified(d[i])) pieces++;
    return pieces;
  }

  function installUiOverride() {
    const base = window.showMedalCeremony;
    if (typeof base !== 'function' || base.__awardUiV3) return false;

    const wrapped = function(preview = false, winner = 'p1', requestedKind = 'gold') {
      if (!preview) migrate();

      let kind = requestedKind === 'piece' ? 'piece' : 'gold';
      const latest = latestRecord();
      const qualified = latest ? recordQualified(latest.x) : false;
      const pieces = pieceCount();

      if (!preview) {
        // No medal for a non-perfect 1P attempt or a tied 2P game.
        if (!qualified) return false;

        // Every qualifying lesson earns only 1/11 until all 11 pieces exist.
        // Once 11/11 are earned, Player 1 receives the full gold medal.
        kind = pieces >= 11 ? 'gold' : 'piece';

        if (kind === 'gold') {
          winner = 'p1';
        } else if (latest) {
          const lm = Number(latest.x.lastMode);
          const lw = latest.x.lastAwardWinner ?? latest.x.lastWinner;
          if (lm === 1) winner = 'p1';
          else if (Number(lw) === 2 || lw === 'p2') winner = 'p2';
          else winner = 'p1';
        }
      } else {
        if (kind === 'gold') winner = 'p1';
        if (kind === 'piece' && winner === 'tie') return false;
      }

      const out = base.call(this, preview, winner, kind);
      const banner = document.querySelector('#medalCeremony .mc-banner');
      const player = document.getElementById('mcPlayer');
      const sub = document.getElementById('mcSub');
      const msg = document.getElementById('mcMessage');

      if (banner) banner.textContent = kind === 'piece' ? '🏅 1/11 MEDAL AWARD 🏅' : '🏆 GOLD MEDAL CEREMONY 🏆';
      if (player) player.alt = winner === 'p2' ? 'Player 2 on the rostrum' : 'Player 1 on the rostrum';

      if (!preview && kind === 'piece') {
        if (sub) sub.textContent = `${Math.min(pieces, 11)}/11 medal pieces earned`;
        if (msg) msg.textContent = winner === 'p2'
          ? 'Player 2 wins this lesson and earns 1/11 of the medal!'
          : 'Player 1 earns 1/11 of the medal!';
      }

      if (!preview && kind === 'gold') {
        if (sub) sub.textContent = 'All 11 Sports Fiesta lessons completed!';
        if (msg) msg.textContent = '🏆 Player 1 receives the Sports Fiesta GOLD MEDAL! 🏆';
      }
      return out;
    };

    wrapped.__awardUiV3 = true;
    window.showMedalCeremony = wrapped;
    return true;
  }

  function installRecordOverride() {
    if (!window.SportsFiestaAward || typeof window.SportsFiestaAward.record !== 'function') return false;
    if (window.SportsFiestaAward.record.__awardRulesV2) return true;

    const record = function(id, mode, winner, perfect) {
      id = Number(id); mode = Number(mode) || 1;
      if (!id) return;
      const d = readData();
      const old = d[id] || {};
      const priorQualified = recordQualified(old);
      const winnerNum = winner === 'p2' ? 2 : winner === 'p1' ? 1 : 0;
      const qualifies = mode === 1 ? !!perfect : winnerNum > 0;
      const pieceEarned = priorQualified || qualifies;

      d[id] = {
        ...old,
        completed: true,
        pieceEarned,
        awardQualified: pieceEarned,
        perfectSingle: !!old.perfectSingle || (mode === 1 && !!perfect),
        verified: true,
        source: 'game-v5',
        awardRules: 'v2',
        updatedAt: new Date().toISOString(),
        lastMode: mode,
        lastWinner: mode === 2 ? winnerNum : (old.lastWinner ?? 0),
        lastAwardWinner: qualifies ? (mode === 1 ? 1 : winnerNum) : (old.lastAwardWinner ?? 0)
      };

      localStorage.setItem(KEY, JSON.stringify(d));
      if (qualifies) {
        localStorage.setItem(PENDING, JSON.stringify({
          practiceId:id,
          mode,
          winner:mode===1?'p1':winner,
          perfect:!!perfect,
          time:Date.now()
        }));
      } else {
        localStorage.removeItem(PENDING);
      }
    };

    record.__awardRulesV2 = true;
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
