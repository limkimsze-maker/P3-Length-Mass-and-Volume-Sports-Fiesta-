from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

# Install the existing base ceremony first if needed.
if 'id="medalCeremony"' not in s:
    code=Path('.github/scripts/add_ceremony.py').read_text(encoding='utf-8')
    exec(compile(code,'.github/scripts/add_ceremony.py','exec'),{'__name__':'__main__'})
    s=p.read_text(encoding='utf-8')

CSS_A='/* SF_REWARD_UPGRADE_START */'
CSS_B='/* SF_REWARD_UPGRADE_END */'
JS_A='/* SF_REWARD_UPGRADE_JS_START */'
JS_B='/* SF_REWARD_UPGRADE_JS_END */'
HTML_A='<!-- SF_REWARD_UPGRADE_HTML_START -->'
HTML_B='<!-- SF_REWARD_UPGRADE_HTML_END -->'

def block(text,a,b,new,anchor,before=True):
    if a in text and b in text:
        i=text.index(a);j=text.index(b,i)+len(b)
        return text[:i]+new+text[j:]
    if anchor not in text: raise SystemExit('Missing anchor: '+anchor)
    return text.replace(anchor,(new+'\n'+anchor) if before else (anchor+'\n'+new),1)

css=r'''
/* SF_REWARD_UPGRADE_START */
#sfPass,#sfPreviewMenu{position:fixed;inset:0;z-index:230000;display:none;align-items:center;justify-content:center;padding:16px;background:#102b4dbf;backdrop-filter:blur(5px);font-family:"Trebuchet MS","Arial Rounded MT Bold",Arial,sans-serif}
#sfPass.show,#sfPreviewMenu.show{display:flex}
.sfBox{width:min(430px,94vw);background:#fff;border:4px solid #d9ebff;border-radius:25px;padding:22px;text-align:center;box-shadow:0 22px 60px #08234566}
.sfBox h3{margin:0 0 8px;color:#154f82;font-size:26px}.sfBox p{margin:6px 0 14px;color:#5c7589;line-height:1.4}
#sfPassInput{width:160px;height:52px;border:3px solid #a9cdeb;border-radius:15px;text-align:center;font-size:28px;font-weight:900;color:#111;background:#fff;-webkit-text-fill-color:#111;letter-spacing:5px;caret-color:#111}
.sfBtns{display:flex;justify-content:center;gap:9px;flex-wrap:wrap;margin-top:14px}.sfBtns button{border:0;border-radius:13px;padding:10px 15px;font-weight:900;cursor:pointer}
.sfUnlock{background:#357ed8;color:#fff}.sfCancel{background:#eaf1f6;color:#36566e}.sfChoice{background:linear-gradient(#fff7c8,#ffd965);color:#714d00;border:2px solid #e4b735!important}
#sfPassError{height:22px;margin-top:7px;color:#c43b3b;font-weight:900}
.mc-card.tie .mc-player{width:190px}.mc-card.tie #mcPlayer{left:42%}.mc-card.tie #mcPlayer2{left:58%}
#mcPlayer2{position:absolute;bottom:118px;transform:translateX(-50%);z-index:3;width:225px;height:300px;object-fit:contain;filter:drop-shadow(0 12px 10px #29435755);display:none}
.mc-card.tie #mcPlayer2{display:block;animation:mcPlayer .75s cubic-bezier(.2,.9,.3,1.15)}
.mc-card.piece .mc-face{font-size:0;background:conic-gradient(#f5c33b 0deg 32.73deg,#dfe6ec 32.73deg 360deg);color:#765100}
.mc-card.piece .mc-face:before{content:"1/11";font-size:24px;font-weight:1000;text-shadow:0 1px #fff}.mc-card.piece .mc-face:after{content:"PIECE";position:absolute;bottom:18px;font-size:11px;font-weight:1000}
.mc-card.gold .mc-face{background:radial-gradient(circle at 32% 28%,#fff9cc,#ffd84c 49%,#e29b13)}
/* SF_REWARD_UPGRADE_END */
'''

html=r'''
<!-- SF_REWARD_UPGRADE_HTML_START -->
<div id="sfPass" aria-hidden="true"><div class="sfBox">
  <h3>🔒 Teacher Preview</h3><p>Enter the password to preview the medal presentation.</p>
  <input id="sfPassInput" type="password" inputmode="numeric" maxlength="2" autocomplete="off" aria-label="Preview password">
  <div id="sfPassError"></div>
  <div class="sfBtns"><button class="sfUnlock" onclick="sfCheckPass()">Unlock</button><button class="sfCancel" onclick="sfClosePass()">Cancel</button></div>
</div></div>
<div id="sfPreviewMenu" aria-hidden="true"><div class="sfBox">
  <h3>🏅 Choose a Preview</h3><p>Preview only — saved pupil progress will not change.</p>
  <div class="sfBtns">
    <button class="sfChoice" onclick="sfPreview('p1','piece')">🔵 Player 1 — 1/11</button>
    <button class="sfChoice" onclick="sfPreview('p2','piece')">🔴 Player 2 — 1/11</button>
    <button class="sfChoice" onclick="sfPreview('tie','piece')">🤝 Tie — 1/11</button>
    <button class="sfChoice" onclick="sfPreview('p1','gold')">🏆 Final Gold</button>
    <button class="sfCancel" onclick="sfCloseMenu()">Close</button>
  </div>
</div></div>
<!-- SF_REWARD_UPGRADE_HTML_END -->
'''

js=r'''
<script>
/* SF_REWARD_UPGRADE_JS_START */
(function(){
const PENDING="sportsFiestaPendingAward_v1",GOLDKEY="sportsFiestaGoldCeremonyShown_v1";
let sfAudio=null;
function ac(){if(!sfAudio){const C=window.AudioContext||window.webkitAudioContext;if(C)sfAudio=new C()}if(sfAudio&&sfAudio.state==="suspended")sfAudio.resume();return sfAudio}
function beep(f,d=.12,delay=0,type="triangle",v=.04){const c=ac();if(!c)return;const t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(c.destination);o.start(t);o.stop(t+d+.03)}
function pieceSound(){beep(523,.1);beep(659,.11,.1);beep(784,.14,.21);beep(1047,.2,.34)}
function finalSound(){[392,523,659,784,1047].forEach((f,i)=>beep(f,.22,i*.1,"triangle",.05));setTimeout(()=>[659,784,1047,1319].forEach((f,i)=>beep(f,.26,i*.08,"sine",.035)),600)}
function burst(n){const h=document.getElementById("medalCeremony"),cols=["#ffd43b","#ff5964","#49cfff","#5bdd70","#9d67ff","#fff"];if(!h)return;for(let i=0;i<n;i++){const e=document.createElement("i");e.className="mc-piece";e.style.left=Math.random()*100+"vw";e.style.background=cols[i%cols.length];e.style.setProperty("--dur",2+Math.random()*2+"s");e.style.setProperty("--delay",Math.random()*.4+"s");e.style.setProperty("--drift",Math.random()*240-120+"px");e.style.setProperty("--rot",Math.random()*900-450+"deg");h.appendChild(e);setTimeout(()=>e.remove(),4500)}}
function imgs(){const a=document.querySelectorAll(".playerImgWrap img.playerSvg");return [a[0]?a[0].src:"",a[1]?a[1].src:""]}
function data(){try{return JSON.parse(localStorage.getItem("sportsFiestaHubProgress_v1")||"{}")}catch(e){return{}}}
function perfects(){const d=data();let n=0;for(let i=1;i<=11;i++)if(d[i]&&d[i].perfectSingle)n++;return n}
function preparePlayers(w){const m=document.getElementById("mcPlayer"),card=document.querySelector("#medalCeremony .mc-card"),src=imgs();if(!m||!card)return;let m2=document.getElementById("mcPlayer2");if(!m2){m2=document.createElement("img");m2.id="mcPlayer2";m2.alt="Player 2";card.querySelector(".mc-stage").appendChild(m2)}card.classList.remove("tie");m2.style.display="none";if(w==="p2")m.src=src[1];else m.src=src[0];if(w==="tie"){card.classList.add("tie");m.src=src[0];m2.src=src[1];m2.style.display="block"}}
window.showMedalCeremony=function(preview=false,winner="p1",kind="gold"){
  const e=document.getElementById("medalCeremony"),c=e&&e.querySelector(".mc-card");if(!e||!c)return;
  if(typeof clearCT==="function")clearCT();e.querySelectorAll(".mc-piece").forEach(x=>x.remove());
  c.classList.remove("award","celebrate","preview","piece","gold","tie");if(preview)c.classList.add("preview");c.classList.add(kind==="piece"?"piece":"gold");preparePlayers(winner);
  const sub=document.getElementById("mcSub"),msg=document.getElementById("mcMessage"),face=c.querySelector(".mc-face");
  if(kind==="piece"){face.textContent="";sub.textContent=preview?"Preview only — progress is unchanged.":"Practice completed — 1/11 of the medal earned!";msg.textContent=winner==="p2"?"Player 2 wins and receives 1/11 of the medal!":winner==="tie"?"It's a tie! Both players share the medal celebration!":"Player 1 receives 1/11 of the medal!";pieceSound();burst(70)}
  else{face.textContent="★";sub.textContent=preview?"Preview only — progress is unchanged.":"All 11 practices completed perfectly in 1-player mode!";msg.textContent="🏆 Player 1 receives the Sports Fiesta GOLD MEDAL! 🏆";finalSound();burst(125);if(!preview)localStorage.setItem(GOLDKEY,"1")}
  e.classList.add("show");e.setAttribute("aria-hidden","false");setTimeout(()=>c.classList.add("award"),500);setTimeout(()=>c.classList.add("celebrate"),1200)
};
window.unlockCeremonyPreview=function(){const o=document.getElementById("sfPass"),i=document.getElementById("sfPassInput"),er=document.getElementById("sfPassError");o.classList.add("show");o.setAttribute("aria-hidden","false");er.textContent="";i.value="";setTimeout(()=>i.focus(),60)};
window.sfClosePass=function(){const o=document.getElementById("sfPass");o.classList.remove("show");o.setAttribute("aria-hidden","true")};
window.sfCheckPass=function(){const i=document.getElementById("sfPassInput"),er=document.getElementById("sfPassError");if(i.value==="67"){beep(660,.08);beep(990,.13,.08);sfClosePass();const m=document.getElementById("sfPreviewMenu");m.classList.add("show");m.setAttribute("aria-hidden","false")}else{er.textContent="Incorrect password.";i.value="";i.focus();beep(180,.14,0,"sawtooth",.03)}};
window.sfCloseMenu=function(){const m=document.getElementById("sfPreviewMenu");m.classList.remove("show");m.setAttribute("aria-hidden","true")};
window.sfPreview=function(w,k){sfCloseMenu();showMedalCeremony(true,w,k)};
function maybeGold(){if(perfects()===11&&localStorage.getItem(GOLDKEY)!=="1"){setTimeout(()=>showMedalCeremony(false,"p1","gold"),500);return true}if(perfects()<11)localStorage.removeItem(GOLDKEY);return false}
window.SportsFiestaAward={record:function(id,mode,winner,perfect){const d=data(),k=String(id);if(!d[k])d[k]={completed:false,perfectSingle:false,updatedAt:null};d[k].completed=true;if(Number(mode)===1&&perfect)d[k].perfectSingle=true;d[k].updatedAt=new Date().toISOString();localStorage.setItem("sportsFiestaHubProgress_v1",JSON.stringify(d));localStorage.setItem(PENDING,JSON.stringify({practiceId:Number(id),mode:Number(mode)||1,winner:winner||"p1",perfect:!!perfect,time:Date.now()}))}};
function pending(){const raw=localStorage.getItem(PENDING);if(!raw)return;localStorage.removeItem(PENDING);let r;try{r=JSON.parse(raw)}catch(e){return}if(maybeGold())return;showMedalCeremony(false,r.mode===2?(r.winner||"tie"):"p1","piece");if(typeof renderAll==="function")renderAll()}
function wrap(){
 if(typeof toggleCompleted==="function"&&!toggleCompleted.__sf){const old=toggleCompleted;window.toggleCompleted=function(id){const b=(data()[id]||{}).completed;old(id);const a=(data()[id]||{}).completed;if(!b&&a)showMedalCeremony(false,"p1","piece")};window.toggleCompleted.__sf=1}
 if(typeof togglePerfect==="function"&&!togglePerfect.__sf){const old=togglePerfect;window.togglePerfect=function(id){const b=(data()[id]||{}).perfectSingle;old(id);const a=(data()[id]||{}).perfectSingle;if(!b&&a&&!maybeGold())showMedalCeremony(false,"p1","piece")};window.togglePerfect.__sf=1}
}
function setup(){wrap();pending();const i=document.getElementById("sfPassInput");if(i)i.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();sfCheckPass()}});document.addEventListener("visibilitychange",()=>{if(!document.hidden)pending()});window.addEventListener("storage",e=>{if(e.key===PENDING)pending()})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup);else setup();
})();
/* SF_REWARD_UPGRADE_JS_END */
</script>
'''

s=block(s,CSS_A,CSS_B,css,'</style>',True)
s=block(s,HTML_A,HTML_B,html,'<!-- SPORTS_FIESTA_COVER_END -->',False)
s=block(s,JS_A,JS_B,js,'</body>',True)
p.write_text(s,encoding='utf-8')
print('Reward upgrade installed: masked password, 1/11 awards, 2P winner/tie ceremonies and final gold.')
