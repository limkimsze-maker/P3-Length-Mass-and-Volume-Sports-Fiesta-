(() => {
  if (window.__sfTieDirectV4) return;
  window.__sfTieDirectV4 = true;

  const style = document.createElement('style');
  style.id = 'sf-tie-two-players-v4';
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
    }
  `;
  document.head.appendChild(style);

  function validSrc(x){
    return typeof x === 'string' && x.trim() && !x.endsWith('/') && x !== location.href;
  }

  function playerSources(){
    let p1 = '', p2 = '';

    // Use the hub's own player-source helper first. This is the same source used
    // by the normal Player 1 / Player 2 award ceremony.
    try {
      if (typeof window.imgs === 'function') {
        const a = window.imgs();
        if (Array.isArray(a)) {
          p1 = a[0] || '';
          p2 = a[1] || '';
        }
      }
    } catch (_) {}

    // The cover images are populated from the original player cards at startup.
    const cards = [...document.querySelectorAll('.playerImgWrap img.playerSvg')];
    p1 = p1 || document.getElementById('fcP1')?.src || cards[0]?.src || '';
    p2 = p2 || document.getElementById('fcP2')?.src || cards[1]?.src || '';

    return {p1: validSrc(p1) ? p1 : '', p2: validSrc(p2) ? p2 : ''};
  }

  function seedPlayersFromHub(){
    // Reuse the proven hub routine. It creates mcPlayer2 and assigns the same
    // real player images that are used for normal Player 1 / Player 2 wins.
    try {
      if (typeof window.preparePlayers === 'function') window.preparePlayers('tie');
    } catch (_) {}

    const p1 = document.getElementById('mcPlayer');
    const p2 = document.getElementById('mcPlayer2');
    const fallback = playerSources();

    if (p1 && !validSrc(p1.src) && fallback.p1) p1.src = fallback.p1;
    if (p2 && !validSrc(p2.src) && fallback.p2) p2.src = fallback.p2;

    return {
      p1,
      p2,
      p1src: validSrc(p1?.src) ? p1.src : fallback.p1,
      p2src: validSrc(p2?.src) ? p2.src : fallback.p2
    };
  }

  function renderTieDirect(){
    const ceremony = document.getElementById('medalCeremony');
    const card = ceremony?.querySelector('.mc-card');
    const stage = ceremony?.querySelector('.mc-stage');
    const sub = document.getElementById('mcSub');
    const msg = document.getElementById('mcMessage');
    const banner = ceremony?.querySelector('.mc-banner');
    if (!ceremony || !card || !stage) return false;

    // Do not reveal the ceremony until both competitors have real image sources.
    ceremony.classList.remove('show');
    ceremony.setAttribute('aria-hidden','true');

    const seeded = seedPlayersFromHub();
    let p1 = seeded.p1;
    let p2 = seeded.p2;

    if (!p1) return false;
    if (!p2) {
      p2 = p1.cloneNode(true);
      p2.id = 'mcPlayer2';
      stage.appendChild(p2);
    }

    const src = playerSources();
    const p1src = seeded.p1src || src.p1;
    const p2src = seeded.p2src || src.p2;

    if (!p1src || !p2src) {
      // Player-card images can finish initialising a fraction later in the iframe.
      // Retry briefly instead of showing an empty podium.
      let tries = 0;
      const wait = setInterval(() => {
        const s = seedPlayersFromHub();
        if ((s.p1src && s.p2src) || ++tries >= 20) {
          clearInterval(wait);
          if (s.p1src && s.p2src) renderTieDirect();
        }
      }, 75);
      return true;
    }

    try { if (typeof clearCT === 'function') clearCT(); } catch (_) {}
    ceremony.querySelectorAll('.mc-piece').forEach(x => x.remove());
    card.classList.remove('award','celebrate','preview','gold');
    card.classList.add('piece','tie');

    p1.src = p1src;
    p1.alt = 'Player 1 — joint 1st place';
    p1.style.removeProperty('display');
    p1.style.setProperty('visibility','visible','important');

    p2.src = p2src;
    p2.alt = 'Player 2 — joint 1st place';
    p2.style.setProperty('display','block','important');
    p2.style.setProperty('visibility','visible','important');

    // Restart the entrance animations every time a tie ceremony opens.
    p1.style.animation = 'none';
    p2.style.animation = 'none';
    void p1.offsetWidth;
    p1.style.removeProperty('animation');
    p2.style.removeProperty('animation');

    if (banner) banner.textContent = '🏅 2-PLAYER MATCH AWARD 🏅';
    if (sub) sub.textContent = 'Standalone 2-player match';
    if (msg) msg.innerHTML = '<b>It’s a tie!</b><br>Both players share 1st place and receive the match award.';

    const face = card.querySelector('.mc-face');
    if (face) face.textContent = '';

    ceremony.classList.add('show');
    ceremony.setAttribute('aria-hidden','false');

    try { if (typeof pieceSound === 'function') pieceSound(); } catch (_) {}
    try { if (typeof burst === 'function') burst(80); else if (typeof confetti === 'function') confetti(80); } catch (_) {}

    setTimeout(() => card.classList.add('award'), 420);
    setTimeout(() => card.classList.add('celebrate'), 1050);
    return true;
  }

  function install(){
    const base = window.showMedalCeremony;
    if (typeof base !== 'function') return false;
    if (base.__sfTieDirectV4) return true;

    const wrapped = function(preview=false, winner='p1', kind='gold'){
      if (winner === 'tie' && kind === 'piece') {
        return renderTieDirect();
      }
      return base.apply(this, arguments);
    };
    wrapped.__sfTieDirectV4 = true;
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
