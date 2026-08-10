from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
marker='<!-- SPORTS_FIESTA_COVER_END -->'
html='''<section id="medalCeremony" aria-hidden="true"><div class="mc-card"><button class="mc-close" type="button" onclick="closeMedalCeremony()">×</button><div class="mc-previewTag">TEACHER PREVIEW</div><div class="mc-banner">🏆 GOLD MEDAL CEREMONY 🏆</div><div class="mc-sub" id="mcSub">All 11 Sports Fiesta challenges completed perfectly!</div><div class="mc-stage"><div class="mc-glow"></div><div class="mc-side left">2nd</div><div class="mc-side right">3rd</div><div class="mc-podium"></div><img class="mc-player" id="mcPlayer" alt="Player 1 receiving the gold medal"><div class="mc-medal"><div class="mc-face">★</div></div><div class="mc-message" id="mcMessage">Player 1, step onto the champion's rostrum!</div></div></div></section>'''
if 'id="medalCeremony"' not in s:
    if marker not in s: raise SystemExit('Cover marker missing')
    s=s.replace(marker,marker+html,1)
cover_btn='<button class="fc-start" id="fcStart">★ START SPORTS FIESTA ★</button>'
if 'Preview Gold Medal Ceremony' not in s:
    if cover_btn not in s: raise SystemExit('Cover start button missing')
    s=s.replace(cover_btn,cover_btn+'<button class="fc-preview" type="button" onclick="unlockCeremonyPreview()">🔒 Preview Gold Medal Ceremony</button>',1)
if '<button class="previewCeremonyBtn"' not in s:
    reset_btn='<button id="resetBtn" class="resetBtn" type="button">Hold 5 Seconds to Reset</button>'
    s=s.replace(reset_btn,'<button class="previewCeremonyBtn" type="button" onclick="unlockCeremonyPreview()">🔒 Preview Medal Ceremony</button> '+reset_btn,1)
p.write_text(s,encoding='utf-8')
print('Ceremony HTML and preview buttons verified.')
