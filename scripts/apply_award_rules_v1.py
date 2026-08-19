from pathlib import Path

hook = Path('sports-fiesta-medal-hook-v4.js')
s = hook.read_text(encoding='utf-8')

start = s.index('  function update(gm,perfect,winner){')
mid = s.index('  function ceremony(gm,o,p){', start)
end = s.index('  function check(){', mid)
obs = s.index('  new MutationObserver', end)

update_block = r'''  function update(gm,perfect,winner){
    let data={};try{data=JSON.parse(localStorage.getItem(HUB_KEY)||'{}')||{}}catch(e){}
    const old=data[PRACTICE_ID]||{};
    const oldWinner=old.lastWinner;
    const oldWinnerQualified=Number(old.lastMode)===2&&(oldWinner==='p1'||oldWinner==='p2'||Number(oldWinner)===1||Number(oldWinner)===2);
    const priorQualified=old.awardRules==='v1'?!!old.pieceEarned:(!!old.perfectSingle||oldWinnerQualified);
    const winnerNum=winner==='p1'?1:winner==='p2'?2:0;
    const qualifies=gm===1?!!perfect:winnerNum>0;
    const pieceEarned=priorQualified||qualifies;
    const perfectSingle=!!old.perfectSingle||(gm===1&&!!perfect);
    data[PRACTICE_ID]={
      ...old,completed:true,pieceEarned,awardQualified:pieceEarned,perfectSingle,
      verified:true,source:'game-v5',awardRules:'v1',updatedAt:new Date().toISOString(),
      lastMode:gm,lastWinner:gm===2?winnerNum:(old.lastWinner??0),
      lastAwardWinner:qualifies?(gm===1?1:winnerNum):(old.lastAwardWinner??0)
    };
    localStorage.setItem(HUB_KEY,JSON.stringify(data));
    let completed=0,perfectCount=0,pieces=0;
    for(let i=1;i<=11;i++){
      const x=data[i]||{};
      const verified=x.completed===true&&x.verified===true&&x.source==='game-v5';
      if(verified)completed++;
      if(verified&&x.perfectSingle===true)perfectCount++;
      if(verified&&x.pieceEarned===true)pieces++;
    }
    return{completed,perfectCount,pieces,qualifies};
  }

'''

ceremony_block = r'''  function ceremony(gm,o,p){
    const winner=gm===1?'p1':o.winner;
    const fullGold=gm===1&&o.perfect&&p.perfectCount===11;
    const frame=document.createElement('iframe');
    frame.title='Sports Fiesta medal ceremony';
    frame.src=HUB_URL+'?ceremonyBridge=award-v1&t='+Date.now();
    Object.assign(frame.style,{position:'fixed',inset:'0',width:'100%',height:'100%',border:'0',zIndex:'2147483647',background:'#185b9d'});
    document.body.appendChild(frame);
    frame.onload=()=>{
      try{
        const w=frame.contentWindow,d=w.document;
        d.body.classList.remove('cover-on');
        const cover=d.getElementById('fiestaCover');if(cover)cover.style.display='none';
        const app=d.querySelector('.app');if(app)app.style.setProperty('display','none','important');
        d.body.style.padding='0';d.body.style.overflow='hidden';
        let stage='piece';
        const showPiece=()=>{
          w.showMedalCeremony(false,winner,'piece');
          const sub=d.getElementById('mcSub'),msg=d.getElementById('mcMessage');
          if(sub)sub.textContent=`Practice ${PRACTICE_ID} of 11 • ${SPORT}`;
          if(msg)msg.textContent=gm===1?'Player 1 earns 1/11 of the medal for a perfect score!':`${winner==='p2'?'Player 2':'Player 1'} earns 1/11 of the medal for winning!`;
        };
        const showGold=()=>{
          stage='gold';
          w.showMedalCeremony(false,'p1','gold');
          const sub=d.getElementById('mcSub'),msg=d.getElementById('mcMessage');
          if(sub)sub.textContent='All 11 lessons completed perfectly by Player 1!';
          if(msg)msg.textContent='🏆 Player 1 receives the Sports Fiesta GOLD MEDAL! 🏆';
        };
        showPiece();
        const close=d.querySelector('#medalCeremony .mc-close');
        if(close)close.addEventListener('click',()=>{
          if(fullGold&&stage==='piece')setTimeout(showGold,90);else setTimeout(()=>frame.remove(),0);
        });
        d.addEventListener('keydown',e=>{
          if(e.key!=='Escape')return;
          if(fullGold&&stage==='piece')setTimeout(showGold,90);else setTimeout(()=>frame.remove(),0);
        });
      }catch(e){frame.remove();}
    };
  }
'''

check_block = r'''  function check(){
    clearTimeout(timer);timer=setTimeout(()=>{
      const res=resultElement();if(!res){shown=false;return}if(shown)return;
      const text=(res.innerText||'').replace(/\s+/g,' ').trim();if(text.length<20)return;
      const gm=readMode(text),o=outcome(text,gm);if(gm===2&&!twoPlayerFinalRound(res,text,o))return;
      const p=update(gm,o.perfect,o.winner);shown=true;
      if(!p.qualifies)return;
      setTimeout(()=>ceremony(gm,o,p),350);
    },120)
  }
'''

s = s[:start] + update_block + ceremony_block + check_block + s[obs:]
hook.write_text(s,encoding='utf-8')

index = Path('index.html')
h = index.read_text(encoding='utf-8')
tag = '<script src="sports-fiesta-award-ui-v2.js?v=20260819a"></script>'
if tag not in h:
    h = h.replace('</body>', tag+'\n</body>', 1)
index.write_text(h,encoding='utf-8')
