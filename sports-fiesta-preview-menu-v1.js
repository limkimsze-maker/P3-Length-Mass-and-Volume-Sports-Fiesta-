(() => {
  if (window.__sportsFiestaPreviewDebugV5) return;
  window.__sportsFiestaPreviewDebugV5 = true;

  const PASS = '1215';
  const PREVIEW_PASS = 'sfPreviewPassV5';
  const PREVIEW_MENU = 'sfPreviewMenuV5';

  function getMode() {
    try { if (typeof mode !== 'undefined') return Number(mode) === 2 ? 2 : 1; } catch (_) {}
    try { if (typeof gameMode !== 'undefined') return String(gameMode).includes('2') ? 2 : 1; } catch (_) {}
    return 1;
  }

  function getPracticeId() {
    const s = [...document.scripts].find(x => /sports-fiesta-awards-v1\.js/i.test(x.src || '') && x.dataset?.practice);
    return Number(s?.dataset?.practice || 0);
  }

  function getQuestionTotal() {
    try { if (typeof TOTAL !== 'undefined' && Number.isFinite(Number(TOTAL))) return Math.max(1, Number(TOTAL)); } catch (_) {}
    try { if (typeof N !== 'undefined' && Number.isFinite(Number(N))) return Math.max(1, Number(N)); } catch (_) {}
    try { if (typeof MAX_TURNS !== 'undefined' && Number.isFinite(Number(MAX_TURNS))) return Math.max(1, Number(MAX_TURNS)); } catch (_) {}
    try { if (typeof totalQuestions !== 'undefined' && Number.isFinite(Number(totalQuestions))) return Math.max(1, Number(totalQuestions)); } catch (_) {}
    const dots = document.querySelectorAll('[data-question],.question-dot,.qdot,.progress-dot').length;
    return dots > 0 ? dots : 12;
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
        const html = msg.innerHTML || '';
        const br = html.search(/<br\s*\/?\s*>/i);
        const tail = br >= 0 ? html.slice(br) : '';
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

  /* The retry controller intentionally holds 2-player ceremony iframes until Next.
     It was also catching 1-player ceremonies. Rename only 1-player ceremony frames
     synchronously before they enter the DOM, so the normal 1-player Next works. */
  if (!window.__sfOnePlayerCeremonyAppendFixV5) {
    window.__sfOnePlayerCeremonyAppendFixV5 = true;
    const originalAppendChild = Node.prototype.appendChild;
    Node.prototype.appendChild = function(node) {
      try {
        if (this === document.body && node?.tagName === 'IFRAME' && node.title === 'Sports Fiesta medal ceremony' && getMode() === 1) {
          node.title = 'Sports Fiesta 1-player medal ceremony';
        }
      } catch (_) {}
      return originalAppendChild.call(this, node);
    };
  }

  function ensurePreviewUi() {
    if (!document.getElementById('sfPreviewDebugStyleV5')) {
      const st = document.createElement('style');
      st.id = 'sfPreviewDebugStyleV5';
      st.textContent = `
        #${PREVIEW_PASS},#${PREVIEW_MENU}{position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(13,42,75,.8);backdrop-filter:blur(6px);font-family:"Trebuchet MS",Arial,sans-serif}
        #${PREVIEW_PASS}.show,#${PREVIEW_MENU}.show{display:flex!important}
        .sf-v5-box{width:min(570px,94vw);max-height:90vh;overflow:auto;background:#fff;border:5px solid #d8ecff;border-radius:26px;padding:24px;text-align:center;box-shadow:0 24px 70px rgba(0,0,0,.3)}
        .sf-v5-box h3{margin:0 0 8px;color:#154f82;font-size:clamp(24px,4vw,32px)}
        .sf-v5-grid{display:grid;grid-template-columns:1fr;gap:10px;margin-top:14px}
        .sf-v5-grid button{border:0;border-radius:15px;padding:13px 15px;font-weight:1000;font-size:16px;cursor:pointer;box-shadow:0 4px 0 rgba(0,0,0,.14)}
        .sf-v5-choice{background:linear-gradient(#fff8c9,#ffd85d);color:#6b4900;border:2px solid #e3b73a!important}
        .sf-v5-action{background:#357ed8;color:#fff}.sf-v5-cancel{background:#eaf1f6;color:#36566e}
        #sfPreviewInputV5{width:160px;height:54px;border:3px solid #9fc9ec;border-radius:15px;text-align:center;font-size:28px;font-weight:1000;letter-spacing:5px}
        #sfPreviewErrorV5{min-height:24px;margin:7px 0;color:#c83c3c;font-weight:900}
        @media(min-width:650px){.sf-v5-grid{grid-template-columns:1fr 1fr}.sf-v5-wide{grid-column:1/-1}}
      `;
      document.head.appendChild(st);
    }
    if (!document.getElementById(PREVIEW_PASS)) {
      const el = document.createElement('div');
      el.id = PREVIEW_PASS;
      el.innerHTML = `<div class="sf-v5-box"><h3>🔒 Teacher Preview</h3><p>Enter the password.</p><input id="sfPreviewInputV5" type="password" inputmode="numeric" maxlength="4"><div id="sfPreviewErrorV5"></div><div class="sf-v5-grid"><button class="sf-v5-action" id="sfPreviewUnlockV5">Unlock</button><button class="sf-v5-action sf-v5-cancel" id="sfPreviewCancelV5">Cancel</button></div></div>`;
      document.body.appendChild(el);
    }
    if (!document.getElementById(PREVIEW_MENU)) {
      const el = document.createElement('div');
      el.id = PREVIEW_MENU;
      el.innerHTML = `<div class="sf-v5-box"><h3>🏅 Preview Every Award Animation</h3><p>Preview only — saved pupil progress will not change.</p><div class="sf-v5-grid"><button class="sf-v5-choice" data-preview-v5="single">👤 1 Player — Earn 1/11</button><button class="sf-v5-choice" data-preview-v5="p1">🔵 2 Players — Player 1 Wins</button><button class="sf-v5-choice" data-preview-v5="p2">🔴 2 Players — Player 2 Wins</button><button class="sf-v5-choice" data-preview-v5="tie">🤝 2 Players — Tie / Shared 1st</button><button class="sf-v5-choice sf-v5-wide" data-preview-v5="gold">🏆 11/11 — Final Gold Medal</button><button class="sf-v5-action sf-v5-cancel sf-v5-wide" id="sfPreviewCloseV5">Close</button></div></div>`;
      document.body.appendChild(el);
    }
  }

  function previewScenario(kind) {
    document.getElementById(PREVIEW_MENU)?.classList.remove('show');
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
    const input = document.getElementById('sfPreviewInputV5');
    const err = document.getElementById('sfPreviewErrorV5');
    window.unlockCeremonyPreview = () => {
      input.value = ''; err.textContent = ''; pass.classList.add('show');
      setTimeout(() => input.focus(), 50);
    };
    const unlock = () => {
      if (input.value !== PASS) { err.textContent = 'Incorrect password.'; input.value=''; input.focus(); return; }
      pass.classList.remove('show'); menu.classList.add('show');
    };
    document.getElementById('sfPreviewUnlockV5').onclick = unlock;
    document.getElementById('sfPreviewCancelV5').onclick = () => pass.classList.remove('show');
    document.getElementById('sfPreviewCloseV5').onclick = () => menu.classList.remove('show');
    input.addEventListener('keydown', e => { if (e.key === 'Enter') unlock(); });
    menu.querySelectorAll('[data-preview-v5]').forEach(btn => btn.onclick = () => previewScenario(btn.dataset.previewV5));
  }

  function setAttemptState(kind) {
    const correct = Array.isArray(window.__sportsFiestaCorrectAttempts) ? window.__sportsFiestaCorrectAttempts : null;
    const wrong = Array.isArray(window.__sportsFiestaMistakes) ? window.__sportsFiestaMistakes : null;
    const values = kind === 'p1' ? [10,7,0,3] : kind === 'p2' ? [7,10,3,0] : [8,8,2,2];
    if (correct) { correct[0] = values[0]; correct[1] = values[1]; }
    if (wrong) { wrong[0] = values[2]; wrong[1] = values[3]; }
    if (!window.__sportsFiestaAttemptStats || !Array.isArray(window.__sportsFiestaAttemptStats.correct) || !Array.isArray(window.__sportsFiestaAttemptStats.wrong)) {
      window.__sportsFiestaAttemptStats = {correct:[values[0],values[1]], wrong:[values[2],values[3]]};
    } else {
      window.__sportsFiestaAttemptStats.correct[0] = values[0];
      window.__sportsFiestaAttemptStats.correct[1] = values[1];
      window.__sportsFiestaAttemptStats.wrong[0] = values[2];
      window.__sportsFiestaAttemptStats.wrong[1] = values[3];
    }
    window.__sportsFiestaFairWinner = kind;
    return values;
  }

  function resultParts(results) {
    let title = document.getElementById('resultTitle') || document.getElementById('rt');
    let text = document.getElementById('resultText') || document.getElementById('rr');
    if (!title) {
      title = document.getElementById('sfDebugResultTitleV5');
      if (!title) {
        title = document.createElement('h2');
        title.id = 'sfDebugResultTitleV5';
        results.prepend(title);
      }
    }
    if (!text) {
      text = document.getElementById('sfDebugResultTextV5');
      if (!text) {
        text = document.createElement('div');
        text.id = 'sfDebugResultTextV5';
        title.insertAdjacentElement('afterend', text);
      }
    }
    return {title,text};
  }

  function activateNormalResults(results) {
    const parent = results.parentElement;
    if (parent) {
      [...parent.children].forEach(el => {
        if (el !== results && el.classList?.contains('active')) el.classList.remove('active');
      });
    }
    results.style.removeProperty('display');
    results.style.removeProperty('visibility');
    results.classList.add('active');
  }

  function fastForwardToNormalResult(kind) {
    const practice = getPracticeId();
    if (!practice) return;
    const gm = getMode();
    if (gm === 1) kind = 'single';
    if (gm === 2 && !['p1','p2','tie'].includes(kind)) return;

    const results = document.getElementById('results');
    if (!results) {
      window.alert('DEBUG could not find this practice’s normal Results screen.');
      return;
    }

    document.getElementById('sfCheatFlowResultV2')?.remove();
    document.querySelectorAll('iframe[title^="Sports Fiesta"]').forEach(f => f.remove());

    /* First make the normal awards observer see Results as inactive, which resets
       its handledResult flag. Then activate the real Results screen. */
    results.classList.remove('active');
    const {title,text} = resultParts(results);
    const total = getQuestionTotal();

    if (gm === 1) {
      title.textContent = 'Perfect Score!';
      text.innerHTML = `<b>Player 1 — Correct: ${total} / ${total}</b><br>Perfect score!`;
    } else {
      const v = setAttemptState(kind);
      const label = kind === 'tie' ? "It's a Tie!" : `Player ${kind === 'p2' ? 2 : 1} Wins!`;
      const raceLabel = practice === 1 && kind !== 'tie' ? `Player ${kind === 'p2' ? 2 : 1} Wins the Race!` : label;
      title.textContent = raceLabel;
      text.innerHTML = `<b>Attempt record</b><br>Player 1 — Correct: <b>${v[0]}</b> &nbsp; Wrong: <b>${v[2]}</b><br>Player 2 — Correct: <b>${v[1]}</b> &nbsp; Wrong: <b>${v[3]}</b>`;
    }

    setTimeout(() => {
      activateNormalResults(results);
      /* Keep the intended 2-player outcome stable while the normal retry/result
         observers finish their own bookkeeping. */
      if (gm === 2) [0,80,180,350].forEach(ms => setTimeout(() => { window.__sportsFiestaFairWinner = kind; }, ms));
    }, 320);
  }

  let debugUnlocked = sessionStorage.getItem('sportsFiestaDebugUnlocked_v5') === '1';

  function installDebug() {
    const practice = getPracticeId();
    if (!practice) return;
    document.getElementById('sfFlowCheatPanel')?.remove();
    document.getElementById('sfPracticeDebugV4')?.remove();

    if (!document.getElementById('sfPracticeDebugStyleV5')) {
      const st = document.createElement('style');
      st.id = 'sfPracticeDebugStyleV5';
      st.textContent = `
        #sfPracticeDebugV5{position:fixed;right:12px;bottom:12px;z-index:2147483002;font-family:"Trebuchet MS",Arial,sans-serif;display:flex;align-items:flex-end;gap:7px;flex-wrap:wrap;justify-content:flex-end;max-width:min(680px,95vw)}
        #sfPracticeDebugV5 button{border:2px solid #fff;border-radius:13px;padding:9px 12px;font-size:12px;font-weight:1000;cursor:pointer;box-shadow:0 5px 16px rgba(0,0,0,.25)}
        #sfDebugUnlockV5{background:#5c2aa6;color:#fff;border-radius:999px!important}
        #sfDebugButtonsV5{display:none;gap:7px;flex-wrap:wrap;justify-content:flex-end;background:rgba(255,255,255,.97);border:3px solid #d8c8ff;border-radius:16px;padding:8px}
        #sfPracticeDebugV5.unlocked #sfDebugButtonsV5{display:flex}#sfPracticeDebugV5.unlocked #sfDebugUnlockV5{display:none}
        .sf-debug-single{background:#ffe272;color:#5d4300}.sf-debug-p1{background:#dcecff;color:#144e88}.sf-debug-p2{background:#ffe0e5;color:#8b2638}.sf-debug-tie{background:#e6f7e8;color:#246b31}.sf-debug-lock{background:#eef1f5;color:#53606d}
        @media(max-width:600px){#sfPracticeDebugV5{right:7px;bottom:7px}#sfPracticeDebugV5 button{padding:7px 9px;font-size:10px}#sfDebugButtonsV5{gap:5px;padding:6px}}
      `;
      document.head.appendChild(st);
    }

    let panel = document.getElementById('sfPracticeDebugV5');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'sfPracticeDebugV5';
      panel.innerHTML = `<button id="sfDebugUnlockV5" type="button">DEBUG</button><div id="sfDebugButtonsV5"></div>`;
      document.body.appendChild(panel);
      panel.querySelector('#sfDebugUnlockV5').onclick = () => {
        const entered = window.prompt('DEBUG password');
        if (entered === null) return;
        if (entered !== PASS) { window.alert('Incorrect password.'); return; }
        debugUnlocked = true;
        sessionStorage.setItem('sportsFiestaDebugUnlocked_v5','1');
        renderDebugButtons();
      };
      panel.querySelector('#sfDebugButtonsV5').addEventListener('click', e => {
        const lock = e.target.closest?.('[data-debug-lock-v5]');
        if (lock) {
          debugUnlocked = false;
          sessionStorage.removeItem('sportsFiestaDebugUnlocked_v5');
          renderDebugButtons();
          return;
        }
        const btn = e.target.closest?.('[data-debug-kind-v5]');
        if (btn) fastForwardToNormalResult(btn.dataset.debugKindV5);
      });
    }
    renderDebugButtons();
  }

  function renderDebugButtons() {
    const panel = document.getElementById('sfPracticeDebugV5');
    const box = document.getElementById('sfDebugButtonsV5');
    if (!panel || !box) return;
    if (!debugUnlocked) { panel.classList.remove('unlocked'); box.innerHTML=''; return; }
    panel.classList.add('unlocked');
    if (getMode() === 2) {
      box.innerHTML = `<button class="sf-debug-p1" data-debug-kind-v5="p1">Player 1 Wins</button><button class="sf-debug-p2" data-debug-kind-v5="p2">Player 2 Wins</button><button class="sf-debug-tie" data-debug-kind-v5="tie">Tie</button><button class="sf-debug-lock" data-debug-lock-v5>🔒</button>`;
    } else {
      box.innerHTML = `<button class="sf-debug-single" data-debug-kind-v5="single">Player 1 Cheat Solve</button><button class="sf-debug-lock" data-debug-lock-v5>🔒</button>`;
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
    };
    sync();
    setInterval(sync, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, {once:true});
  else bind();
})();
