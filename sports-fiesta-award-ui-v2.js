/* SPORTS FIESTA AWARD UI V4 — 1/11 lesson medals, tie podium, Player 1 final gold */
(() => {
  if (window.__sportsFiestaAwardUiV4) return;
  window.__sportsFiestaAwardUiV4 = true;
  const KEY = 'sportsFiestaHubProgress_v1';
  const PENDING = 'sportsFiestaPendingAward_v1';

  function winnerQualified(x) {
    const lm = Number(x?.lastMode), lw = x?.lastWinner;
    return lm === 2 && (lw === 'p1' || lw === 'p2' || Number(lw) === 1 || Number(lw) === 2 || lw === 'tie');
  }

  function recordQualified(x) {
    if (!x || typeof x !== 'object') return false;
    if (x.awardRules === 'v1' || x.awardRules === 'v2' || x.awardRules === 'v3') return x.pieceEarned === true;
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
      if (x.awardRules === 'v1' || x.awardRules === 'v2' || x.awardRules === 'v3') continue;
      const qualified = x.perfectSingle === true || winnerQualified(x);
      x.pieceEarned = qualified;
      x.awardQualified = qualified;
      x.awardRules = 'v3';
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
        const qualifies = Number(p.mode) === 1 ? !!p.perfect : (p.winner === 'p1' || p.winner === 'p2' || p.winner === 'tie');
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

  function latestWinner(latest) {
    if (!latest) return 'p1';
    const lm = Number(latest.x.lastMode);
    const lw = latest.x.lastAwardWinner ?? latest.x.lastWinner;
    if (lm === 1) return 'p1';
    if (lw === 'tie') return 'tie';
    if (Number(lw) === 2 || lw === 'p2') return 'p2';
    return 'p1';
  }

  function renderTiePodium(base, ctx, preview, kind) {
    // Capture Player 2's rendered image from the original ceremony, then rebuild
    // the ceremony for Player 1 and place both athletes together on the rostrum.
    base.call(ctx, preview, 'p2', kind);
    const p2Rendered = document.getElementById('mcPlayer');
    const p2Src = p2Rendered?.getAttribute('src') || '';
    const p2Srcset = p2Rendered?.getAttribute('srcset') || '';

    const out = base.call(ctx, preview, 'p1', kind);
    const p1 = document.getElementById('mcPlayer');
    if (!p1 || !p1.parentElement) return out;

    document.getElementById('mcPlayerPair')?.remove();
    document.getElementById('mcPlayer2')?.remove();

    const parent = p1.parentElement;
    const pair = document.createElement('div');
    pair.id = 'mcPlayerPair';
    Object.assign(pair.style, {
      width:'100%', display:'flex', justifyContent:'center', alignItems:'flex-end',
      gap:'clamp(12px,4vw,48px)', position:'relative', zIndex:'3'
    });

    parent.insertBefore(pair, p1);
    pair.appendChild(p1);

    const p2 = p1.cloneNode(true);
    p2.id = 'mcPlayer2';
    if (p2Src) p2.setAttribute('src', p2Src);
    if (p2Srcset) p2.setAttribute('srcset', p2Srcset); else p2.removeAttribute('srcset');
    p1.alt = 'Player 1 on the rostrum';
    p2.alt = 'Player 2 on the rostrum';

    [p1,p2].forEach((img,idx) => {
      img.style.setProperty('position','relative','important');
      img.style.setProperty('left','auto','important');
      img.style.setProperty('right','auto','important');
      img.style.setProperty('top','auto','important');
      img.style.setProperty('bottom','auto','important');
      img.style.setProperty('transform','none','important');
      img.style.setProperty('max-width','42%','important');
      img.style.setProperty('height','auto','important');
      img.dataset.rostrumPlayer = String(idx + 1);
    });
    pair.appendChild(p2);
    return out;
  }

  function installUiOverride() {
    const base = window.showMedalCeremony;
    if (typeof base !== 'function' || base.__awardUiV4) return false;

    const wrapped = function(preview = false, winner = 'p1', requestedKind = 'gold') {
      if (!preview) migrate();

      let kind = requestedKind === 'piece' ? 'piece' : 'gold';
      const latest = latestRecord();
      const qualified = latest ? recordQualified(latest.x) : false;
      const pieces = pieceCount();

      if (!preview) {
        if (!qualified) return false;

        // A lesson award is always shown as 1/11 first. Old callers that ask for
        // a full gold too early are downgraded to a lesson medal. Full gold is
        // valid only when all 11 lesson pieces have been earned.
        if (kind === 'gold' && pieces < 11) kind = 'piece';
        if (kind === 'gold') winner = 'p1';
        else winner = latestWinner(latest);
      } else if (kind === 'gold') {
        winner = 'p1';
      }

      const out = winner === 'tie' && kind === 'piece'
        ? renderTiePodium(base, this, preview, kind)
        : base.call(this, preview, winner, kind);

      const banner = document.querySelector('#medalCeremony .mc-banner');
      const player = document.getElementById('mcPlayer');
      const sub = document.getElementById('mcSub');
      const msg = document.getElementById('mcMessage');

      if (banner) banner.textContent = kind === 'piece' ? '🏅 1/11 MEDAL AWARD 🏅' : '🏆 GOLD MEDAL CEREMONY 🏆';
      if (player && winner !== 'tie') player.alt = winner === 'p2' ? 'Player 2 on the rostrum' : 'Player 1 on the rostrum';

      if (!preview && kind === 'piece') {
        if (sub) sub.textContent = `${Math.min(pieces, 11)}/11 lesson medals earned`;
        if (msg) {
          if (winner === 'tie') msg.textContent = 'It is a tie! Player 1 and Player 2 both receive a 1/11 medal on the rostrum!';
          else if (winner === 'p2') msg.textContent = 'Player 2 wins this lesson and earns a 1/11 medal!';
          else msg.textContent = 'Player 1 earns a 1/11 medal!';
        }
      }

      if (!preview && kind === 'gold') {
        if (sub) sub.textContent = 'All 11 Sports Fiesta lessons completed!';
        if (msg) msg.textContent = '🏆 Player 1 receives the Sports Fiesta GOLD MEDAL! 🏆';
      }
      return out;
    };

    wrapped.__awardUiV4 = true;
    window.showMedalCeremony = wrapped;
    return true;
  }

  function installRecordOverride() {
    if (!window.SportsFiestaAward || typeof window.SportsFiestaAward.record !== 'function') return false;
    if (window.SportsFiestaAward.record.__awardRulesV3) return true;

    const record = function(id, mode, winner, perfect) {
      id = Number(id); mode = Number(mode) || 1;
      if (!id) return;
      const d = readData();
      const old = d[id] || {};
      const priorQualified = recordQualified(old);
      const isTie = mode === 2 && winner === 'tie';
      const winnerNum = winner === 'p2' ? 2 : winner === 'p1' ? 1 : 0;
      const qualifies = mode === 1 ? !!perfect : (winnerNum > 0 || isTie);
      const pieceEarned = priorQualified || qualifies;

      d[id] = {
        ...old,
        completed: true,
        pieceEarned,
        awardQualified: pieceEarned,
        perfectSingle: !!old.perfectSingle || (mode === 1 && !!perfect),
        verified: true,
        source: 'game-v5',
        awardRules: 'v3',
        updatedAt: new Date().toISOString(),
        lastMode: mode,
        lastWinner: mode === 2 ? (isTie ? 'tie' : winnerNum) : (old.lastWinner ?? 0),
        lastAwardWinner: qualifies ? (mode === 1 ? 1 : (isTie ? 'tie' : winnerNum)) : (old.lastAwardWinner ?? 0)
      };

      localStorage.setItem(KEY, JSON.stringify(d));
      if (qualifies) {
        localStorage.setItem(PENDING, JSON.stringify({
          practiceId:id,
          mode,
          winner:mode===1?'p1':(isTie?'tie':winner),
          perfect:!!perfect,
          time:Date.now()
        }));
      } else {
        localStorage.removeItem(PENDING);
      }
    };

    record.__awardRulesV3 = true;
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
