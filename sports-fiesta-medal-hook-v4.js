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

  function visible(el){if(!el)return false;const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0}
  function resultElement(){const list=[...document.querySelectorAll('#results,.results,[id*="result" i],[class*="result" i],.screen.active')];return list.find(el=>visible(el)&&/score|scored|winner|wins|won|champion|complete|finished|great job|results|tie|draw/i.test(el.innerText||''))||null}
  function readMode(text){try{if(typeof mode!=='undefined'){if(mode===2||mode==='2'||String(mode).toLowerCase().includes('2'))return 2;if(mode===1||mode==='1'||String(mode).toLowerCase().includes('1'))return 1}}catch(e){}try{if(typeof gameMode!=='undefined'){if(String(gameMode).toLowerCase().includes('2'))return 2;if(String(gameMode).toLowerCase().includes('1'))return 1}}catch(e){}return /player\s*2|\bp2\b/i.test(text)?2:1}
  function stateScores(){let a=null,b=null,total=null;try{if(typeof scores!=='undefined'&&Array.isArray(scores)){a=Number(scores[0]);b=Number(scores[1])}}catch(e){}try{if(typeof score1!=='undefined')a=Number(score1)}catch(e){}try{if(typeof score2!=='undefined')b=Number(score2)}catch(e){}try{if(typeof p1Score!=='undefined')a=Number(p1Score)}catch(e){}try{if(typeof p2Score!=='undefined')b=Number(p2Score)}catch(e){}try{if(typeof TOTAL!=='undefined')total=Number(TOTAL)}catch(e){}try{if(typeof totalQuestions!=='undefined')total=Number(totalQuestions)}catch(e){}return{a:Number.isFinite(a)?a:null,b:Number.isFinite(b)?b:null,total:Number.isFinite(total)?total:null}}
  function domScore(sel){const el=document.querySelector(sel);if(!el)return null;const n=(el.textContent.match(/\d+/g)||[]).map(Number);return n.length?n[n.length-1]:null}
  function outcome(text,gm){const s=stateScores();let p1=s.a,p2=s.b,total=s.total;if(p1==null)p1=domScore('.score.p1,.p1.score,#score1,#p1Score');if(p2==null)p2=domScore('.score.p2,.p2.score,#score2,#p2Score');const f=[...text.matchAll(/(\d+)\s*\/\s*(\d+)/g)].map(m=>[+m[1],+m[2]]).filter(x=>x[1]>=5);if(f.length){p1=f[0][0];total=f[0][1]}const out=text.match(/(\d+)\s+out\s+of\s+(\d+)/i);if(out){p1=+out[1];total=+out[2]}let winner='p1';if(gm===2){if(/tie|draw|same score/i.test(text))winner='tie';else if(/player\s*2[^.!]{0,35}(wins|won|winner)|\bp2[^.!]{0,25}(wins|won|winner)/i.test(text))winner='p2';else if(/player\s*1[^.!]{0,35}(wins|won|winner)|\bp1[^.!]{0,25}(wins|won|winner)/i.test(text))winner='p1';else if(p1!=null&&p2!=null)winner=p1===p2?'tie':(p1>p2?'p1':'p2');else winner='tie'}return{winner,perfect:gm===1&&p1!=null&&total!=null&&total>0&&p1===total,p1,p2,total}}
  function update(perfect,winner){let data={};try{data=JSON.parse(localStorage.getItem(HUB_KEY)||'{}')||{}}catch(e){}const old=data[PRACTICE_ID]||{};data[PRACTICE_ID]={...old,completed:true,perfectSingle:!!old.perfectSingle||!!perfect,updatedAt:new Date().toISOString(),lastWinner:winner};localStorage.setItem(HUB_KEY,JSON.stringify(data));let completed=0,perfectCount=0;for(let i=1;i<=11;i++){const x=data[i]||{};if(x.completed)completed++;if(x.perfectSingle)perfectCount++}return{completed,perfectCount}}

  function ceremony(gm,o,p){
    const full=o.perfect&&p.perfectCount===11;
    const winner=gm===1?'p1':o.winner;
    const kind=full?'gold':'piece';
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
        const sub=d.getElementById('mcSub'),msg=d.getElementById('mcMessage');
        if(!full&&sub)sub.textContent=`Practice ${PRACTICE_ID}: ${SPORT} completed!`;
        if(!full&&msg){if(gm===1)msg.textContent=`Player 1 receives 1/11 of the medal! ${p.completed}/11 practices complete.`;else if(winner==='p2')msg.textContent='Player 2 wins and receives 1/11 of the medal!';else if(winner==='tie')msg.textContent="It's a tie! Both players share the medal celebration!";else msg.textContent='Player 1 wins and receives 1/11 of the medal!'}
        const close=d.querySelector('#medalCeremony .mc-close');if(close)close.addEventListener('click',()=>setTimeout(()=>frame.remove(),0),{once:true});
        d.addEventListener('keydown',e=>{if(e.key==='Escape')setTimeout(()=>frame.remove(),0)},{once:true});
      }catch(e){frame.remove();}
    };
  }
  function check(){clearTimeout(timer);timer=setTimeout(()=>{const res=resultElement();if(!res){shown=false;return}if(shown)return;const text=(res.innerText||'').replace(/\s+/g,' ').trim();if(text.length<20)return;const gm=readMode(text),o=outcome(text,gm),p=update(o.perfect,o.winner);shown=true;setTimeout(()=>ceremony(gm,o,p),350)},120)}
  new MutationObserver(check).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style'],characterData:true});window.addEventListener('load',check);check();
})();
