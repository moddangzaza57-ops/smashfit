'use strict';
/* ================= วันที่ ================= */
const p2=n=>String(n).padStart(2,'0');
const ds=d=>`${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}`;
const pd=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const addD=(s,n)=>{const d=pd(s);d.setDate(d.getDate()+n);return ds(d)};
const mon=s=>{const d=pd(s);d.setDate(d.getDate()-((d.getDay()+6)%7));return ds(d)};
const today=()=>ds(new Date());
const dayDiff=(a,b)=>Math.round((pd(b)-pd(a))/864e5);
const thd=s=>{const d=pd(s);return `${DNF[d.getDay()]} ${d.getDate()} ${TM[d.getMonth()]}`};
const sdd=s=>{const d=pd(s);return `${d.getDate()}/${d.getMonth()+1}`};

/* ================= State ================= */
function defState(){return {settings:{level:'inter',goal:'power',start:mon(today()),dumbbells:'2, 4, 6, 8, 10, 12',rtSpd:'mid',voice:true,tourn:'',lastBackup:'',onboarded:false,theme:'auto',accent:'green',textSize:1,tick:true,loud:true},week:{...PRESETS.balanced.w,5:'game'},overrides:{},checkins:{},logs:[],lastW:{},drafts:{},pain:{},tests:[],swaps:{},health:{},budget:{}}}
function normalize(s){
  const d=defState(),hadOnb=!!(s.settings&&'onboarded' in s.settings);s.settings=Object.assign(d.settings,s.settings||{});
  // ผู้ใช้เดิม (ก่อนมีหน้าต้อนรับ) ที่มีข้อมูลแล้ว ไม่ต้องเห็นหน้าต้อนรับ
  if(!hadOnb)s.settings.onboarded=!!((s.logs&&s.logs.length)||Object.keys(s.checkins||{}).length||Object.keys(s.drafts||{}).length);
  if(s.settings.rtVoice===false&&s.voice==null)s.settings.voice=false;
  ['overrides','checkins','lastW','drafts','pain','swaps','health','budget'].forEach(k=>s[k]=(s[k]&&typeof s[k]==='object'&&!Array.isArray(s[k]))?s[k]:{});
  s.logs=Array.isArray(s.logs)?s.logs:[];s.tests=Array.isArray(s.tests)?s.tests:[];
  // ป้องกันข้อมูลเสีย/ไฟล์สำรองผิดรูปแบบทำให้แอปพัง (ค่าเพี้ยน → ใช้ค่าเริ่มต้น ข้อมูลอื่นยังอยู่)
  const st=s.settings,isD=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(pd(v));
  if(!isD(st.start))st.start=mon(today());
  if(st.tourn&&!isD(st.tourn))st.tourn='';
  if(!['beg','inter','adv'].includes(st.level))st.level='inter';
  if(!['power','endurance','prevention'].includes(st.goal))st.goal='power';
  if(!['slow','mid','fast'].includes(st.rtSpd))st.rtSpd='mid';
  st.dumbbells=String(st.dumbbells??'2, 4, 6, 8, 10, 12');
  const okT=t=>typeof t==='string'&&TYPES[t]&&t!=='game'&&!TYPES[t].extra;
  if(!s.week||typeof s.week!=='object')s.week=d.week;
  for(let i=0;i<7;i++){if(i===GAME_DOW)s.week[i]='game';else if(!okT(s.week[i]))s.week[i]='rest'}
  for(const k in s.overrides)if(!isD(k)||!okT(s.overrides[k]))delete s.overrides[k];
  s.logs=s.logs.filter(l=>l&&typeof l==='object'&&isD(l.date)&&typeof l.type==='string');
  s.logs.forEach(l=>{['minutes','rpe','load'].forEach(f=>{l[f]=+l[f]||0})});
  s.tests=s.tests.filter(t=>t&&isD(t.date)&&t.r&&typeof t.r==='object');
  for(const k in s.lastW){const v=s.lastW[k];if(!v||isNaN(+v.w))delete s.lastW[k];else v.w=+v.w}
  for(const k in s.budget)if(![20,30,45].includes(+s.budget[k]))delete s.budget[k];
  return s;
}
let state;
try{state=JSON.parse(localStorage.getItem(KEY))}catch(e){state=null}
state=state&&state.week?normalize(state):defState();
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
(function(){const lim=addD(today(),-14);for(const k in state.drafts){if(k.split('|')[0]<lim)delete state.drafts[k]}
  ['overrides','swaps','budget'].forEach(o=>{for(const k in state[o]){if(k<lim)delete state[o][k]}})})();

const FRAMED=(()=>{try{return window.top!==window.self}catch(e){return true}})();
let view='today',sel=today(),cur=null,rpeSel=0,gRpe=0,deskMode=false,gMist=new Set(),libCat='',anim=null;

/* ================= ตัวช่วยคำนวณ ================= */
const typeOf=date=>{const dow=pd(date).getDay();if(dow===GAME_DOW)return 'game';return state.overrides[date]||state.week[dow]||'rest'};
function phaseIdx(date){const w=Math.floor(dayDiff(mon(state.settings.start),mon(date))/7);return (((w%4)+4)%4)||0}
const weekLoad=wk=>state.logs.filter(l=>mon(l.date)===wk).reduce((a,l)=>a+(l.load||0),0);
function acwr(date){const wk=mon(date),c=weekLoad(wk);const prev=[1,2,3].map(i=>weekLoad(addD(wk,-7*i))).filter(x=>x>0);if(prev.length<2)return null;const avg=prev.reduce((a,b)=>a+b,0)/prev.length;return {ratio:c/avg,cur:c,avg}}
const sleepScore=h=>h>=8?5:h>=7?4:h>=6?3:h>=5?2:1;
function readiness(date){const c=state.checkins[date];if(!c||!c.sleep||!c.energy||!c.sore)return null;return {score:c.sleep+c.energy+(6-c.sore)}}
function rhrBase(date){const v=[];for(let i=1;i<=14;i++){const h=state.health[addD(date,-i)];if(h&&h.rhr)v.push(h.rhr)}return v.length>=3?v.reduce((a,b)=>a+b,0)/v.length:null}
function tournDays(date){const t=state.settings.tourn;if(!t)return null;const d=dayDiff(date,t);return d>=0?d:null}
function activePain(date){
  const out={};
  for(const a in AREAS){for(let i=0;i<=10;i++){const p=state.pain[addD(date,-i)];if(p&&p[a]!=null){if(p[a]>0)out[a]=p[a];break}}}
  return out;
}
const riskAreas=(id,pain,min=3)=>Object.keys(pain).filter(a=>pain[a]>=min&&RISK[a].includes(id));
function ctxAdjust(date,type){
  const T=TYPES[type],dow=pd(date).getDay(),o={mult:1,noPlyo:false,notes:[]};
  if(!T||!T.legs||T.load<2||type==='game')return o;
  const to=(GAME_DOW-dow+7)%7,af=(dow-GAME_DOW+7)%7;
  if(to===1){o.mult*=.5;o.noPlyo=true;o.notes.push('พรุ่งนี้ตีเกม 🏸 ลดปริมาณครึ่งหนึ่ง ตัดท่ากระโดด ใช้น้ำหนักเบา ให้ขาสดในวันศุกร์')}
  else if(to===2&&T.load>=3){o.mult*=.8;o.notes.push('อีก 2 วันตีเกม — ลดปริมาณงานขา 20%')}
  if(af===1){o.mult*=.7;o.notes.push('เมื่อวานตีเกม ขายังล้า — ลด 30% (ถ้าปวดมากเปลี่ยนเป็นยืดเหยียด)')}
  else{const pt=typeOf(addD(date,-1));if(pt!=='game'&&TYPES[pt]&&TYPES[pt].legs&&TYPES[pt].load>=3&&T.load>=3){o.mult*=.85;o.notes.push(`เมื่อวานเล่นขาหนัก (${TYPES[pt].n}) — ลด 15%`)}}
  return o;
}
function subst(it,alt,ctx){
  const n={...it,id:alt,orig:it.orig||it.id},fo=EX[it.id][2],fn=EX[alt][2];
  if(!!fo.t!==!!fn.t){n.v=fn.t?30:10;delete n.hi;delete n.rir}
  if(fn.db&&!it.db)Object.assign(n,{db:1,v:ctx.P.lo,hi:ctx.P.hi,rir:ctx.P.rir,rest:ctx.P.rest});
  if(!fn.db&&it.db){delete n.db;delete n.hi;delete n.rir;n.v=fn.t?30:12}
  return n;
}
function estSec(it){const f=EX[it.id][2],reps=it.hi?(it.v+it.hi)/2:it.v;let w=f.t?it.v:reps*(it.db?4:3);if(f.u)w*=2;return it.sets*(w+(it.rest||0))+15}
const estMin=blocks=>Math.round(blocks.reduce((a,b)=>a+b.items.reduce((x,it)=>x+estSec(it),0),0)/60);
function trimTo(blocks,B){
  const est=()=>estMin(blocks);let guard=200;
  const items=pr=>blocks.flatMap(b=>(b.pr||(b.fixed?0:1))===pr?b.items.map(it=>({b,it})):[]);
  while(est()>B&&guard--){
    const p3=items(3);if(p3.length){const x=p3[p3.length-1];x.b.items.pop();continue}
    const fx=blocks.find(b=>b.fixed&&b.items.length>(b===blocks[0]?3:1));if(fx){fx.items.pop();continue}
    const r2=items(2).filter(x=>x.it.sets>1).sort((a,b)=>b.it.sets-a.it.sets)[0];if(r2){r2.it.sets--;continue}
    const d2=items(2);if(d2.length){const x=d2[d2.length-1];x.b.items.splice(x.b.items.indexOf(x.it),1);continue}
    const r1=items(1).filter(x=>x.it.sets>2).sort((a,b)=>b.it.sets-a.it.sets)[0];if(r1){r1.it.sets--;continue}
    const r0=items(1).filter(x=>x.it.sets>1).sort((a,b)=>b.it.sets-a.it.sets)[0];if(r0){r0.it.sets--;continue}
    break;
  }
  return blocks.filter(b=>b.items.length);
}
function buildSession(date,forced){
  const type=forced||typeOf(date),ph=phaseIdx(date),P=PH[ph];
  const s={date,type,ph,notes:[],blocks:[],swap:false,est:0};
  const pain=activePain(date),painA=Object.keys(pain),td=tournDays(date);
  const ctx={ph,P,level:state.settings.level};
  if(painA.length){const hi=painA.filter(a=>pain[a]>=6);
    if(hi.length)s.notes.push({t:`⚠️ ปวด${hi.map(a=>AREAS[a]).join(', ')} ระดับสูง — พักส่วนนี้ ถ้าไม่ดีขึ้นใน 1–2 สัปดาห์ หรือบวม/ชา ควรพบแพทย์หรือนักกายภาพ`,bad:1});}
  if(td!=null&&td<=10){
    if(td===0)s.notes.push({t:'🏆 วันแข่งรายการ! ทำแค่วอร์มอัพเบาๆ เก็บแรงไว้แข่ง',bad:1});
    else s.notes.push({t:`🏆 อีก ${td} วันแข่ง — ช่วงลดปริมาณ (Taper) คงความหนักแต่ลดจำนวนเซ็ต`});
  }
  let blocks;
  if(type==='game'){blocks=[GAME_WARM,GAME_COOL].map(b=>({...b,items:b.items.map(i=>({...i}))}));
    if(painA.length&&!painA.some(a=>pain[a]>=6))s.notes.push({t:`มีอาการเจ็บ${painA.map(a=>AREAS[a]).join(', ')} — เล่นได้แต่ฟังร่างกาย ลดเกมถ้าเจ็บเพิ่ม`});}
  else if(type==='rest')return s;
  else{
    const c=ctxAdjust(date,type);let mult=c.mult,noP=c.noPlyo;c.notes.forEach(t=>s.notes.push({t}));
    if(td!=null&&td<=10&&type!=='desk'){
      if(td<=2){mult*=.4;noP=true;s.swap=true}else if(TYPES[type].load>=2)mult*=.6;
      if(type==='cardio'&&td<=5)mult*=.5;
    }
    const r=readiness(date),hh=state.health[date]||{},base=rhrBase(date);
    if(type!=='mobility'&&type!=='desk'){
      if(r){
        if(r.score>=12)s.notes.push({t:`ความพร้อม ${r.score}/15 ดีมาก — ทำเต็มโปรแกรมได้`,good:1});
        else if(r.score>=9){mult*=.85;s.notes.push({t:`ความพร้อม ${r.score}/15 ปานกลาง — ลดเซ็ต 15%`})}
        else if(r.score>=6){mult*=.7;noP=true;s.notes.push({t:`ความพร้อม ${r.score}/15 ต่ำ — ลดเซ็ต 30% และตัดท่ากระโดด`})}
        else{mult*=.6;noP=true;s.swap=true;s.notes.push({t:`ความพร้อม ${r.score}/15 ต่ำมาก — แนะนำเปลี่ยนเป็นวันยืดเหยียด`})}
      }
      if(hh.rhr&&base&&hh.rhr>=base+5){mult*=.9;s.notes.push({t:`ชีพจรตอนตื่น ${hh.rhr} สูงกว่าปกติ (~${Math.round(base)}) — ร่างกายอาจยังไม่ฟื้น ลด 10%`})}
      const a=acwr(date);
      if(a&&a.ratio>1.3&&TYPES[type].load>=2){mult*=.85;s.notes.push({t:`ภาระสัปดาห์นี้สูงกว่าค่าเฉลี่ย ${Math.round((a.ratio-1)*100)}% — ลด 15% เพื่อเลี่ยงบาดเจ็บ`})}
    }
    blocks=TPL[type](ctx).map(b=>({...b,items:b.items.map(i=>({...i}))}));
    const g=state.settings.goal,{P:Pl,R}=mk(ctx);
    if(g==='power'&&(type==='lower'||type==='full'))blocks.splice(1,0,{t:'⚡ พลังระเบิด (ตามเป้าหมาย)',pr:3,items:[Pl('pogo',20),Pl('skater',4)]});
    if(g==='endurance'&&['lower','upper','full','footwork'].includes(type))blocks.splice(blocks.length-1,0,{t:'🔥 Finisher ความอึด (ตามเป้าหมาย)',pr:3,items:[R('shadow_int',30,30)]});
    if(g==='prevention'&&!['prehab','mobility','desk'].includes(type))blocks.splice(blocks.length-1,0,{t:'🛡️ ป้องกันบาดเจ็บ (ตามเป้าหมาย)',pr:3,items:[I('ext_rot',2,15,30),I('prosup',2,12,30),I('tib',2,15,30)]});
    s._mult=mult;s._noP=noP;
  }
  // ระบุตำแหน่งท่าแบบคงที่ (ใช้เก็บข้อมูลที่บันทึก)
  blocks.forEach((b,bi)=>b.items.forEach((it,ii)=>it.slot=`${bi}-${ii}`));
  // ท่าที่ผู้ใช้เปลี่ยนเอง
  const sw=state.swaps[date]||{};
  blocks=blocks.map(b=>({...b,items:b.items.map(it=>sw[it.slot]&&EX[sw[it.slot]]?subst(it,sw[it.slot],ctx):it)}));
  // อาการเจ็บ → เปลี่ยน/ตัดท่า
  if(painA.length){let subN=[],rem=[];const used=new Set(blocks.flatMap(b=>b.items.map(i=>i.id)));
    blocks=blocks.map(b=>({...b,items:b.items.flatMap(it=>{
      const ra=riskAreas(it.id,pain);if(!ra.length)return [it];
      const alt=(ALT[it.orig||it.id]||[]).find(x=>!riskAreas(x,pain).length&&x!==it.id&&!used.has(x));
      if(alt&&!ra.some(a=>pain[a]>=6)){used.add(alt);const n=subst(it,alt,ctx);n.painSub=ra.map(a=>AREAS[a]).join(', ');subN.push(EX[it.id][0]);return [n]}
      rem.push(EX[it.id][0]);return [];
    })})).filter(b=>b.items.length);
    if(subN.length||rem.length)s.notes.push({t:`🩹 ปรับตามอาการเจ็บ${painA.map(a=>`${AREAS[a]} ${pain[a]}/10`).join(', ')}: ${subN.length?`เปลี่ยนท่า ${subN.length} ท่า`:''}${subN.length&&rem.length?' · ':''}${rem.length?`ตัดออก ${rem.length} ท่า`:''}`});
  }
  if(s._mult!=null){let removed=0;const mult=s._mult;
    blocks=blocks.map(b=>{if(b.fixed)return b;let items=b.items.filter(i=>{if(s._noP&&EX[i.id][2].p){removed++;return false}return true});items=items.map(i=>({...i,sets:Math.max(1,Math.round(i.sets*mult))}));return {...b,items}}).filter(b=>b.items.length);
    if(removed)s.notes.push({t:`ตัดท่ากระโดดออก ${removed} ท่า`});
    if(mult<.999)s.notes.push({t:`ปริมาณรวมวันนี้ ≈ ${Math.round(mult*100)}% ของปกติ`});
  }
  // จำกัดเวลา
  const B=state.budget[date];
  if(B&&type!=='game'){const before=estMin(blocks);if(before>B){blocks=trimTo(blocks,B);s.notes.push({t:`⏱ ปรับให้พอดี ${B} นาที (จาก ~${before} นาที) — เก็บท่าหลักไว้ ตัดท่าเสริมก่อน`})}}
  s.blocks=blocks;s.est=estMin(blocks);
  return s;
}

/* ================= น้ำหนักดัมเบล (Double progression) ================= */
const dbList=()=>String(state.settings.dumbbells||'').split(/[\s,]+/).map(Number).filter(x=>x>0).sort((a,b)=>a-b);
const upW=w=>{const n=dbList().find(x=>x>w);return n??w};
const downW=x=>{const l=dbList();let r=l[0]||x;for(const v of l)if(v<=x)r=v;return r};
function suggestW(id,ph,it){
  const lw=state.lastW[id];if(!lw||!lw.w)return null;
  const lo=it?it.v:8,hi=it&&it.hi?it.hi:lo;
  let w=lw.w,why=`ใช้น้ำหนักเดิม พยายามเพิ่มทีละ 1 ครั้งจนทำได้ ${hi} ครั้งทุกเซ็ต`;
  if(lw.ok){const n=upW(w);if(n>w){w=n;why=`ครั้งก่อนทำถึงเพดานครบทุกเซ็ต → เพิ่มน้ำหนัก แล้วเริ่มที่ ${lo} ครั้ง`}else why='ถึงดัมเบลหนักสุดแล้ว → ลงช้า 4 วินาที หรือทำเพิ่ม 1 เซ็ต'}
  if(ph===3){w=downW(w*.8);why='สัปดาห์ Deload → เบาลง ~80% ให้ร่างกายฟื้น'}
  return {w,why};
}

