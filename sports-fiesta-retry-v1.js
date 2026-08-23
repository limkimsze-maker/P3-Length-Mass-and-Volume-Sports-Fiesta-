/* Sports Fiesta shared mastery retry rule — Practices 1 to 11 */
(() => {
  const script = document.currentScript;
  const practice = Number(script?.dataset?.practice || 0);
  if (!practice || window.__sportsFiestaRetryV1) return;
  window.__sportsFiestaRetryV1 = true;

  let cooling = false;

  function feedbackEl(){
    return document.getElementById('feedback') || document.getElementById('fb');
  }
  function explainEl(){ return document.getElementById('explain'); }
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

  // Remove stale red/green field styling as soon as a pupil edits a retry.
  document.addEventListener('input',e=>{
    const t=e.target;
    if(t && t.matches && t.matches('input.answerInput,input.blank')){
      t.classList.remove('wrong','correct');
    }
  },true);

  // Practice 1: Running Race — choice buttons, including the two-player panels.
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
        setResolvedFalse(); hideNext(); showRetryMessage();
        enableTextInputs(); restartHardTimer();
      }
      return result;
    });
    wrap('onTimeUp',original=>async function(){
      if(cooling) return;
      const result=await original.apply(this,arguments);
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
        if(wrongFieldPresent()) standardRetry(practice===7 || practice===8 ? 650 : 480);
      });
    });
  }
})();
