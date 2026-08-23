(() => {
  if (window.__sfTieDirectV5) return;
  window.__sfTieDirectV5 = true;

  const style = document.createElement('style');
  style.id = 'sf-tie-two-players-v5';
  style.textContent = `
    #medalCeremony .mc-card.tie .mc-side{opacity:.35!important}
    #medalCeremony .mc-card.tie .mc-podium::before{content:"1st"!important;font-size:64px!important;line-height:1.7!important}
    #medalCeremony .mc-card.tie #mcPlayer,
    #medalCeremony .mc-card.tie #mcPlayer2{
      position:absolute!important;
      display:block!important;
      visibility:visible!important;
      top:auto!important;
      bottom:118px!important;
      width:min(190px,28%)!important;
      height:300px!important;
      object-fit:contain!important;
      z-index:5!important;
      filter:drop-shadow(0 10px 10px rgba(32,63,88,.24))!important;
    }
    #medalCeremony .mc-card.tie #mcPlayer{
      left:31%!important;
      transform:translateX(-50%)!important;
      animation:sfTieDirectLeft .78s cubic-bezier(.22,.9,.3,1.15) both!important;
    }
    #medalCeremony .mc-card.tie #mcPlayer2{
      left:69%!important;
      transform:translateX(-50%)!important;
      animation:sfTieDirectRight .78s .10s cubic-bezier(.22,.9,.3,1.15) both!important;
    }
    #medalCeremony .mc-card.tie #mcMessage{
      position:absolute!important;
      left:50%!important;
      bottom:10px!important;
      transform:translateX(-50%)!important;
      z-index:20!important;
      width:min(760px,88%)!important;
      max-width:760px!important;
      box-sizing:border-box!important;
      padding:12px 18px!important;
      border:2px solid rgba(0,0,0,.10)!important;
      border-radius:18px!important;
      background:#fff!important;
      color:#111!important;
      text-shadow:none!important;
      box-shadow:0 7px 20px rgba(0,0,0,.18)!important;
      font-size:clamp(16px,2.1vw,21px)!important;
      font-weight:900!important;
      line-height:1.35!important;
      text-align:center!important;
    }
    #medalCeremony .mc-card.tie .mc-previewTag{display:none!important}
    #medalCeremony .sf-tie-fallback{
      position:absolute!important;
      bottom:150px!important;
      z-index:6!important;
      width:116px!important;
      height:116px!important;
      border-radius:50%!important;
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
      background:#fff!important;
      border:7px solid rgba(255,255,255,.85)!important;
      box-shadow:0 8px 20px rgba(0,0,0,.18)!important;
      font-size:34px!important;
      font-weight:1000!important;
      color:#17324d!important;
    }
    #medalCeremony .sf-tie-fallback.p1{left:31%!important;transform:translateX(-50%)!important}
    #medalCeremony .sf-tie-fallback.p2{left:69%!important;transform:translateX(-50%)!important}
    @keyframes sfTieDirectLeft{
      from{opacity:0;transform:translateX(-50%) translateX(-110px) translateY(70px) scale(.80)}
      to{opacity:1;transform:translateX(-50%) translateX(0) translateY(0) scale(1)}
    }
    @keyframes sfTieDirectRight{
      from{opacity:0;transform:translateX(-50%) translateX(110px) translateY(70px) scale(.80)}
      to{opacity:1;transform:translateX(-50%) translateX(0) translateY(0) scale(1)}
    }
    @media(max-width:620px){
      #medalCeremony .mc-card.tie #mcPlayer,
      #medalCeremony .mc-card.tie #mcPlayer2{width:min(145px,38vw)!important;height:230px!important;bottom:108px!important}
      #medalCeremony .mc-card.tie #mcPlayer{left:27%!important}
      #medalCeremony .mc-card.tie #mcPlayer2{left:73%!important}
      #medalCeremony .mc-card.tie #mcMessage{width:92%!important;padding:9px 11px!important;font-size:14px!important}
      #medalCeremony .sf-tie-fallback{width:88px!important;height:88px!important;bottom:140px!important;font-size:27px!important}
      #medalCeremony .sf-tie-fallback.p1{left:27%!important}
      #medalCeremony .sf-tie-fallback.p2{left:73%!important}
    }
  `;
  document.head.appendChild(style);

  function validSrc(x){
    return typeof x === 'string' && x.trim() && !x.endsWith('/') && x !== location.href;
  }

  function playerSources(){
    let p1 = '', p2 = '';
    try {
      if (typeof window.imgs === 'function') {
        const a = window.imgs();
        if (Array.isArray(a)) {
          p1 = a[0] || '';
          p2 = a[1] || '';
        }
      }
    } catch (_) {}

    const cards = [...document.querySelectorAll('.playerImgWrap img.playerSvg')];
    p1 = p1 || document.getElementById('fcP1')?.src || cards[0]?.src || '';
    p2 = p2 || document.getElementById('fcP2')?.src || cards[1]?.src || '';
    return {p1: validSrc(p1) ? p1 : '', p2: validSrc(p2) ? p2 : ''};
  }

  function ensurePlayers(stage){
    try {
      if (typeof window.preparePlayers === 'function') window.preparePlayers('tie');
    } catch (_) {}

    let p1 = document.getElementById('mcPlayer');
    if (!p1) {
      p1 = document.createElement('img');
      p1.id = 'mcPlayer';
      p1.alt = 'Player 1 — joint 1st place';
      stage.appendChild(p1);
    }

    let p2 = document.getElementById('mcPlayer2');
    if (!p2) {
      p2 = p1.cloneNode(false);
      p2.id = 'mcPlayer2';
      p2.alt = 'Player 2 — joint 1st place';
      stage.appendChild(p2);
    }
    return {p1, p2};
  }

  function fallbackBadge(stage, who){
    let badge = stage.querySelector(`.sf-tie-fallback.${who}`);
    if (!badge) {
      badge = document.createElement('div');
      badge.className = `sf-tie-fallback ${who}`;
      badge.textContent = who === 'p1' ? 'P1' : 'P2';
      badge.setAttribute('aria-label', who === 'p1' ? 'Player 1' : 'Player 2');
      stage.appendChild(badge);
    }
    return badge;
  }

  function setPlayerImage(img, src, stage, who){
    if (validSrc(src)) {
      img.src = src;
      img.style.setProperty('display','block','important');
      img.style.setProperty('visibility','visible','important');
      stage.querySelector(`.sf-tie-fallback.${who}`)?.remove();
      return true;
    }
    img.style.setProperty('display','none','important');
    fallbackBadge(stage, who);
    return false;
  }

  function renderTieDirect(){
    const ceremony = document.getElementById('medalCeremony');
    const card = ceremony?.querySelector('.mc-card');
    const stage = ceremony?.querySelector('.mc-stage');
    const sub = document.getElementById('mcSub');
    const msg = document.getElementById('mcMessage');
    const banner = ceremony?.querySelector('.mc-banner');
    if (!ceremony || !card || !stage) return false;

    try { if (typeof clearCT === 'function') clearCT(); } catch (_) {}
    ceremony.querySelectorAll('.mc-piece').forEach(x => x.remove());
    stage.querySelectorAll('.sf-tie-fallback').forEach(x => x.remove());
    card.classList.remove('award','celebrate','preview','gold');
    card.classList.add('piece','tie');

    // Critical: make the result visible BEFORE waiting for player artwork.
    // A slow/missing image can no longer leave pupils on a blank screen.
    if (banner) banner.textContent = '🏅 2-PLAYER MATCH AWARD 🏅';
    if (sub) sub.textContent = 'Standalone 2-player match';
    if (msg) msg.innerHTML = '<b>It’s a tie!</b><br>Both players share 1st place and receive the match award.';
    const face = card.querySelector('.mc-face');
    if (face) face.textContent = '';
    ceremony.classList.add('show');
    ceremony.setAttribute('aria-hidden','false');

    const {p1, p2} = ensurePlayers(stage);
    p1.alt = 'Player 1 — joint 1st place';
    p2.alt = 'Player 2 — joint 1st place';

    const load = () => {
      const src = playerSources();
      const ok1 = setPlayerImage(p1, validSrc(p1.src) ? p1.src : src.p1, stage, 'p1');
      const ok2 = setPlayerImage(p2, validSrc(p2.src) ? p2.src : src.p2, stage, 'p2');
      return ok1 && ok2;
    };

    // Show P1/P2 fallback badges immediately if artwork is not ready, then
    // quietly replace them when the real player images become available.
    if (!load()) {
      let tries = 0;
      const wait = setInterval(() => {
        if (load() || ++tries >= 30) clearInterval(wait);
      }, 100);
    }

    p1.style.animation = 'none';
    p2.style.animation = 'none';
    void p1.offsetWidth;
    p1.style.removeProperty('animation');
    p2.style.removeProperty('animation');

    try { if (typeof pieceSound === 'function') pieceSound(); } catch (_) {}
    try { if (typeof burst === 'function') burst(80); else if (typeof confetti === 'function') confetti(80); } catch (_) {}
    setTimeout(() => card.classList.add('award'), 420);
    setTimeout(() => card.classList.add('celebrate'), 1050);
    return true;
  }

  function install(){
    const base = window.showMedalCeremony;
    if (typeof base !== 'function') return false;
    if (base.__sfTieDirectV5) return true;

    const wrapped = function(preview=false, winner='p1', kind='gold'){
      if (winner === 'tie' && kind === 'piece') return renderTieDirect();
      return base.apply(this, arguments);
    };
    wrapped.__sfTieDirectV5 = true;
    window.showMedalCeremony = wrapped;
    return true;
  }

  install();
  let tries = 0;
  const timer = setInterval(() => {
    install();
    if (++tries > 40) clearInterval(timer);
  }, 100);
})();
