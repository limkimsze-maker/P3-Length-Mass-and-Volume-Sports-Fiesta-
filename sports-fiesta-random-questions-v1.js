(() => {
  const script = document.currentScript;
  const id = Number(script?.dataset?.practice || 0);
  if (!id) return;
  const guard = `__sportsFiestaRandomQuestionsV1_${id}`;
  if (window[guard]) return;
  window[guard] = true;

  const rand = n => Math.floor(Math.random() * n);
  const pickOne = arr => arr[rand(arr.length)];
  const shuffled = arr => [...arr].sort(() => Math.random() - .5);

  function groupOf(q) {
    return String(q?.tag ?? q?.t ?? q?.type ?? q?.badge ?? q?.kind ?? q?.prompt ?? 'Mixed');
  }

  function fingerprint(q) {
    try {
      return JSON.stringify(q, (k, v) => {
        if (typeof v === 'function') return undefined;
        if (k === 'render') return undefined;
        return v;
      });
    } catch (_) {
      return String(q?.question ?? q?.q ?? q?.title ?? q?.prompt ?? '') + '|' +
             String(q?.answer ?? q?.a ?? '') + '|' + JSON.stringify(q?.expected ?? {});
    }
  }

  function balancedUnique(oldBuild, extraBatches = 7) {
    return function(...args) {
      const base = oldBuild.apply(this, args);
      if (!Array.isArray(base) || base.length < 2) return base;

      const target = base.length;
      const wanted = new Map();
      base.forEach(q => wanted.set(groupOf(q), (wanted.get(groupOf(q)) || 0) + 1));

      const pools = new Map();
      const seen = new Map();
      const addBatch = batch => {
        if (!Array.isArray(batch)) return;
        for (const q of batch) {
          const g = groupOf(q), f = fingerprint(q);
          if (!pools.has(g)) { pools.set(g, []); seen.set(g, new Set()); }
          if (!seen.get(g).has(f)) {
            seen.get(g).add(f);
            pools.get(g).push(q);
          }
        }
      };

      addBatch(base);
      for (let i = 0; i < extraBatches; i++) addBatch(oldBuild.apply(this, args));

      let out = [];
      for (const [g, count] of wanted.entries()) {
        const candidates = shuffled(pools.get(g) || []);
        out.push(...candidates.slice(0, count));
      }

      const used = new Set(out.map(fingerprint));
      let tries = 0;
      while (out.length < target && tries++ < 30) {
        const batch = oldBuild.apply(this, args);
        for (const q of batch) {
          const f = fingerprint(q);
          if (!used.has(f)) {
            used.add(f);
            out.push(q);
            if (out.length === target) break;
          }
        }
      }

      if (out.length < target) {
        for (const q of base) {
          if (out.length === target) break;
          out.push(q);
        }
      }
      return shuffled(out.slice(0, target));
    };
  }

  if (id === 1 && typeof unitObjects !== 'undefined' && typeof buildQuestions === 'function') {
    const extras = [
      {name:'exercise book',type:'book',value:29,unit:'cm',dimension:'length'},
      {name:'school shoe',type:'shoe',value:24,unit:'cm',dimension:'length'},
      {name:'lunch box',type:'box',value:20,unit:'cm',dimension:'length'},
      {name:'classroom whiteboard',type:'table',value:2,unit:'m',dimension:'length'},
      {name:'playground bench',type:'table',value:2,unit:'m',dimension:'length'},
      {name:'young tree',type:'tree',value:3,unit:'m',dimension:'height'},
      {name:'park lamp post',type:'lamp',value:6,unit:'m',dimension:'height'},
      {name:'sports hall entrance',type:'school',value:8,unit:'m',dimension:'height'}
    ];
    const names = new Set(unitObjects.map(x => x.name));
    extras.forEach(x => { if (!names.has(x.name)) unitObjects.push(x); });

    const estimatePool = [
      {name:'sports bottle',type:'bottle',measure:'Height ?',ans:'24 cm',ops:['24 cm','24 m','240 m','2 m']},
      {name:'exercise book',type:'book',measure:'Length ?',ans:'29 cm',ops:['29 cm','29 m','290 m','3 m']},
      {name:'school shoe',type:'shoe',measure:'Length ?',ans:'24 cm',ops:['24 cm','24 m','240 m','2 m']},
      {name:'lunch box',type:'box',measure:'Length ?',ans:'20 cm',ops:['20 cm','20 m','200 m','2 m']},
      {name:'classroom doorway',type:'door',measure:'Height ?',ans:'2 m',ops:['2 m','2 cm','20 cm','20 m']},
      {name:'single bed',type:'bed',measure:'Length ?',ans:'2 m',ops:['2 m','2 cm','20 cm','20 m']},
      {name:'study table',type:'table',measure:'Length ?',ans:'1 m',ops:['1 m','1 cm','10 m','100 m']},
      {name:'measuring ruler',type:'ruler',measure:'Length ?',ans:'30 cm',ops:['30 cm','30 m','3 m','300 m']},
      {name:'young tree',type:'tree',measure:'Height ?',ans:'3 m',ops:['3 m','3 cm','30 cm','30 m']},
      {name:'park lamp post',type:'lamp',measure:'Height ?',ans:'6 m',ops:['6 m','6 cm','60 cm','60 m']}
    ];

    const old = balancedUnique(buildQuestions, 8);
    buildQuestions = function(...args) {
      let qs = old.apply(this, args);
      const selected = shuffled(estimatePool);
      let k = 0;
      qs = qs.map(q => {
        if (q.tag !== 'Estimate length') return q;
        const e = selected[k++ % selected.length];
        return {
          tag:'Estimate length',
          picHTML:visuals([objectCard(e.type,e.name,e.measure)]),
          q:`Which is the most sensible ${e.measure.toLowerCase().replace(' ?','')} of a ${e.name}?`,
          options:shuffle(e.ops), answer:e.ans,
          explain:`${e.ans} is a sensible estimate for the ${e.name}.`
        };
      });
      return shuffled(qs);
    };
  }

  if (id === 3 && typeof objs !== 'undefined' && typeof build === 'function') {
    const fresh = [
      {n:'pumpkin',e:'🎃',m:3,u:'kg'}, {n:'school bag',e:'🎒',m:4,u:'kg'},
      {n:'bag of rice',e:'🍚',m:5,u:'kg'}, {n:'small dog',e:'🐕',m:6,u:'kg'},
      {n:'watermelon',e:'🍉',m:3,u:'kg'}, {n:'travel bag',e:'🧳',m:7,u:'kg'},
      {n:'magazine',e:'📰',m:350,u:'g'}, {n:'pear',e:'🍐',m:160,u:'g'},
      {n:'lemon',e:'🍋',m:120,u:'g'}, {n:'crayon box',e:'🖍️',m:280,u:'g'},
      {n:'shampoo bottle',e:'🧴',m:650,u:'g'}, {n:'packet of crackers',e:'🥨',m:240,u:'g'}
    ];
    objs.splice(0, objs.length, ...fresh);

    const estimates = [
      {n:'bowling ball',e:'🎳',a:'4 kg',o:['4 kg','4 g','400 g','40 kg']},
      {n:'school bag',e:'🎒',a:'4 kg',o:['4 kg','4 g','400 g','40 kg']},
      {n:'watermelon',e:'🍉',a:'3 kg',o:['3 kg','3 g','300 g','30 kg']},
      {n:'small dog',e:'🐕',a:'6 kg',o:['6 kg','6 g','600 g','60 kg']},
      {n:'tennis ball',e:'🎾',a:'60 g',o:['60 g','60 kg','600 g','6 kg']},
      {n:'pear',e:'🍐',a:'160 g',o:['160 g','160 kg','16 kg','2 kg']},
      {n:'magazine',e:'📰',a:'350 g',o:['350 g','350 kg','35 kg','3 kg']},
      {n:'crayon box',e:'🖍️',a:'280 g',o:['280 g','280 kg','28 kg','2 kg']}
    ];

    const old = balancedUnique(build, 8);
    build = function(...args) {
      let qs = old.apply(this, args);
      const selected = shuffled(estimates);
      let k = 0;
      return shuffled(qs.map(q => {
        if (q.t !== 'Estimate mass') return q;
        const e = selected[k++ % selected.length];
        return {t:'Estimate mass',q:`Which is the most sensible mass for a ${e.n}?`,v:`<div class="masspair">${card({n:e.n,e:e.e},'Mass ?')}</div>`,o:sh(e.o),a:e.a,x:`${e.a} is a sensible estimate for a ${e.n}.`};
      }));
    };
  }

  if (id === 4 && typeof buildQuestions === 'function') {
    buildQuestions = function() {
      const values = [];
      for (let kg = 0; kg <= 4; kg++) {
        const band = Array.from({length:9}, (_,i) => kg*1000 + (i+1)*100).filter(v => v <= 4900);
        values.push(...shuffled(band).slice(0, 2));
      }
      return shuffled(values).slice(0, typeof TOTAL === 'number' ? TOTAL : 10).map(totalGrams => ({
        totalGrams, kg:Math.floor(totalGrams/1000), g:totalGrams%1000
      }));
    };
  }

  if (id === 11 && typeof qRouteCompare === 'function') {
    qRouteCompare = function() {
      const unitWord = pick(['m','km']);
      const factor = unitWord === 'km' ? pick([2,3]) : pick([2,3,4]);
      const unit = unitWord === 'km' ? pick([2,3,4,5,6,8]) : pick([20,25,30,40,50,60,75,100]);
      const total = factor*unit, diffUnits=factor-1, diff=total-unit;
      return {type:'Compare two training routes',title:'How much longer is Route A?',story:`Route A is <b>${total} ${unitWord}</b> long. Route A is <b>${factor}</b> times as long as Route B. How much longer is Route A than Route B?`,render:()=>`<div class="svgWrap">${svgTimes(total,factor)}</div><div class="mathBlock"><div class="sectionTag">Find 1 unit</div><div class="eqLine">${factor} <span>units =</span> ${input('e1')} <span>${unitWord}</span></div><div class="eqLine">1 unit = ${input('e2')} <span>÷</span> ${input('e3','tiny')} <span>=</span> ${input('e4')}</div><div class="sectionTag">Find the difference</div><div class="eqLine">${input('e5','tiny')} <span>units =</span> ${input('e6')} <span>×</span> ${input('e7','tiny')} <span>=</span> ${input('e8')}</div><div class="eqLine">Route A is ${input('e9')} <span>${unitWord} longer than Route B.</span></div></div>`,expected:{e1:total,e2:total,e3:factor,e4:unit,e5:diffUnits,e6:unit,e7:diffUnits,e8:diff,e9:diff},fields:['e1','e2','e3','e4','e5','e6','e7','e8','e9'],commutativePairs:[['e6','e7']],explain:`${factor} units = ${total}. So 1 unit = ${total} ÷ ${factor} = ${unit}. The difference is ${diffUnits} units = ${unit} × ${diffUnits} = ${diff}.`};
    };
  }

  if (![1,3,4].includes(id)) {
    if (typeof buildQuestions === 'function') buildQuestions = balancedUnique(buildQuestions, 8);
  }
})();