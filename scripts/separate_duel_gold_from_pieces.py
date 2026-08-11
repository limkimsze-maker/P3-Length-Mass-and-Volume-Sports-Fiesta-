from pathlib import Path

hook=Path('sports-fiesta-medal-hook-v4.js')
s=hook.read_text(encoding='utf-8')
s=s.replace('function update(perfect,winner){','function update(gm,perfect,winner){',1)
s=s.replace("data[PRACTICE_ID]={...old,completed:true,perfectSingle:!!old.perfectSingle||!!perfect,verified:true,source:'game-v5',updatedAt:new Date().toISOString(),lastWinner:winner};","data[PRACTICE_ID]={...old,completed:true,pieceEarned:!!old.pieceEarned||gm===1,perfectSingle:!!old.perfectSingle||!!perfect,verified:true,source:'game-v5',updatedAt:new Date().toISOString(),lastMode:gm,lastWinner:winner};",1)
s=s.replace('const p=update(o.perfect,o.winner);','const p=update(gm,o.perfect,o.winner);',1)
hook.write_text(s,encoding='utf-8')

hub=Path('index.html')
h=hub.read_text(encoding='utf-8')
old='''function getCounts(data){
  let completed = 0;
  let perfect = 0;
  practices.forEach(p=>{
    const s = ensureState(data, p.id);
    if(isVerifiedProgressState(s)) completed++;
    if(isVerifiedProgressState(s) && s.perfectSingle) perfect++;
  });
  return {completed, perfect};
}'''
new='''function getCounts(data){
  let completed = 0;
  let perfect = 0;
  let pieces = 0;
  practices.forEach(p=>{
    const s = ensureState(data, p.id);
    if(isVerifiedProgressState(s)) completed++;
    if(isVerifiedProgressState(s) && s.perfectSingle) perfect++;
    if(isVerifiedProgressState(s) && (s.pieceEarned === true || (s.pieceEarned == null && s.perfectSingle === true))) pieces++;
  });
  return {completed, perfect, pieces};
}'''
if old in h:
    h=h.replace(old,new,1)
h=h.replace('document.getElementById("medalFraction").textContent = `${counts.completed} / 11`;','document.getElementById("medalFraction").textContent = `${counts.pieces} / 11`;',1)
h=h.replace('const fill = (counts.completed / TOTAL) * 360;','const fill = (counts.pieces / TOTAL) * 360;',1)
h=h.replace('medalInner.textContent = counts.completed;','medalInner.textContent = counts.pieces;',1)
hub.write_text(h,encoding='utf-8')
print('2P gold and 1P medal pieces are separated consistently.')
