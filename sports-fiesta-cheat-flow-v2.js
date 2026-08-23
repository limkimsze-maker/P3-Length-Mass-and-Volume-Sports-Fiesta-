(() => {
  if (window.__sfCheatFlowV2) return;
  window.__sfCheatFlowV2 = true;

  function copyFor(kind) {
    if (kind === 'p1') return {
      title: 'Player 1 Wins!',
      well: 'Well done, Player 1.',
      scores: 'Player 1 — Correct: 10 | Wrong: 0<br>Player 2 — Correct: 7 | Wrong: 3'
    };
    if (kind === 'p2') return {
      title: 'Player 2 Wins!',
      well: 'Well done, Player 2.',
      scores: 'Player 1 — Correct: 7 | Wrong: 3<br>Player 2 — Correct: 10 | Wrong: 0'
    };
    if (kind === 'tie') return {
      title: 'It’s a Tie!',
      well: 'Well done, both players!',
      scores: 'Player 1 — Correct: 8 | Wrong: 2<br>Player 2 — Correct: 8 | Wrong: 2'
    };
    return {
      title: 'Practice Complete!',
      well: 'Well done, Player 1.',
      scores: 'Player 1 — Perfect score'
    };
  }

  function showResult(kind) {
    document.getElementById('sfCheatFlowV2Overlay')?.remove();
    const c = copyFor(kind);
    const overlay = document.createElement('div');
    overlay.id = 'sfCheatFlowV2Overlay';
    Object.assign(overlay.style, {
      position:'fixed', inset:'0', zIndex:'2147483646', display:'flex',
      alignItems:'center', justifyContent:'center', padding:'18px',
      background:'rgba(12,42,75,.86)', backdropFilter:'blur(5px)',
      fontFamily:'Trebuchet MS,Arial,sans-serif'
    });
    overlay.innerHTML = `
      <div style="width:min(520px,94vw);background:#fff;color:#17324d;border:5px solid #d9ecff;border-radius:26px;padding:24px;text-align:center;box-shadow:0 24px 70px rgba(0,0,0,.32)">
        <div style="font-size:13px;font-weight:900;color:#6d35c7;margin-bottom:8px">🧪 FLOW TEST</div>
        <div style="font-size:clamp(28px,6vw,42px);font-weight:1000;margin:4px 0 8px">${c.title}</div>
        <div style="font-size:20px;font-weight:1000;color:#267044;margin-bottom:14px">${c.well}</div>
        <div style="font-size:17px;font-weight:800;line-height:1.65;background:#f4f8fc;border-radius:16px;padding:13px 15px;margin:0 auto 18px">${c.scores}</div>
        <button id="sfCheatFlowV2Next" type="button" style="min-width:170px;border:0;border-radius:15px;padding:13px 22px;background:#f4c542;color:#4b3700;font-size:20px;font-weight:1000;cursor:pointer;box-shadow:0 5px 0 #c99d22">Next →</button>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('#sfCheatFlowV2Next').onclick = () => {
      const fn = window.__sportsFiestaCheatFinish;
      if (typeof fn !== 'function') {
        overlay.querySelector('#sfCheatFlowV2Next').textContent = 'Loading…';
        setTimeout(() => {
          const retry = window.__sportsFiestaCheatFinish;
          if (typeof retry === 'function') {
            overlay.remove();
            retry(kind);
          }
        }, 250);
        return;
      }
      overlay.remove();
      fn(kind);
    };
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest?.('#sfFlowCheatPanel [data-sf-cheat]');
    if (!btn) return;
    const kind = btn.dataset.sfCheat;
    if (!['single','p1','p2','tie'].includes(kind)) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    document.getElementById('sfFlowCheatPanel')?.classList.remove('open');
    showResult(kind);
  }, true);
})();
