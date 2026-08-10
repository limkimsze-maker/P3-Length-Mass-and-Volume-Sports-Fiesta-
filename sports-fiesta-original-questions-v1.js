(() => {
  const script = document.currentScript;
  const id = Number(script?.dataset?.practice || 0);
  if (!id || window.__sportsFiestaOriginalQuestionsV1) return;
  window.__sportsFiestaOriginalQuestionsV1 = true;

  const esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rep = (s, from, to) => String(s).replace(new RegExp(esc(from), 'g'), to);
  const repMany = (s, arr, to) => arr.reduce((out, x) => rep(out, x, to), String(s));

  // Practice 1: remove the exact cupboard/book/bus/pen examples from the scanned page.
  if (id === 1 && typeof unitObjects !== 'undefined' && typeof buildQuestions === 'function') {
    unitObjects.splice(0, unitObjects.length,
      {name:'wardrobe',type:'cupboard',value:2,unit:'m',dimension:'height'},
      {name:'magazine',type:'book',value:26,unit:'cm',dimension:'length'},
      {name:'coach',type:'bus',value:11,unit:'m',dimension:'length'},
      {name:'marker pen',type:'pen',value:14,unit:'cm',dimension:'length'},
      {name:'lift door',type:'door',value:2,unit:'m',dimension:'height'},
      {name:'sports bottle',type:'bottle',value:24,unit:'cm',dimension:'height'},
      {name:'school hall',type:'corridor',value:18,unit:'m',dimension:'length'},
      {name:'coloured pencil',type:'pencil',value:17,unit:'cm',dimension:'length'},
      {name:'study table',type:'table',value:1,unit:'m',dimension:'length'},
      {name:'measuring strip',type:'ruler',value:30,unit:'cm',dimension:'length'}
    );
    const oldBuild = buildQuestions;
    buildQuestions = function(){
      const qs = oldBuild();
      const safe = [
        {name:'sports bottle',type:'bottle',measure:'Height ?',q:'Which is the most sensible height of a sports bottle?',ans:'24 cm',ops:['24 cm','24 m','240 m','2 m']},
        {name:'school hall',type:'corridor',measure:'Length ?',q:'Which is the most sensible length of a school hall?',ans:'18 m',ops:['18 m','18 cm','180 cm','1 cm']},
        {name:'study table',type:'table',measure:'Length ?',q:'Which is the most sensible length of a study table?',ans:'1 m',ops:['1 m','1 cm','10 m','100 m']},
        {name:'coloured pencil',type:'pencil',measure:'Length ?',q:'Which is the most sensible length of a coloured pencil?',ans:'17 cm',ops:['17 cm','17 m','170 m','2 m']},
        {name:'bed',type:'bed',measure:'Length ?',q:'Which is the most sensible length of a bed?',ans:'2 m',ops:['2 m','2 cm','20 cm','20 m']}
      ];
      let k = Math.floor(Math.random()*safe.length);
      return qs.map(q => {
        if(q.tag !== 'Estimate length') return q;
        const e = safe[k++ % safe.length];
        return {tag:'Estimate length',picHTML:visuals([objectCard(e.type,e.name,e.measure)]),q:e.q,options:shuffle(e.ops),answer:e.ans,explain:`${e.ans} is a sensible estimate for the ${e.name}.`};
      });
    };
  }

  // Practice 3: use a new set of mass objects and new estimation contexts.
  if (id === 3 && typeof objs !== 'undefined' && typeof build === 'function') {
    objs.splice(0, objs.length,
      {n:'pumpkin',e:'🎃',m:3,u:'kg'},
      {n:'travel bag',e:'🧳',m:2,u:'kg'},
      {n:'bag of potatoes',e:'🥔',m:5,u:'kg'},
      {n:'small dog',e:'🐕',m:6,u:'kg'},
      {n:'magazine',e:'📰',m:350,u:'g'},
      {n:'pear',e:'🍐',m:160,u:'g'},
      {n:'lemon',e:'🍋',m:120,u:'g'},
      {n:'crayon box',e:'🖍️',m:280,u:'g'},
      {n:'shampoo bottle',e:'🧴',m:650,u:'g'},
      {n:'crackers',e:'🥨',m:240,u:'g'}
    );
    const oldBuild = build;
    build = function(){
      let n = 0;
      return oldBuild().map(q => {
        if(q.t !== 'Estimate mass') return q;
        if((n++ % 2) === 0){
          return {t:'Estimate mass',q:'Which is the most sensible mass for a travel bag?',v:`<div class="masspair">${card({n:'travel bag',e:'🧳'},'Mass ?')}</div>`,o:sh(['2 kg','2 g','200 g','20 kg']),a:'2 kg',x:'2 kg is a sensible estimate for a travel bag.'};
        }
        return {t:'Estimate mass',q:'Which is the most sensible mass for a pear?',v:`<div class="masspair">${card({n:'pear',e:'🍐'},'Mass ?')}</div>`,o:sh(['160 g','160 kg','16 kg','2 kg']),a:'160 g',x:'160 g is a sensible estimate for a pear.'};
      });
    };
  }

  // Practice 5: keep the generated conversions, but remove worksheet-specific phrasing.
  if (id === 5) {
    const p = document.querySelector('#home .intro p');
    if (p) p.innerHTML = 'Practise converting between <b>kilograms and grams</b> using clear, guided conversion steps.';
    const hint = document.querySelector('.diffHint');
    if (hint) hint.innerHTML = '<b>Easy</b>: more helper steps shown.<br><b>Intermediate</b>: guided working with one step at a time.<br><b>Hard</b>: no helper steps — convert directly.';
  }

  // Practice 7: change the scanned-page-style juice context while keeping scale-reading skill.
  if (id === 7 && typeof makeJugQuestion === 'function') {
    const oldJug = makeJugQuestion;
    makeJugQuestion = function(){
      const q = oldJug();
      q.question = 'What is the total volume of orange drink in the measuring jug?';
      q.explain = rep(q.explain, 'the jug contains', 'the measuring jug contains');
      return q;
    };
    const li = document.querySelector('.preview li');
    if(li) li.textContent = 'Find the volume of orange drink in a measuring jug';
    const q0 = document.getElementById('question');
    if(q0) q0.textContent = 'What is the total volume of orange drink in the measuring jug?';
  }

  // Practice 9: keep the maths, but replace worksheet wording and product contexts.
  if (id === 9 && typeof makeGroupedItems === 'function') {
    const p = document.querySelector('#home .intro p');
    if(p) p.innerHTML = 'Practise <b>litres and millilitres</b> using fresh Sports Fiesta examples and generated values.';
    if (typeof bottleSVG === 'function') {
      const oldBottle = bottleSVG;
      bottleSVG = function(label, kind='bottle'){
        return rep(oldBottle(label,kind), '>Milk<', '>Drink<');
      };
    }
    const oldGrouped = makeGroupedItems;
    makeGroupedItems = function(){
      const q = oldGrouped();
      const oldRender = q.render;
      q.render = () => {
        let h = oldRender();
        h = rep(h, 'Total volume of milk', 'Total volume of sports drink');
        h = rep(h, 'Volume of juice in the tank', 'Water in the team cooler');
        h = rep(h, 'big cartons', 'large bottles');
        h = rep(h, 'small cartons', 'small bottles');
        return h;
      };
      q.helper = rep(rep(rep(q.helper,'big milk carton','large sports drink bottle'),'small carton','small bottle'),'juice','water');
      q.explain = rep(rep(q.explain,'milk','sports drink'),'juice','water');
      return q;
    };
  }

  // Practice 10: rewrite all three narrative problem families while preserving the same maths and bar-model structure.
  if (id === 10) {
    const people = ['Sarah','Aisha','Ben','Ryan','Mia','Ethan','Siti','Noah'];
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
    if (typeof makeRunQuestion === 'function') {
      const oldRun = makeRunQuestion;
      makeRunQuestion = function(){
        const q = oldRun();
        const long = q.expected.a1, diff = q.expected.a2, short = q.expected.a3;
        const oldStory = q.story;
        const name = (oldStory.match(/^([^<]+) ran/)||[])[1] || '';
        const foundDays = [...oldStory.matchAll(/on ([A-Z][a-z]+)/g)].map(m=>m[1]);
        const d1 = foundDays[0] || 'Monday', d2 = foundDays[1] || 'Tuesday';
        q.type = 'Compare two training laps';
        q.title = 'How far was the shorter training lap?';
        q.story = `During Sports Fiesta training, a runner covered <b>${long} m</b> on Lap 1. Lap 1 was <b>${diff} m</b> longer than Lap 2. How far was Lap 2?`;
        const oldRender = q.render;
        q.render = () => {
          let h = oldRender();
          if(name) h = rep(h,name,'The runner');
          h = rep(h,d1,'Lap 1');
          h = rep(h,d2,'Lap 2');
          return h;
        };
        return q;
      };
    }
    if (typeof makeContainerQuestion === 'function') {
      const oldContainer = makeContainerQuestion;
      makeContainerQuestion = function(){
        const q = oldContainer();
        const total = q.expected.b1, content = q.expected.b2;
        q.type = 'Find the empty equipment-box mass';
        q.title = 'What is the mass of the empty equipment box?';
        q.story = `A Sports Fiesta equipment box contains <b>${content} kg</b> of training gear. The box and the gear have a total mass of <b>${total} kg</b>. What is the mass of the empty box?`;
        return q;
      };
    }
    if (typeof makeRibbonQuestion === 'function') {
      const oldRibbon = makeRibbonQuestion;
      makeRibbonQuestion = function(){
        const q = oldRibbon();
        const b = q.expected.c1, total = q.expected.c4, a = total-b, extra = b-a;
        q.type = 'Compare streamer lengths and total';
        q.title = 'How long are the Sports Fiesta streamers?';
        q.story = `Streamer A is <b>${a} cm</b> long. Streamer B is <b>${extra} cm</b> longer than Streamer A.<br>(a) How long is Streamer B?<br>(b) What is the total length of both streamers?`;
        const oldRender = q.render;
        q.render = () => rep(rep(oldRender(),'Ribbon A','Streamer A'),'Ribbon B','Streamer B');
        q.explain = rep(rep(q.explain,'Ribbon B','Streamer B'),'Ribbon A','Streamer A');
        return q;
      };
    }
    const p = document.querySelector('#home .intro p');
    if(p) p.textContent = 'Solve original Sports Fiesta word problems using number sentences and bar models.';
  }

  // Practice 11: rewrite all five multi-step contexts while keeping the mathematical structures.
  if (id === 11) {
    const allNames = ['Ahmad','Sarah','Mia','Noah','Aisha','Ben','Tom','Siti','Ryan','Ethan','Fazlee','Irfan','Gopal','Lina','Hana','Hassan','Andy','Michael'];
    const groupA = ['Fazlee','Aisha','Mia','Noah','Sarah','Irfan'];
    const groupB = ['Gopal','Ryan','Ben','Lina','Ethan','Hana'];
    const routeA = ['Andy','Sarah','Mia','Ryan','Aisha','Noah'];
    const routeB = ['Michael','Ben','Tom','Lina','Hana','Ethan'];
    const wrapNames = (fn, replacement) => {
      const old = fn;
      return function(){
        const q = old();
        const r = q.render;
        q.render = () => repMany(r(), allNames, replacement);
        return q;
      };
    };
    if (typeof qMilkLeft === 'function') {
      const old = qMilkLeft;
      qMilkLeft = function(){
        const q = old();
        const a=q.expected.a1,b=q.expected.a2,total=q.expected.a5;
        q.type='Two-step volume at a drink station';
        q.title='How much drink was served and left?';
        q.story=`A Sports Fiesta drink cooler held <b>${total} ml</b> of fruit drink. The team served <b>${a} ml</b> during the first break and <b>${b} ml</b> during the second break.<br>(i) How much drink was served altogether?<br>(ii) What volume was left in the cooler?`;
        const r=q.render;q.render=()=>repMany(r(),allNames,'The team');
        return q;
      };
    }
    if (typeof qPackets === 'function') {
      const old = qPackets;
      qPackets = function(){
        const q=old(),total=q.expected.b1,used=q.expected.b2,packets=q.expected.b6;
        q.type='Share sports drink powder equally';
        q.title='How much powder went into each team packet?';
        q.story=`A helper prepared <b>${total} g</b> of sports drink powder. After setting aside <b>${used} g</b>, the rest was shared equally among <b>${packets}</b> team packets. What mass of powder went into each packet?`;
        const r=q.render;q.render=()=>repMany(r(),allNames,'The helper');
        return q;
      };
    }
    if (typeof qBottlesTotal === 'function') {
      const old = qBottlesTotal;
      qBottlesTotal = function(){
        const q=old(),bottles=q.expected.c1,each=q.expected.c2,second=q.expected.c6;
        q.type='Water-station total in l and ml';
        q.title='How much water is at the station altogether?';
        q.story=`Each blue-team bottle holds <b>${each} ml</b> of water. There are <b>${bottles}</b> blue-team bottles. A red-team jug contains another <b>${second} ml</b>. How much water is there altogether? Give your answer in litres and millilitres.`;
        const r=q.render;q.render=()=>{
          let h=r();
          h=groupA.reduce((o,n)=>rep(o,n,'Blue team'),h);
          h=groupB.reduce((o,n)=>rep(o,n,'Red team'),h);
          return h;
        };
        return q;
      };
    }
    if (typeof qBagsLeft === 'function') {
      const old=qBagsLeft;
      qBagsLeft=function(){
        const q=old(),bags=q.expected.d1,moved=q.expected.d2,unit=q.expected.d5;
        q.type='Training-marker bags left';
        q.title='What is the mass of the marker bags left?';
        q.story=`A team had <b>${bags}</b> bags of soft training markers. Each bag had a mass of <b>${unit} g</b>. <b>${moved}</b> bags were moved to another activity station. What was the mass of the bags left?`;
        const r=q.render;q.render=()=>repMany(r(),allNames,'The team');
        return q;
      };
    }
    if (typeof qTimesDifference === 'function') {
      const old=qTimesDifference;
      qTimesDifference=function(){
        const q=old(),total=q.expected.e1,factor=q.expected.e3,diff=q.expected.e8;
        const unitWord=(q.story.match(/<b>\d+\s*(km|m)<\/b>/)||[])[1]||'m';
        q.type='Compare two training routes';
        q.title='How much longer is Route A?';
        q.story=`Route A is <b>${total} ${unitWord}</b> long. Route A is <b>${factor}</b> times as long as Route B. How much longer is Route A than Route B?`;
        const r=q.render;q.render=()=>{
          let h=r();
          h=routeA.reduce((o,n)=>rep(o,n,'Route A'),h);
          h=routeB.reduce((o,n)=>rep(o,n,'Route B'),h);
          return h;
        };
        return q;
      };
    }
    const p=document.querySelector('#home .intro p');
    if(p) p.textContent='Answer original Sports Fiesta multi-step word problems using familiar mathematical strategies.';
  }
})();
