(()=>{
  const script=document.currentScript;
  const id=Number(script?.dataset?.practice||0);
  if(!id)return;
  const guard=`__sportsFiestaAuditFixesV1_${id}`;
  if(window[guard])return;
  window[guard]=true;

  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const shuffled=a=>[...a].sort(()=>Math.random()-.5);

  function fingerprint(q){
    try{
      return JSON.stringify(q,(k,v)=>{
        if(typeof v==='function'||k==='render')return undefined;
        if((k==='options'||k==='o')&&Array.isArray(v))return [...v].map(String).sort();
        return v;
      });
    }catch(_){return String(q?.q??q?.question??q?.title??'')+'|'+String(q?.answer??q?.a??'')}
  }

  // Practice 1: keep every question unique for the whole match, even if a
  // first-to-6 duel needs a second batch. Also make the height context more
  // appropriate for a primary-school estimation/comparison exercise.
  if(id===1&&typeof buildQuestions==='function'){
    const oldBuild=buildQuestions;
    const sessionSeen=new Set();

    function makeReasonableMissingHeight(){
      const tree=pick([6,7,8,9,10,12]);
      const extra=pick([4,5,6,8,10,12]);
      const tower=tree+extra;
      return {
        tag:'Missing height',
        picHTML:visuals([
          objectCard('tree','young tree',`${tree} m tall`),
          objectCard('tower','lookout tower','? m tall')
        ]),
        q:`A lookout tower is ${extra} m taller than the young tree. How tall is the lookout tower?`,
        options:numOptions(tower),
        answer:String(tower),
        explain:`${tree} + ${extra} = ${tower} m.`
      };
    }

    function freshBatch(target){
      const out=[];
      const local=new Set();
      let guard=0;
      while(out.length<target&&guard++<80){
        let batch=oldBuild();
        if(!Array.isArray(batch))break;
        batch=batch.map(q=>q?.tag==='Missing height'?makeReasonableMissingHeight():q);
        for(const q of shuffled(batch)){
          const k=fingerprint(q);
          if(!k||sessionSeen.has(k)||local.has(k))continue;
          local.add(k);out.push(q);
          if(out.length===target)break;
        }
      }
      out.forEach(q=>sessionSeen.add(fingerprint(q)));
      return out;
    }

    buildQuestions=function(){
      const target=typeof TOTAL==='number'?TOTAL:12;
      const out=freshBatch(target);
      if(out.length===target)return shuffled(out);
      console.warn(`Practice 1 generated only ${out.length} fresh questions for this batch.`);
      return shuffled(out);
    };

    const oldRestart=window.restart;
    if(typeof oldRestart==='function'){
      window.restart=function(){sessionSeen.clear();return oldRestart.apply(this,arguments)};
    }
  }

  // Practice 8 (Water Polo): both capacity answer boxes must be completed.
  // If a unit is absent, pupils must enter 0 rather than leaving its box blank.
  if(id===8){
    const requiredMessage='Fill in both blanks. Type 0 if there are no litres or no millilitres.';

    function visibleAnswerInputs(){
      return [...document.querySelectorAll('input')].filter(el=>{
        const type=(el.getAttribute('type')||'text').toLowerCase();
        if(['hidden','button','submit','reset','checkbox','radio'].includes(type))return false;
        if(el.disabled||el.readOnly)return false;
        const style=getComputedStyle(el);
        return style.display!=='none'&&style.visibility!=='hidden'&&el.getClientRects().length>0;
      }).slice(0,2);
    }

    function prepareInputs(){
      const fields=visibleAnswerInputs();
      if(fields.length!==2)return fields;
      fields.forEach(field=>{
        field.required=true;
        field.setAttribute('aria-required','true');
        if(!field.dataset.sfRequiredClear){
          field.dataset.sfRequiredClear='1';
          field.addEventListener('input',()=>field.setCustomValidity(''));
        }
      });
      return fields;
    }

    function blockIfIncomplete(event){
      const fields=prepareInputs();
      if(fields.length!==2)return false;
      const missing=fields.find(field=>field.value.trim()==='');
      if(!missing)return false;
      if(event){
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
      }
      fields.forEach(field=>field.setCustomValidity(''));
      missing.setCustomValidity(requiredMessage);
      missing.focus();
      missing.reportValidity();
      return true;
    }

    document.addEventListener('click',event=>{
      const button=event.target.closest?.('button,input[type="button"],input[type="submit"]');
      if(!button)return;
      const label=(button.textContent||button.value||'').trim().toLowerCase();
      if(label.includes('check answer'))blockIfIncomplete(event);
    },true);

    document.addEventListener('keydown',event=>{
      if(event.key==='Enter'&&visibleAnswerInputs().includes(event.target))blockIfIncomplete(event);
    },true);

    const observer=new MutationObserver(()=>prepareInputs());
    observer.observe(document.documentElement,{childList:true,subtree:true});
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',prepareInputs,{once:true});
    else prepareInputs();
  }

  // Practice 11: keep route distances believable for a school Sports Fiesta.
  if(id===11&&typeof qRouteCompare==='function'){
    qRouteCompare=function(){
      const unitWord=pick(['m','km']);
      const factor=unitWord==='km'?pick([2,3]):pick([2,3,4]);
      const unit=unitWord==='km'?pick([1,2,3]):pick([20,25,30,40,50,60,75,100]);
      const total=factor*unit,diffUnits=factor-1,diff=total-unit;
      return {
        type:'Compare two training routes',
        title:'How much longer is Route A?',
        story:`Route A is <b>${total} ${unitWord}</b> long. Route A is <b>${factor}</b> times as long as Route B. How much longer is Route A than Route B?`,
        render:()=>`<div class="svgWrap">${svgTimes(total,factor)}</div><div class="mathBlock"><div class="sectionTag">Find 1 unit</div><div class="eqLine">${factor} <span>units =</span> ${input('e1')} <span>${unitWord}</span></div><div class="eqLine">1 unit = ${input('e2')} <span>÷</span> ${input('e3','tiny')} <span>=</span> ${input('e4')}</div><div class="sectionTag">Find the difference</div><div class="eqLine">${input('e5','tiny')} <span>units =</span> ${input('e6')} <span>×</span> ${input('e7','tiny')} <span>=</span> ${input('e8')}</div><div class="eqLine">Route A is ${input('e9')} <span>${unitWord} longer than Route B.</span></div></div>`,
        expected:{e1:total,e2:total,e3:factor,e4:unit,e5:diffUnits,e6:unit,e7:diffUnits,e8:diff,e9:diff},
        fields:['e1','e2','e3','e4','e5','e6','e7','e8','e9'],
        commutativePairs:[['e6','e7']],
        explain:`${factor} units = ${total}. So 1 unit = ${total} ÷ ${factor} = ${unit}. The difference is ${diffUnits} units = ${unit} × ${diffUnits} = ${diff}.`
      };
    };
  }
})();
