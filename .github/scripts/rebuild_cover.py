from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

# Fix the master sport list used by the existing hub.
repls={
'{id:2, sport:"Javelin", icon:"🎯", title:"P3-2 Length Conversion", subtitle:"Javelin • Length Conversion",':'{id:2, sport:"Javelin Throw", icon:"🎯", title:"P3-2 Length Conversion", subtitle:"Javelin Throw • Length Conversion",',
'{id:5, sport:"Mass Conversion", icon:"⚖️", title:"P3-5 Mass Conversion", subtitle:"Mass Conversion Practice",':'{id:5, sport:"Shot Put", icon:"⚫", title:"P3-5 Mass Conversion", subtitle:"Shot Put • Mass Conversion",',
'{id:6, sport:"Recall of Volume", icon:"💧", title:"P3-6 Recall of Volume", subtitle:"Volume Practice",':'{id:6, sport:"Swimming", icon:"🏊", title:"P3-6 Recall of Volume", subtitle:"Swimming • Recall of Volume",',
'{id:7, sport:"Reading of Volume", icon:"🧪", title:"P3-7 Reading of Volume", subtitle:"Volume Reading Practice",':'{id:7, sport:"Diving", icon:"🤸💦", title:"P3-7 Reading of Volume", subtitle:"Diving • Reading of Volume",',
'{id:8, sport:"Measure Volume", icon:"🥤", title:"P3-8 Measuring Volumes", subtitle:"Litres and Millilitres",':'{id:8, sport:"Water Polo", icon:"🏐🌊", title:"P3-8 Measuring Volumes", subtitle:"Water Polo • Measuring Volume",',
}
for a,b in repls.items():
    s=s.replace(a,b)

# Cover markers. Keep an existing cover intact so reruns are idempotent.
start='<!-- SPORTS_FIESTA_COVER_START -->'
end='<!-- SPORTS_FIESTA_COVER_END -->'

css=r'''
/* SPORTS FIESTA COVER */
body.cover-on{padding:0;overflow:hidden;background:#39aaf2}
body.cover-on>.app{display:none!important}
#fiestaCover{position:fixed;z-index:99999;inset:0;overflow:auto;background:linear-gradient(#2b9fea 0 49%,#8cddff 49% 58%,#65bb62 58% 76%,#c87948 76%);font-family:"Trebuchet MS","Arial Rounded MT Bold",Arial,sans-serif;color:#18324a}
#fiestaCover *{box-sizing:border-box}
#fiestaCover .fc-confetti{position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(circle,#ffd42a 0 4px,transparent 5px),radial-gradient(circle,#ff4e67 0 4px,transparent 5px),radial-gradient(circle,#4be07a 0 4px,transparent 5px);background-size:131px 117px,157px 143px,181px 169px;background-position:0 0,39px 22px,73px 51px;opacity:.72}
#fiestaCover .fc-wrap{position:relative;z-index:1;width:min(1500px,100%);min-height:100%;margin:auto;padding:16px;display:flex;flex-direction:column;justify-content:center}
#fiestaCover .fc-main{display:grid;grid-template-columns:220px minmax(0,1fr) 220px;gap:12px;align-items:center}
#fiestaCover .fc-player{text-align:center;align-self:end}
#fiestaCover .fc-player img{display:block;width:min(100%,205px);max-height:350px;object-fit:contain;margin:auto;border-radius:32px;mix-blend-mode:multiply;filter:drop-shadow(0 12px 12px #153c5b55)}
#fiestaCover .fc-tag{display:inline-block;margin-top:-4px;padding:7px 20px;border-radius:999px;border:4px solid white;color:white;font-size:20px;font-weight:1000;box-shadow:0 5px 0 #0002}
#fiestaCover .fc-p1{background:#347fe3}#fiestaCover .fc-p2{background:#e84c4c}
#fiestaCover .fc-center{text-align:center;min-width:0}
#fiestaCover .fc-trophy{font-size:56px;filter:drop-shadow(0 5px 0 #8a5a09)}
#fiestaCover h1{margin:-8px 0 0;line-height:.9;font-size:clamp(42px,6.4vw,86px);font-weight:1000;letter-spacing:-2px;color:#fff;text-shadow:0 5px 0 #0d3d78,0 8px 0 #06294e,3px 3px 0 #06294e,-3px -3px 0 #06294e}
#fiestaCover h1 .fc-top{display:block;color:#ffc72c;text-shadow:0 5px 0 #a76512,0 8px 0 #5d3909,3px 3px 0 #5d3909,-3px -3px 0 #5d3909}
#fiestaCover .fc-ribbon{margin:10px auto 12px;background:linear-gradient(#f14e4e,#c92222);border:4px solid #8d1717;color:#fff;border-radius:17px;padding:8px 18px;font-size:clamp(17px,2vw,27px);font-weight:1000;box-shadow:0 5px 0 #811515}
#fiestaCover .fc-board{max-width:760px;margin:auto;background:#fff3c7;border:5px solid #b9781b;border-radius:18px;padding:11px 18px;box-shadow:inset 0 0 0 4px #ffe29a,0 7px 0 #75451055;font-size:clamp(15px,1.75vw,22px);font-weight:900;line-height:1.35}
#fiestaCover .fc-start{margin:16px auto 10px;padding:13px 36px;border:5px solid #ffe369;border-radius:999px;background:linear-gradient(#50b4ff,#176acb);box-shadow:0 7px 0 #06438a;color:white;font-size:clamp(24px,2.8vw,37px);font-weight:1000;text-shadow:0 2px 0 #17426d;cursor:pointer}
#fiestaCover .fc-start:active{transform:translateY(4px);box-shadow:0 3px 0 #06438a}
#fiestaCover .fc-track{margin-top:12px;background:#8d4c24;border:4px solid #5b3018;border-radius:23px;padding:9px;box-shadow:0 8px 0 #4b2a17;display:grid;grid-template-columns:repeat(11,minmax(0,1fr));gap:6px}
#fiestaCover .fc-sport{position:relative;min-height:92px;padding:6px 3px 4px;border-radius:15px;border:3px solid #f2b93d;background:linear-gradient(#fff8dc,#ffe39d);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
#fiestaCover .fc-sport .n{position:absolute;left:-7px;top:-8px;width:29px;height:29px;border-radius:50%;display:grid;place-items:center;background:#276fd0;color:#fff;border:3px solid white;font-weight:1000;box-shadow:0 2px 0 #164989}
#fiestaCover .fc-sport .ic{font-size:28px;line-height:1;min-height:32px;display:flex;align-items:center}.fc-sport.tri .ic{font-size:16px}
#fiestaCover .fc-sport b{font-size:11px;line-height:1.08;color:#4d341e;text-transform:uppercase}
@media(max-width:1000px){#fiestaCover .fc-main{grid-template-columns:155px minmax(0,1fr) 155px}#fiestaCover .fc-player img{max-height:235px}#fiestaCover .fc-track{grid-template-columns:repeat(6,1fr)}}
@media(max-width:680px){#fiestaCover .fc-wrap{padding:9px}#fiestaCover .fc-main{grid-template-columns:1fr 1fr}#fiestaCover .fc-center{grid-column:1/-1;grid-row:1}#fiestaCover .fc-player{grid-row:2}#fiestaCover .fc-player img{height:150px;width:120px}#fiestaCover .fc-tag{font-size:12px;padding:4px 10px}#fiestaCover .fc-trophy{font-size:36px}#fiestaCover h1{font-size:38px;letter-spacing:-1px}#fiestaCover .fc-ribbon{font-size:13px}#fiestaCover .fc-board{font-size:13px;padding:8px 11px}#fiestaCover .fc-start{font-size:20px;padding:10px 23px;margin:10px auto}#fiestaCover .fc-track{grid-template-columns:repeat(4,1fr);padding:7px}#fiestaCover .fc-sport{min-height:75px}#fiestaCover .fc-sport .ic{font-size:22px}#fiestaCover .fc-sport b{font-size:9px}}
'''
if '/* SPORTS FIESTA COVER */' not in s:
    s=s.replace('</style>',css+'\n</style>',1)

sports=[('🏃','Running'),('🎯','Javelin Throw'),('🎳','Bowling'),('🏋️','Weightlifting'),('⚫','Shot Put'),('🏊','Swimming'),('🤸💦','Diving'),('🏐🌊','Water Polo'),('⛵','Sailing'),('🏊🚴🏃','Triathlon'),('🔥','Torch Relay')]
steps=''.join(f'<div class="fc-sport {"tri" if i==10 else ""}"><span class="n">{i}</span><span class="ic">{ic}</span><b>{name}</b></div>' for i,(ic,name) in enumerate(sports,1))
cover=f'''{start}<section id="fiestaCover"><div class="fc-confetti"></div><div class="fc-wrap"><div class="fc-main"><div class="fc-player"><img id="fcP1" alt="Player 1"><span class="fc-tag fc-p1">PLAYER 1</span></div><div class="fc-center"><div class="fc-trophy">🏆</div><h1><span class="fc-top">LENGTH, MASS &amp; VOLUME</span>SPORTS FIESTA</h1><div class="fc-ribbon">11 SPORTS • 11 MEDAL PIECES • GO FOR GOLD!</div><div class="fc-board">Choose any sports game to practise. Complete all 11 with correct answers as a <b>single player</b> to win the <b>GOLD MEDAL!</b></div><button class="fc-start" id="fcStart">★ START SPORTS FIESTA ★</button></div><div class="fc-player"><img id="fcP2" alt="Player 2"><span class="fc-tag fc-p2">PLAYER 2</span></div></div><div class="fc-track">{steps}</div></div></section>{end}'''
if start not in s:
    if '<body class="cover-on">' in s:
        s=s.replace('<body class="cover-on">','<body class="cover-on">\n'+cover,1)
    else:
        s=s.replace('<body>','<body class="cover-on">\n'+cover,1)

js=r'''
<script>
(function(){
  function setupCover(){
    const originals=document.querySelectorAll('.playerImgWrap img.playerSvg');
    if(originals.length>=2){document.getElementById('fcP1').src=originals[0].src;document.getElementById('fcP2').src=originals[1].src;}
    const btn=document.getElementById('fcStart');
    if(btn)btn.addEventListener('click',function(){document.body.classList.remove('cover-on');document.getElementById('fiestaCover').style.display='none';window.scrollTo(0,0);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setupCover);else setupCover();
})();
</script>
'''
if 'function setupCover()' not in s:
    s=s.replace('</body>',js+'\n</body>',1)

p.write_text(s,encoding='utf-8')
