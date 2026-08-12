(()=>{
  if(window.__sportsFiestaNextGuardV1)return;
  window.__sportsFiestaNextGuardV1=true;
  const script=document.currentScript;
  const practice=Number(script?.dataset?.practice||0);

  function visible(btn){
    if(!btn)return false;
    if(btn.classList.contains('hidden'))return false;
    const s=getComputedStyle(btn);
    return s.display!=='none'&&s.visibility!=='hidden';
  }

  function findButton(){
    return document.getElementById('nextBtn') ||
           document.getElementById('next') ||
           [...document.querySelectorAll('button')].find(b=>/\bnext\b/i.test(b.textContent||'')||/next/i.test(b.getAttribute('onclick')||'')) || null;
  }

  function parseFunctionName(btn){
    const inline=btn?.getAttribute('onclick')||'';
    const m=inline.match(/\b([A-Za-z_$][\w$]*)\s*\(/);
    if(m)return m[1];
    for(const name of ['nextQuestion','nextTurn','nextQ','nextRound']){
      if(typeof window[name]==='function')return name;
    }
    return '';
  }

  function install(){
    // Practice 4 has a stronger local direct-state fix loaded after all shared scripts.
    if(practice===4 && window.__practice4NextFixV1)return;

    const btn=findButton();
    if(!btn)return;
    if(btn.dataset.sfNextGuard==='1')return;
    btn.dataset.sfNextGuard='1';

    const fnName=parseFunctionName(btn);
    const originalInline=btn.getAttribute('onclick')||'';
    if(originalInline)btn.removeAttribute('onclick');
    btn.disabled=false;
    btn.removeAttribute('disabled');

    const observer=new MutationObserver(()=>{
      if(visible(btn) && btn.disabled){
        btn.disabled=false;
        btn.removeAttribute('disabled');
      }
    });
    observer.observe(btn,{attributes:true,attributeFilter:['class','style','disabled']});

    btn.addEventListener('click',function(ev){
      if(!visible(btn))return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      if(btn.dataset.sfAdvancing==='1')return;
      btn.dataset.sfAdvancing='1';
      try{
        const fn=fnName && window[fnName];
        if(typeof fn==='function'){
          fn.call(window);
        }else if(originalInline){
          (0,eval)(originalInline);
        }else{
          throw new Error('No Next function found');
        }
      }catch(err){
        console.error(`Sports Fiesta Practice ${practice||'?'} Next error`,err);
      }finally{
        setTimeout(()=>{delete btn.dataset.sfAdvancing},120);
      }
    },true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
