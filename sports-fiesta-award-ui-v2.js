/* SPORTS FIESTA AWARD UI V7 — real standalone 2-player awards + separate 1-player gold progress */
(() => {
  if (window.__sportsFiestaAwardUiV7) return;
  window.__sportsFiestaAwardUiV7 = true;
  const KEY = 'sportsFiestaHubProgress_v1';
  const PENDING = 'sportsFiestaPendingAward_v1';

  function recordQualified(x) {
    if (!x || typeof x !== 'object') return false;
    return x.perfectSingle === true || x.singlePlayerPerfect === true;
  }

  function readData() {
    let d = {};
    try { d = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) {}
    return d;
  }

  function pieceCountFrom(d) {
    let pieces = 0;
    for (let i = 1; i <= 11; i++) if (recordQualified(d[i])) pieces++;
    return pieces;
  }

  function migrate() {
    const d = readData();
    let changed = false;
    for (let i = 1; i <= 11; i++) {
      const x = d[i];
      if (!x || typeof x !== 'object') continue;
      const qualified = recordQualified(x);
      if (x.pieceEarned !== qualified || x.awardQualified !== qualified || x.awardRules !== 'v8-single-vs-duel-separated') {
        x.pieceEarned = qualified;
        x.awardQualified = qualified;
        x.singlePlayerPerfect = !!(x.singlePlayerPerfect || x.perfectSingle);
        x.awardRules = 'v8-single-vs-duel-separated';
        d[i] = x;
        changed = true;
      }
    }
    if (pieceCountFrom(d) < 11 && d.__finalGoldAwarded) {
      delete d.__finalGoldAwarded;
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
        if (Number(p.mode) !== 1 || !p.perfect) localStorage.removeItem(PENDING);
      }
    } catch (_) { localStorage.removeItem(PENDING); }
  }

  function latestQualifiedRecord() {
    const d = readData();
    let best = null;
    for (let i = 1; i <= 11; i++) {
      const x = d[i];
      if (!recordQualified(x)) continue;
      const stamp = Date.parse(x.updatedAt || '') || 0;
      if (!best || stamp > best.stamp) best = { id:i, x, stamp };
    }
    return best;
  }

  function pieceCount() { return pieceCountFrom(readData()); }

  function bridgeInfo(requestedWinner) {
    try {
      const params = new URLSearchParams(location.search);
      const bridge = params.get('ceremonyBridge') || '';
      if (!/^award-v(?:6|7|8)/.test(bridge)) return {winner:null, mode:null};
      const candidates = [window.__sportsFiestaBridgeWinner, params.get('winner'), requestedWinner];
      let winner = null;
      for (const x of candidates) {
        if (x === 'p1' || x === 'p2' || x === 'tie') { winner = x; break; }
      }
      const modeRaw = Number(window.__sportsFiestaBridgeMode ?? params.get('mode'));
      const mode = modeRaw === 2 ? 2 : (modeRaw === 1 ? 1 : null);
      return {winner, mode};
    } catch (_) { return {winner:null, mode:null}; }
  }

  function playerSources() {
    const cards = [...document.querySelectorAll('.playerImgWrap img.playerSvg')];
    return {
      p1: document.getElementById('fcP1')?.src || cards[0]?.src || '',
      p2: document.getElementById('fcP2')?.src || cards[1]?.src || ''
    };
  }

  function ensureTiePlayers() {
    const card = document.querySelector('#medalCeremony .mc-card');
    const stage = card?.querySelector('.mc-stage');
    const p1 = document.getElementById('mcPlayer');
    if (!card || !stage || !p1) return;

    const src = playerSources();
    let p2 = document.getElementById('mcPlayer2');
    if (!p2) {
      p2 = p1.cloneNode(true);
      p2.id = 'mcPlayer2';
      p2.alt = 'Player 2 on the rostrum';
      stage.appendChild(p2);
    }

    card.classList.add('tie');
    if (src.p1) p1.src = src.p1;
    if (src.p2) p2.src = src.p2;
    p1.alt = 'Player 1 on the rostrum';
    p2.alt = 'Player 2 on the rostrum';
    p1.style.removeProperty('display');
    p2.style.setProperty('display','block','important');
  }

  function markFirstAsOrdinal() {
    const root = document.getElementById('medalCeremony');
    if (!root) return;

    root.querySelectorAll('*').forEach(el => {
      if (!el.children.length && el.textContent.trim() === '1') el.textContent = '1st';
      try {
        const before = getComputedStyle(el, '::before').content;
        if (before === '"1"' || before === "'1'") el.classList.add('sf-first-ordinal');
      } catch (_) {}
    });

    if (!document.getElementById('sfCeremonyClarityStyleV7')) {
      const st = document.createElement('style');
      st.id = 'sfCeremonyClarityStyleV7';
      st.textContent = `
        #medalCeremony .sf-first-ordinal::before{content:"1st"!important;font-size:.72em!important}
        #medalCeremony #mcMessage.sf-clear-result{
          position:absolute!important;
          left:50%!important;
          bottom:12px!important;
          transform:translateX(-50%)!important;
          z-index:20!important;
          box-sizing:border-box!important;
          background:#fff!important;
          color:#111!important;
          text-shadow:none!important;
          border:2px solid rgba(0,0,0,.10)!important;
          border-radius:18px!important;
          box-shadow:0 7px 20px rgba(0,0,0,.20)!important;
          width:min(760px,86%)!important;
          max-width:760px!important;
          padding:12px 20px!important;
          line-height:1.35!important;
          font-size:clamp(16px,2.1vw,21px)!important;
          text-align:center!important;
        }
        #medalCeremony #mcMessage.sf-clear-result *{text-shadow:none!important}
        #medalCeremony #mcMessage .sf-result-winner{
          display:block!important;
          font-size:1.28em!important;
          font-weight:1000!important;
          margin-bottom:5px!important;
          color:#000!important;
        }
        #medalCeremony #mcMessage .sf-result-note{
          display:block!important;
          font-size:.86em!important;
          font-weight:800!important;
          margin-bottom:6px!important;
          color:#333!important;
        }
        #medalCeremony #mcMessage .sf-result-line{
          display:block!important;
          font-size:.94em!important;
          font-weight:900!important;
          color:#111!important;
        }
        @media(max-width:600px){
          #medalCeremony #mcMessage.sf-clear-result{
            width:92%!important;
            padding:9px 11px!important;
            bottom:8px!important;
            font-size:14px!important;
            border-radius:14px!important;
          }
        }
      `;
      document.head.appendChild(st);
    }
  }

  function formatTwoPlayerMessage(winner) {
    const msg = document.getElementById('mcMessage');
    if (!msg) return;
    markFirstAsOrdinal();
    msg.classList.add('sf-clear-result');

    const raw = (msg.textContent || '').replace(/\s+/g,' ').trim();
    const m = raw.match(/Player\s*1:\s*(\d+)\s*correct,\s*(\d+)\s*wrong\.\s*Player\s*2:\s*(\d+)\s*correct,\s*(\d+)\s*wrong/i);
    const p1c=m?m[1]:null,p1w=m?m[2]:null,p2c=m?m[3]:null,p2w=m?m[4]:null;
    const title = winner === 'tie' ? "It's a tie!" : `Winner: ${winner === 'p2' ? 'Player 2' : 'Player 1'}`;
    const note = winner === 'tie' ? 'Both players share 1st place and receive the match award.' : 'Winner receives the standalone match award.';

    let html = `<span class="sf-result-winner">${title}</span><span class="sf-result-note">${note}</span>`;
    if (p1c !== null) {
      html += `<span class="sf-result-line">Player 1 — Correct: ${p1c} | Wrong: ${p1w}</span>`;
      html += `<span class="sf-result-line">Player 2 — Correct: ${p2c} | Wrong: ${p2w}</span>`;
    }
    msg.innerHTML = html;
  }

  function installClarityGuard(winner, standaloneTwoPlayer) {
    markFirstAsOrdinal();
    if (!standaloneTwoPlayer) return;
    if (winner === 'tie') ensureTiePlayers();

    const msg = document.getElementById('mcMessage');
    if (!msg) return;

    if (!msg.__sfClarityGuardV7) {
      msg.__sfClarityGuardV7 = true;
      const obs = new MutationObserver(() => {
        queueMicrotask(() => {
          if (winner === 'tie') ensureTiePlayers();
          formatTwoPlayerMessage(winner);
        });
      });
      obs.observe(msg,{childList:true,subtree:true,characterData:true});
    }

    [0,80,180,950,1300,1950,2300,3200].forEach(ms=>setTimeout(()=>{
      if (winner === 'tie') ensureTiePlayers();
      formatTwoPlayerMessage(winner);
    },ms));
  }

  function installUiOverride() {
    const base = window.showMedalCeremony;
    if (typeof base !== 'function' || base.__awardUiV7) return false;

    const wrapped = function(preview = false, winner = 'p1', requestedKind = 'gold') {
      const requestedWinner = winner;
      if (!preview) migrate();

      let kind = requestedKind === 'piece' ? 'piece' : 'gold';
      const bridge = bridgeInfo(requestedWinner);

      // Important: a 2-player match may arrive from older parent code with
      // preview=true. Treat the bridge mode as authoritative so it still becomes
      // a real standalone match award, never a teacher preview.
      const standaloneTwoPlayer = kind === 'piece' && bridge.mode === 2 && !!bridge.winner;
      const latest = latestQualifiedRecord();
      const qualified = !!latest;
      const pieces = pieceCount();

      if (standaloneTwoPlayer) {
        winner = bridge.winner;
        kind = 'piece';
      } else if (!preview) {
        if (!qualified) return false;
        if (kind === 'gold' && pieces < 11) kind = 'piece';
        if (kind === 'gold') winner = 'p1';
        else winner = bridge.winner || 'p1';
      } else if (kind === 'gold') {
        winner = 'p1';
      }

      // Standalone 2-player awards are real ceremonies, not teacher previews.
      const effectivePreview = standaloneTwoPlayer ? false : preview;
      const out = base.call(this, effectivePreview, winner, kind);

      if (standaloneTwoPlayer && winner === 'tie') ensureTiePlayers();

      const banner = document.querySelector('#medalCeremony .mc-banner');
      const player = document.getElementById('mcPlayer');
      const sub = document.getElementById('mcSub');
      const msg = document.getElementById('mcMessage');

      if (banner) banner.textContent = standaloneTwoPlayer
        ? '🏅 2-PLAYER MATCH AWARD 🏅'
        : (kind === 'piece' ? '🏅 1/11 MEDAL AWARD 🏅' : '🏆 GOLD MEDAL CEREMONY 🏆');

      if (player && winner !== 'tie') player.alt = winner === 'p2' ? 'Player 2 on the rostrum' : 'Player 1 on the rostrum';

      if (standaloneTwoPlayer) {
        if (sub) sub.textContent = 'Standalone 2-player match — does not affect 1-player gold progress';
        if (msg) msg.textContent = winner === 'tie'
          ? 'It is a tie! Player 1 and Player 2 both receive the match award!'
          : `${winner === 'p2' ? 'Player 2' : 'Player 1'} wins this match and receives the winner award!`;
      } else if (!effectivePreview && kind === 'piece') {
        if (sub) sub.textContent = `${Math.min(pieces, 11)}/11 1-player lesson medals earned`;
        if (msg) msg.textContent = 'Perfect 1-player score — Player 1 earns a 1/11 medal!';
      }

      if (!effectivePreview && kind === 'gold') {
        if (sub) sub.textContent = 'All 11 Sports Fiesta practices completed perfectly in 1-player mode!';
        if (msg) msg.textContent = '🏆 Player 1 receives the Sports Fiesta GOLD MEDAL! 🏆';
      }

      installClarityGuard(winner, standaloneTwoPlayer);
      return out;
    };

    wrapped.__awardUiV7 = true;
    window.showMedalCeremony = wrapped;
    return true;
  }

  function installRecordOverride() {
    if (!window.SportsFiestaAward || typeof window.SportsFiestaAward.record !== 'function') return false;
    if (window.SportsFiestaAward.record.__awardRulesV8) return true;

    const record = function(id, mode, winner, perfect) {
      id = Number(id); mode = Number(mode) || 1;
      if (!id) return;
      const d = readData();
      const old = d[id] || {};

      if (mode === 2) {
        d[id] = {
          ...old,
          twoPlayerLastWinner:winner === 'tie'?'tie':(winner === 'p2'?'p2':'p1'),
          twoPlayerUpdatedAt:new Date().toISOString(),
          awardRules:'v8-single-vs-duel-separated'
        };
        localStorage.setItem(KEY, JSON.stringify(d));
        localStorage.removeItem(PENDING);
        return;
      }

      const nowPerfect = !!(old.perfectSingle || old.singlePlayerPerfect || perfect);
      d[id] = {
        ...old,
        completed:true,
        singlePlayerCompleted:true,
        singlePlayerPerfect:nowPerfect,
        perfectSingle:nowPerfect,
        pieceEarned:nowPerfect,
        awardQualified:nowPerfect,
        verified:true,
        source:'game-v8',
        awardRules:'v8-single-vs-duel-separated',
        updatedAt:new Date().toISOString(),
        lastMode:1,
        lastAwardWinner:nowPerfect?1:(old.lastAwardWinner??0)
      };
      localStorage.setItem(KEY, JSON.stringify(d));
      if (perfect) localStorage.setItem(PENDING,JSON.stringify({practiceId:id,mode:1,winner:'p1',perfect:true,time:Date.now()}));
      else localStorage.removeItem(PENDING);
    };

    record.__awardRulesV8 = true;
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
