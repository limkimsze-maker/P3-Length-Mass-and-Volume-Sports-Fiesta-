(()=>{
  if(window.__sportsFiesta2P12V2)return;
  window.__sportsFiesta2P12V2=true;

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

  function compactText(v){return String(v).replace(/\s+/g,' ').trim()}
  function stableValue(v,depth=0){
    if(depth>6||v==null)return '';
    const t=typeof v;
    if(t==='string'||t==='number'||t==='boolean')return `${t}:${compactText(v)}`;
    if(t==='function')return '';
    if(Array.isArray(v))return `[${v.map(x=>stableValue(x,depth+1)).filter(Boolean).sort().join('|')}]`;
    if(t==='object')return `{${Object.keys(v).sort().map(k=>{
      if(/^(options|ops|o)$/i.test(k))return '';
      const x=stableValue(v[k],depth+1);
      return x?`${k}:${x}`:'';
    }).filter(Boolean).join('|')}}`;
    return '';
  }

  function questionKey(q){
    if(q==null)return '';
    if(typeof q!=='object')return stableValue(q);
    const important=['key','q','question','prompt','story','title','type','tag','badge','v','picHTML','visual','answer','ans','a','correct','expected','data','totalMl','totalGrams'];
    const core={};
    important.forEach(k=>{if(q[k]!==undefined)core[k]=q[k]});
    return stableValue(core)||stableValue(q);
  }

  function ensureUniqueRoundQuestions(required){
    const arr=getQuestionArray();
    if(!arr)return;
    const out=[];
    const seen=new Set();
    const add=q=>{
      if(!q)return;
      const k=questionKey(q);
      if(!k||seen.has(k))return;
      seen.add(k);out.push(q);
    };
    arr.forEach(add);
    let guard=0;
    while(out.length<required&&guard++<100){
      const more=generateMore();
      if(!Array.isArray(more)||!more.length)continue;
      more.forEach(add);
    }
    if(out.length>=required)setQuestionArray(out.slice(0,required));
    else console.warn(`Sports Fiesta generated ${out.length} unique questions; ${required} requested.`);
  }

  function updateHomeCopy(){
    document.querySelectorAll('.preview li,.preview p,.note,.diffHint').forEach(el=>{
      const t=el.textContent||'';
      if(/10 mixed questions per game/i.test(t))el.textContent=t.replace(/10 mixed questions per game/i,'1-player: 10 questions • 2-player: 12 questions');
      else if(/10 questions in each game/i.test(t))el.textContent=t.replace(/10 questions in each game/i,'1-player: 10 questions • 2-player: 12 questions');
      else if(/first player to (?:reach the finish|light the big torch) wins/i.test(t))el.textContent=t.replace(/first player to (?:reach the finish|light the big torch) wins/i,'both players get 6 turns; the higher final score wins');
    });
  }

  function wrapStart(name){
    const old=window[name];
    if(typeof old!=='function'||old.__sf2p12v2)return false;
    const wrapped=function(m){
      setTotal(m);
      const out=old.apply(this,arguments);
      ensureUniqueRoundQuestions(Number(m)===2?TWO_PLAYER_TOTAL:ONE_PLAYER_TOTAL);
      return out;
    };
    wrapped.__sf2p12v2=true;
    window[name]=wrapped;
    return true;
  }

  function install(){
    updateHomeCopy();
    wrapStart('startGame')||wrapStart('start');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
