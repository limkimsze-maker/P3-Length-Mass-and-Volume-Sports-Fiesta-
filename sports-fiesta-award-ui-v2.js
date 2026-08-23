/* SPORTS FIESTA AWARD UI — use the hub preview animation as the single source of truth */
(() => {
  if (window.__sportsFiestaPreviewAwardBridgeV1) return;
  window.__sportsFiestaPreviewAwardBridgeV1 = true;

  const base = window.showMedalCeremony;
  if (typeof base !== 'function') return;

  function bridgeInfo(requestedWinner) {
    try {
      const p = new URLSearchParams(location.search);
      const bridge = p.get('ceremonyBridge') || '';
      if (!/^award-v(?:6|7|8)/.test(bridge)) return { mode:null, winner:null };
      const modeRaw = Number(window.__sportsFiestaBridgeMode ?? p.get('mode'));
      const mode = modeRaw === 2 ? 2 : (modeRaw === 1 ? 1 : null);
      const candidates = [window.__sportsFiestaBridgeWinner, p.get('winner'), requestedWinner];
      let winner = null;
      for (const x of candidates) {
        if (x === 'p1' || x === 'p2' || x === 'tie') { winner = x; break; }
      }
      return { mode, winner };
    } catch (_) {
      return { mode:null, winner:null };
    }
  }

  function playerSources() {
    const cards = [...document.querySelectorAll('.playerImgWrap img.playerSvg')];
    return {
      p1: document.getElementById('fcP1')?.src || cards[0]?.src || '',
      p2: document.getElementById('fcP2')?.src || cards[1]?.src || ''
    };
  }

  function stageParts() {
    const ceremony = document.getElementById('medalCeremony');
    const card = ceremony?.querySelector('.mc-card');
    const stage = card?.querySelector('.mc-stage');
    const p1 = document.getElementById('mcPlayer');
    return { ceremony, card, stage, p1 };
  }

  function forceVisible() {
    const { ceremony } = stageParts();
    if (!ceremony) return;
    ceremony.classList.add('show');
    ceremony.setAttribute('aria-hidden', 'false');
  }

  function clearTie() {
    const { card, p1 } = stageParts();
    card?.classList.remove('tie');
    if (p1) {
      p1.classList.remove('sf-tie-player');
      p1.style.removeProperty('display');
      p1.style.removeProperty('left');
      p1.style.removeProperty('width');
      p1.style.removeProperty('height');
      p1.style.removeProperty('bottom');
      p1.style.removeProperty('animation');
    }
    const p2 = document.getElementById('mcPlayer2');
    if (p2) {
      p2.classList.remove('sf-tie-player');
      p2.style.removeProperty('left');
      p2.style.removeProperty('width');
      p2.style.removeProperty('height');
      p2.style.removeProperty('bottom');
      p2.style.removeProperty('animation');
      p2.style.setProperty('display', 'none', 'important');
    }
  }

  function showOnePlayer(winner) {
    const { p1 } = stageParts();
    if (!p1) return;
    const src = playerSources();
    const wanted = winner === 'p2' ? src.p2 : src.p1;
    if (wanted) p1.src = wanted;
    p1.alt = winner === 'p2' ? 'Player 2 on the rostrum' : 'Player 1 on the rostrum';
    p1.style.removeProperty('display');
  }

  function showTiePlayers() {
    const { card, stage, p1 } = stageParts();
    if (!card || !stage || !p1) return false;
    const src = playerSources();

    let p2 = document.getElementById('mcPlayer2');
    if (!p2) {
      p2 = p1.cloneNode(true);
      p2.id = 'mcPlayer2';
      stage.appendChild(p2);
    }

    // Use the original preview CSS. The hub already contains the .tie and
    // #mcPlayer2 animation rules; do not replace them with a second animation.
    card.classList.add('tie');
    p1.classList.remove('sf-tie-player');
    p2.classList.remove('sf-tie-player');

    if (src.p1) p1.src = src.p1;
    if (src.p2) p2.src = src.p2;
    p1.alt = 'Player 1 — joint 1st place';
    p2.alt = 'Player 2 — joint 1st place';
    p1.style.removeProperty('display');
    p2.style.removeProperty('left');
    p2.style.removeProperty('width');
    p2.style.removeProperty('height');
    p2.style.removeProperty('bottom');
    p2.style.removeProperty('animation');
    p2.style.setProperty('display', 'block', 'important');
    return true;
  }

  function restoreTieForAnimation() {
    // Re-apply only visibility/source state. Do not rewrite text, classes used by
    // the original podium/medal/glow animation, or animation timings.
    [0, 50, 180, 600, 1250].forEach(ms => setTimeout(showTiePlayers, ms));
  }

  const wrapped = function(preview = false, requestedWinner = 'p1', requestedKind = 'gold') {
    const bridge = bridgeInfo(requestedWinner);
    const kind = requestedKind === 'piece' ? 'piece' : 'gold';
    let winner = requestedWinner;

    // A real game result simply selects which of the existing preview animations
    // to play. No qualification/migration/mutation layer is allowed to block it.
    if (!preview && bridge.mode === 2 && bridge.winner) winner = bridge.winner;
    if (kind === 'gold') winner = 'p1';
    if (winner !== 'p1' && winner !== 'p2' && winner !== 'tie') winner = 'p1';

    let out;
    if (winner === 'tie' && kind === 'piece') {
      // Render the known-good Player 1 preview scaffold first, then add Player 2
      // using the hub's original tie-preview CSS. This prevents a blank tie path.
      out = base.call(this, preview, 'p1', kind);
      showTiePlayers();
      restoreTieForAnimation();
    } else {
      out = base.call(this, preview, winner, kind);
      clearTie();
      showOnePlayer(winner);
    }

    forceVisible();
    return out;
  };

  wrapped.__sportsFiestaPreviewAwardBridgeV1 = true;
  window.showMedalCeremony = wrapped;
})();
