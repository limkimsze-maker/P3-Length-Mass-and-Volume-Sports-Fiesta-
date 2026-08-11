/* SF_MEDAL_HOOK_SECURITY_V6: verified end-screen completion + Practice 1 race fix */
(() => {
  const script=document.currentScript;
  const PRACTICE_ID=Number(script?.dataset?.practice||0);
  const SPORT=script?.dataset?.sport||`Practice ${PRACTICE_ID}`;
  if(!PRACTICE_ID||window.__sportsFiestaMedalHookV4)return;
  window.__sportsFiestaMedalHookV4=true;
  const HUB_KEY='sportsFiestaHubProgress_v1';
  const HUB_URL='https://limkimsze-maker.github.io/P3-Length-Mass-and-Volume-Sports-Fiesta-/';
  let shown=false,timer=null;

  function installMobileFit(){
    const common=`
    @media(max-width:600px) and (orientation:portrait){
      html,body{height:100dvh!important;min-height:100dvh!important;max-height:100dvh!important;overflow:hidden!important}
      body{padding:0!important}
      .app{height:100dvh!important;min-height:100dvh!important;max-height:100dvh!important;border-radius:0!important;border-left:0!important;border-right:0!important}
      header{padding:6px 8px!important;gap:6px!important;flex:0 0 auto!important}
      header h1{font-size:clamp(18px,5.4vw,23px)!important;line-height:1.05!important}
      header .sub,header small{display:none!important}
      main{padding:5px!important;min-height:0!important;overflow:hidden!important}
      #game{gap:4px!important;min-height:0!important;overflow:hidden!important}
      .controls,.topControls,.top{gap:4px!important;min-height:0!important;flex:0 0 auto!important}
      .btnRow{gap:4px!important;flex-wrap:nowrap!important}
      .smallbtn,.small{padding:6px 7px!important;font-size:11px!important;line-height:1.05!important;white-space:nowrap!important}
      .statusline,.scoreline,.status{gap:4px!important;flex:0 0 auto!important}
      .score{padding:5px!important;font-size:11px!important;line-height:1.05!important}
      .round{font-size:11px!important}
      .progress,.bar{height:4px!important;margin:0!important;flex:0 0 auto!important}
      .questionCard,.qcard,.panel{padding:5px!important}
      .badges,.topBadges{gap:3px!important;flex-wrap:nowrap!important;overflow:hidden!important}
      .badge,.tag,.turnBanner,.timerBadge{font-size:10px!important;padding:3px 5px!important;line-height:1!important;white-space:nowrap!important}
      #question,#questionTitle,#q{font-size:clamp(16px,4.7vw,19px)!important;line-height:1.08!important;margin:3px 0!important}
      .story{font-size:13px!important;line-height:1.18!important;margin:2px auto!important}
      .helper,.helperBubble{font-size:10px!important;line-height:1.12!important;padding:3px 7px!important;margin:2px auto!important}
      .answers,.choices{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:4px!important;margin-top:4px!important}
      .answer,.ans,.choiceBtn{min-height:38px!important;padding:4px 5px!important;font-size:clamp(14px,3.9vw,17px)!important;line-height:1.05!important;border-width:2px!important;border-radius:10px!important}
      .panswers{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:4px!important}
      .panswer{min-height:34px!important;padding:3px!important;font-size:12px!important}
      .worksheet,.workArea,.measureWrap,.scene,.visual,.scaleArea{padding:4px!important;margin-top:3px!important;min-height:0!important}
      .actions,.inputArea,.answerWrap,.answerRow,.answerArea{margin-top:3px!important;gap:4px!important}
      .action,.actionBtn,.next{padding:6px 10px!important;font-size:13px!important;min-height:32px!important}
      .blank,.answerInput{height:36px!important;font-size:16px!important}
      .feedback,.fb{min-height:14px!important;font-size:11px!important;margin-top:2px!important;line-height:1.05!important}
      .explain,.answerHint{min-height:12px!important;font-size:9px!important;margin-top:1px!important;line-height:1.05!important}
      .lifterCard,.strongmanCard,.raceCard,.diveCard,.poloCard,.sailingCard{padding:4px!important}
      .lifterStage,.strongmanStage,.raceStage,.diveStage,.poloStage,.sailingStage{margin-top:3px!important}
      .resultText,.raceNote,.diveNote,.poloNote,.sailingNote{font-size:10px!important;min-height:12px!important;margin-top:2px!important}
      .raceTitle,.diveTitle,.poloTitle,.sailingTitle,.lifterName,.athleteName{font-size:11px!important;padding:3px 7px!important}
    }`;
    let specific='';
    if(PRACTICE_ID===1){
      specific=`
      @media(max-width:600px) and (orientation:portrait){
        main{display:flex!important;flex-direction:column!important}
        #game.screen.active{display:flex!important;flex-direction:column!important;min-height:0!important;overflow:hidden!important}
        .racebox{margin:3px 0!important;padding:2px!important;flex:0 0 auto!important}
        .raceTitle{display:none!important}
        .lane{height:28px!important;margin:2px 0!important}
        .laneLabel{width:20px!important;height:20px!important;top:3px!important;font-size:10px!important}
        .runner{width:29px!important;height:27px!important}
        .finishFlag{font-size:15px!important}
        .progress{margin-bottom:3px!important}
        .qcard{flex:1!important;min-height:0!important;justify-content:flex-start!important;overflow:hidden!important}
        #picture{margin-top:3px!important;min-height:0!important;max-height:96px!important;overflow:hidden!important}
        .visuals{gap:4px!important;flex-wrap:nowrap!important}
        .objcard{padding:4px!important;max-width:none!important}
        .objsvg,.objsvg svg{height:43px!important}
        .objname,.objmeasure{font-size:10px!important;margin-top:2px!important;padding:3px!important}
        .answers{grid-template-columns:repeat(2,minmax(0,1fr))!important}
        .duelwrap{gap:4px!important;margin-top:4px!important;grid-template-columns:repeat(2,minmax(0,1fr))!important}
        .playerpanel{padding:4px!important}
        .playername{font-size:12px!important;margin-bottom:3px!important}
      }`;
    }else if(PRACTICE_ID===2){
      specific=`
      @media(max-width:600px) and (orientation:portrait){
        .gameGrid{grid-template-rows:minmax(92px,24%) minmax(0,76%)!important;gap:4px!important}
        .fieldStatus{font-size:9px!important;padding:2px 5px!important}
        .thrower{width:54px!important;height:68px!important;bottom:19px!important}
        .runway{height:24px!important}.landingPin{bottom:27px!important}
        .landingPin .flag{font-size:18px!important}.landingPin .distance{font-size:9px!important}
        .worksheet{justify-content:flex-start!important;overflow:hidden!important}
        .mainline{font-size:20px!important;margin:2px 0 4px!important}
        .step{font-size:16px!important;margin:2px 0!important;line-height:1.15!important}
        .choices{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      }`;
    }else if(PRACTICE_ID===3){
      specific=`
      @media(max-width:600px) and (orientation:portrait){
        .gamegrid{grid-template-rows:minmax(92px,24%) minmax(0,76%)!important;gap:4px!important}
        .alleyMsg{font-size:8px!important;padding:2px 5px!important}
        .pins{transform:translateX(-50%) scale(.72)!important;transform-origin:top center!important}
        .ball{width:34px!important;height:34px!important}
        .answers{grid-template-columns:repeat(2,minmax(0,1fr))!important}
        .visual{min-height:0!important}
        .scale{height:120px!important}
      }`;
    }else{
      specific=`
      @media(max-width:600px) and (orientation:portrait){
        .gameGrid{grid-template-columns:1fr!important;grid-template-rows:minmax(0,3fr) minmax(88px,1fr)!important;gap:4px!important}
      }`;
    }
    const st=document.createElement('style');
    st.id='sportsFiestaMobileFitV4';
    st.textContent=common+specific;
    document.head.appendChild(st);
  }
  installMobileFit();

  function installPracticeOneRaceRules(){
    if(PRACTICE_ID!==1)return;
    try{
      const DUEL_FINISH=6;
      let duelRound=1;
      const baseRestart=restart;
      const baseRenderQuestion=renderQuestion;
      const baseFinish=finish;

      updateRace=function(movedPlayer=-1){
        const target=(mode===2)?DUEL_FINISH:TOTAL;
        [0,1].forEach(i=>{
          const el=document.getElementById(`runner${i+1}`);
          if(!el)return;
          const progress=Math.min(scores[i],target)/target;
          const pct=6+progress*88;
          el.style.left=`${pct}%`;
          if(i===movedPlayer){el.classList.remove('bounce');void el.offsetWidth;el.classList.add('bounce')}
        });
      };

      renderQuestion=function(){
        baseRenderQuestion();
        if(mode===2){
          const roundEl=document.getElementById('round');
          if(roundEl)roundEl.textContent=`Round ${duelRound} • First to ${DUEL_FINISH}`;
          const bar=document.getElementById('bar');
          if(bar)bar.style.width=`${Math.min(100,(Math.max(scores[0],scores[1])/DUEL_FINISH)*100)}%`;
          const title=document.querySelector('.raceTitle');
          if(title)title.textContent=`FIRST TO ${DUEL_FINISH} CORRECT ANSWERS WINS`;
        }else{
          const title=document.querySelector('.raceTitle');
          if(title)title.textContent='CORRECT ANSWERS MOVE YOUR RUNNER';
        }
      };

      restart=function(){duelRound=1;baseRestart()};

      duelAnswer=function(pi,btn,op){
        if(answered||pLocked[pi])return;
        const q=questions[round];
        if(op===q.answer){
          answered=true;
          scores[pi]++;
          btn.classList.add('correct');
          document.querySelectorAll('.panswer').forEach(x=>x.disabled=true);
          document.getElementById('score1').textContent=`Player 1: ${scores[0]}`;
          document.getElementById('score2').textContent=`Player 2: ${scores[1]}`;
          updateRace(pi);
          if(scores[pi]>=DUEL_FINISH){
            feedback(`🏁 Player ${pi+1} reached the finishing line first!`,true);
            document.getElementById('nextBtn').style.display='none';
            setTimeout(()=>finish(),520);
          }else{
            feedback(`✅ Player ${pi+1} earns a point! ${q.explain}`,true);
            document.getElementById('nextBtn').style.display='block';
          }
        }else{
          pLocked[pi]=true;
          btn.classList.add('wrong');
          document.querySelectorAll(pi===0?'#p1answers .panswer':'#p2answers .panswer').forEach(x=>{x.disabled=true;x.classList.add('locked')});
          feedback(`❌ Player ${pi+1} is locked out. Other player can answer!`,false);
          if(pLocked[0]&&pLocked[1]){
            answered=true;
            document.querySelectorAll('.panswer').forEach(x=>{if(x.textContent.trim()===q.answer)x.classList.add('correct')});
            feedback(`💡 No point this round. ${q.explain}`,false);
            document.getElementById('nextBtn').style.display='block';
          }
        }
      };

      nextQuestion=function(){
        if(mode!==2){round++;if(round>=TOTAL){finish();return}renderQuestion();return}
        if(scores[0]>=DUEL_FINISH||scores[1]>=DUEL_FINISH){finish();return}
        duelRound++;
        round++;
        if(round>=questions.length){questions=buildQuestions();round=0}
        renderQuestion();
      };

      finish=function(){
        if(mode!==2){baseFinish();return}
        const winner=scores[0]>=DUEL_FINISH?1:2;
        const bar=document.getElementById('bar');if(bar)bar.style.width='100%';
        show('results');
        document.getElementById('trophy').textContent='🏆';
        document.getElementById('resultTitle').textContent=`Player ${winner} Wins the Race!`;
        document.getElementById('resultText').innerHTML=`Player ${winner} reached the finishing line first!<br><br>Player 1: <b>${scores[0]}</b> point${scores[0]===1?'':'s'}<br>Player 2: <b>${scores[1]}</b> point${scores[1]===1?'':'s'}<br><br>Race again for a fresh mix of questions.`;
      };

      const note=document.querySelector('#home .intro .note');
      if(note)note.textContent='1 Player: 12 questions. 2 Players: first to 6 correct answers reaches the finishing line and wins.';
      const preview=document.querySelector('#home .preview p');
      if(preview)preview.textContent='In 1-player mode, beat your own score. In 2-player mode, the first player to reach the finishing line wins.';
      updateRace();
    }catch(e){console.warn('Practice 1 race rules could not be installed',e)}
  }
  installPracticeOneRaceRules();

  function visible(el){if(!el)return false;const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0}
  function resultElement(){
    const list=[...document.querySelectorAll('#results,.results,[id*="result" i],[class*="result" i],.screen.active')];
    return list.find(el=>{
      if(!visible(el))return false;
      const text=(el.innerText||'').replace(/\s+/g,' ').trim();
      if(text.length<20)return false;
      const strongEnd=/final score|\bresults\b|\bcompleted\b|\bfinished\b|\bwinner\b|\bwins the\b|\bwon the\b|practice\s+complete|challenge\s+complete|game\s+complete|game\s+over|it(?:'|’)s\s+a\s+draw|tie\s+game/i.test(text);
      const explicitResult=el.matches('#results,.results,[id*="result" i],[class*="result" i]');
      const resultProof=/score|scored|\d+\s*\/\s*\d+|\d+\s+out\s+of\s+\d+/i.test(text);
      return strongEnd||(explicitResult&&resultProof);
    })||null;
  }
  function readMode(text){try{if(typeof mode!=='undefined'){if(mode===2||mode==='2'||String(mode).toLowerCase().includes('2'))return 2;if(mode===1||mode==='1'||String(mode).toLowerCase().includes('1'))return 1}}catch(e){}try{if(typeof gameMode!=='undefined'){if(String(gameMode).toLowerCase().includes('2'))return 2;if(String(gameMode).toLowerCase().includes('1'))return 1}}catch(e){}return /player\s*2|\bp2\b/i.test(text)?2:1}
  function stateScores(){let a=null,b=null,total=null;try{if(typeof scores!=='undefined'&&Array.isArray(scores)){a=Number(scores[0]);b=Number(scores[1])}}catch(e){}try{if(typeof score1!=='undefined')a=Number(score1)}catch(e){}try{if(typeof score2!=='undefined')b=Number(score2)}catch(e){}try{if(typeof p1Score!=='undefined')a=Number(p1Score)}catch(e){}try{if(typeof p2Score!=='undefined')b=Number(p2Score)}catch(e){}try{if(typeof TOTAL!=='undefined')total=Number(TOTAL)}catch(e){}try{if(typeof totalQuestions!=='undefined')total=Number(totalQuestions)}catch(e){}return{a:Number.isFinite(a)?a:null,b:Number.isFinite(b)?b:null,total:Number.isFinite(total)?total:null}}
  function domScore(sel){const el=document.querySelector(sel);if(!el)return null;const n=(el.textContent.match(/\d+/g)||[]).map(Number);return n.length?n[n.length-1]:null}
  function outcome(text,gm){const s=stateScores();let p1=s.a,p2=s.b,total=s.total;if(p1==null)p1=domScore('.score.p1,.p1.score,#score1,#p1Score');if(p2==null)p2=domScore('.score.p2,.p2.score,#score2,#p2Score');const f=[...text.matchAll(/(\d+)\s*\/\s*(\d+)/g)].map(m=>[+m[1],+m[2]]).filter(x=>x[1]>=5);if(f.length){p1=f[0][0];total=f[0][1]}const out=text.match(/(\d+)\s+out\s+of\s+(\d+)/i);if(out){p1=+out[1];total=+out[2]}let winner='p1';if(gm===2){winner=(p1!=null&&p2!=null)?(p1===p2?'tie':(p1>p2?'p1':'p2')):'tie'}return{winner,perfect:gm===1&&p1!=null&&total!=null&&total>0&&p1===total,p1,p2,total}}
  function twoPlayerFinalRound(res,text,o){
    if(o.p1==null||o.p2==null)return false;
    const explicitFinal=!!(res&&res.matches&&res.matches('#results,.results'));
    if(explicitFinal)return true;
    const finalText=/final\s+score|final\s+results|game\s+complete|game\s+over|challenge\s+complete|(?:question|round)\s*12\s*(?:of|\/)\s*12/i.test(text);
    return finalText;
  }

  function update(gm,perfect,winner){
    let data={};try{data=JSON.parse(localStorage.getItem(HUB_KEY)||'{}')||{}}catch(e){}
    const old=data[PRACTICE_ID]||{};
    data[PRACTICE_ID]={...old,completed:true,pieceEarned:!!old.pieceEarned||gm===1,perfectSingle:!!old.perfectSingle||!!perfect,verified:true,source:'game-v5',updatedAt:new Date().toISOString(),lastMode:gm,lastWinner:winner};
    localStorage.setItem(HUB_KEY,JSON.stringify(data));
    let completed=0,perfectCount=0;
    for(let i=1;i<=11;i++){
      const x=data[i]||{};
      const verified=x.completed===true&&x.verified===true&&x.source==='game-v5';
      if(verified)completed++;
      if(verified&&x.perfectSingle)perfectCount++;
    }
    return{completed,perfectCount};
  }

  function ceremony(gm,o,p){
    const full=o.perfect&&p.perfectCount===11;
    const duelGold=gm===2&&o.winner!=='tie';
    const winner=gm===1?'p1':o.winner;
    const kind=duelGold?'gold':(full?'gold':'piece');
    const frame=document.createElement('iframe');
    frame.title='Sports Fiesta medal ceremony';
    frame.src=HUB_URL+'?ceremonyBridge=4&t='+Date.now();
    Object.assign(frame.style,{position:'fixed',inset:'0',width:'100%',height:'100%',border:'0',zIndex:'2147483647',background:'#185b9d'});
    document.body.appendChild(frame);
    frame.onload=()=>{
      try{
        const w=frame.contentWindow,d=w.document;
        d.body.classList.remove('cover-on');
        const cover=d.getElementById('fiestaCover');if(cover)cover.style.display='none';
        const app=d.querySelector('.app');if(app)app.style.setProperty('display','none','important');
        d.body.style.padding='0';d.body.style.overflow='hidden';
        w.showMedalCeremony(false,winner,kind);
        const card=d.querySelector('#medalCeremony .mc-card');
        if(duelGold&&card)card.classList.remove('preview');
        const sub=d.getElementById('mcSub'),msg=d.getElementById('mcMessage');
        if(duelGold){
          if(PRACTICE_ID===1){
            if(sub)sub.textContent=`Race complete — Player 1: ${o.p1} • Player 2: ${o.p2}`;
            if(msg)msg.textContent=`${winner==='p2'?'Player 2':'Player 1'} reached the finishing line first and receives the GOLD MEDAL!`;
          }else{
            if(sub)sub.textContent=`12-question round complete — Player 1: ${o.p1} • Player 2: ${o.p2}`;
            if(msg)msg.textContent=`${winner==='p2'?'Player 2':'Player 1'} has the higher score and receives the GOLD MEDAL!`;
          }
        }else if(!full&&sub)sub.textContent=`Practice ${PRACTICE_ID}: ${SPORT} completed!`;
        if(!duelGold&&!full&&msg){if(gm===1)msg.textContent=`Player 1 receives 1/11 of the medal! ${p.completed}/11 practices complete.`;else if(winner==='tie')msg.textContent="It's a tie — no gold medal is awarded."}
        const close=d.querySelector('#medalCeremony .mc-close');if(close)close.addEventListener('click',()=>setTimeout(()=>frame.remove(),0),{once:true});
        d.addEventListener('keydown',e=>{if(e.key==='Escape')setTimeout(()=>frame.remove(),0)},{once:true});
      }catch(e){frame.remove();}
    };
  }
  function check(){clearTimeout(timer);timer=setTimeout(()=>{const res=resultElement();if(!res){shown=false;return}if(shown)return;const text=(res.innerText||'').replace(/\s+/g,' ').trim();if(text.length<20)return;const gm=readMode(text),o=outcome(text,gm);if(gm===2&&!twoPlayerFinalRound(res,text,o))return;const p=update(gm,o.perfect,o.winner);shown=true;if(gm===2&&o.winner==='tie')return;setTimeout(()=>ceremony(gm,o,p),350)},120)}
  new MutationObserver(check).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style'],characterData:true});window.addEventListener('load',check);check();
})();

/* SF_NO_REPEAT_EMBED_START */
(()=>{
  if(window.__sportsFiesta2P12V1)return;
  window.__sportsFiesta2P12V1=true;
  const ONE_PLAYER_TOTAL=10;
  const TWO_PLAYER_TOTAL=12;
  const title=document.title||'';
  const GOAL_RACE=/Swimming|Sailing Regatta|Triathlon|Torch Relay/i.test(title);
  const TORCH=/Torch Relay/i.test(title);
  const usedQuestionKeys=new Set();

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

  function compactText(v){
    return String(v).replace(/\s+/g,' ').trim();
  }

  function stableValue(v,depth){
    if(depth>5||v==null)return '';
    const t=typeof v;
    if(t==='string'||t==='number'||t==='boolean')return `${t}:${compactText(v)}`;
    if(t==='function')return '';
    if(Array.isArray(v)){
      return `[${v.map(x=>stableValue(x,depth+1)).filter(Boolean).sort().join('|')}]`;
    }
    if(t==='object'){
      return `{${Object.keys(v).sort().map(k=>{
        if(/^(options|ops|o)$/i.test(k))return '';
        const x=stableValue(v[k],depth+1);
        return x?`${k}:${x}`:'';
      }).filter(Boolean).join('|')}}`;
    }
    return '';
  }

  function questionKey(q){
    if(q==null)return '';
    if(typeof q!=='object')return stableValue(q,0);
    const important=['q','question','prompt','story','title','type','tag','v','picHTML','visual','answer','ans','a','correct','expected'];
    const core={};
    important.forEach(k=>{if(q[k]!==undefined)core[k]=q[k]});
    return stableValue(core,0)||stableValue(q,0);
  }

  function resetUsedQuestions(){
    usedQuestionKeys.clear();
  }

  function markCurrentQuestion(){
    try{
      const arr=getQuestionArray();
      if(!arr||!arr.length)return;
      const i=Math.max(0,Number(round)||0);
      const q=arr[i];
      const k=questionKey(q);
      if(k)usedQuestionKeys.add(k);
    }catch(e){}
  }

  function ensureUniqueRoundQuestions(required){
    const arr=getQuestionArray();
    if(!arr)return [];
    const out=[];
    const seen=new Set();
    const add=q=>{
      if(!q)return false;
      const k=questionKey(q);
      if(!k||seen.has(k))return false;
      seen.add(k);
      out.push(q);
      return true;
    };
    arr.forEach(add);

    let guard=0;
    while(out.length<required&&guard++<80){
      const more=generateMore();
      if(!Array.isArray(more)||!more.length)continue;
      more.forEach(add);
    }
    setQuestionArray(out);
    return out;
  }

  function prepareUnseenQuestion(index){
    let arr=getQuestionArray();
    if(!arr)arr=[];

    const keyAt=i=>i>=0&&i<arr.length?questionKey(arr[i]):'';
    const currentKey=keyAt(index);
    if(currentKey&&!usedQuestionKeys.has(currentKey))return true;

    for(let i=index+1;i<arr.length;i++){
      const k=keyAt(i);
      if(k&&!usedQuestionKeys.has(k)){
        const tmp=arr[index];
        arr[index]=arr[i];
        arr[i]=tmp;
        setQuestionArray(arr);
        return true;
      }
    }

    let guard=0;
    while(guard++<100){
      const more=generateMore();
      if(!Array.isArray(more)||!more.length)continue;
      for(const q of more){
        const k=questionKey(q);
        if(!k||usedQuestionKeys.has(k))continue;
        arr[index]=q;
        setQuestionArray(arr);
        return true;
      }
    }
    return false;
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
      resetUsedQuestions();
      setTotal(m);
      const out=old.apply(this,arguments);
      ensureUniqueRoundQuestions(Number(m)===2?TWO_PLAYER_TOTAL:ONE_PLAYER_TOTAL);
      if(Number(m)===2){
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
      markCurrentQuestion();
      try{
        if(mode===2){
          const r=document.getElementById('round');if(r)r.textContent=`Round ${duelRound} • First to ${target()}`;
          const b=document.getElementById('bar')||document.getElementById('prog');if(b)b.style.width=`${Math.min(100,(Math.max(scores[0],scores[1])/target())*100)}%`;
        }
      }catch(e){}
      return out;
    };

    window.restart=function(){
      clearTimeout(finishTimer);finishTimer=null;finishing=false;duelRound=1;resetUsedQuestions();
      return oldRestart.apply(this,arguments);
    };

    if(typeof oldHome==='function')window.goHome=function(){clearTimeout(finishTimer);finishTimer=null;finishing=false;resetUsedQuestions();return oldHome.apply(this,arguments)};

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
          if(!prepareUnseenQuestion(round)){
            console.warn('Sports Fiesta could not generate another unique question.');
            oldFinish();return;
          }
          window.renderQuestion();return;
        }
        const w=winner();if(w>=0){endRace(w,0);return}
        duelRound++;
        round++;
        if(!prepareUnseenQuestion(round)){
          console.warn('Sports Fiesta could not generate another unique question.');
          return;
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
/* SF_NO_REPEAT_EMBED_END */
