(() => {
  const style = document.createElement('style');
  style.id = 'sf-tie-two-players-v2';
  style.textContent = `
    /* A real tie ceremony: both competitors share 1st place. */
    .mc-card.tie #mcPlayer,
    .mc-card.tie #mcPlayer2 {
      position:absolute!important;
      display:block!important;
      top:auto!important;
      width:min(190px,28%)!important;
      height:300px!important;
      bottom:118px!important;
      object-fit:contain!important;
      z-index:4!important;
      transform:translateX(-50%)!important;
      filter:drop-shadow(0 10px 10px rgba(32,63,88,.22));
      animation:sfTiePlayerIn .75s cubic-bezier(.22,.9,.3,1.15) both!important;
    }
    .mc-card.tie #mcPlayer { left:36%!important; }
    .mc-card.tie #mcPlayer2 { left:64%!important; animation-delay:.12s!important; }

    /* Both players are joint first. Do not visually demote either player. */
    .mc-card.tie .mc-second,
    .mc-card.tie .mc-third { opacity:.72; }

    @keyframes sfTiePlayerIn {
      from { opacity:0; transform:translateX(-50%) translateY(65px) scale(.84); }
      to   { opacity:1; transform:translateX(-50%) translateY(0) scale(1); }
    }

    @media (max-width:620px) {
      .mc-card.tie #mcPlayer,
      .mc-card.tie #mcPlayer2 {
        width:min(145px,38vw)!important;
        height:230px!important;
        bottom:110px!important;
      }
      .mc-card.tie #mcPlayer { left:34%!important; }
      .mc-card.tie #mcPlayer2 { left:66%!important; }
    }

    @media (max-width:390px) {
      .mc-card.tie #mcPlayer,
      .mc-card.tie #mcPlayer2 {
        width:min(128px,36vw)!important;
        height:215px!important;
      }
      .mc-card.tie #mcPlayer { left:33%!important; }
      .mc-card.tie #mcPlayer2 { left:67%!important; }
    }
  `;
  document.head.appendChild(style);
})();
