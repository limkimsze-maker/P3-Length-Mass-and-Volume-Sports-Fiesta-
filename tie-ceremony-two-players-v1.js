(() => {
  if (window.__sfTieAndPreviewV10) return;
  window.__sfTieAndPreviewV10 = true;

  const style = document.createElement('style');
  style.id = 'sf-tie-preview-v10-style';
  style.textContent = `
    #medalCeremony .sf-tie-fallback{
      position:absolute!important;bottom:150px!important;z-index:10!important;
      width:96px!important;height:96px!important;border-radius:50%!important;
      display:flex!important;align-items:center!important;justify-content:center!important;
      background:#fff!important;border:6px solid #ffe27a!important;
      box-shadow:0 8px 20px rgba(0,0,0,.18)!important;
      color:#17324d!important;font-size:28px!important;font-weight:1000!important;
    }
    #medalCeremony .sf-tie-fallback.p1{left:42%!important;transform:translateX(-50%)!important}
    #medalCeremony .sf-tie-fallback.p2{left:58%!important;transform:translateX(-50%)!important}
    @media(max-width:620px){
      #medalCeremony .sf-tie-fallback{width:74px!important;height:74px!important;bottom:145px!important;font-size:22px!important}
      #medalCeremony .sf-tie-fallback.p1{left:38%!important}
      #medalCeremony .sf-tie-fallback.p2{left:62%!important}
    }
  `;
  document.head.appendChild(style);

  function validSrc(src) {
    return typeof src === 'string' && src.trim() && !src.endsWith('/') && src !== location.href;
  }

  function playerSources() {
    const cards = [...document.querySelectorAll('.playerImgWrap img.playerSvg')];
    return {
      p1: document.getElementById('fcP1')?.src || cards[0]?.src || '',
      p2: document.getElementById('fcP2')?.src || cards[1]?.src || ''
    };
  }

  function ensureFallback(stage, who) {
    let badge = stage.querySelector(`.sf-tie-fallback.${who}`);
    if (!badge) {
      badge = document.createElement('div');
      badge.className = `sf-tie-fallback ${who}`;
      badge.textContent = who === 'p1' ? 'P1' : 'P2';
      badge.setAttribute('aria-label', who === 'p1' ? 'Player 1' : 'Player 2');
      stage.appendChild(badge);
    }
  }

  function removeFallback(stage, who) {
    stage.querySelector(`.sf-tie-fallback.${who}`)?.remove();
  }

  function clearTie() {
    const ceremony = document.getElementById('medalCeremony');
    const card = ceremony?.querySelector('.mc-card');
    const stage = ceremony?.querySelector('.mc-stage');
    card?.classList.remove('tie');
    stage?.querySelector('.sf-tie-fallback.p1')?.remove();
    stage?.querySelector('.sf-tie-fallback.p2')?.remove();
    const p2 = document.getElementById('mcPlayer2');
    if (p2) p2.style.setProperty('display', 'none', 'important');
  }

  function showTiePlayers() {
    const ceremony = document.getElementById('medalCeremony');
    const card = ceremony?.querySelector('.mc-card');
    const stage = ceremony?.querySelector('.mc-stage');
    const p1 = document.getElementById('mcPlayer');
    if (!ceremony || !card || !stage || !p1) return false;

    const src = playerSources();
    let p2 = document.getElementById('mcPlayer2');
    if (!p2) {
      p2 = p1.cloneNode(false);
      p2.id = 'mcPlayer2';
      p2.alt = 'Player 2';
      stage.appendChild(p2);
    }

    ceremony.classList.add('show');
    ceremony.setAttribute('aria-hidden', 'false');
    card.classList.add('piece', 'tie');

    if (validSrc(src.p1)) {
      p1.src = src.p1;
      p1.style.removeProperty('display');
      removeFallback(stage, 'p1');
    } else if (!validSrc(p1.src)) {
      p1.style.setProperty('display', 'none', 'important');
      ensureFallback(stage, 'p1');
    }

    if (validSrc(src.p2)) {
      p2.src = src.p2;
      p2.style.setProperty('display', 'block', 'important');
      removeFallback(stage, 'p2');
    } else if (!validSrc(p2.src)) {
      p2.style.setProperty('display', 'none', 'important');
      ensureFallback(stage, 'p2');
    } else {
      p2.style.setProperty('display', 'block', 'important');
    }

    p1.alt = 'Player 1 — joint 1st place';
    p2.alt = 'Player 2 — joint 1st place';
    return true;
  }

  function scheduleTiePlayers() {
    [0, 50, 160, 420, 900, 1500].forEach(ms => setTimeout(showTiePlayers, ms));
  }

  function installTieBridge() {
    const base = window.showMedalCeremony;
    if (typeof base !== 'function') return false;
    if (base.__sfTiePreviewV10) return true;

    const wrapped = function(preview = false, winner = 'p1', kind = 'gold') {
      if (winner === 'tie' && kind === 'piece') {
        const out = base.call(this, preview, 'p1', 'piece');
        scheduleTiePlayers();
        return out;
      }
      clearTie();
      return base.apply(this, arguments);
    };
    wrapped.__sfTiePreviewV10 = true;
    window.showMedalCeremony = wrapped;
    return true;
  }

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
      sub.textContent = 'Teacher preview • Tie / Shared 1st';
      msg.textContent = 'It is a tie! Player 1 and Player 2 share 1st place!';
    } else if (scenario === 'gold') {
      banner.textContent = '🏆 GOLD MEDAL CEREMONY 🏆';
      sub.textContent = 'Teacher preview • all 11 practices completed perfectly';
      msg.textContent = '🏆 Player 1 receives the complete Sports Fiesta GOLD MEDAL! 🏆';
    }
  }

  window.sfPreviewScenario = function(scenario) {
    if (typeof window.sfCloseMenu === 'function') window.sfCloseMenu();
    if (typeof window.showMedalCeremony !== 'function') return;

    if (scenario === 'single-piece') window.showMedalCeremony(true, 'p1', 'piece');
    else if (scenario === 'p1-win') window.showMedalCeremony(true, 'p1', 'piece');
    else if (scenario === 'p2-win') window.showMedalCeremony(true, 'p2', 'piece');
    else if (scenario === 'tie') window.showMedalCeremony(true, 'tie', 'piece');
    else if (scenario === 'gold') window.showMedalCeremony(true, 'p1', 'gold');
    else return;

    [0, 80, 300].forEach(ms => setTimeout(() => setPreviewCopy(scenario), ms));
  };

  const expectedButtons = [
    '👤 1 Player — Earn 1/11',
    '🔵 2 Players — Player 1 Wins',
    '🔴 2 Players — Player 2 Wins',
    '🤝 2 Players — Tie / Shared 1st',
    '🏆 11/11 — Final Gold Medal'
  ];

  function installPreviewMenu() {
    const menu = document.getElementById('sfPreviewMenu');
    const box = menu?.querySelector('.sfBox');
    const buttons = box?.querySelector('.sfBtns');
    if (!buttons) return false;

    const current = [...buttons.querySelectorAll('.sfChoice')].map(b => (b.textContent || '').trim());
    const correct = current.length === expectedButtons.length && expectedButtons.every((x, i) => current[i] === x);
    if (correct && buttons.dataset.allAwardAnimations === 'v10') return true;

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
    buttons.dataset.allAwardAnimations = 'v10';
    return true;
  }

  function installUnlockGuard() {
    const baseCheck = window.sfCheckPass;
    if (typeof baseCheck === 'function' && !baseCheck.__sfPreviewMenuV10) {
      const wrappedCheck = function() {
        const out = baseCheck.apply(this, arguments);
        [0, 20, 80, 180].forEach(ms => setTimeout(installPreviewMenu, ms));
        return out;
      };
      wrappedCheck.__sfPreviewMenuV10 = true;
      window.sfCheckPass = wrappedCheck;
    }

    const baseUnlock = window.unlockCeremonyPreview;
    if (typeof baseUnlock === 'function' && !baseUnlock.__sfPreviewMenuV10) {
      const wrappedUnlock = function() {
        installPreviewMenu();
        const out = baseUnlock.apply(this, arguments);
        setTimeout(installPreviewMenu, 20);
        return out;
      };
      wrappedUnlock.__sfPreviewMenuV10 = true;
      window.unlockCeremonyPreview = wrappedUnlock;
    }
  }

  function observeMenu() {
    const menu = document.getElementById('sfPreviewMenu');
    if (!menu || menu.__sfPreviewObserverV10) return false;
    menu.__sfPreviewObserverV10 = true;
    const observer = new MutationObserver(() => queueMicrotask(installPreviewMenu));
    observer.observe(menu, {subtree:true, childList:true, characterData:true});
    return true;
  }

  function installEverything() {
    installTieBridge();
    installPreviewMenu();
    installUnlockGuard();
    observeMenu();
  }

  installEverything();
  [50, 150, 350, 800, 1600, 3000].forEach(ms => setTimeout(installEverything, ms));
})();
