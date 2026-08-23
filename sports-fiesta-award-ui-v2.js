/* SPORTS FIESTA AWARD UI — use the hub preview animation as the single source of truth */
(() => {
  if (window.__sportsFiestaPreviewAwardBridgeV2) return;
  window.__sportsFiestaPreviewAwardBridgeV2 = true;

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

  wrapped.__sportsFiestaPreviewAwardBridgeV2 = true;
  window.showMedalCeremony = wrapped;

  function setPreviewCopy(scenario) {
    const banner = document.querySelector('#medalCeremony .mc-banner');
    const sub = document.getElementById('mcSub');
    const msg = document.getElementById('mcMessage');
    if (!banner || !sub || !msg) return;

    if (scenario === 'single-piece') {
      banner.textContent = '🏅 1-PLAYER 1/11 MEDAL AWARD 🏅';
      sub.textContent = 'Teacher preview • perfect 1-player practice';
      msg.textContent = 'Player 1 completes the practice perfectly and earns 1/11 of the gold medal!';
    } else if (scenario === 'p1-win') {
      banner.textContent = '🏅 2-PLAYER MATCH AWARD 🏅';
      sub.textContent = 'Teacher preview • Player 1 wins';
      msg.textContent = 'Player 1 wins the match and earns the 1/11 gold medal piece!';
    } else if (scenario === 'p2-win') {
      banner.textContent = '🏅 2-PLAYER MATCH AWARD 🏅';
      sub.textContent = 'Teacher preview • Player 2 wins';
      msg.textContent = 'Player 2 wins the match and earns the 1/11 gold medal piece!';
    } else if (scenario === 'tie') {
      banner.textContent = '🏅 2-PLAYER SHARED AWARD 🏅';
      sub.textContent = 'Teacher preview • tie';
      msg.textContent = 'It is a tie! Player 1 and Player 2 share 1st place!';
    } else if (scenario === 'gold') {
      banner.textContent = '🏆 GOLD MEDAL CEREMONY 🏆';
      sub.textContent = 'Teacher preview • all 11 practices completed perfectly';
      msg.textContent = '🏆 Player 1 receives the complete Sports Fiesta GOLD MEDAL! 🏆';
    }
  }

  function previewScenario(scenario) {
    if (typeof window.sfCloseMenu === 'function') window.sfCloseMenu();

    if (scenario === 'single-piece') {
      window.showMedalCeremony(true, 'p1', 'piece');
    } else if (scenario === 'p1-win') {
      window.showMedalCeremony(true, 'p1', 'piece');
    } else if (scenario === 'p2-win') {
      window.showMedalCeremony(true, 'p2', 'piece');
    } else if (scenario === 'tie') {
      window.showMedalCeremony(true, 'tie', 'piece');
    } else if (scenario === 'gold') {
      window.showMedalCeremony(true, 'p1', 'gold');
    } else {
      return;
    }

    setPreviewCopy(scenario);
  }

  window.sfPreviewScenario = previewScenario;

  function installAllPreviewChoices() {
    const menu = document.getElementById('sfPreviewMenu');
    const box = menu?.querySelector('.sfBox');
    const buttons = box?.querySelector('.sfBtns');
    if (!buttons || buttons.dataset.allAwardAnimations === '1') return false;

    const heading = box.querySelector('h3');
    const note = box.querySelector('p');
    if (heading) heading.textContent = '🏅 Preview Every Award Animation';
    if (note) note.textContent = 'Choose any real award scenario. Preview only — saved pupil progress will not change.';

    buttons.innerHTML = `
      <button class="sfChoice" type="button" onclick="sfPreviewScenario('single-piece')">👤 1 Player — Earn 1/11</button>
      <button class="sfChoice" type="button" onclick="sfPreviewScenario('p1-win')">🔵 2 Players — Player 1 Wins</button>
      <button class="sfChoice" type="button" onclick="sfPreviewScenario('p2-win')">🔴 2 Players — Player 2 Wins</button>
      <button class="sfChoice" type="button" onclick="sfPreviewScenario('tie')">🤝 2 Players — Tie / Shared 1st</button>
      <button class="sfChoice" type="button" onclick="sfPreviewScenario('gold')">🏆 11/11 — Final Gold Medal</button>
      <button class="sfCancel" type="button" onclick="sfCloseMenu()">Close</button>
    `;
    buttons.dataset.allAwardAnimations = '1';
    return true;
  }

  if (!installAllPreviewChoices()) {
    let tries = 0;
    const previewTimer = setInterval(() => {
      if (installAllPreviewChoices() || ++tries > 40) clearInterval(previewTimer);
    }, 100);
  }
})();
