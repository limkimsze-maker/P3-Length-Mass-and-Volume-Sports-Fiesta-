/* Sports Fiesta shared mastery retry + 2-player fair-play rule — Practices 1 to 11 */
(() => {
  const script = document.currentScript;
  const practice = Number(script?.dataset?.practice || 0);
  if (!practice || window.__sportsFiestaRetryV1) return;
  window.__sportsFiestaRetryV1 = true;

  let cooling = false;
  const mistakes = window.__sportsFiestaMistakes = [0,0];
  const correctAttempts = window.__sportsFiestaCorrectAttempts = [0,0];
  window.__sportsFiestaAttemptStats = {correct:correctAttempts, wrong:mistakes};
  let fairResultApplied = false;

  function feedbackEl(){
    return document.getElementById('feedback') || document.getElementById('fb');
  }
  function explainEl(){ return document.getElementById('explain'); }
  function getMode(){
    try{ if(typeof mode!=='undefined') return Number(mode)===2?2:1; }catch(_){}
    try{ if(typeof gameMode!=='undefined') return String(gameMode).includes('2')?2:1; }catch(_){}
    return 1;
  }
  function activePlayerIndex(fallback=0){
    try{ if(typeof currentPlayer!=='undefined') return Number(currentPlayer)===1?1:0; }catch(_){}
    try{ if(typeof player!=='undefined') return Number(player)===1?1:0; }catch(_){}
    return Number(fallback)===1?1:0;
  }
  function resetAttempts(){
    mistakes[0]=0; mistakes[1]=0;
    correctAttempts[0]=0; correctAttempts[1]=0;
    fairResultApplied=false;
    window.__sportsFiestaFairWinner=null;
  }
  function recordMistake(pi=activePlayerIndex()){
    if(getMode()!==2) return;
    const idx=Number(pi)===1?1:0;
    mistakes[idx]=(Number(mistakes[idx])||0)+1;
  }
  function recordCorrect(pi=activePlayerIndex()){
    if(getMode()!==2) return;
    const idx=Number(pi)===1?1:0;
    correctAttempts[idx]=(Number(correctAttempts[idx])||0)+1;
  }
  function winnerFromAttempts(){
    const c1=Number(correctAttempts[0])||0, c2=Number(correctAttempts[1])||0;
    const m1=Number(mistakes[0])||0, m2=Number(mistakes[1])||0;
    if(c1!==c2) return c1>c2?'p1':'p2';
    if(m1!==m2) return m1<m2?'p1':'p2';
    return 'tie';
  }
  function hideNext(){
    const ids=['nextBtn','next'];
    ids.forEach(id=>{
      const el=document.getElementById(id);
      if(!el) return;
      const usesInlineDisplay=el.classList.contains('next') || id==='next';
      if(usesInlineDisplay){
        el.style.display='none';
      }else{
        el.classList.add('hidden');
        el.style.removeProperty('display');
      }
      el.disabled=false;
    });
  }
  function showRetryMessage(text='❌ Not quite. Try this question again.'){
    const f=feedbackEl();
    if(f){ f.textContent=text; f.style.color='#b43b3b'; }
    const ex=explainEl();
    if(ex) ex.textContent='';
  }
  function setAnsweredFalse(){ try{ if(typeof answered!=='undefined') answered=false; }catch(_){} }
  function setResolvedFalse(){ try{ if(typeof resolved!=='undefined') resolved=false; }catch(_){} }
  function setLockedFalse(){ try{ if(typeof locked!=='undefined') locked=false; }catch(_){} }
  function enableTextInputs(){
    document.querySelectorAll('input.answerInput,input.blank').forEach(el=>{ el.disabled=false; });
    const check=document.getElementById('checkBtn');
    if(check) check.disabled=false;
  }
  function clearPreviousFieldMarks(){
    document.querySelectorAll('input.answerInput,input.blank').forEach(el=>{
      el.classList.remove('correct','wrong');
    });
  }
  function wrongFieldPresent(){
    return !!document.querySelector('input.answerInput.wrong,input.blank.wrong');
  }
  function correctSignal(){
    const f=(feedbackEl()?.textContent||'').toLowerCase();
    if(/correct|success|well done|great/.test(f)) return true;
    return !wrongFieldPresent() && !!document.querySelector('input.answerInput.correct,input.blank.correct,.choiceBtn.correct,.ans.ok,.ans.correct');
  }
  function standardRetry(delay=480){
    setAnsweredFalse();
    hideNext();
    showRetryMessage();
    cooling=true;
    const check=document.getElementById('checkBtn');
    if(check) check.disabled=true;
    setTimeout(()=>{
      enableTextInputs();
      cooling=false;
      const first=document.querySelector('input.answerInput.wrong,input.blank.wrong,input.answerInput,input.blank');
      if(first && typeof first.focus==='function') first.focus();
    },delay);
  }
  function wrap(name,make){
    const original=window[name];
    if(typeof original!=='function') return false;
    window[name]=make(original);
    return true;
  }
  function afterMaybePromise(result,after){
    if(result && typeof result.then==='function'){
      return result.then(v=>{ after(); return v; });
    }
    after();
    return result;
  }

  // Each new game starts with clean attempt totals.
  wrap('restart',original=>function(){
    resetAttempts();
    return original.apply(this,arguments);
  });

  // All 2-player result screens show the same transparent attempt breakdown.
  // Practice 1 keeps its true race winner. Practices 2–11 use:
  // more correct attempts -> fewer wrong attempts -> tie.
  function applyFairTurnTakingResult(){
    if(getMode()!==2 || fairResultApplied) return;
    const results=document.getElementById('results');
    if(!results || !results.classList.contains('active')) return;

    fairResultApplied=true;
    const c1=Number(correctAttempts[0])||0, c2=Number(correctAttempts[1])||0;
    const m1=Number(mistakes[0])||0, m2=Number(mistakes[1])||0;
    const title=document.getElementById('resultTitle') || document.getElementById('rt');
    const text=document.getElementById('resultText') || document.getElementById('rr');

    if(practice===1){
      // Running Race remains first-to-finish. Do not replace its winner.
      if(text){
        const existing=text.innerHTML;
        text.innerHTML=existing+`<br><br><b>Attempt record</b><br>`+
          `Player 1 — Correct: <b>${c1}</b> &nbsp; Wrong: <b>${m1}</b><br>`+
          `Player 2 — Correct: <b>${c2}</b> &nbsp; Wrong: <b>${m2}</b>`;
      }
      return;
    }

    const winner=winnerFromAttempts();
    window.__sportsFiestaFairWinner=winner;
    if(title){
      title.textContent=winner==='tie' ? "It's a Tie!" : `Player ${winner==='p2'?2:1} Wins!`;
    }
    if(text){
      const reason=winner==='tie'
        ? 'Both players have the same correct and wrong attempt totals.'
        : (c1!==c2
          ? `Player ${winner==='p2'?2:1} wins with more correct attempts.`
          : `Player ${winner==='p2'?2:1} wins with fewer wrong attempts.`);
      text.innerHTML=`<b>Attempt record</b><br>`+
        `Player 1 — Correct: <b>${c1}</b> &nbsp; Wrong: <b>${m1}</b><br>`+
        `Player 2 — Correct: <b>${c2}</b> &nbsp; Wrong: <b>${m2}</b><br><br>${reason}`;
    }
  }

  new MutationObserver(applyFairTurnTakingResult).observe(document.documentElement,{
    subtree:true,childList:true,attributes:true,attributeFilter:['class','style']
  });

  document.addEventListener('input',e=>{
    const t=e.target;
    if(t && t.matches && t.matches('input.answerInput,input.blank')){
      t.classList.remove('wrong','correct');
    }
  },true);

  // Practice 1: Running Race — first player to reach the finishing line wins.
  if(practice===1){
    wrap('soloAnswer',original=>function(btn,op){
      if(cooling) return;
      const result=original.apply(this,arguments);
      if(btn && btn.classList.contains('wrong')){
        setAnsweredFalse();
        hideNext();
        document.querySelectorAll('#soloAnswers .answer').forEach(b=>{
          if(b!==btn) b.classList.remove('correct');
          b.disabled=b.classList.contains('wrong');
        });
        showRetryMessage();
      }
      return result;
    });
    wrap('duelAnswer',original=>function(pi,btn,op){
      if(cooling) return;
      const result=original.apply(this,arguments);
      if(btn && btn.classList.contains('wrong')){
        recordMistake(pi);
        try{ if(typeof pLocked!=='undefined' && Array.isArray(pLocked)) pLocked[pi]=false; }catch(_){}
        setAnsweredFalse();
        hideNext();
        const box=document.getElementById(pi===0?'p1answers':'p2answers');
        if(box) box.querySelectorAll('.panswer').forEach(b=>{
          b.classList.remove('locked','correct');
          b.disabled=b.classList.contains('wrong');
        });
        showRetryMessage(`❌ Player ${pi+1}, try this question again.`);
      }else if(btn && (btn.classList.contains('correct') || btn.classList.contains('ok'))){
        recordCorrect(pi);
      }
      return result;
    });
    return;
  }

  // Practice 2: Javelin — choice or input questions, plus timed hard mode.
  if(practice===2){
    function restartHardTimer(){
      try{
        if(typeof stopTimer==='function') stopTimer();
        if(typeof difficulty!=='undefined' && difficulty==='hard' && typeof startTimer==='function' && typeof HARD_TIME!=='undefined') startTimer(HARD_TIME);
      }catch(_){}
    }
    wrap('checkChoice',original=>async function(btn,value){
      if(cooling) return;
      const pi=activePlayerIndex();
      document.querySelectorAll('.choiceBtn').forEach(b=>b.classList.remove('correct'));
      const result=await original.apply(this,arguments);
      if(btn && btn.classList.contains('wrong')){
        recordMistake(pi);
        setResolvedFalse(); hideNext(); showRetryMessage();
        document.querySelectorAll('.choiceBtn').forEach(b=>{
          b.classList.remove('correct','locked');
          b.disabled=b.classList.contains('wrong');
        });
        restartHardTimer();
      }else if(btn && btn.classList.contains('correct')){
        recordCorrect(pi);
      }
      return result;
    });
    wrap('checkInputs',original=>async function(){
      if(cooling) return;
      const pi=activePlayerIndex();
      clearPreviousFieldMarks();
      const result=await original.apply(this,arguments);
      if(wrongFieldPresent()){
        recordMistake(pi);
        setResolvedFalse(); hideNext(); showRetryMessage();
        enableTextInputs(); restartHardTimer();
      }else if(correctSignal()){
        recordCorrect(pi);
      }
      return result;
    });
    wrap('onTimeUp',original=>async function(){
      if(cooling) return;
      const pi=activePlayerIndex();
      const result=await original.apply(this,arguments);
      recordMistake(pi);
      setResolvedFalse(); hideNext();
      showRetryMessage("⏰ Time's up. Try this question again.");
      document.querySelectorAll('.choiceBtn').forEach(b=>b.disabled=false);
      enableTextInputs(); restartHardTimer();
      return result;
    });
    return;
  }

  // Practice 3: Bowling — do not consume the roll on a wrong choice.
  if(practice===3){
    wrap('answer',original=>async function(btn,op){
      if(cooling) return;
      const pi=activePlayerIndex();
      const result=await original.apply(this,arguments);
      if(btn && (btn.classList.contains('no') || btn.classList.contains('wrong'))){
        recordMistake(pi);
        setLockedFalse(); hideNext();
        const box=document.getElementById('answers');
        if(box) box.querySelectorAll('.ans').forEach(b=>{
          b.classList.remove('ok','correct','locked');
          b.disabled=b===btn || b.classList.contains('no') || b.classList.contains('wrong');
        });
        showRetryMessage();
      }else if(btn && (btn.classList.contains('ok') || btn.classList.contains('correct'))){
        recordCorrect(pi);
      }
      return result;
    });
    return;
  }

  // Practices 4–11 share the same basic Check Answer / Next pattern.
  if(practice>=4 && practice<=11){
    wrap('checkAnswer',original=>function(){
      if(cooling) return;
      const pi=activePlayerIndex();
      clearPreviousFieldMarks();
      const result=original.apply(this,arguments);
      return afterMaybePromise(result,()=>{
        if(wrongFieldPresent()){
          recordMistake(pi);
          standardRetry(practice===7 || practice===8 ? 650 : 480);
        }else if(correctSignal()){
          recordCorrect(pi);
        }
      });
    });
  }
})();
