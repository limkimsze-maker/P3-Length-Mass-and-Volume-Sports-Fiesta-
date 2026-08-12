(()=>{
  if(window.__sportsFiestaBackToHubV1)return;
  window.__sportsFiestaBackToHubV1=true;
  const HUB='https://limkimsze-maker.github.io/P3-Length-Mass-and-Volume-Sports-Fiesta-/';
  function install(){
    const header=document.querySelector('header');
    if(!header||header.querySelector('.sfBackToHub'))return;
    const link=document.createElement('a');
    link.className='sfBackToHub';
    link.href=HUB;
    link.setAttribute('aria-label','Back to Sports Fiesta Practice Hub');
    link.title='Back to Sports Fiesta Practice Hub';
    link.textContent='← Fiesta Hub';
    header.insertBefore(link,header.firstChild);
    const st=document.createElement('style');
    st.id='sfBackToHubStyle';
    st.textContent=`
      header{display:grid!important;grid-template-columns:auto minmax(0,1fr) auto!important;align-items:center!important;column-gap:10px!important}
      header h1{min-width:0!important;margin:0!important}
      .sfBackToHub{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:8px 11px;border-radius:12px;background:#fff;color:#07558e!important;text-decoration:none!important;font-weight:900;font-size:13px;line-height:1;white-space:nowrap;box-shadow:0 3px 0 #0002;border:2px solid #ffffffcc;touch-action:manipulation}
      .sfBackToHub:hover{background:#eef8ff}.sfBackToHub:active{transform:translateY(2px);box-shadow:0 1px 0 #0002}
      @media(max-width:700px){header{column-gap:6px!important}.sfBackToHub{min-height:32px;padding:6px 8px;font-size:11px;border-radius:10px}header .sub{display:none!important}}
      @media(max-width:410px){.sfBackToHub{font-size:10px;padding:5px 7px}header h1{font-size:18px!important}}
    `;
    document.head.appendChild(st);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
