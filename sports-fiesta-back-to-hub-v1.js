(()=>{
  if(window.__sportsFiestaBackToHubV2)return;
  window.__sportsFiestaBackToHubV2=true;

  const HUB='https://limkimsze-maker.github.io/P3-Length-Mass-and-Volume-Sports-Fiesta-/';

  function goHome(e){
    if(e){
      e.preventDefault?.();
      e.stopPropagation?.();
    }
    try{
      if(window.top && window.top!==window){
        window.top.location.href=HUB;
        return false;
      }
    }catch(_){}
    window.location.href=HUB;
    return false;
  }
  window.goSportsFiestaHome=goHome;

  function installHeaderLink(){
    const header=document.querySelector('header');
    if(!header)return;
    let link=header.querySelector('.sfBackToHub');
    if(!link){
      link=document.createElement('a');
      link.className='sfBackToHub';
      link.setAttribute('aria-label','Back to Sports Fiesta Practice Hub');
      link.title='Back to Sports Fiesta Practice Hub';
      link.textContent='← Fiesta Hub';
      header.insertBefore(link,header.firstChild);
    }
    link.href=HUB;
    link.target='_top';
    link.onclick=goHome;

    if(!document.getElementById('sfBackToHubStyle')){
      const st=document.createElement('style');
      st.id='sfBackToHubStyle';
      st.textContent=`
        header{display:grid!important;grid-template-columns:auto minmax(0,1fr) auto!important;align-items:center!important;column-gap:10px!important}
        header h1{min-width:0!important;margin:0!important}
        .sfBackToHub{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:8px 11px;border-radius:12px;background:#fff;color:#07558e!important;text-decoration:none!important;font-weight:900;font-size:13px;line-height:1;white-space:nowrap;box-shadow:0 3px 0 #0002;border:2px solid #ffffffcc;touch-action:manipulation}
        .sfBackToHub:hover{background:#eef8ff}.sfBackToHub:active{transform:translateY(2px);box-shadow:0 1px 0 #0002}
        #sfResultBackHome{display:block!important;min-width:180px!important;margin:12px auto 4px!important;padding:12px 20px!important;border:0!important;border-radius:14px!important;background:#1769aa!important;color:#fff!important;font:900 18px/1.1 "Trebuchet MS",Arial,sans-serif!important;box-shadow:0 5px 0 #0b4778!important;cursor:pointer!important;visibility:visible!important;opacity:1!important}
        #sfResultBackHome:active{transform:translateY(3px)!important;box-shadow:0 2px 0 #0b4778!important}
        @media(max-width:700px){header{column-gap:6px!important}.sfBackToHub{min-height:32px;padding:6px 8px;font-size:11px;border-radius:10px}header .sub,header small{display:none!important}#sfResultBackHome{min-width:160px!important;padding:10px 16px!important;font-size:16px!important}}
        @media(max-width:410px){.sfBackToHub{font-size:10px;padding:5px 7px}header h1{font-size:18px!important}}
      `;
      document.head.appendChild(st);
    }
  }

  function ensureResultHome(){
    const results=document.getElementById('results');
    if(!results)return;
    const active=results.classList.contains('active') && getComputedStyle(results).display!=='none';
    if(!active)return;

    let btn=document.getElementById('sfResultBackHome');
    if(!btn){
      btn=document.createElement('button');
      btn.id='sfResultBackHome';
      btn.type='button';
      btn.textContent='← Back to Home';
      btn.setAttribute('aria-label','Back to Sports Fiesta home');
      const box=results.querySelector('.results')||results;
      box.appendChild(btn);
    }
    btn.onclick=goHome;
  }

  function wireCeremonyFrame(frame){
    if(!frame || frame.dataset.sfHomeWired==='1')return;
    frame.dataset.sfHomeWired='1';
    const wire=()=>{
      try{
        const w=frame.contentWindow;
        const d=w?.document;
        if(!w||!d)return;

        /* The ceremony's historical Back to Home button calls this name. Make
           that call escape every nested iframe and return the whole programme. */
        w.goSportsFiestaHome=goHome;

        const candidates=[...d.querySelectorAll('button,a')].filter(el=>
          /back\s+to\s+home|fiesta\s+hub/i.test((el.textContent||'').trim()) ||
          /goSportsFiestaHome/.test(el.getAttribute('onclick')||'')
        );
        candidates.forEach(el=>{
          if(el.tagName==='A'){
            el.setAttribute('href',HUB);
            el.setAttribute('target','_top');
          }
          el.onclick=goHome;
        });

        /* Some older ceremony builds have no home button at all. Add one without
           replacing the original animation or close control. */
        const ceremony=d.getElementById('medalCeremony');
        const card=ceremony?.querySelector('.mc-card');
        if(card && !d.getElementById('sfCeremonyBackHome')){
          const btn=d.createElement('button');
          btn.id='sfCeremonyBackHome';
          btn.type='button';
          btn.textContent='← Back to Home';
          btn.onclick=goHome;
          btn.style.cssText='position:absolute;left:50%;bottom:18px;transform:translateX(-50%);z-index:50;min-width:170px;padding:10px 18px;border:2px solid #fff;border-radius:14px;background:#1769aa;color:#fff;font:900 16px/1.1 Trebuchet MS,Arial,sans-serif;box-shadow:0 4px 0 #0b4778;cursor:pointer;';
          card.appendChild(btn);
        }
      }catch(_){}
    };
    frame.addEventListener('load',()=>{
      setTimeout(wire,0);
      setTimeout(wire,350);
      setTimeout(wire,1000);
    });
    try{wire();}catch(_){}
  }

  function scan(){
    installHeaderLink();
    ensureResultHome();
    document.querySelectorAll('iframe[title="Sports Fiesta medal ceremony"],iframe[title="Sports Fiesta 1-player medal ceremony"]').forEach(wireCeremonyFrame);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});
  else scan();

  new MutationObserver(scan).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
  window.addEventListener('focus',scan);
})();
