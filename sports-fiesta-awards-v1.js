/* Sports Fiesta result bridge — shared real result/progress/award flow + teacher DEBUG */
(() => {
  const script = document.currentScript;
  const PRACTICE_ID = Number(script?.dataset?.practice || 0);
  const SPORT = script?.dataset?.sport || `Practice ${PRACTICE_ID}`;
  if (!PRACTICE_ID || window.__sportsFiestaAwardsOnlyV2) return;
  window.__sportsFiestaAwardsOnlyV2 = true;

  const HUB_KEY = 'sportsFiestaHubProgress_v1';
  const HUB_URL = 'https://limkimsze-maker.github.io/P3-Length-Mass-and-Volume-Sports-Fiesta-/';
  const DEBUG_PASS = '67';

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
  retryScript.src = HUB_URL + 'sports-fiesta-retry-v1.js?v=20260823debugv6';
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
        source:'game-v10-shared-result-flow',
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

  function winnerMessage(winner) {
    if (winner === 'p2') return 'Well done, Player 2.';
    if (winner === 'tie') return 'Well done, both players!';
    return 'Well done, Player 1.';
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
      msg.innerHTML = `<b>Well done, Player 1.</b><br>Perfect score! Player 1 earns a 1/11 gold medal piece!`;
      return;
    }

    const well = winnerMessage(winner);
    if (!stats) {
      msg.textContent = well;
      return;
    }
    msg.innerHTML = `<b>${well}</b><br>Player 1 — Correct: ${stats.c1} | Wrong: ${stats.w1}<br>Player 2 — Correct: ${stats.c2} | Wrong: ${stats.w2}`;
  }

  /* The ceremony lives in a full-screen iframe. Keep the return action in the
     parent practice as well, so it remains usable even if an older cached copy
     of the hub's ceremony UI is loaded inside the frame. */
  function goHubNow(e) {
    if (e) {
      e.preventDefault?.();
      e.stopPropagation?.();
    }
    try {
      window.top.location.href = HUB_URL;
    } catch (_) {
      window.location.href = HUB_URL;
    }
    return false;
  }

  function showCeremony(gm, outcome, progress) {
    const winner = gm === 1 ? 'p1' : outcome.winner;
    const stats = attemptStats();
    const frame = document.createElement('iframe');
    /* The retry controller intentionally holds only the exact 2-player title until
       its normal Next button capture hook runs. 1-player must not be hidden. */
    frame.title = gm === 2 ? 'Sports Fiesta medal ceremony' : 'Sports Fiesta 1-player medal ceremony';
    frame.src = HUB_URL + '?ceremonyBridge=award-v8&mode=' + gm + '&winner=' + encodeURIComponent(winner) + '&t=' + Date.now();
    Object.assign(frame.style, {
      position:'fixed', inset:'0', width:'100%', height:'100%', border:'0',
      zIndex:'2147483600', background:'#185b9d'
    });
    document.body.appendChild(frame);

    const returnBtn = document.createElement('button');
    returnBtn.id = 'sfCeremonyReturnHub';
    returnBtn.type = 'button';
    returnBtn.textContent = '← Back to Hub';
    returnBtn.setAttribute('aria-label', 'Back to Sports Fiesta Practice Hub');
    returnBtn.onclick = goHubNow;
    returnBtn.style.cssText = 'position:fixed!important;left:14px!important;top:14px!important;z-index:2147483647!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:150px!important;min-height:48px!important;padding:10px 16px!important;border:3px solid #fff!important;border-radius:15px!important;background:#1769aa!important;color:#fff!important;font:900 16px/1.1 "Trebuchet MS",Arial,sans-serif!important;box-shadow:0 5px 0 #0b4778,0 8px 18px rgba(0,0,0,.2)!important;cursor:pointer!important;visibility:visible!important;opacity:1!important;';
    document.body.appendChild(returnBtn);

    const cleanupCeremony = () => {
      frame.remove();
      returnBtn.remove();
    };

    frame.onload = () => {
      try {
        const w = frame.contentWindow;
        const d = w.document;
        w.__sportsFiestaBridgeWinner = winner;
        w.__sportsFiestaBridgeMode = gm;
        w.goSportsFiestaHome = goHubNow;

        d.querySelectorAll('.mc-home,#sfCeremonyBackHome').forEach(el => {
          el.onclick = goHubNow;
        });

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

        const fresh = d.createElement('script');
        fresh.src = HUB_URL + 'sports-fiesta-award-ui-v2.js?v=20260824returnv2';
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
          else setTimeout(cleanupCeremony, 0);
        });
        d.addEventListener('keydown', e => {
          if (e.key !== 'Escape') return;
          if (progress.awardGoldNow && stage === 'piece') setTimeout(showGold, 90);
          else setTimeout(cleanupCeremony, 0);
        });
      } catch (e) {
        console.warn('Sports Fiesta ceremony could not open', e);
        cleanupCeremony();
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

  /* DEBUG only skips answering. It then uses the same updateProgress(), Results
     screen, Next button and showCeremony() functions as genuine completion. */
  function debugStats(kind, total) {
    if (kind === 'single') return {correct:[total,0], wrong:[0,0]};
    if (kind === 'p1') return {correct:[10,7], wrong:[0,3]};
    if (kind === 'p2') return {correct:[7,10], wrong:[3,0]};
    return {correct:[8,8], wrong:[2,2]};
  }

  function resultParts(result) {
    let title = document.getElementById('resultTitle') || document.getElementById('rt');
    let text = document.getElementById('resultText') || document.getElementById('rr');
    let summary = document.getElementById('sfDebugResultSummaryV6');
    if (!summary) {
      summary = document.createElement('div');
      summary.id = 'sfDebugResultSummaryV6';
      summary.style.cssText = 'max-width:680px;margin:14px auto;padding:14px 18px;border-radius:16px;background:#f4f8fc;color:#17324d;font-weight:800;line-height:1.55;text-align:center;';
      const box = result.querySelector('.results') || result;
      box.insertBefore(summary, box.firstChild || null);
    }
    return {title,text,summary};
  }

  function activateResults(result) {
    document.querySelectorAll('.screen.active,.page.active,.view.active').forEach(el => {
      if (el !== result) el.classList.remove('active');
    });
    result.style.removeProperty('display');
    result.style.removeProperty('visibility');
    result.classList.add('active');
  }

  function runDebugFastForward(kind) {
    const gm = getMode();
    if (gm === 1) kind = 'single';
    if (gm === 2 && !['p1','p2','tie'].includes(kind)) return;

    const result = document.getElementById('results');
    if (!result) {
      alert('DEBUG could not find this practice’s normal Results screen.');
      return;
    }

    const total = Math.max(1, Number(questionTotal()) || 12);
    const fake = debugStats(kind, total);
    window.__sportsFiestaAttemptStats = fake;
    if (gm === 2) window.__sportsFiestaFairWinner = kind;

    const {title,text,summary} = resultParts(result);
    if (gm === 1) {
      if (title) title.textContent = 'Perfect Score!';
      if (text) text.innerHTML = `<b>Player 1 — Correct: ${total} / ${total}</b><br>Perfect score!`;
      summary.innerHTML = `<b>Player 1 — Correct: ${total} / ${total}</b><br>Perfect score!`;
    } else {
      const label = kind === 'tie' ? "It's a Tie!" : `Player ${kind === 'p2' ? 2 : 1} Wins!`;
      if (title) title.textContent = PRACTICE_ID === 1 && kind !== 'tie' ? `Player ${kind === 'p2' ? 2 : 1} Wins the Race!` : label;
      const scoresHtml = `Player 1 — Correct: <b>${fake.correct[0]}</b> &nbsp; Wrong: <b>${fake.wrong[0]}</b><br>Player 2 — Correct: <b>${fake.correct[1]}</b> &nbsp; Wrong: <b>${fake.wrong[1]}</b>`;
      if (text) text.innerHTML = `<b>Attempt record</b><br>${scoresHtml}`;
      summary.innerHTML = `<b>${label}</b><br>${scoresHtml}`;
    }

    document.getElementById('sfCeremonyNext')?.remove();
    document.getElementById('sfCeremonyNextWrap')?.remove();
    activateResults(result);

    const outcome = gm === 1
      ? {winner:'p1', perfect:true, score:total, total}
      : {winner:kind, perfect:false};

    handledResult = true;
    const progress = updateProgress(gm, outcome);
    addCeremonyNextButton(gm, outcome, progress);

    if (gm === 2) {
      [0,80,180,350].forEach(ms => setTimeout(() => { window.__sportsFiestaFairWinner = kind; }, ms));
    }
  }
  window.__sportsFiestaDebugFastForwardV6 = runDebugFastForward;

  function installDebugPanel() {
    document.getElementById('sfFlowCheatPanel')?.remove();
    if (document.getElementById('sfDebugPanelV6')) return;

    const style = document.createElement('style');
    style.id = 'sfDebugStyleV6';
    style.textContent = `
      #sfDebugPanelV6{position:fixed;right:12px;bottom:12px;z-index:2147483003;font-family:"Trebuchet MS",Arial,sans-serif;display:flex;gap:7px;align-items:flex-end;justify-content:flex-end;flex-wrap:wrap;max-width:min(700px,95vw)}
      #sfDebugPanelV6 button{border:2px solid #fff;border-radius:13px;padding:9px 12px;font-size:12px;font-weight:1000;cursor:pointer;box-shadow:0 5px 16px rgba(0,0,0,.25)}
      #sfDebugUnlockV6{background:#5c2aa6;color:#fff;border-radius:999px!important}
      #sfDebugChoicesV6{display:none;gap:7px;flex-wrap:wrap;justify-content:flex-end;background:rgba(255,255,255,.97);border:3px solid #d8c8ff;border-radius:16px;padding:8px}
      #sfDebugPanelV6.unlocked #sfDebugChoicesV6{display:flex}#sfDebugPanelV6.unlocked #sfDebugUnlockV6{display:none}
      .sfDebugSingleV6{background:#ffe272;color:#5d4300}.sfDebugP1V6{background:#dcecff;color:#144e88}.sfDebugP2V6{background:#ffe0e5;color:#8b2638}.sfDebugTieV6{background:#e6f7e8;color:#246b31}.sfDebugLockV6{background:#eef1f5;color:#53606d}
      @media(max-width:600px){#sfDebugPanelV6{right:7px;bottom:7px}#sfDebugPanelV6 button{padding:7px 9px;font-size:10px}#sfDebugChoicesV6{gap:5px;padding:6px}}
    `;
    document.head.appendChild(style);

    const panel = document.createElement('div');
    panel.id = 'sfDebugPanelV6';
    panel.innerHTML = `<button id="sfDebugUnlockV6" type="button">DEBUG</button><div id="sfDebugChoicesV6"></div>`;
    document.body.appendChild(panel);

    let unlocked = false;
    let lastMode = getMode();
    const choices = panel.querySelector('#sfDebugChoicesV6');
    const render = () => {
      if (!unlocked) {
        panel.classList.remove('unlocked');
        choices.innerHTML = '';
        return;
      }
      panel.classList.add('unlocked');
      if (getMode() === 2) {
        choices.innerHTML = `<button class="sfDebugP1V6" data-sf-debug-v6="p1">Player 1 Wins</button><button class="sfDebugP2V6" data-sf-debug-v6="p2">Player 2 Wins</button><button class="sfDebugTieV6" data-sf-debug-v6="tie">Tie</button><button class="sfDebugLockV6" data-sf-debug-lock-v6>🔒</button>`;
      } else {
        choices.innerHTML = `<button class="sfDebugSingleV6" data-sf-debug-v6="single">Player 1 Cheat Solve</button><button class="sfDebugLockV6" data-sf-debug-lock-v6>🔒</button>`;
      }
    };

    panel.querySelector('#sfDebugUnlockV6').onclick = () => {
      const entered = prompt('DEBUG password');
      if (entered === null) return;
      if (entered !== DEBUG_PASS) {
        alert('Incorrect password.');
        return;
      }
      unlocked = true;
      render();
    };

    choices.addEventListener('click', e => {
      if (e.target.closest('[data-sf-debug-lock-v6]')) {
        unlocked = false;
        render();
        return;
      }
      const btn = e.target.closest('[data-sf-debug-v6]');
      if (btn) runDebugFastForward(btn.dataset.sfDebugV6);
    });

    setInterval(() => {
      /* Old cached helper must never be allowed to recreate CHEAT SOLVE. */
      document.getElementById('sfFlowCheatPanel')?.remove();
      const now = getMode();
      if (now !== lastMode) {
        lastMode = now;
        render();
      }
    }, 250);
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installDebugPanel, {once:true});
  } else {
    installDebugPanel();
  }

  new MutationObserver(checkResult).observe(document.documentElement, {
    subtree:true, childList:true, attributes:true,
    attributeFilter:['class','style'], characterData:true
  });
  window.addEventListener('load', checkResult);
  checkResult();
})();
