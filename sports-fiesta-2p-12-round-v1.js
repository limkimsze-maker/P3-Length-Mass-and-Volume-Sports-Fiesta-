(()=>{
  if(window.__sportsFiesta2P12V1)return;
  window.__sportsFiesta2P12V1=true;
  const ONE_PLAYER_TOTAL=10;
  const TWO_PLAYER_TOTAL=12;

  function setTotal(m){
    try{ TOTAL = Number(m)===2 ? TWO_PLAYER_TOTAL : ONE_PLAYER_TOTAL; }catch(e){}
  }

  function getQuestionArray(){
    try{if(typeof questions!=='undefined'&&Array.isArray(questions))return questions}catch(e){}
    try{if(typeof qs!=='undefined'&&Array.isArray(qs))return qs}catch(e){}
    return null;
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
      if(/10 mixed questions per game/i.test(t))el.textContent=t.replace(/10 mixed questions per game/i,'1-player: 10 questions • 2-player: 12 questions');
      else if(/10 questions in each game/i.test(t))el.textContent=t.replace(/10 questions in each game/i,'1-player: 10 questions • 2-player: 12 questions');
    });
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
        if(r){
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

  function install(){
    updateHomeCopy();
    if(wrapStart('startGame'))return;
    wrapStart('start');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
