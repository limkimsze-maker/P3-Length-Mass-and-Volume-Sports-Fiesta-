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

  function readHubData() {
    try { return JSON.parse(localStorage.getItem(HUB_KEY) || '{}') || {}; }
    catch (_) { return {}; }
  }

  // Keep a protected copy of the 1-player record. Some individual games write
  // generic fields such as lastMode/lastWinner before this shared script sees
  // the result. A 2-player match must never erase the existing 1-player record.
  let preservedSingleRecord = {...(readHubData()[PRACTICE_ID] || {})};

  // Shared mastery/fair-play rule for Practices 1–11.
  const retryScript = document.createElement('script');
  retryScript.src = HUB_URL + 'sports-fiesta-retry-v1.js?v=20260823f';
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
          if (Number.isFinite(t)) return {p1, p2, c1, c2, total:t, text};
        }
      }
    }
    return {p1, p2, c1, c2, total, text};
  }

  function resultOutcome(gm) {
    const s = readState(gm);
    if (gm === 1) {
      return {
        winner: 'p1',
        perfect: s.p1 != null && s.total != null && s.total > 0 && s.p1 === s.total,
        score: s.p1,
        total: s.total
      };
    }

    // Practice 1 is a true first-to-finish race. Trust the game's explicit
    // winner message first, because reaching 6 first is the actual race rule.
    if (PRACTICE_ID === 1) {
      if (/Player\s*2\s+Wins\s+the\s+Race|Player\s*2\s+reached\s+the\s+finishing\s+line\s+first/i.test(s.text)) {
        return {winner:'p2', perfect:false};
      }
      if (/Player\s*1\s+Wins\s+the\s+Race|Player\s*1\s+reached\s+the\s+finishing\s+line\s+first/i.test(s.text)) {
        return {winner:'p1', perfect:false};
      }
      if (s.c2 != null && s.c2 >= 6 && !(s.c1 != null && s.c1 >= 6)) return {winner:'p2', perfect:false};
      if (s.c1 != null && s.c1 >= 6 && !(s.c2 != null && s.c2 >= 6)) return {winner:'p1', perfect:false};
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

  // Only perfect 1-player practices count toward the 11-piece gold medal.
  // A 2-player match never contributes a medal piece to this count.
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
      const oldBest = Number(old.singlePlayerBestScore);
      const savedBest = Number(preservedSingleRecord.singlePlayerBestScore);
      const current = Number(outcome.score);
      const best = [oldBest, savedBest, current].filter(Number.isFinite).reduce((a,b)=>Math.max(a,b), -Infinity);

      data[PRACTICE_ID] = {
        ...old,
        completed: true,
        singlePlayerCompleted: true,
        singlePlayerPerfect: nowPerfect,
        singlePlayerBestScore: Number.isFinite(best) ? best : (old.singlePlayerBestScore ?? null),
        singlePlayerTotal: Number.isFinite(Number(outcome.total)) ? Number(outcome.total) : (old.singlePlayerTotal ?? null),
        perfectSingle: nowPerfect,
        pieceEarned: nowPerfect,
        awardQualified: nowPerfect,
        verified: true,
        source: 'game-v8',
        awardRules: 'v8-single-vs-duel-separated',
        updatedAt: new Date().toISOString(),
        lastMode: 1,
        lastWinner: old.lastWinner ?? 0,
        lastAwardWinner: nowPerfect ? 1 : (old.lastAwardWinner ?? 0)
      };
      preservedSingleRecord = {...data[PRACTICE_ID]};
    } else {
      const protectedRecord = preservedSingleRecord || {};
      const singlePerfect = qualifiesGoldRecord(protectedRecord);

      // Preserve every 1-player progress field from before this 2-player match.
      // Store the standalone match result under its own twoPlayer* fields only.
      data[PRACTICE_ID] = {
        ...old,
        completed: protectedRecord.completed ?? old.completed ?? false,
        singlePlayerCompleted: protectedRecord.singlePlayerCompleted ?? old.singlePlayerCompleted ?? false,
        singlePlayerPerfect: protectedRecord.singlePlayerPerfect ?? protectedRecord.perfectSingle ?? false,
        singlePlayerBestScore: protectedRecord.singlePlayerBestScore ?? old.singlePlayerBestScore ?? null,
        singlePlayerTotal: protectedRecord.singlePlayerTotal ?? old.singlePlayerTotal ?? null,
        perfectSingle: !!(protectedRecord.perfectSingle || protectedRecord.singlePlayerPerfect),
        pieceEarned: singlePerfect,
        awardQualified: singlePerfect,
        verified: protectedRecord.verified ?? old.verified ?? false,
        source: protectedRecord.source ?? old.source ?? 'game-v8',
        awardRules: 'v8-single-vs-duel-separated',
        updatedAt: protectedRecord.updatedAt ?? old.updatedAt ?? null,
        lastMode: protectedRecord.lastMode ?? 0,
        lastWinner: protectedRecord.lastWinner ?? 0,
        lastAwardWinner: protectedRecord.lastAwardWinner ?? 0,
        twoPlayerLastWinner: outcome.winner,
        twoPlayerLastAttemptStats: stats,
        twoPlayerUpdatedAt: new Date().toISOString()
      };
    }

    const piecesAfter = goldPieceCount(data);
    if (piecesAfter < 11) delete data.__finalGoldAwarded;
    localStorage.setItem(HUB_KEY, JSON.stringify(data));

    return {
      // A completed 2-player match always qualifies for its standalone winner
      // ceremony. In 1-player mode, the lesson medal requires a perfect score.
      qualifies: gm === 2 ? true : !!outcome.perfect,
      newlyEarned: gm === 1 && !!outcome.perfect && piecesAfter > piecesBefore,
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

  function ceremonyPlayerSources(d) {
    const cards = [...d.querySelectorAll('.playerImgWrap img.playerSvg')];
    const p1 = d.getElementById('fcP1')?.src || cards[0]?.src || '';
    const p2 = d.getElementById('fcP2')?.src || cards[1]?.src || '';
    return {p1,p2};
  }

  function enforcePieceWinner(d, winner, gm, stats) {
    const banner = d.querySelector('#medalCeremony .mc-banner');
    const sub = d.getElementById('mcSub');
    const msg = d.getElementById('mcMessage');
    const player = d.getElementById('mcPlayer');
    const player2 = d.getElementById('mcPlayer2');
    const sources = ceremonyPlayerSources(d);

    if (banner) {
      const wanted = gm === 2 ? '🏅 2-PLAYER MATCH AWARD 🏅' : '🏅 1/11 MEDAL AWARD 🏅';
      if (banner.textContent !== wanted) banner.textContent = wanted;
    }
    if (sub) {
      const wanted = gm === 2
        ? `Practice ${PRACTICE_ID} • ${SPORT} • Standalone 2-player match`
        : `Practice ${PRACTICE_ID} of 11 • ${SPORT}`;
      if (sub.textContent !== wanted) sub.textContent = wanted;
    }

    if (winner === 'p2' && player && sources.p2 && player.src !== sources.p2) {
      player.src = sources.p2;
      player.alt = 'Player 2 on the rostrum';
    } else if (winner === 'p1' && player && sources.p1 && player.src !== sources.p1) {
      player.src = sources.p1;
      player.alt = 'Player 1 on the rostrum';
    } else if (winner === 'tie') {
      if (player && sources.p1 && player.src !== sources.p1) {
        player.src = sources.p1;
        player.alt = 'Player 1 on the rostrum';
      }
      if (player2 && sources.p2 && player2.src !== sources.p2) {
        player2.src = sources.p2;
        player2.alt = 'Player 2 on the rostrum';
        player2.style.removeProperty('display');
      }
    }

    if (msg) {
      const attemptLine = gm===2 && stats
        ? ` Player 1: ${stats.c1} correct, ${stats.w1} wrong. Player 2: ${stats.c2} correct, ${stats.w2} wrong.`
        : '';
      let wanted = '';
      if (gm === 1) {
        wanted = 'Perfect score! Player 1 earns a 1/11 medal!';
      } else if (winner === 'tie') {
        wanted = 'It is a tie! Player 1 and Player 2 both receive the match award!' + attemptLine;
      } else {
        const why = stats && stats.c1===stats.c2 && stats.w1!==stats.w2 ? ' with fewer wrong attempts' : '';
        wanted = `${winner === 'p2' ? 'Player 2' : 'Player 1'} wins this match${why} and receives the winner award!` + attemptLine;
      }
      if (msg.textContent !== wanted) msg.textContent = wanted;
    }
  }

  function showCeremony(gm, outcome, progress) {
    const winner = gm === 1 ? 'p1' : outcome.winner;
    const stats = attemptStats();
    // Gold can only follow a 1-player perfect completion. 2-player matches are
    // standalone and can never trigger the cumulative gold ceremony.
    const awardGoldNow = gm === 1 && progress.qualifies && progress.piecesAfter === 11 && !goldAlreadyAwarded();

    const frame = document.createElement('iframe');
    frame.title = 'Sports Fiesta medal ceremony';
    frame.src = HUB_URL + '?ceremonyBridge=award-v8&mode=' + gm + '&winner=' + encodeURIComponent(winner) + '&t=' + Date.now();
    Object.assign(frame.style, {
      position:'fixed', inset:'0', width:'100%', height:'100%',
      border:'0', zIndex:'2147483647', background:'#185b9d'
    });
    document.body.appendChild(frame);

    frame.onload = () => {
      try {
        const w = frame.contentWindow, d = w.document;
        w.__sportsFiestaBridgeWinner = winner;
        w.__sportsFiestaBridgeMode = gm;
        d.body.classList.remove('cover-on');
        const cover = d.getElementById('fiestaCover');
        if (cover) cover.style.display = 'none';
        const app = d.querySelector('.app');
        if (app) app.style.setProperty('display','none','important');
        d.body.style.padding = '0';
        d.body.style.overflow = 'hidden';

        let stage = 'piece';
        let guard = null;

        const showPiece = () => {
          w.showMedalCeremony(false, winner, 'piece');
          enforcePieceWinner(d, winner, gm, stats);

          // Some older ceremony code has delayed timers that rewrite the athlete
          // and final text to Player 1. Keep the correct winner locked throughout
          // the complete animation, then disconnect the guard.
          const medal = d.getElementById('medalCeremony');
          if (medal && w.MutationObserver) {
            guard?.disconnect?.();
            guard = new w.MutationObserver(() => {
              if (stage === 'piece') enforcePieceWinner(d, winner, gm, stats);
            });
            guard.observe(medal, {
              subtree:true,
              childList:true,
              characterData:true,
              attributes:true,
              attributeFilter:['src','class','style']
            });
          }
          [80, 980, 1980, 2300, 3200].forEach(ms => {
            setTimeout(() => {
              if (stage === 'piece') enforcePieceWinner(d, winner, gm, stats);
            }, ms);
          });
        };

        const showGold = () => {
          stage = 'gold';
          guard?.disconnect?.();
          markGoldAwarded();
          w.showMedalCeremony(false, 'p1', 'gold');
          const sub = d.getElementById('mcSub');
          const msg = d.getElementById('mcMessage');
          if (sub) sub.textContent = 'All 11 Sports Fiesta 1-player lessons completed perfectly!';
          if (msg) msg.textContent = '🏆 Player 1 receives the Sports Fiesta GOLD MEDAL! 🏆';
        };

        showPiece();

        const close = d.querySelector('#medalCeremony .mc-close');
        if (close) close.addEventListener('click', () => {
          if (awardGoldNow && stage === 'piece') setTimeout(showGold, 90);
          else {
            guard?.disconnect?.();
            setTimeout(() => frame.remove(), 0);
          }
        });

        d.addEventListener('keydown', e => {
          if (e.key !== 'Escape') return;
          if (awardGoldNow && stage === 'piece') setTimeout(showGold, 90);
          else {
            guard?.disconnect?.();
            setTimeout(() => frame.remove(), 0);
          }
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
