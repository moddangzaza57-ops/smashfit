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
function defState(){return {settings:{level:'inter',goal:'power',start:mon(today()),dumbbells:'2, 4, 6, 8, 10, 12',rtSpd:'mid',voice:true,tourn:'',lastBackup:''},week:{...PRESETS.balanced.w,5:'game'},overrides:{},checkins:{},logs:[],lastW:{},drafts:{},pain:{},tests:[],swaps:{},health:{},budget:{}}}
function normalize(s){
  const d=defState();s.settings=Object.assign(d.settings,s.settings||{});
  if(s.settings.rtVoice===false&&s.voice==null)s.settings.voice=false;
  ['overrides','checkins','lastW','drafts','pain','swaps','health','budget'].forEach(k=>s[k]=s[k]||{});
  s.logs=s.logs||[];s.tests=s.tests||[];s.week=s.week||d.week;return s;
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
function phaseIdx(date){const w=Math.floor(dayDiff(mon(state.settings.start),mon(date))/7);return ((w%4)+4)%4}
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

/* ================= Render ================= */
const $=s=>document.querySelector(s);
const fmtSec=s=>s>=60?(s%60?`${Math.floor(s/60)}:${p2(s%60)} นาที`:`${s/60} นาที`):`${s} วิ`;
const fmtClock=s=>`${Math.floor(s/60)}:${p2(s%60)}`;
const getDraft=(date,type)=>{const k=date+'|'+type;return state.drafts[k]||(state.drafts[k]={start:null,data:{}})};
const isLogged=(date,type)=>state.logs.some(l=>l.date===date&&l.type===type);
const thumb=id=>(window.FIG&&FIG.has(id))?FIG.svg(id,FIG.thumbT(id)):'';
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
const noteH=n=>`<div class="note ${n.good?'good':''}${n.bad?' bad':''}">${n.t}</div>`;

function render(){
  document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.nav===view));
  $('#app').innerHTML=({today:vToday,plan:vPlan,lib:vLib,hist:vHist,set:vSet})[view]();
  if(view==='today')updProg();
}
function header(sub){return `<div class="top"><div class="brand">Smash<b>Fit</b> 🏸</div><div class="mu">${sub||''}</div></div>`}

function testDue(){const t=state.tests[state.tests.length-1];return !t||dayDiff(t.date,today())>=28}

function vToday(){
  const td=today(),m=mon(td);
  const chips=[0,1,2,3,4,5,6].map(i=>{const d=addD(m,i),t=typeOf(d);return `<button class="chip ${d===sel?'on':''} ${d===td?'td':''}" data-act="sel" data-d="${d}">${DN[pd(d).getDay()]}<span class="ic">${TYPES[t].ic}</span>${pd(d).getDate()}</button>`}).join('');
  const s=buildSession(sel,deskMode?'desk':null);cur=s;
  const P=PH[s.ph],T=TYPES[s.type],dow=pd(sel).getDay();
  let h=header(`รอบสัปดาห์ ${s.ph+1}/4 · ${P.n}`)+`<div class="chips">${chips}</div>`;
  h+=`<div class="card"><div class="mu">${thd(sel)}${sel===td?' · วันนี้':''}</div><h1>${T.ic} ${T.n}</h1>`;
  if(deskMode)h+=`<button class="btn sec sm" data-act="desk">← กลับเซสชันหลักของวัน</button>`;
  else if(dow===GAME_DOW)h+=`<div class="mu">วันศุกร์ล็อกเป็นวันตีเกมเสมอ</div>`;
  else h+=`<div class="lbl">เปลี่ยนเซสชันเฉพาะวันนี้</div><select data-ch="swapday">${Object.keys(TYPES).filter(k=>k!=='game'&&!TYPES[k].extra).map(k=>`<option value="${k}" ${k===s.type?'selected':''}>${TYPES[k].ic} ${TYPES[k].n}${k===state.week[dow]?' (ตามตาราง)':''}</option>`).join('')}</select>`;
  if(s.type!=='game'&&s.type!=='rest'&&!deskMode){const B=state.budget[sel]||0;
    h+=`<div class="lbl">วันนี้มีเวลาเท่าไร</div><div class="scale">${[[0,'เต็ม'],[45,'45 นาที'],[30,'30 นาที'],[20,'20 นาที']].map(([v,l])=>`<button class="${B===v?'on':''}" data-act="budget" data-v="${v}">${l}</button>`).join('')}</div>`;}
  if(s.est)h+=`<div class="mu sm">⏱ ใช้เวลาประมาณ ${s.est} นาที</div>`;
  h+=`</div>`;
  if(!deskMode&&sel===td&&testDue()&&state.logs.length>=3)h+=`<div class="note good">📏 ถึงรอบทดสอบสมรรถภาพแล้ว (ทุก 4 สัปดาห์) <button class="btn sm" style="margin-left:6px" data-act="testopen">ทดสอบ</button></div>`;
  h+=vPain();
  if(s.type==='game')return h+vGame(s);
  if(!['rest','mobility','desk'].includes(s.type))h+=vReady();
  s.notes.forEach(n=>h+=noteH(n));
  if(s.swap)h+=`<button class="btn sec" data-act="tomob">เปลี่ยนวันนี้เป็นยืดเหยียด / ฟื้นฟู</button>`;
  if(s.type==='rest')return h+`<div class="card"><h2>วันพัก 😴</h2><div class="mu">การพักคือส่วนหนึ่งของการฝึก — นอน 7–8 ชม. ดื่มน้ำให้พอ เดินเบาๆ ได้</div><div style="height:10px"></div><button class="btn sec" data-act="tomob">อยากขยับ: เปลี่ยนเป็นยืดเหยียด 20 นาที</button></div>${deskBtn()}`;
  if(isLogged(sel,s.type))h+=`<div class="note good">✓ บันทึกเซสชันนี้แล้ว</div>`;
  h+=`<div class="card"><div class="mu" id="pgt">ความคืบหน้า</div><div class="prog"><i id="pg"></i></div><div class="mu sm" style="margin-top:6px">แตะรูปหรือชื่อท่าเพื่อดูวิธีทำ · ✓ แล้วจับเวลาพักให้อัตโนมัติ · 🔄 เปลี่ยนท่าได้</div></div>`;
  h+=renderBlocks(s);
  h+=`<button class="btn" data-act="finish">จบเซสชัน & บันทึก</button>`;
  if(!deskMode)h+=deskBtn();
  return h;
}
const deskBtn=()=>`<div style="height:10px"></div><button class="btn sec" data-act="desk">🪑 ยืดระหว่างทำงาน 5 นาที</button>`;
function vPain(){
  const p=activePain(sel),a=Object.keys(p);
  return `<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div><h2 style="margin:0">อาการเจ็บ</h2><div class="mu sm">${a.length?a.map(k=>`${AREAS[k]} <b style="color:${p[k]>=6?'var(--bad)':'var(--warn)'}">${p[k]}/10</b>`).join(' · '):'ไม่มีอาการเจ็บ ✓'}</div></div><button class="btn sec sm" data-act="painopen">${a.length?'อัปเดต':'บันทึก'}</button></div></div>`;
}
function painSheet(){
  const p=activePain(sel);
  sheet(`<div class="shh"><h2 style="margin:0">เจ็บตรงไหน ระดับเท่าไร</h2><button class="x" data-act="fcancel">เสร็จ ✓</button></div>
  <div class="mu sm" style="margin:6px 0">0 = ไม่เจ็บ · 3–5 = เจ็บแต่ขยับได้ (แอปจะเปลี่ยนท่าที่เสี่ยง) · 6+ = เจ็บมาก (แอปจะตัดท่าที่ใช้ส่วนนั้นและแนะนำพัก) · กด 0 เมื่อหายแล้ว</div>
  ${Object.entries(AREAS).map(([k,n])=>`<div class="lbl">${n}</div><div class="scale">${[0,2,4,6,8,10].map(v=>`<button class="${(p[k]||0)===v?'on':''}" data-act="painset" data-a="${k}" data-v="${v}">${v}</button>`).join('')}</div>`).join('')}
  <div class="mu sm" style="margin-top:8px">แอปไม่ใช่การวินิจฉัยทางการแพทย์ ถ้าบวม ชา ปวดตอนกลางคืน หรือไม่ดีขึ้น ควรพบแพทย์</div>`);
}
function vReady(){
  const c=state.checkins[sel]||{},r=readiness(sel),hh=state.health[sel]||{},base=rhrBase(sel);
  const sc=(f,lo,hi)=>`<div class="mu sm">${lo} → ${hi}</div><div class="scale">${[1,2,3,4,5].map(v=>`<button class="${c[f]===v?'on':''}" data-act="ci" data-f="${f}" data-v="${v}">${v}</button>`).join('')}</div>`;
  return `<div class="card"><h2>เช็กความพร้อมก่อนฝึก ${r?`<span class="badge">${r.score}/15</span>`:''}</h2>
  <div class="grid2"><div><div class="lbl">นอนกี่ชั่วโมง</div><input type="number" inputmode="decimal" step="0.5" data-ch="sleepH" value="${hh.sleep??''}" placeholder="เช่น 7"></div><div><div class="lbl">ชีพจรตอนตื่น</div><input type="number" inputmode="numeric" data-ch="rhr" value="${hh.rhr??''}" placeholder="${base?'ปกติ ~'+Math.round(base):'ไม่บังคับ'}"></div></div>
  <div class="lbl">คุณภาพการนอน</div>${sc('sleep','1 แย่มาก','5 ดีมาก')}
  <div class="lbl">พลังงานตอนนี้</div>${sc('energy','1 หมดแรง','5 เต็มที่')}
  <div class="lbl">ความล้า / ปวดกล้ามเนื้อ</div>${sc('sore','1 ไม่ปวด','5 ปวดมาก')}
  <div class="mu sm">โปรแกรมด้านล่างปรับตามคะแนนทันที · ตั้งคำสั่งลัดให้ดึงข้อมูลจากแอป Health อัตโนมัติได้ (ดูในตั้งค่า)</div></div>`;
}
function renderBlocks(s,only){
  const dr=getDraft(s.date,s.type);
  return (only||s.blocks).map(b=>`<div class="card"><h2>${b.t}</h2>${b.items.map(it=>renderItem(it,dr,s.ph,s.date)).join('')}</div>`).join('');
}
function renderItem(it,dr,ph,date){
  const k=it.slot,ex=EX[it.id],f=ex[2],d=dr.data[k]||[],per=f.u?' /ข้าง':'';
  const rx=f.t?`${it.sets} × ${fmtSec(it.v)}${per}`:it.hi?`${it.sets} × ${it.v}–${it.hi} ครั้ง${per} · เหลือแรง ~${it.rir}`:`${it.sets} × ${it.v} ครั้ง${per}`;
  let sug='';const sw=it.db?suggestW(it.id,ph,it):null;
  if(it.db)sug=sw?`<div class="sug">แนะนำ ${sw.w} กก.${per?'/มือ':''} · ${sw.why}</div>`:`<div class="sug">ครั้งแรก: เลือกน้ำหนักที่ทำได้ ${it.v} ครั้งแล้วยังเหลือแรงอีก ~${it.rir||2} ครั้ง</div>`;
  const tag=it.painSub?`<div class="sug" style="color:var(--warn)">🩹 แทน ${EX[it.orig][0]} (เจ็บ${it.painSub})</div>`:it.orig&&it.orig!==it.id?`<div class="mu sm">🔄 แทน ${EX[it.orig][0]}</div>`:'';
  const canSwap=!!ALT[it.orig||it.id];
  const rph=it.hi?`${it.v}–${it.hi}`:`${it.v}`;
  let rows='';
  if(it.id==='rand_corner'){
    rows=`<button class="btn sec" data-act="rcstart">🎯 เริ่มสุ่มมุม ${it.sets} รอบ × ${fmtSec(it.v)}</button><div style="display:flex;gap:6px;margin-top:6px">${Array.from({length:it.sets},(_,i)=>`<button class="ck ${(d[i]||{}).done?'on':''}" style="flex:1" data-act="ck" data-i="${i}">${i+1}</button>`).join('')}</div>`;
  }else for(let i=0;i<it.sets;i++){
    const x=d[i]||{},ck=`<button class="ck ${x.done?'on':''}" data-act="ck" data-i="${i}">✓</button>`;
    if(f.t)rows+=`<div class="set t"><span>${i+1}</span><button class="play" data-act="play" data-i="${i}">▶ เริ่ม ${fmtSec(it.v)}</button>${ck}</div>`;
    else if(it.db)rows+=`<div class="set"><span>${i+1}</span><input data-in="w" data-i="${i}" inputmode="decimal" placeholder="${sw?sw.w:'กก.'} กก." value="${x.w??''}"><input data-in="r" data-i="${i}" inputmode="numeric" placeholder="${rph} ครั้ง" value="${x.r??''}">${ck}</div>`;
    else rows+=`<div class="set t"><span>${i+1}</span><input data-in="r" data-i="${i}" inputmode="numeric" placeholder="${rph} ครั้ง" value="${x.r??''}">${ck}</div>`;
  }
  return `<div class="ex" data-k="${k}"><div class="exrow"><div class="thumb" data-act="exinfo" data-id="${it.id}">${thumb(it.id)}</div><div style="flex:1;min-width:0"><div class="exn" data-act="exinfo" data-id="${it.id}">${ex[0]} <span class="i">วิธีทำ ›</span></div><div class="rx">${rx}${it.rest?` · พัก ${it.rest} วิ`:''}</div>${tag}${sug}</div>${canSwap?`<button class="x" data-act="swap" title="เปลี่ยนท่า">🔄</button>`:''}</div><div class="sets">${rows}</div></div>`;
}
const itemByKey=k=>{for(const b of cur.blocks)for(const it of b.items)if(it.slot===k)return it;return null};
function updProg(){
  if(!cur||!$('#pg'))return;const dr=getDraft(cur.date,cur.type);let tot=0,dn=0;
  cur.blocks.forEach(b=>b.items.forEach(it=>{tot+=it.sets;const d=dr.data[it.slot]||[];for(let i=0;i<it.sets;i++)if(d[i]&&d[i].done)dn++}));
  $('#pg').style.width=(tot?dn/tot*100:0)+'%';$('#pgt').textContent=`ความคืบหน้า ${dn}/${tot} เซ็ต`;
}
function exSheet(id){
  const ex=EX[id],D=(window.EXD||{})[id];if(!ex)return;
  const L=a=>(a||[]).map(t=>`<li>${t}</li>`).join('');
  let h=`<div class="shh"><div><h2 style="margin:0">${ex[0]}</h2>${D?`<div class="mu sm">${D.m}</div>`:''}</div><button class="x" data-act="fcancel">ปิด ✕</button></div>`;
  h+=FIG.has(id)?`<svg class="anim" id="anim"></svg>`:'';
  if(D){
    h+=`<div class="note good">🏸 ${D.w}</div><h3>วิธีทำทีละขั้น</h3><ol>${L(D.s)}</ol>
    <h3>จังหวะ / การหายใจ</h3><p>${D.b}</p><h3>ข้อผิดพลาดที่พบบ่อย</h3><ul>${L(D.x)}</ul>
    <div class="grid2" style="margin-top:12px"><div class="mini"><b>⬇ แบบง่ายลง</b>${D.e}</div><div class="mini"><b>⬆ แบบยากขึ้น</b>${D.h}</div></div>`;
    if(ex[2].u)h+=`<div class="note">ท่าข้างเดียว: เริ่มข้างที่อ่อนกว่า (มักเป็นข้างที่ไม่ได้ถือไม้) และทำจำนวนเท่ากันทั้งสองข้าง ช่วยลดความไม่สมดุลซ้าย–ขวา</div>`;
    const ra=Object.keys(RISK).filter(a=>RISK[a].includes(id));
    if(ra.length)h+=`<div class="mu sm" style="margin-top:8px">ระวังถ้าเจ็บ: ${ra.map(a=>AREAS[a]).join(', ')}${ALT[id]?` · ท่าทดแทน: ${ALT[id].map(x=>EX[x][0]).join(', ')}`:''}</div>`;
    h+=`<a class="btn sec" href="https://www.youtube.com/results?search_query=${encodeURIComponent(D.q)}" target="_blank" rel="noopener">▶ ดูวิดีโอสาธิตจริงบน YouTube</a>`;
  }else h+=`<p class="mu">${ex[1]}</p>`;
  if(id==='rand_corner')h+=`<div style="height:8px"></div>${rtCfg()}<div style="height:8px"></div><button class="btn" data-act="rctry">ลองเลย 5 รอบ × 30 วิ</button>`;
  h+=`<div class="mu sm" style="margin-top:10px">หุ่นเป็นภาพประกอบจังหวะการเคลื่อนไหว ดูวิดีโอประกอบเพื่อรายละเอียดท่าที่ถูกต้อง · เจ็บแหลมหรือชาให้หยุดทันที</div>`;
  sheet(h);
  if(FIG.has(id)){if(anim)anim.stop();anim=FIG.play($('#anim'),id)}
}

function vGame(s){
  const lg=state.logs.find(l=>l.date===sel&&l.type==='game');
  let h=vReady();
  s.notes.forEach(n=>h+=noteH(n));
  h+=`<div class="note good">วันตีเกม: วอร์มอัพให้ครบก่อนลงสนาม ดื่มน้ำทุกช่วงพักเกม และคูลดาวน์หลังเล่นเพื่อให้พร้อมสำหรับวันเสาร์</div>`;
  h+=renderBlocks(s,[s.blocks[0]]);
  if(lg)h+=`<div class="card"><h2>บันทึกเกมแล้ว ✓</h2><div>${lg.minutes} นาที · ${lg.games||0} เกม${lg.wins!=null?` · ชนะ ${lg.wins} แพ้ ${lg.losses}`:''} · RPE ${lg.rpe}</div>${lg.partner?`<div class="mu">คู่: ${esc(lg.partner)}</div>`:''}${lg.mist&&lg.mist.length?`<div class="mu">จุดพลาด: ${lg.mist.join(', ')}</div>`:''}${lg.feel?`<div class="mu">ร่างกาย: ${lg.feel}</div>`:''}${lg.notes?`<div class="mu">${esc(lg.notes)}</div>`:''}</div>`;
  else h+=`<div class="card"><h2>บันทึกการตีเกม</h2>
   <div class="grid2"><div><div class="lbl">เวลาเล่น (นาที)</div><input type="number" id="gm" inputmode="numeric" value="120"></div><div><div class="lbl">คู่ที่เล่นด้วย</div><input type="text" id="gp" placeholder="ไม่บังคับ"></div></div>
   <div class="grid2"><div><div class="lbl">ชนะ (เกม)</div><input type="number" id="gw" inputmode="numeric" placeholder="0"></div><div><div class="lbl">แพ้ (เกม)</div><input type="number" id="gl" inputmode="numeric" placeholder="0"></div></div>
   <div class="lbl">ความเหนื่อยโดยรวม (RPE 1–10)</div><div class="rpe">${[1,2,3,4,5,6,7,8,9,10].map(v=>`<button data-act="grpe" data-v="${v}" class="${gRpe===v?'on':''}">${v}</button>`).join('')}</div>
   <div class="lbl">จุดที่พลาดบ่อยวันนี้ (เลือกได้หลายข้อ)</div><div style="display:flex;flex-wrap:wrap;gap:6px">${MISTAKES.map(m=>`<button class="chip ${gMist.has(m)?'on':''}" style="flex:none;padding:6px 10px" data-act="gmist" data-m="${m}">${m}</button>`).join('')}</div>
   <div class="lbl">ร่างกายรู้สึก</div><select id="gf"><option value="">—</option><option>ตัวเบา เล่นดี</option><option>ปกติ</option><option>ตัวหนัก / ขาล้า</option><option>เจ็บบางจุด</option></select>
   <div class="lbl">โน้ต (จุดที่อยากพัฒนา)</div><textarea id="gn" style="min-height:60px;font-size:16px"></textarea>
   <div style="height:10px"></div><button class="btn" data-act="gsave">บันทึกเกม</button></div>`;
  h+=renderBlocks(s,[s.blocks[1]]);
  return h;
}

function vPlan(){
  const td=today(),m=mon(td),ph=phaseIdx(td),tdays=tournDays(td);
  let h=header('ตารางสัปดาห์')+`<div class="card"><h2>รอบฝึก 4 สัปดาห์</h2><div class="ph">${PH.map((p,i)=>`<div class="${i===ph?'on':''}">สัปดาห์ ${i+1}<br><b>${p.n}</b></div>`).join('')}</div><div class="mu">ตอนนี้: <b style="color:var(--ac)">${PH[ph].n}</b> — ${PH[ph].d}</div><div style="height:8px"></div><button class="btn sec sm" data-act="cycle">เริ่มรอบใหม่ตั้งแต่สัปดาห์นี้</button></div>`;
  h+=`<div class="card"><h2>🏆 โหมดก่อนแข่ง</h2><div class="mu sm">ใส่วันแข่งรายการ แอปจะลดปริมาณการฝึก 10 วันก่อนแข่ง (Taper) ให้ร่างกายสดที่สุดในวันจริง</div><div class="lbl">วันแข่งรายการถัดไป</div><input type="date" data-ch="tourn" value="${state.settings.tourn||''}">${tdays!=null?`<div class="note good">อีก ${tdays} วันแข่ง</div>`:''}${state.settings.tourn?`<div style="height:6px"></div><button class="btn sec sm" data-act="tournclr">ล้างวันแข่ง</button>`:''}</div>`;
  h+=`<div class="card"><h2>วันฝึกประจำสัปดาห์</h2><div class="mu sm" style="margin-bottom:6px">วันศุกร์ล็อกเป็นวันตีเกม วันอื่นเลือกได้อิสระ ระบบจะปรับความหนักให้อัตโนมัติ</div>`;
  ORDER.forEach(dow=>{
    const d=addD(m,(dow+6)%7);
    if(dow===GAME_DOW){h+=`<div class="day"><b>${DNF[dow]}</b><div class="lock">🏸 ตีเกมแบด (ล็อก)</div></div>`;return}
    const t=state.week[dow]||'rest',w=ctxAdjust(d,t).notes;
    h+=`<div class="day"><b>${DNF[dow]}</b><select data-ch="week" data-d="${dow}">${Object.keys(TYPES).filter(k=>k!=='game'&&!TYPES[k].extra).map(k=>`<option value="${k}" ${k===t?'selected':''}>${TYPES[k].ic} ${TYPES[k].n}</option>`).join('')}</select>${w.length?`<div class="w">⚠︎ ${w[0].split(' — ')[0]} — ระบบจะลดความหนักให้</div>`:''}</div>`;
  });
  h+=`</div><div class="card"><h2>ตารางสำเร็จรูป</h2><div style="display:grid;gap:8px">${Object.entries(PRESETS).map(([k,p])=>`<button class="btn sec" data-act="preset" data-p="${k}">${p.n}</button>`).join('')}</div></div>`;
  h+=`<div class="card"><h2>หลักการที่ระบบใช้ปรับโปรแกรม</h2><ul class="tips">
  <li>วันพฤหัส (ก่อนเกม) งานขาหนักจะถูกลดครึ่งและตัดท่ากระโดด</li>
  <li>วันพุธ (2 วันก่อนเกม) งานขาหนักลด 20% · วันเสาร์ (หลังเกม) ลด 30%</li>
  <li>งานขาหนัก 2 วันติดกัน วันที่สองลด 15%</li>
  <li>คะแนนความพร้อมต่ำ หรือชีพจรตอนตื่นสูงกว่าปกติ → ลดเซ็ต / ตัดกระโดด / แนะนำพัก</li>
  <li>มีอาการเจ็บ → เปลี่ยนเป็นท่าที่ไม่ลงน้ำหนักจุดนั้น หรือตัดออกถ้าเจ็บมาก</li>
  <li>ภาระสัปดาห์นี้สูงกว่าค่าเฉลี่ย 3 สัปดาห์ก่อนเกิน 30% → ลด 15%</li>
  <li>เวลาน้อย → ตัดท่าเสริมก่อน เก็บท่าหลักไว้</li>
  <li>เวทใช้ช่วงจำนวนครั้ง (Double progression): น้ำหนักเดิมเพิ่มทีละครั้งจนถึงเพดานทุกเซ็ต แล้วค่อยขยับดัมเบล</li>
  <li>คุมความหนักด้วย “เหลือแรง” (RIR) ไม่ฝืนจนหมดแรง เพื่อให้ขายังสดสำหรับการตีแบด</li></ul></div>`;
  return h;
}

/* ================= คลังท่า ================= */
function vLib(){
  let h=header('คลังท่า')+`<div class="card"><h2>คลังท่าทั้งหมด</h2><div class="mu sm">แตะท่าเพื่อดูหุ่นสาธิต วิธีทำทีละขั้น ข้อผิดพลาด และลิงก์วิดีโอ</div><div style="height:8px"></div><input type="text" id="libq" placeholder="ค้นหาท่า เช่น squat, ไหล่, ข้อเท้า"></div>`;
  h+=`<div class="chips" style="flex-wrap:wrap">${CATS.map(([c])=>`<button class="chip ${libCat===c?'on':''}" style="flex:none;padding:6px 10px" data-act="libcat" data-c="${c}">${c}</button>`).join('')}</div>`;
  return h+`<div id="liblist">${libList('')}</div>`;
}
function libList(q){
  q=q.trim().toLowerCase();
  return CATS.filter(([c])=>!libCat||libCat===c).map(([c,ids])=>{
    const items=ids.filter(id=>{if(!q)return true;const D=(window.EXD||{})[id]||{};return (EX[id][0]+' '+EX[id][1]+' '+(D.m||'')+' '+c).toLowerCase().includes(q)});
    if(!items.length)return '';
    return `<div class="card"><h2>${c}</h2>${items.map(id=>`<div class="libi" data-act="exinfo" data-id="${id}"><div class="thumb">${thumb(id)}</div><div style="min-width:0"><b>${EX[id][0]}</b><div class="mu sm">${((window.EXD||{})[id]||{}).m||EX[id][1]}</div></div></div>`).join('')}</div>`;
  }).join('')||'<div class="mu">ไม่พบท่าที่ค้นหา</div>';
}

/* ================= ความก้าวหน้า ================= */
function spark(vals,hiGood){
  if(vals.length<2)return '';const w=120,h=32,mn=Math.min(...vals),mx=Math.max(...vals),r=mx-mn||1;
  const pts=vals.map((v,i)=>`${(i/(vals.length-1)*w).toFixed(1)},${(h-4-(v-mn)/r*(h-8)).toFixed(1)}`).join(' ');
  const up=vals[vals.length-1]>vals[0],good=hiGood?up:!up;
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><polyline points="${pts}" fill="none" stroke="${good?'var(--ac)':'var(--warn)'}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}
const asym=(l,r)=>l&&r?Math.round(Math.abs(l-r)/Math.max(l,r)*100):null;
function lastAsym(){const t=state.tests[state.tests.length-1];if(!t)return null;return asym(t.r.hopL,t.r.hopR)}
function weekSummary(){
  const td=today(),m=mon(td),days=[0,1,2,3,4,5,6].map(i=>addD(m,i));
  const planned=days.filter(d=>!['rest'].includes(typeOf(d))).length;
  const done=new Set(state.logs.filter(l=>mon(l.date)===m&&l.type!=='desk').map(l=>l.date+l.type)).size;
  const sl=days.map(d=>(state.health[d]||{}).sleep).filter(Boolean),slAvg=sl.length?Math.round(sl.reduce((a,b)=>a+b,0)/sl.length*10)/10:null;
  const a=acwr(td),pain=activePain(td),pa=Object.keys(pain),as=lastAsym();
  const games=state.logs.filter(l=>l.type==='game'&&mon(l.date)===m);
  const rec=[];
  if(a&&a.ratio>1.3)rec.push('ภาระสัปดาห์นี้สูงกว่าปกติมาก — สัปดาห์หน้าลดวันหนักลง 1 วัน');
  if(a&&a.ratio<.7&&done>0)rec.push('ภาระต่ำกว่าปกติ — ค่อยๆ เพิ่มกลับ ไม่เพิ่มทีเดียวเกิน 10–20%');
  if(done<planned-1&&td>=addD(m,4))rec.push('ฝึกได้น้อยกว่าแผน — ลองใช้ปุ่ม “20 นาที” ในวันที่ยุ่ง จะได้ฝึกต่อเนื่อง');
  if(pa.length)rec.push(`มีอาการเจ็บ${pa.map(x=>AREAS[x]).join(', ')} — เพิ่มวันป้องกันบาดเจ็บ และถ้าไม่ดีขึ้นใน 1–2 สัปดาห์ควรพบผู้เชี่ยวชาญ`);
  if(slAvg&&slAvg<6.5)rec.push(`นอนเฉลี่ย ${slAvg} ชม. — การนอน 7–9 ชม. ช่วยฟื้นตัวและความเร็วในการตอบสนอง`);
  if(as!=null&&as>=15)rec.push(`ขาซ้าย–ขวาแรงต่างกัน ${as}% — ทำท่าขาเดียวโดยเริ่มขาที่อ่อนกว่า และเพิ่ม 1 เซ็ตให้ขาที่อ่อน`);
  if(testDue()&&state.logs.length>=3)rec.push('ถึงรอบทดสอบสมรรถภาพ (ทุก 4 สัปดาห์)');
  const lb=state.settings.lastBackup;if(state.logs.length>3&&(!lb||dayDiff(lb,td)>14))rec.push('ไม่ได้สำรองข้อมูลเกิน 2 สัปดาห์ — ไปที่ตั้งค่า → สำรองข้อมูล');
  if(!rec.length)rec.push('ทุกอย่างอยู่ในเกณฑ์ดี ทำต่อแบบนี้ 👍');
  return `<div class="card"><h2>สรุปสัปดาห์นี้</h2><div class="grid2"><div><div class="mu sm">ฝึกแล้ว / แผน</div><h1>${done}/${planned}</h1></div><div><div class="mu sm">เกมสัปดาห์นี้</div><h1>${games.reduce((s,l)=>s+(+l.wins||0),0)}–${games.reduce((s,l)=>s+(+l.losses||0),0)}</h1><div class="mu sm">ชนะ–แพ้</div></div></div>
  <div class="mu sm" style="margin-top:4px">${slAvg?`นอนเฉลี่ย ${slAvg} ชม. · `:''}ภาระ ${weekLoad(m)}${a?` (เฉลี่ย ${Math.round(a.avg)})`:''}</div>
  <div class="lbl">สัปดาห์หน้าควรเน้น</div><ul class="tips">${rec.map(r=>`<li>${r}</li>`).join('')}</ul></div>`;
}
function vTests(){
  const T=state.tests,last=T[T.length-1];
  let h=`<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div><h2 style="margin:0">ทดสอบสมรรถภาพ</h2><div class="mu sm">${last?`ล่าสุด ${thd(last.date)}${testDue()?' · ถึงรอบแล้ว':` · ครั้งถัดไป ${sdd(addD(last.date,28))}`}`:'ยังไม่เคยทดสอบ — ทดสอบครั้งแรกเพื่อใช้เทียบ'}</div></div><button class="btn sm" data-act="testopen">ทดสอบ</button></div>`;
  if(T.length){
    TESTS.forEach(t=>{
      const keys=t.lr?[t.id+'L',t.id+'R']:[t.id];
      const rows=keys.map(k=>{const vals=T.map(x=>x.r[k]).filter(v=>v!=null&&v!=='').map(Number);if(!vals.length)return '';const lv=vals[vals.length-1],pv=vals.length>1?vals[vals.length-2]:null;
        const dlt=pv!=null?lv-pv:null,good=dlt==null?null:(t.hi?dlt>0:dlt<0);
        return `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div class="sm">${t.lr?(k.endsWith('L')?'ซ้าย':'ขวา'):''} <b>${lv}</b> ${t.u}${dlt!=null&&dlt!==0?` <span style="color:${good?'var(--ac)':'var(--warn)'}">${dlt>0?'+':''}${Math.round(dlt*10)/10}</span>`:''}</div>${spark(vals,t.hi)}</div>`}).join('');
      if(!rows)return;
      const a=t.lr&&last?asym(+last.r[t.id+'L'],+last.r[t.id+'R']):null;
      h+=`<div class="log" style="display:block"><b>${t.n}</b>${t.w&&last&&last.r.gobW?` <span class="mu sm">(${last.r.gobW} กก.)</span>`:''}${rows}${a!=null?`<div class="sm" style="color:${a>=15?'var(--warn)':'var(--mu)'}">ซ้าย–ขวาต่างกัน ${a}%${a>=15?' — ควรเสริมข้างที่อ่อน':' — อยู่ในเกณฑ์ดี (<15%)'}</div>`:''}</div>`;
    });
  }
  return h+`</div>`;
}
function testSheet(){
  sheet(`<div class="shh"><h2 style="margin:0">ทดสอบสมรรถภาพ</h2><button class="x" data-act="fcancel">ปิด ✕</button></div>
  <div class="mu sm" style="margin:6px 0">วอร์มอัพก่อน 10 นาที ทดสอบในวันที่ร่างกายสด (ไม่ใช่วันหลังเกม) และใช้วิธีเดิมทุกครั้งเพื่อเทียบผลได้ ข้ามข้อที่ทำไม่ได้</div>
  ${TESTS.map(t=>`<div class="card" style="margin:8px 0"><b>${t.n}</b> <span class="mu sm">(${t.u}${t.hi?' · มากดี':' · น้อยดี'})</span><div class="mu sm">${t.how}</div>
   <div class="grid2" style="margin-top:6px">${t.lr?`<input type="number" inputmode="decimal" id="t_${t.id}L" placeholder="ซ้าย"><input type="number" inputmode="decimal" id="t_${t.id}R" placeholder="ขวา">`:`<input type="number" inputmode="decimal" id="t_${t.id}" placeholder="${t.u}">${t.w?`<input type="number" inputmode="decimal" id="t_gobW" placeholder="น้ำหนัก กก.">`:''}`}</div></div>`).join('')}
  <button class="btn" data-act="testsave">บันทึกผลทดสอบ</button>`);
}
function gameInsights(){
  const g=state.logs.filter(l=>l.type==='game').sort((a,b)=>a.date.localeCompare(b.date));if(!g.length)return '';
  const W=g.reduce((s,l)=>s+(+l.wins||0),0),Lo=g.reduce((s,l)=>s+(+l.losses||0),0);
  const mc={};g.slice(-8).forEach(l=>(l.mist||[]).forEach(m=>mc[m]=(mc[m]||0)+1));
  const top=Object.entries(mc).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const grp=[[],[]];g.forEach(l=>{const r=readiness(l.date);if(r&&(+l.wins||+l.losses))grp[r.score>=12?0:1].push(l)});
  const wr=a=>{const w=a.reduce((s,l)=>s+(+l.wins||0),0),t=a.reduce((s,l)=>s+(+l.wins||0)+(+l.losses||0),0);return t?Math.round(w/t*100):null};
  let cmp='';if(grp[0].length>=2&&grp[1].length>=2){const a=wr(grp[0]),b=wr(grp[1]);cmp=`<div class="sm" style="margin-top:6px">วันที่ความพร้อมดี (≥12) ชนะ ${a}% · วันที่ความพร้อมต่ำ ชนะ ${b}%${a-b>=10?' — การพักผ่อนส่งผลต่อเกมชัดเจน':''}</div>`}
  return `<div class="card"><h2>🏸 สถิติการตีเกม</h2><div>รวม ${g.length} ครั้ง · ชนะ ${W} แพ้ ${Lo}${W+Lo?` · ชนะ ${Math.round(W/(W+Lo)*100)}%`:''}</div>${top.length?`<div class="lbl">จุดที่พลาดบ่อย (8 ครั้งล่าสุด)</div><div class="sm">${top.map(([m,c])=>`${m} (${c})`).join(' · ')}</div>`:''}${cmp}</div>`;
}
function vHist(){
  const td=today(),m=mon(td);
  const wks=[7,6,5,4,3,2,1,0].map(i=>addD(m,-7*i)),loads=wks.map(weekLoad),mx=Math.max(1,...loads);
  const a=acwr(td);
  let h=header('ความก้าวหน้า')+weekSummary()+vTests()+gameInsights();
  h+=`<div class="card"><h2>ภาระการฝึกรายสัปดาห์</h2><div class="mu sm">ภาระ = นาที × RPE (ทั้งเวทและตีแบด)</div><div class="bars">${loads.map((v,i)=>`<div class="${i===7?'cur':''}" style="height:${v/mx*100}%"></div>`).join('')}</div><div class="blbl">${wks.map(w=>`<span>${sdd(w)}</span>`).join('')}</div>
  <div class="mu" style="margin-top:8px">${a?(a.ratio>1.3?`<span style="color:var(--warn)">สัปดาห์นี้สูงกว่าค่าเฉลี่ย ${Math.round((a.ratio-1)*100)}% ระวังบาดเจ็บ</span>`:`สัปดาห์นี้ ${a.cur} / ค่าเฉลี่ย ${Math.round(a.avg)} — อยู่ในช่วงปลอดภัย`):'บันทึกต่อเนื่อง 3 สัปดาห์ขึ้นไปจะเห็นการเตือนภาระเกิน'}</div></div>`;
  const ws=Object.entries(state.lastW).filter(([id])=>EX[id]);
  if(ws.length)h+=`<div class="card"><h2>น้ำหนักล่าสุดต่อท่า</h2>${ws.map(([id,w])=>`<div class="log"><div>${EX[id][0]}<div class="mu sm">${sdd(w.date)}</div></div><div style="text-align:right"><b>${w.w} กก.</b><div class="sm" style="color:${w.ok?'var(--ac)':'var(--mu)'}">${w.ok?'↑ พร้อมเพิ่ม':'เพิ่มจำนวนครั้งก่อน'}</div></div></div>`).join('')}</div>`;
  const logs=[...state.logs].sort((x,y)=>y.date.localeCompare(x.date)||y.id-x.id).slice(0,40);
  h+=`<div class="card"><h2>ประวัติ</h2>${logs.length?logs.map(l=>`<div class="log"><div><b>${TYPES[l.type]?.ic||''} ${TYPES[l.type]?.n||l.type}</b><div class="mu sm">${thd(l.date)} · ${l.minutes} นาที · RPE ${l.rpe}${l.type==='game'&&l.wins!=null?` · ชนะ ${l.wins} แพ้ ${l.losses}`:''}${l.total?` · ${l.done}/${l.total} เซ็ต`:''}</div>${l.notes?`<div class="mu sm">${esc(l.notes)}</div>`:''}</div><button class="x" data-act="del" data-id="${l.id}">ลบ</button></div>`).join(''):'<div class="mu">ยังไม่มีบันทึก</div>'}</div>`;
  return h;
}

/* ================= ตั้งค่า ================= */
function vSet(){
  const st=state.settings,opt=(arr,v)=>arr.map(([k,n])=>`<option value="${k}" ${k===v?'selected':''}>${n}</option>`).join('');
  const lb=st.lastBackup;
  return header('ตั้งค่า')+`<div class="card"><h2>โปรไฟล์การฝึก</h2>
  <div class="lbl">ระดับ</div><select data-ch="level">${opt([['beg','เริ่มต้น (เพิ่งเริ่มเวท)'],['inter','กลาง (เล่นเวทสม่ำเสมอ)'],['adv','สูง (เพิ่มเซ็ต/รอบ)']],st.level)}</select>
  <div class="lbl">เป้าหมายหลัก</div><select data-ch="goal">${opt([['power','สปีด + พลังกระโดด/ตบ'],['endurance','ความอึด เล่นได้หลายเกม'],['prevention','ป้องกันบาดเจ็บ (ไหล่ เข่า ข้อเท้า)']],st.goal)}</select>
  <div class="lbl">ดัมเบลที่มี (กก. ต่อข้าง คั่นด้วย ,)</div><input type="text" data-ch="db" value="${esc(st.dumbbells)}">
  <div class="lbl">วันเริ่มรอบ 4 สัปดาห์</div><input type="date" data-ch="start" value="${st.start}"></div>
  <div class="card"><h2>เสียง</h2><label class="chk"><input type="checkbox" data-ch="voice" ${st.voice!==false?'checked':''}> เสียงพูดภาษาไทย (เริ่ม, อีก 10 วินาที, มุมคอร์ท)</label>${rtCfg(true)}</div>
  <div class="card"><h2>ดึงข้อมูลจากแอป Health อัตโนมัติ</h2><div class="mu sm">ใช้แอป “คำสั่งลัด” (Shortcuts) บน iPhone ส่งชั่วโมงนอนและชีพจรตอนตื่นเข้ามา (ใช้ได้เมื่อแอปอยู่บนเว็บของคุณเอง)</div><ol class="tips">
  <li>เปิดแอปคำสั่งลัด → สร้างคำสั่งลัดใหม่ ชื่อ “SmashFit เช้า”</li>
  <li>เพิ่ม “ค้นหาตัวอย่างสุขภาพ” → ประเภท การนอน (Sleep Analysis) ช่วง 1 วันล่าสุด → รวมเป็นชั่วโมง</li>
  <li>เพิ่ม “ค้นหาตัวอย่างสุขภาพ” → ชีพจรขณะพัก (Resting Heart Rate) ค่าล่าสุด</li>
  <li>เพิ่ม “เปิด URL”: <code>https://เว็บของคุณ/?sleep=[ชั่วโมงนอน]&amp;rhr=[ชีพจร]</code></li>
  <li>ตั้งระบบอัตโนมัติให้รันทุกเช้า หรือกดก่อนฝึก</li></ol></div>
  <div class="card"><h2>สำรองข้อมูล</h2><div class="mu sm">${lb?`สำรองล่าสุด ${thd(lb)}`:'ยังไม่เคยสำรอง'} · ข้อมูลเก็บในเครื่องนี้เท่านั้น ควรสำรองทุก 1–2 สัปดาห์</div><div style="height:8px"></div>
  ${FRAMED?'<div class="note">หน้าตัวอย่างนี้ดาวน์โหลดไฟล์ไม่ได้ ใช้ปุ่มคัดลอกด้านล่างแล้ววางเก็บใน Notes (เวอร์ชันบนเว็บของคุณเองจะดาวน์โหลดเป็นไฟล์ได้)</div>':'<button class="btn" data-act="dl">⬇ ดาวน์โหลดไฟล์สำรอง (.json)</button><div style="height:8px"></div>'}
  <div class="lbl">กู้คืนจากไฟล์</div><input type="file" accept=".json,application/json" data-ch="impfile">
  <details style="margin-top:10px" ${FRAMED?'open':''}><summary class="mu sm">คัดลอก/วางข้อความแทนไฟล์</summary><textarea id="exp" readonly>${esc(JSON.stringify(state))}</textarea><div style="height:6px"></div><button class="btn sec" data-act="copy">คัดลอกข้อมูลสำรอง</button>
  <div class="lbl">วางข้อมูลสำรอง</div><textarea id="imp" placeholder='{"settings":...}'></textarea><div style="height:6px"></div><button class="btn sec" data-act="import">กู้คืนจากข้อความ</button></details></div>
  <div class="card"><h2>ใช้งานเหมือนแอปบน iPhone</h2><ul class="tips"><li>เปิดหน้าเว็บของแอปใน Safari</li><li>กดปุ่มแชร์ ⬆︎ → “เพิ่มไปยังหน้าจอโฮม”</li></ul></div>
  <div class="card"><button class="btn danger" data-act="reset">ล้างข้อมูลทั้งหมด</button></div>`;
}

/* ================= โหมดสุ่มมุมคอร์ท ================= */
const RT_SPD={slow:[2200,3000],mid:[1500,2200],fast:[1000,1500]};
const RT_LBL=['หน้าซ้าย','หน้าขวา','กลางซ้าย','กลางขวา','หลังซ้าย','หลังขวา'];
function rtCfg(noVoice){const s=state.settings.rtSpd||'mid';
  return `<div class="lbl">ความเร็วสัญญาณโหมดสุ่มมุม</div><select data-ch="rtspd"><option value="slow" ${s==='slow'?'selected':''}>ช้า (มือใหม่)</option><option value="mid" ${s==='mid'?'selected':''}>กลาง</option><option value="fast" ${s==='fast'?'selected':''}>เร็ว</option></select>${noVoice?'':`<label class="chk" style="margin-top:6px"><input type="checkbox" data-ch="voice" ${state.settings.voice!==false?'checked':''}> เสียงพูดบอกมุม</label>`}`}
let RT=null;
function say(t){if(state.settings.voice===false)return;try{const u=new SpeechSynthesisUtterance(t);u.lang='th-TH';u.rate=1.2;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}
function rtStart(rounds,work,rest,onDone){
  unlockAudio();stopTimer();rtStop();
  const sp=RT_SPD[state.settings.rtSpd||'mid'];
  RT={rounds,work,rest,onDone,round:1,phase:'prep',end:Date.now()+3000,next:0,last:-1,cells:[...document.querySelectorAll('#court div')]};
  $('#rt').classList.add('show');keepAwake();
  const clear=()=>RT.cells.forEach(c=>c.classList.remove('on'));
  RT.iv=setInterval(()=>{
    if(!RT)return;const now=Date.now(),left=Math.max(0,Math.ceil((RT.end-now)/1000));
    $('#rtT').textContent=RT.phase==='work'?fmtClock(left):left;$('#rtR').textContent=`รอบ ${RT.round}/${RT.rounds}`;
    $('#rtPh').textContent=RT.phase==='prep'?'เตรียมตัว…':RT.phase==='work'?'ทำงาน!':'พัก — เดินกลับกลางคอร์ท หายใจ';
    if(RT.phase==='work'&&now>=RT.next){clear();let i;do{i=Math.floor(Math.random()*6)}while(i===RT.last);RT.last=i;RT.cells[i].classList.add('on');beep(880,.12);say(RT_LBL[i]);RT.next=now+sp[0]+Math.random()*(sp[1]-sp[0]);setTimeout(()=>{if(RT&&RT.last===i)RT.cells[i].classList.remove('on')},Math.min(900,sp[0]-200))}
    if(now>=RT.end){
      if(RT.phase==='prep'){RT.phase='work';RT.end=now+RT.work*1000;RT.next=now+400;beep(990,.3)}
      else if(RT.phase==='work'){clear();beep(990,.35);setTimeout(()=>beep(990,.35),400);
        if(RT.round>=RT.rounds){const d=RT.onDone;rtStop();toast('ครบทุกรอบ เยี่ยมมาก 🏸');say('ครบทุกรอบ');d&&d();return}
        RT.phase='rest';RT.end=now+RT.rest*1000;say('พัก')}
      else{RT.round++;RT.phase='work';RT.end=now+RT.work*1000;RT.next=now+400;beep(990,.3)}
    }
  },100);
}
function rtStop(){if(RT){clearInterval(RT.iv);RT=null}$('#rt').classList.remove('show');document.querySelectorAll('#court div').forEach(c=>c.classList.remove('on'));try{speechSynthesis.cancel()}catch(e){}}

/* ================= Timer ================= */
let T=null,actx=null,wl=null;
function unlockAudio(){try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume()}catch(e){}}
function beep(f=880,d=.18){try{if(!actx)return;const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=f;o.connect(g);g.connect(actx.destination);g.gain.setValueAtTime(.25,actx.currentTime);g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+d);o.start();o.stop(actx.currentTime+d)}catch(e){}}
function keepAwake(){try{if(navigator.wakeLock&&!wl)navigator.wakeLock.request('screen').then(l=>{wl=l;l.addEventListener('release',()=>wl=null)}).catch(()=>{})}catch(e){}}
function startTimer(label,sec,done,isRest){
  unlockAudio();if(T)clearInterval(T.iv);
  T={label,end:Date.now()+sec*1000,total:sec,done,last:null,isRest};
  $('#tl').textContent=label;$('#timer').classList.add('show');
  T.iv=setInterval(tick,200);tick();keepAwake();
  if(!isRest)say('เริ่ม');
}
function tick(){
  if(!T)return;const left=Math.max(0,(T.end-Date.now())/1000),s=Math.ceil(left);
  $('#tt').textContent=fmtClock(s);$('#tb').style.width=Math.min(100,100-left/T.total*100)+'%';
  if(s!==T.last){if(s===10&&T.total>=20)say('อีก 10 วินาที');if(s>0&&s<=3)beep(660,.12)}T.last=s;
  if(left<=0){const d=T.done,r=T.isRest;stopTimer();beep(990,.35);setTimeout(()=>beep(990,.35),400);if(r)say('ไปต่อ');d&&d()}
}
function stopTimer(){if(T){clearInterval(T.iv);T=null}$('#timer').classList.remove('show')}

/* ================= Helpers ================= */
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),1800)}
function sheet(h){$('#sheet').innerHTML=h;$('#modal').classList.add('show')}
function closeSheet(){$('#modal').classList.remove('show');if(anim){anim.stop();anim=null}}
function setArr(k,i){const dr=getDraft(cur.date,cur.type);if(!dr.start)dr.start=Date.now();const a=dr.data[k]||(dr.data[k]=[]);a[i]=a[i]||{};return a[i]}
function markDone(k,i,val){
  const x=setArr(k,i),it=itemByKey(k);x.done=val;
  if(val&&!EX[it.id][2].t){if(x.r==null||x.r==='')x.r=it.v;if(it.db&&(x.w==null||x.w==='')){const sw=suggestW(it.id,cur.ph,it);if(sw)x.w=sw.w}
    const ex=document.querySelector(`.ex[data-k="${k}"]`);if(ex){const r=ex.querySelector(`input[data-in="r"][data-i="${i}"]`),w=ex.querySelector(`input[data-in="w"][data-i="${i}"]`);if(r&&!r.value)r.value=x.r;if(w&&!w.value&&x.w!=null)w.value=x.w}}
  save();const b=document.querySelector(`.ex[data-k="${k}"] .ck[data-i="${i}"]`);if(b)b.classList.toggle('on',val);updProg();
}
const keepScroll=fn=>{const y=window.scrollY;fn();window.scrollTo(0,y)};
function dlBackup(){
  try{const blob=new Blob([JSON.stringify(state)],{type:'application/json'}),a=document.createElement('a');
    a.href=URL.createObjectURL(blob);a.download=`smashfit-backup-${today()}.json`;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),4000);state.settings.lastBackup=today();save();toast('ดาวน์โหลดไฟล์สำรองแล้ว — เก็บไว้ใน iCloud Drive');
  }catch(e){toast('ดาวน์โหลดไม่ได้ ใช้วิธีคัดลอกแทน')}
}
function loadBackup(txt){try{const s=JSON.parse(txt);if(!s.week||!Array.isArray(s.logs))throw 0;state=normalize(s);save();render();toast('กู้คืนสำเร็จ')}catch(err){toast('ข้อมูลไม่ถูกต้อง')}}
function importHealth(){
  let sl=null,rh=null;
  try{const q=new URLSearchParams(location.search);if(q.get('sleep'))sl=+q.get('sleep');if(q.get('rhr'))rh=+q.get('rhr')}catch(e){}
  const m=(location.hash||'').match(/^#h-s(\d+)(?:-r(\d+))?/);if(m){sl=+m[1]/10;rh=m[2]?+m[2]:null}
  if((sl==null||isNaN(sl))&&!rh)return;
  const d=today(),h=state.health[d]||(state.health[d]={});
  if(sl!=null&&!isNaN(sl)&&sl>0){h.sleep=Math.round(sl*10)/10;(state.checkins[d]=state.checkins[d]||{}).sleep=sleepScore(sl)}
  if(rh)h.rhr=rh;save();setTimeout(()=>toast('นำเข้าข้อมูลจากแอป Health แล้ว'),300);
  try{history.replaceState(null,'',location.pathname)}catch(e){}
}

/* ================= Events ================= */
document.addEventListener('click',e=>{
  const nb=e.target.closest('[data-nav]');if(nb){view=nb.dataset.nav;deskMode=false;render();window.scrollTo(0,0);return}
  const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act;
  if(a==='mclose'){if(e.target===b)closeSheet();return}
  unlockAudio();
  const exEl=b.closest('.ex'),k=exEl&&exEl.dataset.k,i=+b.dataset.i;
  switch(a){
    case 'sel':sel=b.dataset.d;gRpe=0;gMist=new Set();deskMode=false;render();break;
    case 'exinfo':exSheet(b.dataset.id);break;
    case 'swap':{const it=itemByKey(k),o=it.orig||it.id,list=[o,...ALT[o]];const nx=list[(list.indexOf(it.id)+1)%list.length];
      const sw=state.swaps[cur.date]||(state.swaps[cur.date]={});if(nx===o)delete sw[k];else sw[k]=nx;
      const dr=getDraft(cur.date,cur.type);delete dr.data[k];save();keepScroll(render);toast(`เปลี่ยนเป็น ${EX[nx][0]}`);break}
    case 'ck':{const x=setArr(k,i),v=!x.done;markDone(k,i,v);const it=itemByKey(k);if(v&&it.rest&&it.id!=='rand_corner'){const last=i===it.sets-2;startTimer(`พัก · ${last?'เซ็ตสุดท้ายต่อไป':'ต่อไป: '+EX[it.id][0]}`,it.rest,null,true);if(last)say('ต่อไปเซ็ตสุดท้าย')}break}
    case 'play':{const it=itemByKey(k);startTimer(`${EX[it.id][0]} · เซ็ต ${i+1}`,it.v,()=>{markDone(k,i,true);if(it.rest&&i<it.sets-1)startTimer('พัก',it.rest,null,true)});break}
    case 'rcstart':{const it=itemByKey(k);rtStart(it.sets,it.v,it.rest,()=>{for(let j=0;j<it.sets;j++)markDone(k,j,true)});break}
    case 'rctry':closeSheet();rtStart(5,30,30,null);break;
    case 'rtstop':rtStop();break;
    case 't15':if(T){T.end+=15000;T.total+=15}break;
    case 'tskip':if(T){const d=T.done;stopTimer();d&&d()}break;
    case 'tstop':stopTimer();break;
    case 'ci':{const c=state.checkins[sel]||(state.checkins[sel]={});c[b.dataset.f]=+b.dataset.v;save();keepScroll(render);break}
    case 'budget':{const v=+b.dataset.v;if(v)state.budget[sel]=v;else delete state.budget[sel];save();keepScroll(render);break}
    case 'painopen':painSheet();break;
    case 'painset':{const p=state.pain[sel]||(state.pain[sel]={});p[b.dataset.a]=+b.dataset.v;save();painSheet();keepScroll(render);break}
    case 'desk':deskMode=!deskMode;render();window.scrollTo(0,0);break;
    case 'tomob':state.overrides[sel]='mobility';save();render();break;
    case 'testopen':testSheet();break;
    case 'testsave':{const r={};document.querySelectorAll('#sheet input[id^="t_"]').forEach(x=>{if(x.value!=='')r[x.id.slice(2)]=+x.value});
      if(!Object.keys(r).length){toast('ใส่ผลอย่างน้อย 1 ข้อ');break}state.tests.push({date:today(),r});save();closeSheet();view='hist';render();toast('บันทึกผลทดสอบแล้ว 📏');break}
    case 'finish':{
      const dr=getDraft(cur.date,cur.type);const mins=dr.start?Math.min(180,Math.max(5,Math.round((Date.now()-dr.start)/60000))):(cur.est||30);rpeSel=0;
      sheet(`<h2>จบเซสชัน: ${TYPES[cur.type].n}</h2><div class="lbl">ใช้เวลา (นาที)</div><input type="number" id="fm" inputmode="numeric" value="${mins}">
      <div class="lbl">ความหนักโดยรวม (RPE) — 5 สบาย · 7 หนักแต่คุมได้ · 9 เกือบหมดแรง</div><div class="rpe">${[1,2,3,4,5,6,7,8,9,10].map(v=>`<button data-act="rpe" data-v="${v}">${v}</button>`).join('')}</div>
      <div class="lbl">โน้ต</div><textarea id="fn" style="min-height:60px;font-size:16px"></textarea><div style="height:12px"></div>
      <button class="btn" data-act="fsave">บันทึก</button><div style="height:8px"></div><button class="btn sec" data-act="fcancel">ยกเลิก</button>`);break}
    case 'rpe':rpeSel=+b.dataset.v;b.parentNode.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));break;
    case 'fcancel':closeSheet();break;
    case 'fsave':{
      if(!rpeSel){toast('เลือก RPE ก่อน');break}
      const dr=getDraft(cur.date,cur.type),mins=+$('#fm').value||0;let tot=0,dn=0;const items=[];
      cur.blocks.forEach(bl=>bl.items.forEach(it=>{const d=dr.data[it.slot]||[];tot+=it.sets;const sets=[];for(let j=0;j<it.sets;j++){const x=d[j]||{};if(x.done)dn++;sets.push({w:x.w!=null&&x.w!==''?+x.w:null,r:x.r!=null&&x.r!==''?+x.r:null,done:!!x.done})}
        items.push({id:it.id,sets});
        if(it.db){const ws=sets.filter(x=>x.done&&x.w).map(x=>x.w);if(ws.length){const ok=sets.every(x=>x.done&&(x.r??it.v)>=(it.hi||it.v));state.lastW[it.id]={w:Math.max(...ws),ok,rpe:rpeSel,date:cur.date}}}}));
      state.logs.push({id:Date.now(),date:cur.date,type:cur.type,minutes:mins,rpe:rpeSel,load:mins*rpeSel,done:dn,total:tot,items,notes:$('#fn').value.trim(),ph:cur.ph});
      delete state.drafts[cur.date+'|'+cur.type];save();closeSheet();stopTimer();deskMode=false;render();toast('บันทึกแล้ว 💪');break}
    case 'grpe':gRpe=+b.dataset.v;b.parentNode.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));break;
    case 'gmist':{const m=b.dataset.m;gMist.has(m)?gMist.delete(m):gMist.add(m);b.classList.toggle('on');break}
    case 'gsave':{
      if(!gRpe){toast('เลือก RPE ก่อน');break}const mins=+$('#gm').value||0,w=+$('#gw').value||0,l=+$('#gl').value||0;
      state.logs.push({id:Date.now(),date:sel,type:'game',minutes:mins,games:w+l,wins:w,losses:l,partner:$('#gp').value.trim(),mist:[...gMist],rpe:gRpe,load:mins*gRpe,feel:$('#gf').value,notes:$('#gn').value.trim()});
      save();gRpe=0;gMist=new Set();render();toast('บันทึกเกมแล้ว 🏸');break}
    case 'cycle':state.settings.start=mon(today());save();render();toast('เริ่มรอบใหม่แล้ว');break;
    case 'tournclr':state.settings.tourn='';save();render();break;
    case 'preset':state.week={...PRESETS[b.dataset.p].w,5:'game'};save();render();toast('ใช้ตาราง: '+PRESETS[b.dataset.p].n);break;
    case 'libcat':{const c=b.dataset.c;libCat=libCat===c?'':c;render();break}
    case 'del':if(b.classList.contains('arm')){state.logs=state.logs.filter(l=>String(l.id)!==b.dataset.id);save();render()}else{b.classList.add('arm');b.textContent='ยืนยัน?';setTimeout(()=>{b.classList.remove('arm');b.textContent='ลบ'},2500)}break;
    case 'dl':dlBackup();break;
    case 'copy':{const t=$('#exp');const ok=()=>{state.settings.lastBackup=today();save();toast('คัดลอกแล้ว')};try{navigator.clipboard.writeText(t.value).then(ok).catch(()=>{t.select();toast('กดค้างที่ข้อความเพื่อคัดลอก')})}catch(err){t.select();toast('กดค้างที่ข้อความเพื่อคัดลอก')}break}
    case 'import':loadBackup($('#imp').value);break;
    case 'reset':if(b.dataset.arm){state=defState();save();render();toast('ล้างข้อมูลแล้ว')}else{b.dataset.arm=1;b.textContent='แตะอีกครั้งเพื่อยืนยันการล้าง';setTimeout(()=>{if(b.isConnected){delete b.dataset.arm;b.textContent='ล้างข้อมูลทั้งหมด'}},3000)}break;
  }
});
document.addEventListener('input',e=>{
  const t=e.target;if(t.id==='libq'){$('#liblist').innerHTML=libList(t.value);return}
  if(!t.dataset.in)return;const k=t.closest('.ex').dataset.k;const x=setArr(k,+t.dataset.i);x[t.dataset.in]=t.value;save();
});
document.addEventListener('change',e=>{
  const t=e.target,c=t.dataset.ch;if(!c)return;
  const st=state.settings;
  if(c==='swapday'){const dow=pd(sel).getDay();if(t.value===state.week[dow])delete state.overrides[sel];else state.overrides[sel]=t.value;save();render()}
  else if(c==='week'){state.week[t.dataset.d]=t.value;save();render()}
  else if(c==='level'||c==='goal'){st[c]=t.value;save();toast('บันทึกแล้ว')}
  else if(c==='db'){st.dumbbells=t.value;save();toast('บันทึกแล้ว')}
  else if(c==='start'&&t.value){st.start=t.value;save();toast('บันทึกแล้ว')}
  else if(c==='tourn'){st.tourn=t.value;save();render()}
  else if(c==='rtspd'){st.rtSpd=t.value;save()}
  else if(c==='voice'){st.voice=t.checked;save()}
  else if(c==='sleepH'||c==='rhr'){const h=state.health[sel]||(state.health[sel]={});const v=parseFloat(t.value);
    if(c==='sleepH'){if(v>0){h.sleep=v;(state.checkins[sel]=state.checkins[sel]||{}).sleep=sleepScore(v)}else delete h.sleep}
    else{if(v>0)h.rhr=v;else delete h.rhr}
    save();keepScroll(render)}
  else if(c==='impfile'){const f=t.files&&t.files[0];if(!f)return;const r=new FileReader();r.onload=()=>loadBackup(r.result);r.readAsText(f)}
});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&T)tick()});

/* ================= เริ่มต้น ================= */
importHealth();
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist().catch(()=>{})}catch(e){}
if('serviceWorker' in navigator&&document.querySelector('link[rel="manifest"]')){try{navigator.serviceWorker.register('sw.js').catch(()=>{})}catch(e){}}
render();
