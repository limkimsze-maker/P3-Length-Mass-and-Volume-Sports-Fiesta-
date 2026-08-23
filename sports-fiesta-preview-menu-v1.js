(() => {
  if (window.__sportsFiestaPreviewDebugV4) return;
  window.__sportsFiestaPreviewDebugV4 = true;

  const HUB_URL = 'https://limkimsze-maker.github.io/P3-Length-Mass-and-Volume-Sports-Fiesta-/';
  const PASS = '67';

  function getMode() {
    try { if (typeof mode !== 'undefined') return Number(mode) === 2 ? 2 : 1; } catch (_) {}
    try { if (typeof gameMode !== 'undefined') return String(gameMode).includes('2') ? 2 : 1; } catch (_) {}
    return 1;
  }

  function wellDoneFor(winner) {
    if (winner === 'p2') return 'Well done, Player 2.';
    if (winner === 'tie') return 'Well done, both players!';
    return 'Well done, Player 1.';
  }

  function replaceWrongCongrats(root, winner) {
    if (!root || winner === 'p1') return;
    const wanted = wellDoneFor(winner);
    const patterns = winner === 'p2'
      ? [/Well\s*done\s*,?\s*Player\s*1\s*[.!]?/gi,/Congratulations\s*,?\s*(?:to\s+)?Player\s*1\s*[.!]?/gi,/Great\s*job\s*,?\s*Player\s*1\s*[.!]?/gi]
      : [/Well\s*done\s*,?\s*Player\s*[12]\s*[.!]?/gi,/Congratulations\s*,?\s*(?:to\s+)?Player\s*[12]\s*[.!]?/gi,/Great\s*job\s*,?\s*Player\s*[12]\s*[.!]?/gi];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      let text = node.nodeValue || '';
      patterns.forEach(re => { text = text.replace(re, wanted); });
      node.nodeValue = text;
    });
  }

  function bridgeWinner() {
    try {
      const p = new URLSearchParams(location.search);
      if (!/^award-v(?:6|7|8)/.test(p.get('ceremonyBridge') || '')) return null;
      const w = window.__sportsFiestaBridgeWinner || p.get('winner');
      return w === 'p1' || w === 'p2' || w === 'tie' ? w : null;
    } catch (_) { return null; }
  }

  function guardRealCeremonyCopy() {
    const winner = bridgeWinner();
    if (!winner) return;
    const enforce = () => {
      const ceremony = document.getElementById('medalCeremony');
      const msg = document.getElementById('mcMessage');
      if (msg && winner !== 'p1') {
        const lines = (msg.innerHTML || '').split(/<br\s*\/?\s*>/i);
        const tail = lines.length > 1 ? '<br>' + lines.slice(1).join('<br>') : '';
        msg.innerHTML = `<b>${wellDoneFor(winner)}</b>${tail}`;
      }
      replaceWrongCongrats(ceremony, winner);
    };
    [0,50,120,250,500,900,1500,2500,4500,7000].forEach(ms => setTimeout(enforce, ms));
    let ceremony = null;
    const timer = setInterval(() => {
      const now = document.getElementById('medalCeremony');
      if (now && now !== ceremony) {
        ceremony = now;
        new MutationObserver(enforce).observe(now, {subtree:true, childList:true, characterData:true});
        enforce();
      }
    }, 100);
    setTimeout(() => clearInterval(timer), 15000);
  }

  const PREVIEW_PASS = 'sfPreviewPassV4';
  const PREVIEW_MENU = 'sfPreviewMenuV4';
  function ensurePreviewUi() {
    if (!document.getElementById('sfPreviewDebugStyleV4')) {
      const st = document.createElement('style');
      st.id = 'sfPreviewDebugStyleV4';
      st.textContent = `
        #${PREVIEW_PASS},#${PREVIEW_MENU}{position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(13,42,75,.8);backdrop-filter:blur(6px);font-family:"Trebuchet MS",Arial,sans-serif}
        #${PREVIEW_PASS}.show,#${PREVIEW_MENU}.show{display:flex!important}
        .sf-v4-box{width:min(570px,94vw);max-height:90vh;overflow:auto;background:#fff;border:5px solid #d8ecff;border-radius:26px;padding:24px;text-align:center;box-shadow:0 24px 70px rgba(0,0,0,.3)}
        .sf-v4-box h3{margin:0 0 8px;color:#154f82;font-size:clamp(24px,4vw,32px)}
        .sf-v4-grid{display:grid;grid-template-columns:1fr;gap:10px;margin-top:14px}
        .sf-v4-grid button{border:0;border-radius:15px;padding:13px 15px;font-weight:1000;font-size:16px;cursor:pointer;box-shadow:0 4px 0 rgba(0,0,0,.14)}
        .sf-v4-choice{background:linear-gradient(#fff8c9,#ffd85d);color:#6b4900;border:2px solid #e3b73a!important}
        .sf-v4-action{background:#357ed8;color:#fff}.sf-v4-cancel{background:#eaf1f6;color:#36566e}
        #sfPreviewInputV4{width:160px;height:54px;border:3px solid #9fc9ec;border-radius:15px;text-align:center;font-size:28px;font-weight:1000;letter-spacing:5px}
        #sfPreviewErrorV4{min-height:24px;margin:7px 0;color:#c83c3c;font-weight:900}
        @media(min-width:650px){.sf-v4-grid{grid-template-columns:1fr 1fr}.sf-v4-wide{grid-column:1/-1}}
      `;
      document.head.appendChild(st);
    }
    if (!document.getElementById(PREVIEW_PASS)) {
      const el = document.createElement('div');
      el.id = PREVIEW_PASS;
      el.innerHTML = `<div class="sf-v4-box"><h3>🔒 Teacher Preview</h3><p>Enter password 67.</p><input id="sfPreviewInputV4" type="password" inputmode="numeric" maxlength="2"><div id="sfPreviewErrorV4"></div><div class="sf-v4-grid"><button class="sf-v4-action" id="sfPreviewUnlockV4">Unlock</button><button class="sf-v4-action sf-v4-cancel" id="sfPreviewCancelV4">Cancel</button></div></div>`;
      document.body.appendChild(el);
    }
    if (!document.getElementById(PREVIEW_MENU)) {
      const el = document.createElement('div');
      el.id = PREVIEW_MENU;
      el.innerHTML = `<div class="sf-v4-box"><h3>🏅 Preview Every Award Animation</h3><p>Preview only — saved pupil progress will not change.</p><div class="sf-v4-grid"><button class="sf-v4-choice" data-preview-v4="single">👤 1 Player — Earn 1/11</button><button class="sf-v4-choice" data-preview-v4="p1">🔵 2 Players — Player 1 Wins</button><button class="sf-v4-choice" data-preview-v4="p2">🔴 2 Players — Player 2 Wins</button><button class="sf-v4-choice" data-preview-v4="tie">🤝 2 Players — Tie / Shared 1st</button><button class="sf-v4-choice sf-v4-wide" data-preview-v4="gold">🏆 11/11 — Final Gold Medal</button><button class="sf-v4-action sf-v4-cancel sf-v4-wide" id="sfPreviewCloseV4">Close</button></div></div>`;
      document.body.appendChild(el);
    }
  }

  function previewScenario(kind) {
    const menu = document.getElementById(PREVIEW_MENU);
    menu?.classList.remove('show');
    if (typeof window.showMedalCeremony !== 'function') return;
    if (kind === 'p2') window.showMedalCeremony(true,'p2','piece');
    else if (kind === 'tie') window.showMedalCeremony(true,'tie','piece');
    else if (kind === 'gold') window.showMedalCeremony(true,'p1','gold');
    else window.showMedalCeremony(true,'p1','piece');
    const winner = kind === 'p2' ? 'p2' : kind === 'tie' ? 'tie' : 'p1';
    const msg = document.getElementById('mcMessage');
    if (msg) msg.textContent = kind === 'gold' ? '🏆 GOLD MEDAL CHAMPION — Well done, Player 1. 🏆' : wellDoneFor(winner);
    replaceWrongCongrats(document.getElementById('medalCeremony'), winner);
  }

  function bindPreview() {
    ensurePreviewUi();
    const pass = document.getElementById(PREVIEW_PASS);
    const menu = document.getElementById(PREVIEW_MENU);
    const input = document.getElementById('sfPreviewInputV4');
    const err = document.getElementById('sfPreviewErrorV4');
    window.unlockCeremonyPreview = () => {
      input.value = ''; err.textContent = ''; pass.classList.add('show');
      setTimeout(() => input.focus(), 50);
    };
    const unlock = () => {
      if (input.value !== PASS) { err.textContent = 'Incorrect password.'; input.value=''; input.focus(); return; }
      pass.classList.remove('show'); menu.classList.add('show');
    };
    document.getElementById('sfPreviewUnlockV4').onclick = unlock;
    document.getElementById('sfPreviewCancelV4').onclick = () => pass.classList.remove('show');
    document.getElementById('sfPreviewCloseV4').onclick = () => menu.classList.remove('show');
    input.addEventListener('keydown', e => { if (e.key === 'Enter') unlock(); });
    menu.querySelectorAll('[data-preview-v4]').forEach(btn => btn.onclick = () => previewScenario(btn.dataset.previewV4));
  }

  let debugUnlocked = sessionStorage.getItem('sportsFiestaDebugUnlocked_v4') === '1';
  let debugBusy = false;

  function forceDebugCeremonyVisible() {
    if (!debugBusy) return;
    const frames = [...document.querySelectorAll('iframe[title="Sports Fiesta medal ceremony"]')];
    const frame = frames[frames.length - 1];
    if (!frame) return;
    frame.title = 'Sports Fiesta DEBUG ceremony';
    frame.style.setProperty('display','block','important');
    frame.style.setProperty('visibility','visible','important');
    frame.style.setProperty('opacity','1','important');
  }

  function runExistingCheat(kind) {
    if (typeof window.__sportsFiestaCheatFinish !== 'function') return;
    debugBusy = true;
    window.__sportsFiestaCheatFinish(kind);
    [0,30,80,150].forEach(ms => setTimeout(() => document.getElementById('sfCheatFlowNextV2')?.click(), ms));
    [30,80,150,300,600,1000,1800].forEach(ms => setTimeout(forceDebugCeremonyVisible, ms));
    setTimeout(() => { debugBusy = false; }, 5000);
  }

  function installDebug() {
    document.getElementById('sfFlowCheatPanel')?.remove();
    if (!document.getElementById('sfPracticeDebugStyleV4')) {
      const st = document.createElement('style');
      st.id = 'sfPracticeDebugStyleV4';
      st.textContent = `
        #sfPracticeDebugV4{position:fixed;right:12px;bottom:12px;z-index:2147483002;font-family:"Trebuchet MS",Arial,sans-serif;display:flex;align-items:flex-end;gap:7px;flex-wrap:wrap;justify-content:flex-end;max-width:min(680px,95vw)}
        #sfPracticeDebugV4 button{border:2px solid #fff;border-radius:13px;padding:9px 12px;font-size:12px;font-weight:1000;cursor:pointer;box-shadow:0 5px 16px rgba(0,0,0,.25)}
        #sfDebugUnlockV4{background:#5c2aa6;color:#fff;border-radius:999px!important}
        #sfDebugButtonsV4{display:none;gap:7px;flex-wrap:wrap;justify-content:flex-end;background:rgba(255,255,255,.97);border:3px solid #d8c8ff;border-radius:16px;padding:8px}
        #sfPracticeDebugV4.unlocked #sfDebugButtonsV4{display:flex}#sfPracticeDebugV4.unlocked #sfDebugUnlockV4{display:none}
        .sf-debug-single{background:#ffe272;color:#5d4300}.sf-debug-p1{background:#dcecff;color:#144e88}.sf-debug-p2{background:#ffe0e5;color:#8b2638}.sf-debug-tie{background:#e6f7e8;color:#246b31}.sf-debug-lock{background:#eef1f5;color:#53606d}
        @media(max-width:600px){#sfPracticeDebugV4{right:7px;bottom:7px}#sfPracticeDebugV4 button{padding:7px 9px;font-size:10px}#sfDebugButtonsV4{gap:5px;padding:6px}}
      `;
      document.head.appendChild(st);
    }
    let panel = document.getElementById('sfPracticeDebugV4');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'sfPracticeDebugV4';
      panel.innerHTML = `<button id="sfDebugUnlockV4" type="button">DEBUG</button><div id="sfDebugButtonsV4"></div>`;
      document.body.appendChild(panel);
      panel.querySelector('#sfDebugUnlockV4').onclick = () => {
        const entered = window.prompt('DEBUG password');
        if (entered === null) return;
        if (entered !== PASS) { window.alert('Incorrect password.'); return; }
        debugUnlocked = true;
        sessionStorage.setItem('sportsFiestaDebugUnlocked_v4','1');
        renderDebugButtons();
      };
      panel.querySelector('#sfDebugButtonsV4').addEventListener('click', e => {
        const lock = e.target.closest?.('[data-debug-lock-v4]');
        if (lock) {
          debugUnlocked = false;
          sessionStorage.removeItem('sportsFiestaDebugUnlocked_v4');
          renderDebugButtons();
          return;
        }
        const btn = e.target.closest?.('[data-debug-kind-v4]');
        if (btn) runExistingCheat(btn.dataset.debugKindV4);
      });
    }
    renderDebugButtons();
  }

  function renderDebugButtons() {
    const panel = document.getElementById('sfPracticeDebugV4');
    const box = document.getElementById('sfDebugButtonsV4');
    if (!panel || !box) return;
    if (!debugUnlocked) { panel.classList.remove('unlocked'); box.innerHTML=''; return; }
    panel.classList.add('unlocked');
    if (getMode() === 2) {
      box.innerHTML = `<button class="sf-debug-p1" data-debug-kind-v4="p1">Player 1 Wins</button><button class="sf-debug-p2" data-debug-kind-v4="p2">Player 2 Wins</button><button class="sf-debug-tie" data-debug-kind-v4="tie">Tie</button><button class="sf-debug-lock" data-debug-lock-v4>🔒</button>`;
    } else {
      box.innerHTML = `<button class="sf-debug-single" data-debug-kind-v4="single">Player 1 Cheat Solve</button><button class="sf-debug-lock" data-debug-lock-v4>🔒</button>`;
    }
  }

  function bind() {
    bindPreview();
    guardRealCeremonyCopy();
    let lastMode = -1;
    const sync = () => {
      document.getElementById('sfFlowCheatPanel')?.remove();
      installDebug();
      const gm = getMode();
      if (gm !== lastMode) { lastMode = gm; renderDebugButtons(); }
      if (debugBusy) forceDebugCeremonyVisible();
    };
    sync();
    setInterval(sync, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, {once:true});
  else bind();
})();