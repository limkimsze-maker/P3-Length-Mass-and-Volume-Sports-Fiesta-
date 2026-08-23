from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')

# Ensure mobile browsers use the real device width.
viewport = '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
if not re.search(r'<meta\s+[^>]*name=["\']viewport["\']', s, flags=re.I):
    s = re.sub(r'(<head\b[^>]*>)', r'\1\n  ' + viewport, s, count=1, flags=re.I)
else:
    s = re.sub(
        r'<meta\s+[^>]*name=["\']viewport["\'][^>]*>',
        viewport,
        s,
        count=1,
        flags=re.I,
    )

start = '/* SPORTS_FIESTA_RESPONSIVE_V1_START */'
end = '/* SPORTS_FIESTA_RESPONSIVE_V1_END */'

responsive_css = r'''
/* SPORTS_FIESTA_RESPONSIVE_V1_START */
/* Device-safe foundation. These rules intentionally avoid game-specific sizing. */
html{width:100%;max-width:100%;-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{width:100%;max-width:100%;margin:0;overflow-x:hidden}
body.cover-on{min-height:100dvh}
#fiestaCover{width:100vw;width:100dvw;height:100vh;height:100dvh;max-width:100%;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
#fiestaCover .fc-wrap{width:min(1500px,100%);max-width:100%;min-height:100%;padding:max(12px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));justify-content:center}
#fiestaCover .fc-main,#fiestaCover .fc-center,#fiestaCover .fc-player,#fiestaCover .fc-track,#fiestaCover .fc-sport{min-width:0}
#fiestaCover h1,#fiestaCover .fc-ribbon,#fiestaCover .fc-board{overflow-wrap:anywhere}
#fiestaCover .fc-start{max-width:100%;min-height:48px;white-space:normal;touch-action:manipulation}

/* Tablets and smaller laptops. */
@media (max-width:1100px){
  #fiestaCover .fc-main{grid-template-columns:clamp(110px,16vw,165px) minmax(0,1fr) clamp(110px,16vw,165px);gap:10px}
  #fiestaCover .fc-player img{width:min(100%,155px);max-height:230px}
  #fiestaCover .fc-track{grid-template-columns:repeat(6,minmax(0,1fr))}
  #fiestaCover .fc-sport{min-height:76px}
}

/* Portrait phones and narrow tablets: title first, players below, compact sport grid. */
@media (max-width:680px){
  #fiestaCover .fc-wrap{min-height:100%;height:auto;padding:max(8px,env(safe-area-inset-top)) max(8px,env(safe-area-inset-right)) max(10px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left));justify-content:flex-start}
  #fiestaCover .fc-main{grid-template-columns:1fr 1fr;gap:6px 10px;align-items:end}
  #fiestaCover .fc-center{grid-column:1/-1;grid-row:1}
  #fiestaCover .fc-player{grid-row:2}
  #fiestaCover .fc-player img{width:clamp(72px,27vw,118px);height:clamp(90px,30vw,140px);max-height:none}
  #fiestaCover .fc-tag{font-size:clamp(10px,3vw,12px);padding:3px 8px;border-width:3px}
  #fiestaCover .fc-trophy{font-size:clamp(28px,9vw,38px)}
  #fiestaCover h1{font-size:clamp(29px,10vw,40px);line-height:.94;letter-spacing:-1px}
  #fiestaCover .fc-ribbon{margin:7px auto 8px;padding:6px 9px;border-width:3px;border-radius:12px;font-size:clamp(11px,3.2vw,14px)}
  #fiestaCover .fc-board{padding:7px 9px;border-width:3px;border-radius:13px;font-size:clamp(11px,3.15vw,14px);line-height:1.25}
  #fiestaCover .fc-start{margin:8px auto 7px;padding:9px 16px;border-width:4px;font-size:clamp(17px,5vw,22px)}
  #fiestaCover .fc-track{margin-top:7px;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;padding:6px;border-width:3px;border-radius:16px}
  #fiestaCover .fc-sport{min-height:62px;padding:4px 2px 3px;border-width:2px;border-radius:11px}
  #fiestaCover .fc-sport .n{left:-5px;top:-6px;width:23px;height:23px;border-width:2px;font-size:11px}
  #fiestaCover .fc-sport .ic{font-size:clamp(18px,6vw,24px);min-height:24px}
  #fiestaCover .fc-sport.tri .ic{font-size:12px}
  #fiestaCover .fc-sport b{font-size:clamp(7px,2.2vw,9px)}
}

/* Very narrow phones. */
@media (max-width:380px){
  #fiestaCover .fc-player img{width:78px;height:92px}
  #fiestaCover h1{font-size:28px}
  #fiestaCover .fc-board{font-size:11px}
  #fiestaCover .fc-track{grid-template-columns:repeat(3,minmax(0,1fr))}
  #fiestaCover .fc-sport{min-height:58px}
}

/* Short landscape screens: keep all critical controls visible and allow vertical scroll if needed. */
@media (orientation:landscape) and (max-height:650px){
  #fiestaCover{overflow-y:auto}
  #fiestaCover .fc-wrap{min-height:100%;height:auto;padding:max(6px,env(safe-area-inset-top)) max(8px,env(safe-area-inset-right)) max(8px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left));justify-content:flex-start}
  #fiestaCover .fc-main{grid-template-columns:clamp(70px,11vw,112px) minmax(0,1fr) clamp(70px,11vw,112px);gap:7px}
  #fiestaCover .fc-player img{width:min(100%,100px);height:min(25vh,135px);max-height:135px}
  #fiestaCover .fc-tag{margin-top:-3px;padding:2px 7px;border-width:2px;font-size:10px}
  #fiestaCover .fc-trophy{font-size:26px}
  #fiestaCover h1{margin:-4px 0 0;font-size:clamp(25px,5.2vw,43px);line-height:.9;letter-spacing:-1px}
  #fiestaCover .fc-ribbon{margin:5px auto 6px;padding:4px 8px;border-width:2px;border-radius:9px;font-size:clamp(10px,1.8vw,14px);box-shadow:0 3px 0 #811515}
  #fiestaCover .fc-board{max-width:680px;padding:5px 8px;border-width:2px;border-radius:10px;font-size:clamp(10px,1.55vw,13px);line-height:1.18}
  #fiestaCover .fc-start{margin:6px auto 5px;padding:6px 18px;border-width:3px;min-height:38px;font-size:clamp(15px,2.5vw,20px);box-shadow:0 4px 0 #06438a}
  #fiestaCover .fc-track{margin-top:5px;grid-template-columns:repeat(11,minmax(0,1fr));gap:3px;padding:5px;border-width:2px;border-radius:13px;box-shadow:0 4px 0 #4b2a17}
  #fiestaCover .fc-sport{min-height:50px;padding:3px 1px 2px;border-width:2px;border-radius:8px}
  #fiestaCover .fc-sport .n{left:-4px;top:-5px;width:20px;height:20px;border-width:2px;font-size:9px}
  #fiestaCover .fc-sport .ic{font-size:18px;min-height:19px}
  #fiestaCover .fc-sport.tri .ic{font-size:10px}
  #fiestaCover .fc-sport b{font-size:7px;line-height:1}
}

/* Very short landscape phones: simplify decoration rather than hide controls. */
@media (orientation:landscape) and (max-height:430px){
  #fiestaCover .fc-trophy{display:none}
  #fiestaCover .fc-player img{height:74px}
  #fiestaCover h1{font-size:clamp(22px,4.5vw,32px)}
  #fiestaCover .fc-board{font-size:10px;padding:4px 7px}
  #fiestaCover .fc-start{margin:4px auto;padding:4px 15px;min-height:34px;font-size:15px}
  #fiestaCover .fc-track{margin-top:4px}
  #fiestaCover .fc-sport{min-height:43px}
  #fiestaCover .fc-sport .ic{font-size:15px;min-height:16px}
}
/* SPORTS_FIESTA_RESPONSIVE_V1_END */
'''

block_pattern = re.compile(re.escape(start) + r'.*?' + re.escape(end), flags=re.S)
if block_pattern.search(s):
    s = block_pattern.sub(responsive_css.strip(), s, count=1)
else:
    # Put overrides after the first existing style block so they win over the older cover breakpoints.
    s = s.replace('</style>', responsive_css + '\n</style>', 1)

p.write_text(s, encoding='utf-8')
