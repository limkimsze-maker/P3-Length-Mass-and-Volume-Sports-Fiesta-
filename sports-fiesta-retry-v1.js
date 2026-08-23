/* Sports Fiesta shared mastery retry + 2-player fair-play rule — Practices 1 to 11 */
(() => {
  const script = document.currentScript;
  const practice = Number(script?.dataset?.practice || 0);
  if (!practice || window.__sportsFiestaRetryV1) return;
  window.__sportsFiestaRetryV1 = true;

  let cooling = false;
  const mistakes = window.__sportsFiestaMistakes = [0,0];
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
  function resetMistakes(){
    mistakes[0]=0; mistakes[1]=0;
    fairResultApplied=false;
    window.__sportsFiestaFairWinner=null;
  }
  function recordMistake(pi=activePlayerIndex()){
    // Practice 1 is a true race: first player to the finish wins, so mistakes do not decide the winner.
    if(practice===1 || getMode()!==2) return;
    const idx=Number(pi)===1?1:0;
    mistakes[idx]=(Number(mistakes[idx])||0)+1;
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

  // Each new game starts with a clean mistake count.
  wrap('restart',original=>function(){
    resetMistakes();
    return original.apply(this,arguments);
  });

  // For turn-taking games (Practices 2–11), equal turns are already built into the games.
  // Most practices use fewer mistakes as the fair-play tiebreak/result rule.
  // Practice 11 already tracks each player's correct-answer score directly, so its
  // displayed winner must come from those scores and must not be overwritten by mistake counts.
  function applyFairTurnTakingResult(){
    if(practice===1 || getMode()!==2 || fairResultApplied) return;
    const results=document.getElementById('results');
    if(!results || !results.classList.contains('active')) return;

    const title=document.getElementById('resultTitle') || document.getElementById('rt');
    const text=document.getElementById('resultText') || document.getElementById('rr');

    if(practice===11){
      let a=null,b=null;
      try{
        if(typeof scores!=='undefined' && Array.isArray(scores)){
          a=Number(scores[0]);
          b=Number(scores[1]);
        }
      }catch(_){}

      if(Number.isFinite(a) && Number.isFinite(b)){
        fairResultApplied=true;
        const winner=a===b?'tie':(a>b?'p1':'p2');
        window.__sportsFiestaFairWinner=winner;
        if(title){
          title.textContent=winner==='tie' ? "It's a Tie!" : `Player ${winner==='p2'?2:1} Wins the Relay!`;
        }
        if(text){
          text.innerHTML=`Player 1 correct answers: <b>${a}</b><br>Player 2 correct answers: <b>${b}</b><br><br>`+
            (winner==='tie'
              ? 'Both players have the same number of correct answers.'
              : `Player ${winner==='p2'?2:1} has more correct answers and wins the relay.`);
        }
        return;
      }
    }

    fairResultApplied=true;
    const m1=Number(mistakes[0])||0, m2=Number(mistakes[1])||0;
    const winner=m1===m2?'tie':(m1<m2?'p1':'p2');
    window.__sportsFiestaFairWinner=winner;

    if(title){
      title.textContent=winner==='tie' ? "It's a Tie!" : `Player ${winner==='p2'?2:1} Wins!`;
    }
    if(text){
      text.innerHTML=`Player 1 mistakes: <b>${m1}</b><br>Player 2 mistakes: <b>${m2}</b><br><br>`+
        (winner==='tie'
          ? 'Both players made the same number of mistakes. Both players win and receive the award.'
          : `Player ${winner==='p2'?2:1} made fewer mistakes and wins the game.`);
    }
  }

  new MutationObserver(applyFairTurnTakingResult).observe(document.documentElement,{
    subtree:true,childList:true,attributes:true,attributeFilter:['class','style']
  });

  // Remove stale red/green field styling as soon as a pupil edits a retry.
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
        try{ if(typeof pLocked!=='undefined' && Array.isArray(pLocked)) pLocked[pi]=false; }catch(_){}
        setAnsweredFalse();
        hideNext();
        const box=document.getElementById(pi===0?'p1answers':'p2answers');
        if(box) box.querySelectorAll('.panswer').forEach(b=>{
          b.classList.remove('locked','correct');
          b.disabled=b.classList.contains('wrong');
        });
        showRetryMessage(`❌ Player ${pi+1}, try this question again.`);
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
      document.querySelectorAll('.choiceBtn').forEach(b=>b.classList.remove('correct'));
      const result=await original.apply(this,arguments);
      if(btn && btn.classList.contains('wrong')){
        recordMistake();
        setResolvedFalse(); hideNext(); showRetryMessage();
        document.querySelectorAll('.choiceBtn').forEach(b=>{
          b.classList.remove('correct','locked');
          b.disabled=b.classList.contains('wrong');
        });
        restartHardTimer();
      }
      return result;
    });
    wrap('checkInputs',original=>async function(){
      if(cooling) return;
      clearPreviousFieldMarks();
      const result=await original.apply(this,arguments);
      if(wrongFieldPresent()){
        recordMistake();
        setResolvedFalse(); hideNext(); showRetryMessage();
        enableTextInputs(); restartHardTimer();
      }
      return result;
    });
    wrap('onTimeUp',original=>async function(){
      if(cooling) return;
      const result=await original.apply(this,arguments);
      recordMistake();
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
      const result=await original.apply(this,arguments);
      if(btn && (btn.classList.contains('no') || btn.classList.contains('wrong'))){
        recordMistake();
        setLockedFalse(); hideNext();
        const box=document.getElementById('answers');
        if(box) box.querySelectorAll('.ans').forEach(b=>{
          b.classList.remove('ok','correct','locked');
          b.disabled=b===btn || b.classList.contains('no') || b.classList.contains('wrong');
        });
        showRetryMessage();
      }
      return result;
    });
    return;
  }

  // Practices 4–11 share the same basic Check Answer / Next pattern.
  if(practice>=4 && practice<=11){
    wrap('checkAnswer',original=>function(){
      if(cooling) return;
      clearPreviousFieldMarks();
      const result=original.apply(this,arguments);
      return afterMaybePromise(result,()=>{
        if(wrongFieldPresent()){
          recordMistake();
          standardRetry(practice===7 || practice===8 ? 650 : 480);
        }
      });
    });
  }
})();
