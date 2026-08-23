/* Sports Fiesta awards and shared project helpers */
(() => {
  const script = document.currentScript;
  const PRACTICE_ID = Number(script?.dataset?.practice || 0);
  const SPORT = script?.dataset?.sport || `Practice ${PRACTICE_ID}`;
  if (!PRACTICE_ID || window.__sportsFiestaAwardsOnlyV1) return;
  window.__sportsFiestaAwardsOnlyV1 = true;

  // Practice 10 visual correction: the lane-marker bar colours should match their labels.
  if (PRACTICE_ID === 10 && typeof window.markerStripSVG === 'function') {
    const originalMarkerStripSVG = window.markerStripSVG;
    window.markerStripSVG = function(a, extra) {
      return originalMarkerStripSVG(a, extra)
        .replace('fill="#efc78f"', 'fill="#4a90e2"')
        .replace('fill="#e576a6"', 'fill="#f6c94c"');
    };
  }

  // Practice 11 display rule: keep each answer value and its ml unit together.
  if (PRACTICE_ID === 11) {
    const style = document.createElement('style');
    style.textContent = '.sf-unit-pair{display:inline-flex;align-items:center;gap:7px;white-space:nowrap}';
    document.head.appendChild(style);

    const keepMlWithAnswer = () => {
      document.querySelectorAll('#questionContent .eqLine input.answerInput').forEach(input => {
        if (input.closest('.sf-unit-pair')) return;
        const unitSpan = input.nextElementSibling;
        if (!unitSpan) return;
        const text = unitSpan.textContent || '';
        const match = text.match(/^\s*ml\b(.*)$/i);
        if (!match) return;

        const pair = document.createElement('span');
        pair.className = 'sf-unit-pair';
        const ml = document.createElement('span');
        ml.textContent = 'ml';

        input.parentNode.insertBefore(pair, input);
        pair.appendChild(input);
        pair.appendChild(ml);

        const rest = match[1] || '';
        if (rest) unitSpan.textContent = rest;
        else unitSpan.remove();
      });
    };

    const target = document.getElementById('questionContent') || document.body;
    new MutationObserver(keepMlWithAnswer).observe(target, {subtree:true, childList:true});
    window.addEventListener('load', keepMlWithAnswer);
    setTimeout(keepMlWithAnswer, 0);
  }

  const HUB_KEY = 'sportsFiestaHubProgress_v1';
  const HUB_URL = 'https://limkimsze-maker.github.io/P3-Length-Mass-and-Volume-Sports-Fiesta-/';

  // Shared mastery/fair-play rule for Practices 1–11.
  const retryScript = document.createElement('script');
  retryScript.src = HUB_URL + 'sports-fiesta-retry-v1.js?v=20260823e';
  retryScript.dataset.practice = String(PRACTICE_ID);
  retryScript.async = false;
  document.head.appendChild(retryScript);

  let handledResult = false;
  let timer = null;

  function visible(el) {
    if (!el) return false;
    const s = getComputedStyle(el);
    return s.display !== 'none' && s.visibility !== 'hidden' && el.classList.contains('active');
  }

  function getMode() {
    try {
      if (typeof mode !== 'undefined') return Number(mode) === 2 ? 2 : 1;
    } catch (_) {}
    try {
      if (typeof gameMode !== 'undefined') return String(gameMode).includes('2') ? 2 : 1;
    } catch (_) {}
    return 1;
  }

  function accuracyScores() {
    try { if (typeof correctCounts !== 'undefined' && Array.isArray(correctCounts)) return correctCounts; } catch (_) {}
    try { if (typeof corrects !== 'undefined' && Array.isArray(corrects)) return corrects; } catch (_) {}
    try { if (typeof scores !== 'undefined' && Array.isArray(scores)) return scores; } catch (_) {}
    return null;
  }

  function competitionScores() {
    try { if (typeof scores !== 'undefined' && Array.isArray(scores)) return scores; } catch (_) {}
    try { if (typeof distances !== 'undefined' && Array.isArray(distances)) return distances; } catch (_) {}
    return accuracyScores();
  }

  function questionTotal() {
    try { if (typeof TOTAL !== 'undefined' && Number.isFinite(Number(TOTAL))) return Number(TOTAL); } catch (_) {}
    try { if (typeof N !== 'undefined' && Number.isFinite(Number(N))) return Number(N); } catch (_) {}
    try { if (typeof MAX_TURNS !== 'undefined' && Number.isFinite(Number(MAX_TURNS))) return Number(MAX_TURNS); } catch (_) {}
    try { if (typeof totalQuestions !== 'undefined' && Number.isFinite(Number(totalQuestions))) return Number(totalQuestions); } catch (_) {}
    return null;
  }

  function attemptStats() {
    const x = window.__sportsFiestaAttemptStats;
    if (!x) return null;
    const c1 = Number(x.correct?.[0]), c2 = Number(x.correct?.[1]);
    const w1 = Number(x.wrong?.[0]), w2 = Number(x.wrong?.[1]);
    if (![c1,c2,w1,w2].every(Number.isFinite)) return null;
    return {c1,c2,w1,w2};
  }

  function attemptWinner() {
    const a = attemptStats();
    if (!a) return null;
    if (a.c1 !== a.c2) return a.c1 > a.c2 ? 'p1' : 'p2';
    if (a.w1 !== a.w2) return a.w1 < a.w2 ? 'p1' : 'p2';
    return 'tie';
  }

  function readState(gm) {
    const accuracy = accuracyScores();
    const competition = competitionScores();
    const total = questionTotal();

    let p1 = accuracy && Number.isFinite(Number(accuracy[0])) ? Number(accuracy[0]) : null;
    let p2 = accuracy && Number.isFinite(Number(accuracy[1])) ? Number(accuracy[1]) : null;
    let c1 = competition && Number.isFinite(Number(competition[0])) ? Number(competition[0]) : p1;
    let c2 = competition && Number.isFinite(Number(competition[1])) ? Number(competition[1]) : p2;

    const result = document.getElementById('results');
    const text = (result?.innerText || '').replace(/\s+/g, ' ').trim();

    if (gm === 1 && (p1 == null || total == null)) {
      const fraction = text.match(/(\d+)\s*(?:\/|out of)\s*(\d+)/i);
      if (fraction) {
        p1 = Number(fraction[1]);
        if (total == null) {
          const t = Number(fraction[2]);
          if (Number.isFinite(t)) return {p1, p2, c1, c2, total:t};
        }
      }
    }
    return {p1, p2, c1, c2, total};
  }

  function resultOutcome(gm) {
    const s = readState(gm);
    if (gm === 1) {
      return {
        winner: 'p1',
        perfect: s.p1 != null && s.total != null && s.total > 0 && s.p1 === s.total
      };
    }

    // Practice 1 remains a true first-to-finish race.
    if (PRACTICE_ID === 1) {
      if (s.c1 == null || s.c2 == null) return {winner:'tie', perfect:false};
      return {winner:s.c1===s.c2?'tie':(s.c1>s.c2?'p1':'p2'), perfect:false};
    }

    // Practices 2–11 use one transparent rule everywhere:
    // more correct attempts; if equal, fewer wrong attempts; if still equal, tie.
    const fairWinner = window.__sportsFiestaFairWinner;
    if (fairWinner === 'p1' || fairWinner === 'p2' || fairWinner === 'tie') {
      return {winner: fairWinner, perfect:false};
    }
    const trackedWinner = attemptWinner();
    if (trackedWinner) return {winner:trackedWinner, perfect:false};

    if (s.c1 == null || s.c2 == null) return {winner:'tie', perfect:false};
    return {winner:s.c1===s.c2?'tie':(s.c1>s.c2?'p1':'p2'), perfect:false};
  }

  function qualifiesOldRecord(x) {
    if (!x) return false;
    const oldWinner = x.lastWinner;
    const awardWinner = x.lastAwardWinner;
    const winnerQualified =
      Number(x.lastMode) === 2 &&
      (oldWinner === 'p1' || oldWinner === 'p2' || oldWinner === 'tie' ||
       Number(oldWinner) === 1 || Number(oldWinner) === 2);
    const awardWinnerQualified =
      awardWinner === 'p1' || awardWinner === 'p2' || awardWinner === 'tie' ||
      Number(awardWinner) === 1 || Number(awardWinner) === 2;
    return x.perfectSingle === true || winnerQualified || awardWinnerQualified;
  }

  function updateProgress(gm, outcome) {
    let data = {};
    try { data = JSON.parse(localStorage.getItem(HUB_KEY) || '{}') || {}; } catch (_) {}
    const old = data[PRACTICE_ID] || {};

    let piecesBefore = 0;
    for (let i = 1; i <= 11; i++) if (qualifiesOldRecord(data[i])) piecesBefore++;

    const priorQualified = qualifiesOldRecord(old);
    const qualifies = gm === 1 ? outcome.perfect : true;
    const pieceEarned = priorQualified || qualifies;
    const winnerValue = gm === 2
      ? (outcome.winner === 'tie' ? 'tie' : (outcome.winner === 'p2' ? 2 : 1))
      : (old.lastWinner ?? 0);
    const stats = attemptStats();

    data[PRACTICE_ID] = {
      ...old,
      completed: true,
      verified: true,
      source: 'game-v6',
      awardRules: 'v6-attempt-record',
      pieceEarned,
      awardQualified: pieceEarned,
      perfectSingle: !!old.perfectSingle || (gm === 1 && outcome.perfect),
      updatedAt: new Date().toISOString(),
      lastMode: gm,
      lastWinner: winnerValue,
      lastAwardWinner: qualifies
        ? (gm === 1 ? 1 : (outcome.winner === 'tie' ? 'tie' : (outcome.winner === 'p2' ? 2 : 1)))
        : (old.lastAwardWinner ?? 0),
      lastAttemptStats: stats || old.lastAttemptStats || null
    };

    localStorage.setItem(HUB_KEY, JSON.stringify(data));

    let piecesAfter = 0;
    for (let i = 1; i <= 11; i++) if (qualifiesOldRecord(data[i])) piecesAfter++;

    return {
      qualifies,
      newlyEarned: qualifies && !priorQualified,
      piecesBefore,
      piecesAfter
    };
  }

  function goldAlreadyAwarded() {
    try {
      const data = JSON.parse(localStorage.getItem(HUB_KEY) || '{}') || {};
      return data.__finalGoldAwarded === true;
    } catch (_) { return false; }
  }

  function markGoldAwarded() {
    try {
      const data = JSON.parse(localStorage.getItem(HUB_KEY) || '{}') || {};
      data.__finalGoldAwarded = true;
      localStorage.setItem(HUB_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  function showCeremony(gm, outcome, progress) {
    const winner = gm === 1 ? 'p1' : outcome.winner;
    const stats = attemptStats();
    const awardGoldNow = progress.qualifies && progress.piecesAfter === 11 && !goldAlreadyAwarded();

    const frame = document.createElement('iframe');
    frame.title = 'Sports Fiesta medal ceremony';
    frame.src = HUB_URL + '?ceremonyBridge=award-v6&winner=' + encodeURIComponent(winner) + '&t=' + Date.now();
    Object.assign(frame.style, {
      position:'fixed', inset:'0', width:'100%', height:'100%',
      border:'0', zIndex:'2147483647', background:'#185b9d'
    });
    document.body.appendChild(frame);

    frame.onload = () => {
      try {
        const w = frame.contentWindow, d = w.document;
        w.__sportsFiestaBridgeWinner = winner;
        d.body.classList.remove('cover-on');
        const cover = d.getElementById('fiestaCover');
        if (cover) cover.style.display = 'none';
        const app = d.querySelector('.app');
        if (app) app.style.setProperty('display','none','important');
        d.body.style.padding = '0';
        d.body.style.overflow = 'hidden';

        let stage = 'piece';

        const showPiece = () => {
          w.showMedalCeremony(false, winner, 'piece');
          const sub = d.getElementById('mcSub');
          const msg = d.getElementById('mcMessage');
          if (sub) sub.textContent = `Practice ${PRACTICE_ID} of 11 • ${SPORT}`;
          if (msg) {
            const attemptLine = gm===2 && stats
              ? ` Player 1: ${stats.c1} correct, ${stats.w1} wrong. Player 2: ${stats.c2} correct, ${stats.w2} wrong.`
              : '';
            if (gm === 1) {
              msg.textContent = 'Perfect score! Player 1 earns a 1/11 medal!';
            } else if (winner === 'tie') {
              msg.textContent = 'It is a tie! Player 1 and Player 2 both receive a 1/11 medal!' + attemptLine;
            } else {
              const why = stats && stats.c1===stats.c2 && stats.w1!==stats.w2 ? ' with fewer wrong attempts' : '';
              msg.textContent = `${winner === 'p2' ? 'Player 2' : 'Player 1'} wins${why} and earns a 1/11 medal!` + attemptLine;
            }
          }
        };

        const showGold = () => {
          stage = 'gold';
          markGoldAwarded();
          w.showMedalCeremony(false, 'p1', 'gold');
          const sub = d.getElementById('mcSub');
          const msg = d.getElementById('mcMessage');
          if (sub) sub.textContent = 'All 11 Sports Fiesta lessons completed!';
          if (msg) msg.textContent = '🏆 Player 1 receives the Sports Fiesta GOLD MEDAL! 🏆';
        };

        showPiece();

        const close = d.querySelector('#medalCeremony .mc-close');
        if (close) close.addEventListener('click', () => {
          if (awardGoldNow && stage === 'piece') setTimeout(showGold, 90);
          else setTimeout(() => frame.remove(), 0);
        });

        d.addEventListener('keydown', e => {
          if (e.key !== 'Escape') return;
          if (awardGoldNow && stage === 'piece') setTimeout(showGold, 90);
          else setTimeout(() => frame.remove(), 0);
        });
      } catch (e) {
        console.warn('Sports Fiesta ceremony could not open', e);
        frame.remove();
      }
    };
  }

  function addCeremonyNextButton(gm, outcome, progress) {
    const result = document.getElementById('results');
    if (!result || !progress.qualifies) return;

    let btn = document.getElementById('sfCeremonyNext');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'sfCeremonyNext';
      btn.type = 'button';
      btn.textContent = 'Next →';
      btn.setAttribute('aria-label', 'Next to medal ceremony');
      btn.className = 'bigbtn gold';
      Object.assign(btn.style, {
        minWidth:'150px',
        margin:'14px auto 4px',
        display:'block',
        fontWeight:'900',
        fontSize:'20px'
      });

      const box = result.querySelector('.results') || result;
      const firstButton = box.querySelector('button');
      if (firstButton) box.insertBefore(btn, firstButton);
      else box.appendChild(btn);
    }

    btn.disabled = false;
    btn.onclick = () => {
      btn.disabled = true;
      showCeremony(gm, outcome, progress);
    };
  }

  function checkResult() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const result = document.getElementById('results');
      if (!visible(result)) {
        handledResult = false;
        const oldBtn = document.getElementById('sfCeremonyNext');
        if (oldBtn) oldBtn.remove();
        return;
      }
      if (handledResult) return;

      const gm = getMode();
      const outcome = resultOutcome(gm);
      const progress = updateProgress(gm, outcome);
      handledResult = true;

      // Keep the result/attempt record on screen. The ceremony starts only when
      // the players deliberately press Next.
      addCeremonyNextButton(gm, outcome, progress);
    }, 220);
  }

  new MutationObserver(checkResult).observe(document.documentElement, {
    subtree:true, childList:true, attributes:true, attributeFilter:['class','style'], characterData:true
  });
  window.addEventListener('load', checkResult);
  checkResult();
})();
