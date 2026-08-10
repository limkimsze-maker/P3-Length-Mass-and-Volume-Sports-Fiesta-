(() => {
  const script=document.currentScript;
  const PRACTICE_ID=Number(script?.dataset?.practice||0);
  const SPORT=script?.dataset?.sport||`Practice ${PRACTICE_ID}`;
  if(!PRACTICE_ID||window.__sportsFiestaMedalHookV3)return;
  window.__sportsFiestaMedalHookV3=true;
  const HUB_KEY='sportsFiestaHubProgress_v1';
  const HUB_URL='https://limkimsze-maker.github.io/P3-Length-Mass-and-Volume-Sports-Fiesta-/';
  let shown=false,timer=null;

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
    frame.src=HUB_URL+'?ceremonyBridge=3&t='+Date.now();
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
