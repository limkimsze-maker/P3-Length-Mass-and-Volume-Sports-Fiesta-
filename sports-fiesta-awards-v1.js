/* SPORTS FIESTA AWARD RULES V2 — 1/11 lesson medals; ties award both players */
(() => {
  const script = document.currentScript;
  const ID = Number(script?.dataset?.practice || 0);
  const SPORT = script?.dataset?.sport || `Practice ${ID}`;
  if (!ID || window[`__sportsFiestaAwardsV2_${ID}`]) return;
  window[`__sportsFiestaAwardsV2_${ID}`] = true;

  const KEY = 'sportsFiestaHubProgress_v1';
  const HUB = 'https://limkimsze-maker.github.io/P3-Length-Mass-and-Volume-Sports-Fiesta-/';
  let shown = false;
  let timer = null;

  function visible(el) {
    if (!el) return false;
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;
  }

  function resultElement() {
    const list = [...document.querySelectorAll('#results,.results,[id*="result" i],[class*="result" i],.screen.active')];
    return list.find(el => {
      if (!visible(el)) return false;
      const t = (el.innerText || '').replace(/\s+/g, ' ').trim();
      if (t.length < 18) return false;
      const end = /final score|\bresults\b|\bcompleted\b|\bfinished\b|\bwinner\b|\bwins\b|\bwon\b|practice\s+complete|challenge\s+complete|game\s+complete|game\s+over|draw|tie/i.test(t);
      const explicit = el.matches('#results,.results,[id*="result" i],[class*="result" i]');
      const proof = /score|scored|\d+\s*\/\s*\d+|\d+\s+out\s+of\s+\d+|player\s*1|player\s*2/i.test(t);
      return end || (explicit && proof);
    }) || null;
  }

  function readMode(text) {
    try {
      if (typeof mode !== 'undefined') {
        if (Number(mode) === 2 || /2/.test(String(mode))) return 2;
        if (Number(mode) === 1 || /1/.test(String(mode))) return 1;
      }
    } catch (_) {}
    try {
      if (typeof gameMode !== 'undefined') {
        if (/2/.test(String(gameMode))) return 2;
        if (/1/.test(String(gameMode))) return 1;
      }
    } catch (_) {}
    return /player\s*2|\bp2\b|two\s*player/i.test(text) ? 2 : 1;
  }

  function stateScores() {
    let a = null, b = null, total = null;
    try { if (typeof scores !== 'undefined' && Array.isArray(scores)) { a = Number(scores[0]); b = Number(scores[1]); } } catch (_) {}
    try { if (typeof correctCounts !== 'undefined' && Array.isArray(correctCounts)) { a = Number(correctCounts[0]); b = Number(correctCounts[1]); } } catch (_) {}
    try { if (typeof score !== 'undefined' && Number.isFinite(Number(score))) a = Number(score); } catch (_) {}
    try { if (typeof score1 !== 'undefined') a = Number(score1); } catch (_) {}
    try { if (typeof score2 !== 'undefined') b = Number(score2); } catch (_) {}
    try { if (typeof p1Score !== 'undefined') a = Number(p1Score); } catch (_) {}
    try { if (typeof p2Score !== 'undefined') b = Number(p2Score); } catch (_) {}
    try { if (typeof TOTAL !== 'undefined') total = Number(TOTAL); } catch (_) {}
    try { if (typeof MAX_TURNS !== 'undefined') total = Number(MAX_TURNS); } catch (_) {}
    try { if (typeof totalQuestions !== 'undefined') total = Number(totalQuestions); } catch (_) {}
    return {
      a: Number.isFinite(a) ? a : null,
      b: Number.isFinite(b) ? b : null,
      total: Number.isFinite(total) ? total : null
    };
  }

  function domScore(sel) {
    const el = document.querySelector(sel);
    if (!el) return null;
    const nums = (el.textContent.match(/\d+/g) || []).map(Number);
    return nums.length ? nums[nums.length - 1] : null;
  }

  function outcome(text, gm) {
    const s = stateScores();
    let p1 = s.a, p2 = s.b, total = s.total;
    if (p1 == null) p1 = domScore('.score.p1,.p1.score,#score1,#p1Score');
    if (p2 == null) p2 = domScore('.score.p2,.p2.score,#score2,#p2Score');

    const fractions = [...text.matchAll(/(\d+)\s*\/\s*(\d+)/g)].map(m => [+m[1], +m[2]]).filter(x => x[1] >= 5);
    if (fractions.length) { p1 = fractions[0][0]; total = fractions[0][1]; }
    const outOf = text.match(/(\d+)\s+out\s+of\s+(\d+)/i);
    if (outOf) { p1 = +outOf[1]; total = +outOf[2]; }

    let winner = 'p1';
    if (gm === 2) {
      if (/\bplayer\s*1\b[^.!]{0,45}\b(?:wins?|won|winner|champion|reached|lights?)\b/i.test(text) || /\b(?:winner|champion)\b[^.!]{0,30}\bplayer\s*1\b/i.test(text)) winner = 'p1';
      else if (/\bplayer\s*2\b[^.!]{0,45}\b(?:wins?|won|winner|champion|reached|lights?)\b/i.test(text) || /\b(?:winner|champion)\b[^.!]{0,30}\bplayer\s*2\b/i.test(text)) winner = 'p2';
      else if (/\bdraw\b|\btie\b/i.test(text)) winner = 'tie';
      else if (p1 != null && p2 != null) winner = p1 === p2 ? 'tie' : (p1 > p2 ? 'p1' : 'p2');
      else winner = 'tie';
    }

    const perfect = gm === 1 && p1 != null && total != null && total > 0 && p1 === total;
    return { winner, perfect, p1, p2, total };
  }

  function isTwoPlayerFinal(res, text, o) {
    if (res?.matches?.('#results,.results')) return true;
    if (/final\s+score|final\s+results|game\s+complete|game\s+over|challenge\s+complete|winner|wins|draw|tie/i.test(text)) return true;
    return o.p1 != null && o.p2 != null && /(?:question|round)\s*\d+\s*(?:of|\/)\s*\d+/i.test(text);
  }

  function oldWinnerQualified(old) {
    const lm = Number(old.lastMode);
    const lw = old.lastWinner;
    const winner = lw === 'p1' || lw === 'p2' || lw === 'tie' || Number(lw) === 1 || Number(lw) === 2;
    return lm === 2 && winner;
  }

  function save(gm, o) {
    let data = {};
    try { data = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) {}
    const old = data[ID] || {};
    const priorQualified = ['v1','v2','v3'].includes(old.awardRules) ? !!old.pieceEarned : (!!old.perfectSingle || oldWinnerQualified(old));
    const isTie = gm === 2 && o.winner === 'tie';
    const winnerNum = o.winner === 'p1' ? 1 : o.winner === 'p2' ? 2 : 0;
    const qualifies = gm === 1 ? !!o.perfect : (winnerNum > 0 || isTie);
    const pieceEarned = priorQualified || qualifies;
    const perfectSingle = !!old.perfectSingle || (gm === 1 && !!o.perfect);

    data[ID] = {
      ...old,
      completed: true,
      pieceEarned,
      awardQualified: pieceEarned,
      perfectSingle,
      verified: true,
      source: 'game-v5',
      awardRules: 'v3',
      updatedAt: new Date().toISOString(),
      lastMode: gm,
      lastWinner: gm === 2 ? (isTie ? 'tie' : winnerNum) : (old.lastWinner ?? 0),
      lastAwardWinner: qualifies ? (gm === 1 ? 1 : (isTie ? 'tie' : winnerNum)) : (old.lastAwardWinner ?? 0)
    };
    localStorage.setItem(KEY, JSON.stringify(data));

    let pieces = 0;
    for (let i = 1; i <= 11; i++) {
      const x = data[i] || {};
      const verified = x.completed === true && x.verified === true && x.source === 'game-v5';
      if (verified && x.pieceEarned === true) pieces++;
    }
    return { pieces, qualifies };
  }

  function showCeremony(gm, o, progress) {
    const winner = gm === 1 ? 'p1' : o.winner;
    const fullGold = progress.pieces === 11;
    const frame = document.createElement('iframe');
    frame.title = 'Sports Fiesta medal ceremony';
    frame.src = HUB + '?ceremonyBridge=award-v2&t=' + Date.now();
    Object.assign(frame.style, {
      position: 'fixed', inset: '0', width: '100%', height: '100%', border: '0',
      zIndex: '2147483647', background: '#185b9d'
    });
    document.body.appendChild(frame);

    frame.onload = () => {
      try {
        const w = frame.contentWindow, d = w.document;
        d.body.classList.remove('cover-on');
        const cover = d.getElementById('fiestaCover'); if (cover) cover.style.display = 'none';
        const app = d.querySelector('.app'); if (app) app.style.setProperty('display', 'none', 'important');
        d.body.style.padding = '0'; d.body.style.overflow = 'hidden';

        let stage = 'piece';
        const showPiece = () => {
          w.showMedalCeremony(false, winner, 'piece');
          const sub = d.getElementById('mcSub'), msg = d.getElementById('mcMessage');
          if (sub) sub.textContent = `Practice ${ID} of 11 • ${SPORT}`;
          if (msg) {
            if (gm === 1) msg.textContent = 'Player 1 earns a 1/11 medal for a perfect score!';
            else if (winner === 'tie') msg.textContent = 'It is a tie! Player 1 and Player 2 both receive a 1/11 medal on the rostrum!';
            else msg.textContent = `${winner === 'p2' ? 'Player 2' : 'Player 1'} wins and earns a 1/11 medal!`;
          }
        };
        const showGold = () => {
          stage = 'gold';
          w.showMedalCeremony(false, 'p1', 'gold');
          const sub = d.getElementById('mcSub'), msg = d.getElementById('mcMessage');
          if (sub) sub.textContent = 'All 11 Sports Fiesta lessons completed!';
          if (msg) msg.textContent = '🏆 Player 1 receives the Sports Fiesta GOLD MEDAL! 🏆';
        };

        showPiece();
        const close = d.querySelector('#medalCeremony .mc-close');
        if (close) close.addEventListener('click', () => {
          if (fullGold && stage === 'piece') setTimeout(showGold, 90);
          else setTimeout(() => frame.remove(), 0);
        });
        d.addEventListener('keydown', e => {
          if (e.key !== 'Escape') return;
          if (fullGold && stage === 'piece') setTimeout(showGold, 90);
          else setTimeout(() => frame.remove(), 0);
        });
      } catch (_) { frame.remove(); }
    };
  }

  function check() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const res = resultElement();
      if (!res) { shown = false; return; }
      if (shown) return;
      const text = (res.innerText || '').replace(/\s+/g, ' ').trim();
      if (text.length < 18) return;
      const gm = readMode(text), o = outcome(text, gm);
      if (gm === 2 && !isTwoPlayerFinal(res, text, o)) return;
      const progress = save(gm, o);
      shown = true;
      if (!progress.qualifies) return; // 1P non-perfect: no lesson medal.
      setTimeout(() => showCeremony(gm, o, progress), 300);
    }, 120);
  }

  new MutationObserver(check).observe(document.documentElement, {
    subtree: true, childList: true, attributes: true,
    attributeFilter: ['class', 'style'], characterData: true
  });
  window.addEventListener('load', check);
  check();
})();
