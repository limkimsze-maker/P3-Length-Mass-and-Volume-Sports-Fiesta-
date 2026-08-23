/* Sports Fiesta result bridge — games choose the result; hub preview supplies the animation */
(() => {
  const script = document.currentScript;
  const PRACTICE_ID = Number(script?.dataset?.practice || 0);
  const SPORT = script?.dataset?.sport || `Practice ${PRACTICE_ID}`;
  if (!PRACTICE_ID || window.__sportsFiestaAwardsOnlyV2) return;
  window.__sportsFiestaAwardsOnlyV2 = true;

  const HUB_KEY = 'sportsFiestaHubProgress_v1';
  const HUB_URL = 'https://limkimsze-maker.github.io/P3-Length-Mass-and-Volume-Sports-Fiesta-/';

  /* Keep the two small practice-specific presentation fixes. */
  if (PRACTICE_ID === 10 && typeof window.markerStripSVG === 'function') {
    const originalMarkerStripSVG = window.markerStripSVG;
    window.markerStripSVG = function(a, extra) {
      return originalMarkerStripSVG(a, extra)
        .replace('fill="#efc78f"', 'fill="#4a90e2"')
        .replace('fill="#e576a6"', 'fill="#f6c94c"');
    };
  }

  if (PRACTICE_ID === 11) {
    const style = document.createElement('style');
    style.textContent = '.sf-unit-pair{display:inline-flex;align-items:center;gap:7px;white-space:nowrap}';
    document.head.appendChild(style);
    const keepMlWithAnswer = () => {
      document.querySelectorAll('#questionContent .eqLine input.answerInput').forEach(input => {
        if (input.closest('.sf-unit-pair')) return;
        const unitSpan = input.nextElementSibling;
        if (!unitSpan) return;
        const match = (unitSpan.textContent || '').match(/^\s*ml\b(.*)$/i);
        if (!match) return;
        const pair = document.createElement('span');
        pair.className = 'sf-unit-pair';
        const ml = document.createElement('span');
        ml.textContent = 'ml';
        input.parentNode.insertBefore(pair, input);
        pair.appendChild(input);
        pair.appendChild(ml);
        const rest = match[1] || '';
        if (rest) unitSpan.textContent = rest; else unitSpan.remove();
      });
    };
    const target = document.getElementById('questionContent') || document.body;
    new MutationObserver(keepMlWithAnswer).observe(target, {subtree:true, childList:true});
    window.addEventListener('load', keepMlWithAnswer);
    setTimeout(keepMlWithAnswer, 0);
  }

  const retryScript = document.createElement('script');
  retryScript.src = HUB_URL + 'sports-fiesta-retry-v1.js?v=20260823f';
  retryScript.dataset.practice = String(PRACTICE_ID);
  retryScript.async = false;
  document.head.appendChild(retryScript);

  function readHubData() {
    try { return JSON.parse(localStorage.getItem(HUB_KEY) || '{}') || {}; }
    catch (_) { return {}; }
  }

  let preservedSingleRecord = {...(readHubData()[PRACTICE_ID] || {})};
  let handledResult = false;
  let timer = null;

  function visible(el) {
    if (!el) return false;
    const s = getComputedStyle(el);
    return s.display !== 'none' && s.visibility !== 'hidden' && el.classList.contains('active');
  }

  function getMode() {
    try { if (typeof mode !== 'undefined') return Number(mode) === 2 ? 2 : 1; } catch (_) {}
    try { if (typeof gameMode !== 'undefined') return String(gameMode).includes('2') ? 2 : 1; } catch (_) {}
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
        const t = Number(fraction[2]);
        if (Number.isFinite(t) && total == null) return {p1,p2,c1,c2,total:t,text};
      }
    }
    return {p1,p2,c1,c2,total,text};
  }

  function resultOutcome(gm) {
    const s = readState(gm);
    if (gm === 1) {
      return {
        winner:'p1',
        perfect:s.p1 != null && s.total != null && s.total > 0 && s.p1 === s.total,
        score:s.p1,
        total:s.total
      };
    }

    if (PRACTICE_ID === 1) {
      if (/Player\s*2\s+Wins\s+the\s+Race|Player\s*2\s+reached\s+the\s+finishing\s+line\s+first/i.test(s.text)) return {winner:'p2',perfect:false};
      if (/Player\s*1\s+Wins\s+the\s+Race|Player\s*1\s+reached\s+the\s+finishing\s+line\s+first/i.test(s.text)) return {winner:'p1',perfect:false};
      if (s.c2 != null && s.c2 >= 6 && !(s.c1 != null && s.c1 >= 6)) return {winner:'p2',perfect:false};
      if (s.c1 != null && s.c1 >= 6 && !(s.c2 != null && s.c2 >= 6)) return {winner:'p1',perfect:false};
      if (s.c1 == null || s.c2 == null) return {winner:'tie',perfect:false};
      return {winner:s.c1 === s.c2 ? 'tie' : (s.c1 > s.c2 ? 'p1' : 'p2'),perfect:false};
    }

    const fairWinner = window.__sportsFiestaFairWinner;
    if (fairWinner === 'p1' || fairWinner === 'p2' || fairWinner === 'tie') return {winner:fairWinner,perfect:false};
    const trackedWinner = attemptWinner();
    if (trackedWinner) return {winner:trackedWinner,perfect:false};
    if (s.c1 == null || s.c2 == null) return {winner:'tie',perfect:false};
    return {winner:s.c1 === s.c2 ? 'tie' : (s.c1 > s.c2 ? 'p1' : 'p2'),perfect:false};
  }

  function qualifiesGoldRecord(x) {
    return !!x && (x.perfectSingle === true || x.singlePlayerPerfect === true);
  }

  function goldPieceCount(data) {
    let n = 0;
    for (let i = 1; i <= 11; i++) if (qualifiesGoldRecord(data[i])) n++;
    return n;
  }

  function updateProgress(gm, outcome) {
    const data = readHubData();
    const old = data[PRACTICE_ID] || {};
    const piecesBefore = goldPieceCount(data);
    const stats = attemptStats();

    if (gm === 1) {
      const wasPerfect = qualifiesGoldRecord(old) || qualifiesGoldRecord(preservedSingleRecord);
      const nowPerfect = wasPerfect || !!outcome.perfect;
      const scores = [Number(old.singlePlayerBestScore), Number(preservedSingleRecord.singlePlayerBestScore), Number(outcome.score)].filter(Number.isFinite);
      const best = scores.length ? Math.max(...scores) : null;
      data[PRACTICE_ID] = {
        ...old,
        completed:true,
        singlePlayerCompleted:true,
        singlePlayerPerfect:nowPerfect,
        singlePlayerBestScore:best,
        singlePlayerTotal:Number.isFinite(Number(outcome.total)) ? Number(outcome.total) : (old.singlePlayerTotal ?? null),
        perfectSingle:nowPerfect,
        pieceEarned:nowPerfect,
        awardQualified:nowPerfect,
        verified:true,
        source:'game-v9-preview-bridge',
        awardRules:'single-vs-duel-separated',
        updatedAt:new Date().toISOString(),
        lastMode:1
      };
      preservedSingleRecord = {...data[PRACTICE_ID]};
    } else {
      const protectedRecord = preservedSingleRecord || {};
      const singlePerfect = qualifiesGoldRecord(protectedRecord);
      data[PRACTICE_ID] = {
        ...old,
        ...protectedRecord,
        pieceEarned:singlePerfect,
        awardQualified:singlePerfect,
        perfectSingle:!!(protectedRecord.perfectSingle || protectedRecord.singlePlayerPerfect),
        singlePlayerPerfect:!!(protectedRecord.singlePlayerPerfect || protectedRecord.perfectSingle),
        awardRules:'single-vs-duel-separated',
        twoPlayerLastWinner:outcome.winner,
        twoPlayerLastAttemptStats:stats,
        twoPlayerUpdatedAt:new Date().toISOString()
      };
    }

    const piecesAfter = goldPieceCount(data);
    if (piecesAfter < 11) delete data.__finalGoldAwarded;
    localStorage.setItem(HUB_KEY, JSON.stringify(data));
    return {
      qualifies:gm === 2 ? true : !!outcome.perfect,
      piecesBefore,
      piecesAfter,
      awardGoldNow:gm === 1 && !!outcome.perfect && piecesAfter === 11 && data.__finalGoldAwarded !== true
    };
  }

  function markGoldAwarded() {
    try {
      const data = readHubData();
      data.__finalGoldAwarded = true;
      localStorage.setItem(HUB_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  function fillResultText(d, gm, winner, stats) {
    const banner = d.querySelector('#medalCeremony .mc-banner');
    const sub = d.getElementById('mcSub');
    const msg = d.getElementById('mcMessage');

    if (banner) banner.textContent = gm === 2 ? '🏅 2-PLAYER MATCH AWARD 🏅' : '🏅 1/11 MEDAL AWARD 🏅';
    if (sub) sub.textContent = gm === 2
      ? `Practice ${PRACTICE_ID} • ${SPORT}`
      : `Practice ${PRACTICE_ID} of 11 • ${SPORT}`;

    if (!msg) return;
    if (gm === 1) {
      msg.textContent = 'Perfect score! Player 1 earns a 1/11 gold medal piece!';
      return;
    }

    const title = winner === 'tie' ? "It's a tie! Both players share 1st place!" : `${winner === 'p2' ? 'Player 2' : 'Player 1'} wins and earns the 1/11 gold medal piece!`;
    if (!stats) {
      msg.textContent = title;
      return;
    }
    msg.innerHTML = `<b>${title}</b><br>Player 1 — Correct: ${stats.c1} | Wrong: ${stats.w1}<br>Player 2 — Correct: ${stats.c2} | Wrong: ${stats.w2}`;
  }

  function showCeremony(gm, outcome, progress) {
    const winner = gm === 1 ? 'p1' : outcome.winner;
    const stats = attemptStats();
    const frame = document.createElement('iframe');
    frame.title = 'Sports Fiesta medal ceremony';
    frame.src = HUB_URL + '?ceremonyBridge=award-v8&mode=' + gm + '&winner=' + encodeURIComponent(winner) + '&t=' + Date.now();
    Object.assign(frame.style, {
      position:'fixed', inset:'0', width:'100%', height:'100%', border:'0',
      zIndex:'2147483647', background:'#185b9d'
    });
    document.body.appendChild(frame);

    frame.onload = () => {
      try {
        const w = frame.contentWindow;
        const d = w.document;
        w.__sportsFiestaBridgeWinner = winner;
        w.__sportsFiestaBridgeMode = gm;

        d.body.classList.remove('cover-on');
        const cover = d.getElementById('fiestaCover');
        if (cover) cover.style.display = 'none';
        const app = d.querySelector('.app');
        if (app) app.style.setProperty('display', 'none', 'important');
        d.body.style.padding = '0';
        d.body.style.overflow = 'hidden';

        let started = false;
        let stage = 'piece';
        const playPiece = () => {
          if (started) return;
          started = true;
          w.showMedalCeremony(false, winner, 'piece');
          fillResultText(d, gm, winner, stats);
        };

        /* Always fetch the small bridge with a fresh version. It does not redraw
           the ceremony; it only routes P1/P2/tie to the original preview. */
        const fresh = d.createElement('script');
        fresh.src = HUB_URL + 'sports-fiesta-award-ui-v2.js?v=20260823previewrestore1';
        fresh.onload = playPiece;
        fresh.onerror = playPiece;
        d.head.appendChild(fresh);
        setTimeout(playPiece, 900);

        const showGold = () => {
          stage = 'gold';
          markGoldAwarded();
          w.showMedalCeremony(false, 'p1', 'gold');
          const sub = d.getElementById('mcSub');
          const msg = d.getElementById('mcMessage');
          if (sub) sub.textContent = 'All 11 Sports Fiesta 1-player practices completed perfectly!';
          if (msg) msg.textContent = '🏆 Player 1 receives the Sports Fiesta GOLD MEDAL! 🏆';
        };

        const close = d.querySelector('#medalCeremony .mc-close');
        if (close) close.addEventListener('click', () => {
          if (progress.awardGoldNow && stage === 'piece') setTimeout(showGold, 90);
          else setTimeout(() => frame.remove(), 0);
        });
        d.addEventListener('keydown', e => {
          if (e.key !== 'Escape') return;
          if (progress.awardGoldNow && stage === 'piece') setTimeout(showGold, 90);
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
      Object.assign(btn.style, {minWidth:'150px', margin:'14px auto 4px', display:'block', fontWeight:'900', fontSize:'20px'});
      const box = result.querySelector('.results') || result;
      const firstButton = box.querySelector('button');
      if (firstButton) box.insertBefore(btn, firstButton); else box.appendChild(btn);
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
        document.getElementById('sfCeremonyNext')?.remove();
        return;
      }
      if (handledResult) return;
      const gm = getMode();
      const outcome = resultOutcome(gm);
      const progress = updateProgress(gm, outcome);
      handledResult = true;
      addCeremonyNextButton(gm, outcome, progress);
    }, 220);
  }

  new MutationObserver(checkResult).observe(document.documentElement, {
    subtree:true, childList:true, attributes:true,
    attributeFilter:['class','style'], characterData:true
  });
  window.addEventListener('load', checkResult);
  checkResult();
})();
