(() => {
  const style = document.createElement('style');
  style.id = 'sf-tie-two-players-v1';
  style.textContent = `
    /* Tie ceremony: show both competitors clearly, one on each side. */
    .mc-card.tie #mcPlayer,
    .mc-card.tie #mcPlayer2 {
      width: min(190px, 28%);
      height: 300px;
      bottom: 118px;
      object-fit: contain;
      z-index: 3;
    }
    .mc-card.tie #mcPlayer { left: 26%; }
    .mc-card.tie #mcPlayer2 { left: 74%; display: block; }

    @media (max-width: 620px) {
      .mc-card.tie #mcPlayer,
      .mc-card.tie #mcPlayer2 {
        width: min(145px, 40vw);
        height: 230px;
        bottom: 110px;
      }
      .mc-card.tie #mcPlayer { left: 25%; }
      .mc-card.tie #mcPlayer2 { left: 75%; }
    }

    @media (max-width: 390px) {
      .mc-card.tie #mcPlayer,
      .mc-card.tie #mcPlayer2 {
        width: min(132px, 38vw);
        height: 220px;
      }
      .mc-card.tie #mcPlayer { left: 24%; }
      .mc-card.tie #mcPlayer2 { left: 76%; }
    }
  `;
  document.head.appendChild(style);
})();
