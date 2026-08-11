(()=>{
  if(window.__sportsFiesta2P12V1)return;
  window.__sportsFiesta2P12V1=true;
  const ONE_PLAYER_TOTAL=10;
  const TWO_PLAYER_TOTAL=12;
  const title=document.title||'';
  const GOAL_RACE=/Swimming|Sailing Regatta|Triathlon|Torch Relay/i.test(title);
  const TORCH=/Torch Relay/i.test(title);

  function setTotal(m){
    try{ TOTAL = Number(m)===2 ? TWO_PLAYER_TOTAL : ONE_PLAYER_TOTAL; }catch(e){}
  }

  function getQuestionArray(){
    try{if(typeof questions!=='undefined'&&Array.isArray(questions))return questions}catch(e){}
    try{if(typeof qs!=='undefined'&&Array.isArray(qs))return qs}catch(e){}
    return null;
  }

  function setQuestionArray(next){
    try{if(typeof questions!=='undefined'&&Array.isArray(questions)){questions=next;return true}}catch(e){}
    try{if(typeof qs!=='undefined'&&Array.isArray(qs)){qs=next;return true}}catch(e){}
    return false;
  }

  function generateMore(){
    try{if(typeof buildQuestions==='function')return buildQuestions()}catch(e){}
    try{if(typeof build==='function')return build()}catch(e){}
    try{if(typeof makeQuestions==='function')return makeQuestions()}catch(e){}
    return null;
  }

  function ensureTwelve(){
    const arr=getQuestionArray();
    if(!arr||arr.length>=TWO_PLAYER_TOTAL)return;
    let guard=0;
    while(arr.length<TWO_PLAYER_TOTAL&&guard++<4){
      const more=generateMore();
      if(Array.isArray(more)&&more.length){
        arr.push(...more.slice(0,TWO_PLAYER_TOTAL-arr.length));
      }else break;
    }
    if(arr.length<TWO_PLAYER_TOTAL&&arr.length){
      const base=arr.slice();
      let i=0;
      while(arr.length<TWO_PLAYER_TOTAL)arr.push(base[i++%base.length]);
    }
  }

  function updateHomeCopy(){
    document.querySelectorAll('.preview li,.preview p,.note,.diffHint').forEach(el=>{
      const t=el.textContent||'';
      if(GOAL_RACE){
        if(/10 mixed questions per game/i.test(t))el.textContent=t.replace(/10 mixed questions per game/i,'1-player: 10 questions • 2-player: race to the finish');
        else if(/10 questions in each game/i.test(t))el.textContent=t.replace(/10 questions in each game/i,'1-player: 10 questions • 2-player: race to the finish');
      }else{
        if(/10 mixed questions per game/i.test(t))el.textContent=t.replace(/10 mixed questions per game/i,'1-player: 10 questions • 2-player: 12 questions');
        else if(/10 questions in each game/i.test(t))el.textContent=t.replace(/10 questions in each game/i,'1-player: 10 questions • 2-player: 12 questions');
      }
    });
    if(GOAL_RACE){
      const note=document.querySelector('#home .note');
      if(note&&!/first player/i.test(note.textContent||'')){
        note.innerHTML += TORCH?'<br><b>2-player:</b> first player to light the big torch wins.':'<br><b>2-player:</b> first player to reach the finish wins.';
      }
    }
  }

  function wrapStart(name){
    const old=window[name];
    if(typeof old!=='function'||old.__sf2p12)return false;
    const wrapped=function(m){
      setTotal(m);
      const out=old.apply(this,arguments);
      if(Number(m)===2){
        ensureTwelve();
        const r=document.getElementById('round');
        if(r&&!GOAL_RACE){
          const txt=r.textContent||'';
          r.textContent=txt.replace(/(\d+)\s*\/\s*10\b/,'$1 / 12');
        }
      }
      return out;
    };
    wrapped.__sf2p12=true;
    window[name]=wrapped;
    return true;
  }

  function installGoalRace(){
    if(!GOAL_RACE)return;
    const oldRender=window.renderQuestion;
    const oldCheck=window.checkAnswer;
    const oldFinish=window.finish;
    const oldRestart=window.restart;
    const oldHome=window.goHome;
    if(typeof oldRender!=='function'||typeof oldCheck!=='function'||typeof oldFinish!=='function'||typeof oldRestart!=='function')return;

    let duelRound=1,finishing=false,finishTimer=null;
    const target=()=>{try{return Math.ceil(Number(TOTAL)/2)||6}catch(e){return 6}};
    const winner=()=>{try{if(scores[0]>=target())return 0;if(scores[1]>=target())return 1}catch(e){}return -1};
    const nextButton=()=>document.getElementById('nextBtn')||document.getElementById('next');

    function finishMessage(p){
      const n=p+1;
      const note=document.getElementById('raceNote')||document.getElementById('sailingNote');
      if(note)note.textContent=TORCH?`🔥 Player ${n} lights the big torch first!`:`🏁 Player ${n} reaches the finish first!`;
      const fb=document.getElementById('feedback')||document.getElementById('fb');
      if(fb){fb.textContent=TORCH?`🏆 Player ${n} lights the big torch first!`:`🏆 Player ${n} reaches the finish first!`;fb.style.color='#14884b'}
    }

    function endRace(p,delay=720){
      if(finishing)return;
      finishing=true;
      finishMessage(p);
      const nb=nextButton();if(nb){nb.classList.add('hidden');nb.style.display='none'}
      clearTimeout(finishTimer);
      finishTimer=setTimeout(()=>{
        oldFinish();
        const rt=document.getElementById('resultTitle');
        const rr=document.getElementById('resultText');
        if(rt)rt.textContent=TORCH?`Player ${p+1} Wins the Relay!`:`Player ${p+1} Wins the Race!`;
        if(rr){
          rr.innerHTML=(TORCH?`Player ${p+1} lit the big torch first!`:`Player ${p+1} reached the finish first!`)+`<br><br>Player 1: <b>${scores[0]}</b><br>Player 2: <b>${scores[1]}</b>`;
        }
      },delay);
    }

    window.renderQuestion=function(){
      const out=oldRender.apply(this,arguments);
      try{
        if(mode===2){
          const r=document.getElementById('round');if(r)r.textContent=`Round ${duelRound} • First to ${target()}`;
          const b=document.getElementById('bar')||document.getElementById('prog');if(b)b.style.width=`${Math.min(100,(Math.max(scores[0],scores[1])/target())*100)}%`;
        }
      }catch(e){}
      return out;
    };

    window.restart=function(){
      clearTimeout(finishTimer);finishTimer=null;finishing=false;duelRound=1;
      return oldRestart.apply(this,arguments);
    };

    if(typeof oldHome==='function')window.goHome=function(){clearTimeout(finishTimer);finishTimer=null;finishing=false;return oldHome.apply(this,arguments)};

    window.checkAnswer=function(){
      let p=0,before=-1;
      try{p=mode===2?currentPlayer:0;before=Number(scores[p])}catch(e){}
      const out=oldCheck.apply(this,arguments);
      try{if(mode===2&&Number(scores[p])>before&&Number(scores[p])>=target())endRace(p)}catch(e){}
      return out;
    };

    window.nextQuestion=function(){
      try{
        if(mode!==2){
          round++;
          if(round>=TOTAL){oldFinish();return}
          window.renderQuestion();return;
        }
        const w=winner();if(w>=0){endRace(w,0);return}
        duelRound++;
        round++;
        let arr=getQuestionArray();
        if(!arr||round>=arr.length){
          const fresh=generateMore();
          if(Array.isArray(fresh)&&fresh.length){setQuestionArray(fresh);arr=fresh}
          round=0;
        }
        currentPlayer=currentPlayer===0?1:0;
        window.renderQuestion();
      }catch(e){
        console.warn('Sports Fiesta goal-race next turn fallback',e);
      }
    };

    const observer=new MutationObserver(records=>{
      records.forEach(rec=>rec.addedNodes.forEach(node=>{
        if(!(node instanceof HTMLIFrameElement)||node.title!=='Sports Fiesta medal ceremony')return;
        node.addEventListener('load',()=>setTimeout(()=>{
          try{
            const d=node.contentDocument,w=winner();if(!d||w<0)return;
            const sub=d.getElementById('mcSub'),msg=d.getElementById('mcMessage');
            if(sub)sub.textContent=`Race complete — Player 1: ${scores[0]} • Player 2: ${scores[1]}`;
            if(msg)msg.textContent=TORCH?`Player ${w+1} lit the big torch first and receives the GOLD MEDAL!`:`Player ${w+1} reached the finish first and receives the GOLD MEDAL!`;
          }catch(e){}
        },120),{once:true});
      }));
    });
    observer.observe(document.body,{childList:true});
  }

  function install(){
    updateHomeCopy();
    const started=wrapStart('startGame')||wrapStart('start');
    installGoalRace();
    return started;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
