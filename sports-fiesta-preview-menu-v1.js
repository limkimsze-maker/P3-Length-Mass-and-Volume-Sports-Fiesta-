(() => {
  if (window.__sportsFiestaAllPreviewMenuV1) return;
  window.__sportsFiestaAllPreviewMenuV1 = true;

  const STYLE_ID = 'sfAllPreviewStyleV1';
  const PASS_ID = 'sfAllPreviewPassV1';
  const MENU_ID = 'sfAllPreviewMenuV1';

  function addStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = `
      #${PASS_ID},#${MENU_ID}{position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(13,42,75,.78);backdrop-filter:blur(6px);font-family:"Trebuchet MS",Arial,sans-serif}
      #${PASS_ID}.show,#${MENU_ID}.show{display:flex!important}
      .sf-ap-box{width:min(560px,94vw);max-height:90vh;overflow:auto;background:#fff;border:5px solid #d8ecff;border-radius:26px;padding:24px;box-shadow:0 24px 70px rgba(0,0,0,.3);text-align:center}
      .sf-ap-box h3{margin:0 0 7px;color:#154f82;font-size:clamp(24px,4vw,32px)}
      .sf-ap-box p{margin:4px 0 16px;color:#55758e;font-weight:700;line-height:1.4}
      #sfAllPreviewInputV1{width:160px;height:54px;border:3px solid #9fc9ec;border-radius:15px;text-align:center;font-size:28px;font-weight:1000;letter-spacing:5px;color:#111;background:#fff}
      #sfAllPreviewErrorV1{min-height:24px;margin:7px 0;color:#c83c3c;font-weight:900}
      .sf-ap-grid{display:grid;grid-template-columns:1fr;gap:10px;margin-top:12px}
      .sf-ap-choice,.sf-ap-action{border:0;border-radius:15px;padding:13px 15px;font-weight:1000;font-size:17px;cursor:pointer;box-shadow:0 4px 0 rgba(0,0,0,.14)}
      .sf-ap-choice{background:linear-gradient(#fff8c9,#ffd85d);color:#6b4900;border:2px solid #e3b73a}
      .sf-ap-action{background:#357ed8;color:#fff}.sf-ap-cancel{background:#eaf1f6;color:#36566e}
      .sf-ap-choice:active,.sf-ap-action:active{transform:translateY(2px);box-shadow:0 2px 0 rgba(0,0,0,.14)}
      @media(min-width:650px){.sf-ap-grid{grid-template-columns:1fr 1fr}.sf-ap-grid .sf-ap-wide{grid-column:1/-1}}
    `;
    document.head.appendChild(st);
  }

  function ensureUi() {
    addStyle();
    if (!document.getElementById(PASS_ID)) {
      const pass = document.createElement('div');
      pass.id = PASS_ID;
      pass.setAttribute('aria-hidden','true');
      pass.innerHTML = `<div class="sf-ap-box"><h3>🔒 Teacher Preview</h3><p>Enter the teacher password to preview all award animations.</p><input id="sfAllPreviewInputV1" type="password" inputmode="numeric" maxlength="2" autocomplete="off" aria-label="Teacher preview password"><div id="sfAllPreviewErrorV1"></div><div class="sf-ap-grid"><button class="sf-ap-action" type="button" id="sfAllPreviewUnlockV1">Unlock</button><button class="sf-ap-action sf-ap-cancel" type="button" id="sfAllPreviewCancelPassV1">Cancel</button></div></div>`;
      document.body.appendChild(pass);
    }
    if (!document.getElementById(MENU_ID)) {
      const menu = document.createElement('div');
      menu.id = MENU_ID;
      menu.setAttribute('aria-hidden','true');
      menu.innerHTML = `<div class="sf-ap-box"><h3>🏅 Preview Every Award Animation</h3><p>Choose a real award scenario. Preview only — saved pupil progress will not change.</p><div class="sf-ap-grid"><button class="sf-ap-choice" data-sf-preview="single-piece">👤 1 Player — Earn 1/11</button><button class="sf-ap-choice" data-sf-preview="p1-win">🔵 2 Players — Player 1 Wins</button><button class="sf-ap-choice" data-sf-preview="p2-win">🔴 2 Players — Player 2 Wins</button><button class="sf-ap-choice" data-sf-preview="tie">🤝 2 Players — Tie / Shared 1st</button><button class="sf-ap-choice sf-ap-wide" data-sf-preview="gold">🏆 11/11 — Final Gold Medal</button><button class="sf-ap-action sf-ap-cancel sf-ap-wide" type="button" id="sfAllPreviewCloseV1">Close</button></div></div>`;
      document.body.appendChild(menu);
    }
  }

  function show(el) { el?.classList.add('show'); el?.setAttribute('aria-hidden','false'); }
  function hide(el) { el?.classList.remove('show'); el?.setAttribute('aria-hidden','true'); }

  function setCopy(scenario) {
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

  function playScenario(scenario) {
    hide(document.getElementById(MENU_ID));
    if (typeof window.showMedalCeremony !== 'function') return;
    if (scenario === 'single-piece') window.showMedalCeremony(true,'p1','piece');
    else if (scenario === 'p1-win') window.showMedalCeremony(true,'p1','piece');
    else if (scenario === 'p2-win') window.showMedalCeremony(true,'p2','piece');
    else if (scenario === 'tie') window.showMedalCeremony(true,'tie','piece');
    else if (scenario === 'gold') window.showMedalCeremony(true,'p1','gold');
    else return;
    [0,80,250,600].forEach(ms => setTimeout(() => setCopy(scenario), ms));
  }

  function bind() {
    ensureUi();
    const pass = document.getElementById(PASS_ID);
    const menu = document.getElementById(MENU_ID);
    const input = document.getElementById('sfAllPreviewInputV1');
    const err = document.getElementById('sfAllPreviewErrorV1');
    const unlock = document.getElementById('sfAllPreviewUnlockV1');
    const cancelPass = document.getElementById('sfAllPreviewCancelPassV1');
    const closeMenu = document.getElementById('sfAllPreviewCloseV1');

    window.unlockCeremonyPreview = function() {
      ensureUi();
      if (err) err.textContent = '';
      if (input) input.value = '';
      show(pass);
      setTimeout(() => input?.focus(), 60);
    };

    const check = () => {
      if (input?.value === '67') {
        hide(pass);
        if (err) err.textContent = '';
        show(menu);
      } else {
        if (err) err.textContent = 'Incorrect password.';
        if (input) { input.value = ''; input.focus(); }
      }
    };

    unlock.onclick = check;
    cancelPass.onclick = () => hide(pass);
    closeMenu.onclick = () => hide(menu);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    menu.querySelectorAll('[data-sf-preview]').forEach(btn => {
      btn.addEventListener('click', () => playScenario(btn.dataset.sfPreview));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, {once:true});
  else bind();
})();
