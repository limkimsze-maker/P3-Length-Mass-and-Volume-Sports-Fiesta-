/* Sports Fiesta awards and shared project helpers */
(() => {
  const script = document.currentScript;
  const PRACTICE_ID = Number(script?.dataset?.practice || 0);
  const SPORT = script?.dataset?.sport || `Practice ${PRACTICE_ID}`;
  if (!PRACTICE_ID || window.__sportsFiestaAwardsOnlyV1) return;
  window.__sportsFiestaAwardsOnlyV1 = true;

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
        if (rest) unitSpan.textContent = rest; else unitSpan.remove();
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

  // Snapshot the complete pre-game record. This is the protected 1-player record
  // that a later 2-player match is not allowed to overwrite.
  let preservedSingleRecord = {...(readHubData()[PRACTICE_ID] || {})};

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
        if (total == null) {
          const t = Number(fraction[2]);
          if (Number.isFinite(t)) return {p1,p2,c1,c2,total:t,text};
        }
      }
    }
    return {p1,p2,c1,c2,total,text};
  }

  function resultOutcome(gm) {
    const s = readState(gm);
    if (gm === 1) return {winner:'p1',perfect:s.p1!=null&&s.total!=null&&s.total>0&&s.p1===s.total,score:s.p1,total:s.total};

    if (PRACTICE_ID === 1) {
      if (/Player\s*2\s+Wins\s+the\s+Race|Player\s*2\s+reached\s+the\s+finishing\s+line\s+first/i.test(s.text)) return {winner:'p2',perfect:false};
      if (/Player\s*1\s+Wins\s+the\s+Race|Player\s*1\s+reached\s+the\s+finishing\s+line\s+first/i.test(s.text)) return {winner:'p1',perfect:false};
      if (s.c2 != null && s.c2 >= 6 && !(s.c1 != null && s.c1 >= 6)) return {winner:'p2',perfect:false};
      if (s.c1 != null && s.c1 >= 6 && !(s.c2 != null && s.c2 >= 6)) return {winner:'p1',perfect:false};
      if (s.c1 == null || s.c2 == null) return {winner:'tie',perfect:false};
      return {winner:s.c1===s.c2?'tie':(s.c1>s.c2?'p1':'p2'),perfect:false};
    }

    const fairWinner = window.__sportsFiestaFairWinner;
    if (fairWinner === 'p1' || fairWinner === 'p2' || fairWinner === 'tie') return {winner:fairWinner,perfect:false};
    const trackedWinner = attemptWinner();
    if (trackedWinner) return {winner:trackedWinner,perfect:false};
    if (s.c1 == null || s.c2 == null) return {winner:'tie',perfect:false};
    return {winner:s.c1===s.c2?'tie':(s.c1>s.c2?'p1':'p2'),perfect:false};
  }

  function qualifiesGoldRecord(x) {
    return !!x && (x.perfectSingle === true || x.singlePlayerPerfect === true);
  }

  function goldPieceCount(data) {
    let n=0; for(let i=1;i<=11;i++) if(qualifiesGoldRecord(data[i])) n++; return n;
  }

  function updateProgress(gm,outcome) {
    const data=readHubData();
    const old=data[PRACTICE_ID]||{};
    const piecesBefore=goldPieceCount(data);
    const stats=attemptStats();

    if(gm===1){
      const wasPerfect=qualifiesGoldRecord(old)||qualifiesGoldRecord(preservedSingleRecord);
      const nowPerfect=wasPerfect||!!outcome.perfect;
      const oldBest=Number(old.singlePlayerBestScore),savedBest=Number(preservedSingleRecord.singlePlayerBestScore),current=Number(outcome.score);
      const best=[oldBest,savedBest,current].filter(Number.isFinite).reduce((a,b)=>Math.max(a,b),-Infinity);
      data[PRACTICE_ID]={...old,completed:true,singlePlayerCompleted:true,singlePlayerPerfect:nowPerfect,singlePlayerBestScore:Number.isFinite(best)?best:(old.singlePlayerBestScore??null),singlePlayerTotal:Number.isFinite(Number(outcome.total))?Number(outcome.total):(old.singlePlayerTotal??null),perfectSingle:nowPerfect,pieceEarned:nowPerfect,awardQualified:nowPerfect,verified:true,source:'game-v8',awardRules:'v8-single-vs-duel-separated',updatedAt:new Date().toISOString(),lastMode:1,lastWinner:old.lastWinner??0,lastAwardWinner:nowPerfect?1:(old.lastAwardWinner??0)};
      preservedSingleRecord={...data[PRACTICE_ID]};
    }else{
      const protectedRecord=preservedSingleRecord||{};
      const singlePerfect=qualifiesGoldRecord(protectedRecord);
      // Restore the complete pre-match record, then append only separate 2-player
      // history. This prevents any native per-game 2-player save from erasing a
      // score, completion flag, timestamp or other field belonging to 1-player.
      data[PRACTICE_ID]={
        ...old,
        ...protectedRecord,
        pieceEarned:singlePerfect,
        awardQualified:singlePerfect,
        perfectSingle:!!(protectedRecord.perfectSingle||protectedRecord.singlePlayerPerfect),
        singlePlayerPerfect:!!(protectedRecord.singlePlayerPerfect||protectedRecord.perfectSingle),
        awardRules:'v8-single-vs-duel-separated',
        twoPlayerLastWinner:outcome.winner,
        twoPlayerLastAttemptStats:stats,
        twoPlayerUpdatedAt:new Date().toISOString()
      };
    }

    const piecesAfter=goldPieceCount(data);
    if(piecesAfter<11) delete data.__finalGoldAwarded;
    localStorage.setItem(HUB_KEY,JSON.stringify(data));
    return {qualifies:gm===2?true:!!outcome.perfect,newlyEarned:gm===1&&!!outcome.perfect&&piecesAfter>piecesBefore,piecesBefore,piecesAfter};
  }

  function goldAlreadyAwarded(){try{return (JSON.parse(localStorage.getItem(HUB_KEY)||'{}')||{}).__finalGoldAwarded===true}catch(_){return false}}
  function markGoldAwarded(){try{const data=JSON.parse(localStorage.getItem(HUB_KEY)||'{}')||{};data.__finalGoldAwarded=true;localStorage.setItem(HUB_KEY,JSON.stringify(data))}catch(_){}}

  function ceremonyPlayerSources(d){const cards=[...d.querySelectorAll('.playerImgWrap img.playerSvg')];return {p1:d.getElementById('fcP1')?.src||cards[0]?.src||'',p2:d.getElementById('fcP2')?.src||cards[1]?.src||''}}

  function ensureCeremonyFallbackStyle(d){
    if(d.getElementById('sfStandaloneMatchStyle'))return;
    const st=d.createElement('style');st.id='sfStandaloneMatchStyle';st.textContent=`
      #medalCeremony #mcMessage.sf-match-result-card{background:#fff!important;color:#111!important;text-shadow:none!important;border:2px solid rgba(0,0,0,.10)!important;border-radius:18px!important;box-shadow:0 7px 20px rgba(0,0,0,.18)!important;width:min(760px,88%)!important;max-width:760px!important;padding:12px 18px!important;line-height:1.35!important;font-size:clamp(16px,2.2vw,22px)!important;text-align:center!important;}
      #medalCeremony #mcMessage .sf-result-winner{display:block;font-size:1.22em;font-weight:1000;margin-bottom:5px;color:#111!important}
      #medalCeremony #mcMessage .sf-result-note{display:block;font-size:.86em;font-weight:800;margin-bottom:6px;color:#333!important}
      #medalCeremony #mcMessage .sf-result-line{display:block;font-size:.94em;font-weight:850;color:#111!important}
      #medalCeremony .sf-tie-player{position:absolute!important;bottom:118px!important;width:min(190px,28%)!important;height:300px!important;object-fit:contain!important;z-index:4!important;}
      #medalCeremony #mcPlayer.sf-tie-player{left:28%!important;transform:translateX(-50%)!important;animation:sfTieLeftIn .72s cubic-bezier(.22,.9,.3,1.15) both!important}
      #medalCeremony #mcPlayer2.sf-tie-player{left:72%!important;transform:translateX(-50%)!important;display:block!important;animation:sfTieRightIn .72s .08s cubic-bezier(.22,.9,.3,1.15) both!important}
      @keyframes sfTieLeftIn{from{opacity:0;transform:translateX(-50%) translateX(-90px) translateY(60px) scale(.82)}to{opacity:1;transform:translateX(-50%) translateX(0) translateY(0) scale(1)}}
      @keyframes sfTieRightIn{from{opacity:0;transform:translateX(-50%) translateX(90px) translateY(60px) scale(.82)}to{opacity:1;transform:translateX(-50%) translateX(0) translateY(0) scale(1)}}
      #medalCeremony .sf-first-ordinal::before{content:'1st'!important;font-size:.72em!important}
      @media(max-width:620px){#medalCeremony .sf-tie-player{width:min(145px,39vw)!important;height:230px!important;bottom:110px!important}#medalCeremony #mcPlayer.sf-tie-player{left:25%!important}#medalCeremony #mcPlayer2.sf-tie-player{left:75%!important}#medalCeremony #mcMessage.sf-match-result-card{width:92%!important;padding:9px 11px!important;font-size:15px!important}}
    `;d.head.appendChild(st);
  }

  function markFirstAsOrdinal(d){
    const root=d.getElementById('medalCeremony');if(!root)return;
    root.querySelectorAll('*').forEach(el=>{
      if(!el.children.length&&el.textContent.trim()==='1')el.textContent='1st';
      try{const before=d.defaultView.getComputedStyle(el,'::before').content;if(before==='"1"'||before==="'1'")el.classList.add('sf-first-ordinal')}catch(_){}
    });
  }

  function ensureTiePlayers(d,sources){
    const player=d.getElementById('mcPlayer');if(!player)return;
    const card=d.querySelector('#medalCeremony .mc-card');if(card)card.classList.add('tie');
    player.classList.add('sf-tie-player');
    if(sources.p1){player.src=sources.p1;player.alt='Player 1 — joint 1st place'}
    let player2=d.getElementById('mcPlayer2');
    if(!player2){player2=player.cloneNode(true);player2.id='mcPlayer2';player.parentElement?.appendChild(player2)}
    player2.classList.add('sf-tie-player');
    if(sources.p2){player2.src=sources.p2;player2.alt='Player 2 — joint 1st place'}
    player2.style.setProperty('display','block','important');
  }

  function clearTiePlayers(d){
    const card=d.querySelector('#medalCeremony .mc-card');if(card)card.classList.remove('tie');
    const player=d.getElementById('mcPlayer');if(player){player.classList.remove('sf-tie-player');player.style.removeProperty('left');player.style.removeProperty('width');player.style.removeProperty('height');player.style.removeProperty('bottom');player.style.removeProperty('animation')}
    const player2=d.getElementById('mcPlayer2');if(player2){player2.classList.remove('sf-tie-player');player2.style.setProperty('display','none','important')}
  }

  function renderMatchMessage(msg,winner,stats){
    if(!msg)return;
    const title=winner==='tie'?"It's a tie!":`Winner: ${winner==='p2'?'Player 2':'Player 1'}`;
    const note=winner==='tie'?'Both players share 1st place and receive the match award.':'Winner receives the standalone match award.';
    let html=`<span class="sf-result-winner">${title}</span><span class="sf-result-note">${note}</span>`;
    if(stats){html+=`<span class="sf-result-line">Player 1 — Correct: ${stats.c1} | Wrong: ${stats.w1}</span><span class="sf-result-line">Player 2 — Correct: ${stats.c2} | Wrong: ${stats.w2}</span>`}
    msg.classList.add('sf-match-result-card');
    if(msg.innerHTML!==html)msg.innerHTML=html;
  }

  function enforcePieceWinner(d,winner,gm,stats){
    ensureCeremonyFallbackStyle(d);markFirstAsOrdinal(d);
    const banner=d.querySelector('#medalCeremony .mc-banner'),sub=d.getElementById('mcSub'),msg=d.getElementById('mcMessage'),player=d.getElementById('mcPlayer'),sources=ceremonyPlayerSources(d);
    if(banner){const wanted=gm===2?'🏅 2-PLAYER MATCH AWARD 🏅':'🏅 1/11 MEDAL AWARD 🏅';if(banner.textContent!==wanted)banner.textContent=wanted}
    if(sub){const wanted=gm===2?`Practice ${PRACTICE_ID} • ${SPORT} • Standalone 2-player match`:`Practice ${PRACTICE_ID} of 11 • ${SPORT}`;if(sub.textContent!==wanted)sub.textContent=wanted}
    if(gm===2&&winner==='tie'){
      ensureTiePlayers(d,sources);
    }else{
      clearTiePlayers(d);
      if(winner==='p2'&&player&&sources.p2&&player.src!==sources.p2){player.src=sources.p2;player.alt='Player 2 on the rostrum'}
      else if(winner==='p1'&&player&&sources.p1&&player.src!==sources.p1){player.src=sources.p1;player.alt='Player 1 on the rostrum'}
    }
    if(gm===2)renderMatchMessage(msg,winner,stats);
    else if(msg&&msg.textContent!=='Perfect score! Player 1 earns a 1/11 medal!')msg.textContent='Perfect score! Player 1 earns a 1/11 medal!';
  }

  function showCeremony(gm,outcome,progress){
    const winner=gm===1?'p1':outcome.winner;
    const stats=attemptStats();
    const awardGoldNow=gm===1&&progress.qualifies&&progress.piecesAfter===11&&!goldAlreadyAwarded();
    const frame=document.createElement('iframe');
    frame.title='Sports Fiesta medal ceremony';
    frame.src=HUB_URL+'?ceremonyBridge=award-v8&mode='+gm+'&winner='+encodeURIComponent(winner)+'&t='+Date.now();
    Object.assign(frame.style,{position:'fixed',inset:'0',width:'100%',height:'100%',border:'0',zIndex:'2147483647',background:'#185b9d'});
    document.body.appendChild(frame);
    frame.onload=()=>{
      try{
        const w=frame.contentWindow,d=w.document;
        w.__sportsFiestaBridgeWinner=winner;w.__sportsFiestaBridgeMode=gm;
        d.body.classList.remove('cover-on');const cover=d.getElementById('fiestaCover');if(cover)cover.style.display='none';const app=d.querySelector('.app');if(app)app.style.setProperty('display','none','important');d.body.style.padding='0';d.body.style.overflow='hidden';
        let stage='piece',guard=null,started=false;
        const showPiece=()=>{
          if(started)return;started=true;
          // A real 2-player game is never a teacher preview. The fresh award UI is
          // loaded below with a new query string so stale hub cache cannot bypass
          // the tie/player-specific animation.
          w.showMedalCeremony(false,winner,'piece');
          enforcePieceWinner(d,winner,gm,stats);
          const medal=d.getElementById('medalCeremony');
          if(medal&&w.MutationObserver){guard?.disconnect?.();guard=new w.MutationObserver(()=>{if(stage==='piece')enforcePieceWinner(d,winner,gm,stats)});guard.observe(medal,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['src','class','style']})}
          [80,650,980,1450,1980,2300,3200].forEach(ms=>setTimeout(()=>{if(stage==='piece')enforcePieceWinner(d,winner,gm,stats)},ms));
        };
        const fresh=d.createElement('script');
        fresh.src=HUB_URL+'sports-fiesta-award-ui-v2.js?v=20260823tie2';
        fresh.onload=showPiece;fresh.onerror=showPiece;d.head.appendChild(fresh);
        setTimeout(showPiece,900);
        const showGold=()=>{stage='gold';guard?.disconnect?.();markGoldAwarded();w.showMedalCeremony(false,'p1','gold');const sub=d.getElementById('mcSub'),msg=d.getElementById('mcMessage');if(sub)sub.textContent='All 11 Sports Fiesta 1-player lessons completed perfectly!';if(msg)msg.textContent='🏆 Player 1 receives the Sports Fiesta GOLD MEDAL! 🏆'};
        const close=d.querySelector('#medalCeremony .mc-close');if(close)close.addEventListener('click',()=>{if(awardGoldNow&&stage==='piece')setTimeout(showGold,90);else{guard?.disconnect?.();setTimeout(()=>frame.remove(),0)}});
        d.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(awardGoldNow&&stage==='piece')setTimeout(showGold,90);else{guard?.disconnect?.();setTimeout(()=>frame.remove(),0)}});
      }catch(e){console.warn('Sports Fiesta ceremony could not open',e);frame.remove()}
    };
  }

  function addCeremonyNextButton(gm,outcome,progress){
    const result=document.getElementById('results');if(!result||!progress.qualifies)return;
    let btn=document.getElementById('sfCeremonyNext');
    if(!btn){btn=document.createElement('button');btn.id='sfCeremonyNext';btn.type='button';btn.textContent='Next →';btn.setAttribute('aria-label','Next to medal ceremony');btn.className='bigbtn gold';Object.assign(btn.style,{minWidth:'150px',margin:'14px auto 4px',display:'block',fontWeight:'900',fontSize:'20px'});const box=result.querySelector('.results')||result,firstButton=box.querySelector('button');if(firstButton)box.insertBefore(btn,firstButton);else box.appendChild(btn)}
    btn.disabled=false;btn.onclick=()=>{btn.disabled=true;showCeremony(gm,outcome,progress)};
  }

  function checkResult(){
    clearTimeout(timer);timer=setTimeout(()=>{const result=document.getElementById('results');if(!visible(result)){handledResult=false;document.getElementById('sfCeremonyNext')?.remove();return}if(handledResult)return;const gm=getMode(),outcome=resultOutcome(gm),progress=updateProgress(gm,outcome);handledResult=true;addCeremonyNextButton(gm,outcome,progress)},220);
  }

  new MutationObserver(checkResult).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style'],characterData:true});
  window.addEventListener('load',checkResult);checkResult();
})();
