/* Sports Fiesta awards only — no question/gameplay changes */
(() => {
  const script = document.currentScript;
  const PRACTICE_ID = Number(script?.dataset?.practice || 0);
  const SPORT = script?.dataset?.sport || `Practice ${PRACTICE_ID}`;
  if (!PRACTICE_ID || window.__sportsFiestaAwardsOnlyV1) return;
  window.__sportsFiestaAwardsOnlyV1 = true;

  const HUB_KEY = 'sportsFiestaHubProgress_v1';
  const HUB_URL = 'https://limkimsze-maker.github.io/P3-Length-Mass-and-Volume-Sports-Fiesta-/';
  const GOLD_KEY = 'sportsFiestaFinalGoldAwarded_v1';
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
    if (s.c1 == null || s.c2 == null) return {winner:'tie', perfect:false};
    return {
      winner: s.c1 === s.c2 ? 'tie' : (s.c1 > s.c2 ? 'p1' : 'p2'),
      perfect: false
    };
  }

  function qualifiesOldRecord(x) {
    if (!x) return false;
    if (x.awardRules === 'v4-medal-only' || ['v1','v2','v3'].includes(x.awardRules)) return x.pieceEarned === true;
    const oldWinner = x.lastWinner;
    const winnerQualified =
      Number(x.lastMode) === 2 &&
      (oldWinner === 'p1' || oldWinner === 'p2' || oldWinner === 'tie' ||
       Number(oldWinner) === 1 || Number(oldWinner) === 2);
    return x.perfectSingle === true || winnerQualified;
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

    data[PRACTICE_ID] = {
      ...old,
      completed: true,
      verified: true,
      source: 'game-v5',
      awardRules: 'v4-medal-only',
      pieceEarned,
      awardQualified: pieceEarned,
      perfectSingle: !!old.perfectSingle || (gm === 1 && outcome.perfect),
      updatedAt: new Date().toISOString(),
      lastMode: gm,
      lastWinner: winnerValue,
      lastAwardWinner: qualifies
        ? (gm === 1 ? 1 : (outcome.winner === 'tie' ? 'tie' : (outcome.winner === 'p2' ? 2 : 1)))
        : (old.lastAwardWinner ?? 0)
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
    try { return localStorage.getItem(GOLD_KEY) === '1'; } catch (_) { return false; }
  }

  function markGoldAwarded() {
    try { localStorage.setItem(GOLD_KEY, '1'); } catch (_) {}
  }

  function showCeremony(gm, outcome, progress) {
    const winner = gm === 1 ? 'p1' : outcome.winner;
    const awardGoldNow = progress.qualifies && progress.piecesAfter === 11 && !goldAlreadyAwarded();

    const frame = document.createElement('iframe');
    frame.title = 'Sports Fiesta medal ceremony';
    frame.src = HUB_URL + '?ceremonyBridge=award-v4&t=' + Date.now();
    Object.assign(frame.style, {
      position:'fixed', inset:'0', width:'100%', height:'100%',
      border:'0', zIndex:'2147483647', background:'#185b9d'
    });
    document.body.appendChild(frame);

    frame.onload = () => {
      try {
        const w = frame.contentWindow, d = w.document;
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
            if (gm === 1) {
              msg.textContent = 'Perfect score! Player 1 earns a 1/11 medal!';
            } else if (winner === 'tie') {
              msg.textContent = 'It is a tie! Player 1 and Player 2 both stand on the rostrum and both receive a 1/11 medal!';
            } else {
              msg.textContent = `${winner === 'p2' ? 'Player 2' : 'Player 1'} wins and earns a 1/11 medal!`;
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

  function checkResult() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const result = document.getElementById('results');
      if (!visible(result)) {
        handledResult = false;
        return;
      }
      if (handledResult) return;

      const gm = getMode();
      const outcome = resultOutcome(gm);
      const progress = updateProgress(gm, outcome);
      handledResult = true;

      if (!progress.qualifies) return;
      setTimeout(() => showCeremony(gm, outcome, progress), 250);
    }, 180);
  }

  new MutationObserver(checkResult).observe(document.documentElement, {
    subtree:true, childList:true, attributes:true, attributeFilter:['class','style'], characterData:true
  });
  window.addEventListener('load', checkResult);
  checkResult();
})();
