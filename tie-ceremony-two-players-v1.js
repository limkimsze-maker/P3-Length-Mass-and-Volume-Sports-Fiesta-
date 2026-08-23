(() => {
  if (window.__sfTieDirectV6) return;
  window.__sfTieDirectV6 = true;

  const style = document.createElement('style');
  style.id = 'sf-tie-two-players-v6';
  style.textContent = `
    #medalCeremony .mc-card.tie{overflow:hidden!important}
    #medalCeremony .mc-card.tie .mc-side{opacity:.12!important}
    #medalCeremony .mc-card.tie .mc-previewTag{display:none!important}
    #medalCeremony .mc-card.tie .mc-face{display:none!important}
    #medalCeremony .mc-card.tie .mc-podium::before{content:"1st"!important;font-size:clamp(48px,7vw,72px)!important;line-height:1.6!important}

    #medalCeremony .mc-card.tie .mc-banner{font-size:clamp(16px,2.2vw,22px)!important;letter-spacing:.08em!important}
    #medalCeremony .mc-card.tie #mcSub{
      position:absolute!important;left:50%!important;top:64px!important;transform:translateX(-50%)!important;
      z-index:18!important;width:94%!important;margin:0!important;color:#10213d!important;text-align:center!important;
      text-shadow:none!important;font-size:clamp(30px,5vw,52px)!important;font-weight:1000!important;line-height:1!important
    }
    #medalCeremony .mc-card.tie #mcSub::after{
      content:"JOINT 1ST PLACE";display:block!important;width:max-content!important;max-width:88vw!important;margin:10px auto 0!important;
      padding:7px 18px!important;border-radius:999px!important;background:linear-gradient(180deg,#fff4a8 0%,#f6c843 100%)!important;
      border:3px solid #b47a00!important;box-shadow:0 5px 0 rgba(122,76,0,.18)!important;color:#5b3900!important;
      font-size:clamp(14px,2vw,20px)!important;font-weight:1000!important;letter-spacing:.06em!important
    }

    #medalCeremony .mc-card.tie #mcPlayer,
    #medalCeremony .mc-card.tie #mcPlayer2{
      position:absolute!important;display:block!important;visibility:visible!important;top:auto!important;bottom:116px!important;
      width:min(205px,29%)!important;height:295px!important;object-fit:contain!important;z-index:8!important;
      filter:drop-shadow(0 10px 10px rgba(32,63,88,.24))!important
    }
    #medalCeremony .mc-card.tie #mcPlayer{left:29%!important;transform:translateX(-50%)!important;animation:sfTieDirectLeft .78s cubic-bezier(.22,.9,.3,1.15) both!important}
    #medalCeremony .mc-card.tie #mcPlayer2{left:71%!important;transform:translateX(-50%)!important;animation:sfTieDirectRight .78s .10s cubic-bezier(.22,.9,.3,1.15) both!important}

    #medalCeremony .sf-tie-medal{
      position:absolute!important;bottom:104px!important;z-index:12!important;display:flex!important;align-items:center!important;justify-content:center!important;
      width:62px!important;height:62px!important;border-radius:50%!important;
      background:radial-gradient(circle at 35% 30%,#fff7b2 0 15%,#ffd84d 36%,#e8a500 78%,#b86d00 100%)!important;
      border:4px solid #fff7cf!important;box-shadow:0 7px 14px rgba(91,57,0,.25)!important;color:#5a3500!important;font-size:31px!important;line-height:1!important
    }
    #medalCeremony .sf-tie-medal.p1{left:29%!important;transform:translateX(-50%)!important}
    #medalCeremony .sf-tie-medal.p2{left:71%!important;transform:translateX(-50%)!important}

    #medalCeremony .sf-tie-name{
      position:absolute!important;bottom:54px!important;z-index:13!important;min-width:132px!important;padding:8px 13px!important;border-radius:14px!important;
      background:#10213d!important;border:3px solid #fff!important;box-shadow:0 5px 0 rgba(8,20,42,.22)!important;color:#fff!important;
      text-align:center!important;text-shadow:none!important;font-size:clamp(14px,1.8vw,18px)!important;font-weight:1000!important;letter-spacing:.04em!important
    }
    #medalCeremony .sf-tie-name.p1{left:29%!important;transform:translateX(-50%)!important}
    #medalCeremony .sf-tie-name.p2{left:71%!important;transform:translateX(-50%)!important}

    #medalCeremony .mc-card.tie #mcMessage{
      position:absolute!important;left:50%!important;bottom:8px!important;transform:translateX(-50%)!important;z-index:20!important;
      width:auto!important;max-width:88%!important;box-sizing:border-box!important;margin:0!important;padding:7px 16px!important;border:0!important;
      border-radius:999px!important;background:rgba(255,255,255,.92)!important;color:#17324d!important;text-shadow:none!important;
      box-shadow:0 4px 12px rgba(0,0,0,.12)!important;font-size:clamp(13px,1.7vw,17px)!important;font-weight:900!important;
      line-height:1.2!important;text-align:center!important;white-space:normal!important
    }

    #medalCeremony .sf-tie-fallback{
      position:absolute!important;bottom:155px!important;z-index:9!important;width:118px!important;height:118px!important;border-radius:50%!important;
      display:flex!important;align-items:center!important;justify-content:center!important;background:#fff!important;border:7px solid rgba(255,255,255,.9)!important;
      box-shadow:0 8px 20px rgba(0,0,0,.18)!important;font-size:34px!important;font-weight:1000!important;color:#17324d!important
    }
    #medalCeremony .sf-tie-fallback.p1{left:29%!important;transform:translateX(-50%)!important}
    #medalCeremony .sf-tie-fallback.p2{left:71%!important;transform:translateX(-50%)!important}

    @keyframes sfTieDirectLeft{from{opacity:0;transform:translateX(-50%) translateX(-100px) translateY(55px) scale(.84)}to{opacity:1;transform:translateX(-50%) translateX(0) translateY(0) scale(1)}}
    @keyframes sfTieDirectRight{from{opacity:0;transform:translateX(-50%) translateX(100px) translateY(55px) scale(.84)}to{opacity:1;transform:translateX(-50%) translateX(0) translateY(0) scale(1)}}

    @media(max-width:620px){
      #medalCeremony .mc-card.tie #mcSub{top:58px!important;font-size:clamp(27px,8vw,38px)!important}
      #medalCeremony .mc-card.tie #mcSub::after{margin-top:7px!important;padding:5px 12px!important;font-size:12px!important}
      #medalCeremony .mc-card.tie #mcPlayer,#medalCeremony .mc-card.tie #mcPlayer2{width:min(142px,38vw)!important;height:218px!important;bottom:112px!important}
      #medalCeremony .mc-card.tie #mcPlayer{left:25%!important} #medalCeremony .mc-card.tie #mcPlayer2{left:75%!important}
      #medalCeremony .sf-tie-fallback{width:84px!important;height:84px!important;bottom:150px!important;font-size:25px!important}
      #medalCeremony .sf-tie-fallback.p1{left:25%!important} #medalCeremony .sf-tie-fallback.p2{left:75%!important}
      #medalCeremony .sf-tie-medal{width:50px!important;height:50px!important;bottom:100px!important;font-size:25px!important}
      #medalCeremony .sf-tie-medal.p1{left:25%!important} #medalCeremony .sf-tie-medal.p2{left:75%!important}
      #medalCeremony .sf-tie-name{bottom:53px!important;min-width:94px!important;padding:6px 8px!important;font-size:12px!important;border-width:2px!important}
      #medalCeremony .sf-tie-name.p1{left:25%!important} #medalCeremony .sf-tie-name.p2{left:75%!important}
      #medalCeremony .mc-card.tie #mcMessage{bottom:7px!important;max-width:94%!important;padding:6px 12px!important;font-size:12px!important}
    }
  `;
  document.head.appendChild(style);

  function validSrc(x){return typeof x === 'string' && x.trim() && !x.endsWith('/') && x !== location.href}

  function playerSources(){
    let p1='',p2='';
    try{
      if(typeof window.imgs==='function'){
        const a=window.imgs();
        if(Array.isArray(a)){p1=a[0]||'';p2=a[1]||''}
      }
    }catch(_){}
    const cards=[...document.querySelectorAll('.playerImgWrap img.playerSvg')];
    p1=p1||document.getElementById('fcP1')?.src||cards[0]?.src||'';
    p2=p2||document.getElementById('fcP2')?.src||cards[1]?.src||'';
    return {p1:validSrc(p1)?p1:'',p2:validSrc(p2)?p2:''};
  }

  function ensurePlayers(stage){
    try{if(typeof window.preparePlayers==='function')window.preparePlayers('tie')}catch(_){}
    let p1=document.getElementById('mcPlayer');
    if(!p1){p1=document.createElement('img');p1.id='mcPlayer';p1.alt='Player 1 — joint 1st place';stage.appendChild(p1)}
    let p2=document.getElementById('mcPlayer2');
    if(!p2){p2=p1.cloneNode(false);p2.id='mcPlayer2';p2.alt='Player 2 — joint 1st place';stage.appendChild(p2)}
    return {p1,p2};
  }

  function ensureTieDecor(stage){
    const make=(cls,text,aria)=>{
      let el=stage.querySelector(`.${cls.replace(/ /g,'.')}`);
      if(!el){el=document.createElement('div');el.className=cls;el.textContent=text;if(aria)el.setAttribute('aria-label',aria);stage.appendChild(el)}
      return el;
    };
    make('sf-tie-medal p1','🥇','Gold medal for Player 1');
    make('sf-tie-medal p2','🥇','Gold medal for Player 2');
    make('sf-tie-name p1','PLAYER 1 · 1ST','Player 1, joint first place');
    make('sf-tie-name p2','PLAYER 2 · 1ST','Player 2, joint first place');
  }

  function fallbackBadge(stage,who){
    let badge=stage.querySelector(`.sf-tie-fallback.${who}`);
    if(!badge){badge=document.createElement('div');badge.className=`sf-tie-fallback ${who}`;badge.textContent=who==='p1'?'P1':'P2';badge.setAttribute('aria-label',who==='p1'?'Player 1':'Player 2');stage.appendChild(badge)}
    return badge;
  }

  function setPlayerImage(img,src,stage,who){
    if(validSrc(src)){
      img.src=src;img.style.setProperty('display','block','important');img.style.setProperty('visibility','visible','important');
      stage.querySelector(`.sf-tie-fallback.${who}`)?.remove();return true;
    }
    img.style.setProperty('display','none','important');fallbackBadge(stage,who);return false;
  }

  function renderTieDirect(){
    const ceremony=document.getElementById('medalCeremony');
    const card=ceremony?.querySelector('.mc-card');
    const stage=ceremony?.querySelector('.mc-stage');
    const sub=document.getElementById('mcSub');
    const msg=document.getElementById('mcMessage');
    const banner=ceremony?.querySelector('.mc-banner');
    if(!ceremony||!card||!stage)return false;

    try{if(typeof clearCT==='function')clearCT()}catch(_){}
    ceremony.querySelectorAll('.mc-piece').forEach(x=>x.remove());
    stage.querySelectorAll('.sf-tie-fallback,.sf-tie-medal,.sf-tie-name').forEach(x=>x.remove());
    card.classList.remove('award','celebrate','preview','gold');
    card.classList.add('piece','tie');

    if(banner)banner.textContent='🏅 SHARED VICTORY 🏅';
    if(sub)sub.textContent='IT’S A TIE!';
    if(msg)msg.textContent='Both players earn a Gold medal.';
    ceremony.classList.add('show');
    ceremony.setAttribute('aria-hidden','false');

    const {p1,p2}=ensurePlayers(stage);
    p1.alt='Player 1 — joint 1st place';
    p2.alt='Player 2 — joint 1st place';
    ensureTieDecor(stage);

    const load=()=>{
      const src=playerSources();
      const ok1=setPlayerImage(p1,validSrc(p1.src)?p1.src:src.p1,stage,'p1');
      const ok2=setPlayerImage(p2,validSrc(p2.src)?p2.src:src.p2,stage,'p2');
      return ok1&&ok2;
    };
    if(!load()){
      let tries=0;
      const wait=setInterval(()=>{if(load()||++tries>=30)clearInterval(wait)},100);
    }

    p1.style.animation='none';p2.style.animation='none';void p1.offsetWidth;p1.style.removeProperty('animation');p2.style.removeProperty('animation');
    try{if(typeof pieceSound==='function')pieceSound()}catch(_){}
    try{if(typeof burst==='function')burst(80);else if(typeof confetti==='function')confetti(80)}catch(_){}
    setTimeout(()=>card.classList.add('award'),420);
    setTimeout(()=>card.classList.add('celebrate'),1050);
    return true;
  }

  function install(){
    const base=window.showMedalCeremony;
    if(typeof base!=='function')return false;
    if(base.__sfTieDirectV6)return true;
    const wrapped=function(preview=false,winner='p1',kind='gold'){
      if(winner==='tie'&&kind==='piece')return renderTieDirect();
      return base.apply(this,arguments);
    };
    wrapped.__sfTieDirectV6=true;
    window.showMedalCeremony=wrapped;
    return true;
  }

  install();
  let tries=0;
  const timer=setInterval(()=>{install();if(++tries>40)clearInterval(timer)},100);
})();
