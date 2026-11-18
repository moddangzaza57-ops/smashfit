'use strict';
/* ================= Smash Fit — หน้าจอ (UI) =================
   ตรรกะโปรแกรมอยู่ใน app.js · ไฟล์นี้วาดหน้าจอ โหมดโฟกัส หน้าต้อนรับ และจัดการปุ่มทั้งหมด */

/* ---------- ไอคอนเส้น (วาดเอง) ---------- */
const IC={
  shuttle:'<path d="M8.5 16 5 3h14l-3.5 13"/><path d="M12 3v13M8.8 3l1.7 13M15.2 3l-1.7 13M6.3 8h11.4"/><path d="M8.5 16h7v1.2a3.5 3.5 0 0 1-7 0z"/>',
  calendar:'<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  book:'<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/><path d="M9 7.5h6"/>',
  chart:'<path d="M4 20V11M10 20V5M16 20v-6M2.5 20.5h19"/>',
  sliders:'<path d="M4 7h9M18 7h2M4 17h3M12 17h8"/><circle cx="15.5" cy="7" r="2.5"/><circle cx="9.5" cy="17" r="2.5"/>',
  steps:'<path d="M3 20h5v-5h5v-5h5V5h3"/>',
  dumbbell:'<path d="M6.5 7.5v9M17.5 7.5v9M3.5 10v4M20.5 10v4M6.5 12h11"/>',
  body:'<circle cx="12" cy="4.8" r="2"/><path d="M12 7.5v6.5M6 10h12M12 14l-3.5 7M12 14l3.5 7"/>',
  bolt:'<path d="M13 2.5 4.5 14H11l-1 7.5L19.5 10H13z"/>',
  feet:'<path d="M8 3.5c1.7 0 3 1.9 3 4.5s-1.3 4.5-3 4.5-3-1.9-3-4.5 1.3-4.5 3-4.5zM6.3 15.5h3.4M16 8c1.7 0 3 1.9 3 4.5S17.7 17 16 17s-3-1.9-3-4.5S14.3 8 16 8zM14.3 20h3.4"/>',
  pulse:'<path d="M2.5 12H7l2.2-5 4.4 10 2.2-5h5.7"/>',
  shield:'<path d="M12 3 5 6v5.2c0 4.4 3 8.1 7 9.8 4-1.7 7-5.4 7-9.8V6z"/>',
  wave:'<path d="M3 9c3-4 6 3 9-1s6-3 9 1M3 15c3-4 6 3 9-1s6-3 9 1"/>',
  moon:'<path d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10z"/>',
  chair:'<path d="M7 3.5h10v8H7zM5 11.5h14M7.5 11.5V21M16.5 11.5V21M7.5 16h9"/>',
  check:'<path d="M5 12.5 9.5 17 19 7.5"/>',
  swap:'<path d="M5 8h13M15 4.5 18.5 8 15 11.5M19 16H6M9 12.5 5.5 16 9 19.5"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle class="fill" cx="12" cy="7.8" r="1.1"/>',
  play:'<path class="fill" d="M8 5.5v13l10.5-6.5z"/>',
  close:'<path d="M6 6l12 12M18 6 6 18"/>',
  chev:'<path d="M9 5.5 15.5 12 9 18.5"/>',
  left:'<path d="M15 5.5 8.5 12l6.5 6.5"/>',
  down:'<path d="M5.5 9 12 15.5 18.5 9"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  cross:'<path d="M9.5 3.5h5v6h6v5h-6v6h-5v-6h-6v-5h6z"/>',
  flame:'<path d="M12 2.5c1 3.6 5.5 5.5 5.5 10.5a5.5 5.5 0 0 1-11 0c0-2.6 1.5-4.4 2.7-5.4.2 2.1 1.2 3.3 2.6 3.4-.6-3.2-.3-5.8.2-8.5z"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  minus:'<path d="M5 12h14"/>',
  trophy:'<path d="M8 3.5h8V9a4 4 0 0 1-8 0zM8 5.5H5a3 3 0 0 0 3 4M16 5.5h3a3 3 0 0 1-3 4M12 13v4M8.5 20.5h7M10 17h4"/>',
  target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle class="fill" cx="12" cy="12" r="1.4"/>',
  download:'<path d="M12 3.5v12M7 10.5l5 5 5-5M4.5 20.5h15"/>',
  upload:'<path d="M12 15.5v-12M7 8.5l5-5 5 5M4.5 20.5h15"/>',
  copy:'<rect x="8.5" y="8.5" width="12" height="12" rx="2.5"/><path d="M15.5 8.5V5.5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3"/>',
  ruler:'<path d="M3.5 16.5 16.5 3.5l4 4-13 13z"/><path d="M7.5 12.5l2 2M10.5 9.5l2 2M13.5 6.5l2 2"/>',
  heart:'<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z"/>',
  speaker:'<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  phone:'<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 20 20"/>',
  bed:'<path d="M3 18.5V7M3 14h18v4.5M21 14v-2.5a3 3 0 0 0-3-3h-7V14"/><circle cx="7" cy="11" r="1.8"/>',
  trash:'<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
  undo:'<path d="M9 7 4.5 11.5 9 16"/><path d="M5 11.5h9.5a5 5 0 0 1 0 10H12"/>',
  next:'<path d="M5 5.5v13l9-6.5zM18.5 5.5v13"/>'
};
const ic=(n,c)=>`<svg class="i ${c||''}" viewBox="0 0 24 24" aria-hidden="true">${IC[n]||''}</svg>`;
const TIC={game:'shuttle',lower:'steps',upper:'dumbbell',full:'body',power:'bolt',footwork:'feet',cardio:'pulse',prehab:'shield',mobility:'wave',rest:'moon',desk:'chair'};
const tIc=(t,c)=>ic(TIC[t]||'body',c);

/* ---------- ตัวช่วย ---------- */
const $=s=>document.querySelector(s);
const clean=s=>String(s??'').replace(/[\p{Extended_Pictographic}\u{FE0E}\u{FE0F}\u{200D}\u{20E3}]/gu,'').replace(/\s{2,}/g,' ').trim();
const fmtSec=s=>s>=60?(s%60?`${Math.floor(s/60)}:${p2(s%60)} นาที`:`${s/60} นาที`):`${s} วิ`;
const fmtClock=s=>`${Math.floor(s/60)}:${p2(s%60)}`;
const getDraft=(date,type)=>{const k=date+'|'+type;return state.drafts[k]||(state.drafts[k]={start:null,data:{}})};
const isLogged=(date,type)=>state.logs.some(l=>l.date===date&&l.type===type);
const thumb=id=>(window.FIG&&FIG.has(id))?FIG.svg(id,FIG.thumbT(id)):'';
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
const testDue=()=>{const t=state.tests[state.tests.length-1];return !t||dayDiff(t.date,today())>=28};
const LEVELS=[['beg','เริ่มต้น','เพิ่งเริ่มเล่นเวท'],['inter','กลาง','เล่นเวทสม่ำเสมอ'],['adv','สูง','เพิ่มเซ็ตและรอบ']];
const GOALS=[['power','สปีด + พลังกระโดด/ตบ','เพิ่มท่าพลังระเบิดในวันเวทขา'],['endurance','ความอึด เล่นได้หลายเกม','เพิ่ม finisher ความอึด'],['prevention','ป้องกันบาดเจ็บ','เสริมไหล่ ข้อศอก ข้อเท้า']];
const lvN=k=>(LEVELS.find(x=>x[0]===k)||LEVELS[1])[1];
const glN=k=>(GOALS.find(x=>x[0]===k)||GOALS[0])[1];

/* ---------- คำอธิบายศัพท์ ---------- */
const TERMS={
  rir:['เหลือแรง (RIR)','จำนวนครั้งที่ยังทำต่อได้อีกตอนจบเซ็ต เช่น "เหลือแรง ~2" คือหยุดตอนที่ยังทำได้อีกประมาณ 2 ครั้ง หนักพอให้แข็งแรงขึ้น แต่ไม่ล้าจนกระทบการตีแบด'],
  rpe:['ความเหนื่อย (RPE)','ให้คะแนนความหนักโดยรวมของวันนี้ 1–10 · 5 สบาย · 7 หนักแต่คุมได้ · 9 เกือบหมดแรง · 10 สุดกำลัง'],
  load:['ภาระการฝึก','นาทีที่ฝึก × RPE รวมทั้งเวทและตีแบด ใช้ดูว่าสัปดาห์นี้หนักกว่าปกติแค่ไหน ถ้าสูงกว่าค่าเฉลี่ย 3 สัปดาห์ก่อนเกิน 30% ความเสี่ยงบาดเจ็บจะสูงขึ้น แอปจะลดโปรแกรมให้เอง'],
  deload:['Deload (สัปดาห์เบา)','ทุกสัปดาห์ที่ 4 ของรอบ แอปลดน้ำหนักเหลือ ~80% และลดเซ็ต ให้ร่างกายซ่อมแซมจนแข็งแรงขึ้นจริง ก่อนเริ่มรอบใหม่ที่หนักขึ้น'],
  taper:['Taper (ลดก่อนแข่ง)','10 วันก่อนแข่ง แอปคงความหนักไว้แต่ลดจำนวนเซ็ต และตัดท่ากระโดดช่วง 2 วันสุดท้าย ให้ขาสดที่สุดในวันแข่ง'],
  ready:['คะแนนความพร้อม','รวมคุณภาพการนอน พลังงาน และความล้า (เต็ม 15) ยิ่งต่ำแอปยิ่งลดปริมาณ ข้ามได้ถ้าไม่อยากกรอก แอปจะใช้โปรแกรมปกติ']
};
const tip=k=>`<button class="tip" data-act="term" data-t="${k}" aria-label="อธิบาย: ${TERMS[k][0]}">${ic('info')}</button>`;

/* ---------- ส่วนประกอบ ---------- */
const lt=(title,sub)=>`<header class="lt"><div><h1>${title}</h1>${sub?`<div class="sub">${sub}</div>`:''}</div></header>`;
const sec=t=>`<h2 class="sec">${t}</h2>`;
function row(o){
  const tag=o.tag||'button',attrs=o.attrs||'';
  return `<${tag} class="row${o.i?' has-i':''}${o.cls?' '+o.cls:''}" ${o.act?`data-act="${o.act}"`:''} ${attrs}>${o.i?ic(o.i,'row-i'):''}${o.pre||''}<span class="row-t">${o.t}${o.sub?`<small>${o.sub}</small>`:''}</span>${o.v!=null?`<span class="row-v">${o.v}</span>`:''}${o.post||''}${o.chev===false?'':ic('chev','chev')}</${tag}>`;
}
const selRow=(o,opts)=>`<label class="row sel${o.i?' has-i':''}">${o.i?ic(o.i,'row-i'):''}<span class="row-t">${o.t}${o.sub?`<small>${o.sub}</small>`:''}</span><span class="row-v">${o.v}</span>${ic('chev','chev')}<select data-ch="${o.ch}" ${o.attrs||''} aria-label="${o.t}">${opts}</select></label>`;
const doneArr=(s,it)=>{const d=getDraft(s.date,s.type).data[it.slot]||[];return Array.from({length:it.sets},(_,j)=>!!(d[j]&&d[j].done))};
const tallyCells=arr=>arr.map(f=>`<i${f?' class="f"':''}></i>`).join('');
function sessionCount(s){let tot=0,dn=0;s.blocks.forEach(b=>b.items.forEach(it=>{const a=doneArr(s,it);tot+=a.length;dn+=a.filter(Boolean).length}));return {tot,dn}}
function rxText(it,long){
  const f=EX[it.id][2],per=f.u?' /ข้าง':'';
  if(f.t)return `${it.sets} × ${fmtSec(it.v)}${per}`;
  if(it.hi)return `${it.sets} × ${it.v}–${it.hi} ครั้ง${per}${long?` · เหลือแรง ~${it.rir}`:''}`;
  return `${it.sets} × ${it.v} ครั้ง${per}`;
}

/* ================= Render ================= */
function render(){
  document.body.className=document.body.className.replace(/\bv-\w+/g,'').trim()+' v-'+view;
  $('#tabs').innerHTML=[['today','shuttle','วันนี้'],['plan','calendar','ตาราง'],['lib','book','คลังท่า'],['hist','chart','ก้าวหน้า'],['set','sliders','ตั้งค่า']]
    .map(([k,i,n])=>`<button data-nav="${k}" ${view===k?'aria-current="page"':''}>${ic(i)}${n}</button>`).join('');
  $('#app').innerHTML=({today:vToday,plan:vPlan,lib:vLib,hist:vHist,set:vSet})[view]();
}

/* ---------- วันนี้ ---------- */
function weekStrip(){
  const td=today(),m=mon(td);
  return `<div class="week" role="group" aria-label="เลือกวันในสัปดาห์นี้">${[0,1,2,3,4,5,6].map(i=>{const d=addD(m,i),t=typeOf(d),lg=state.logs.some(l=>l.date===d&&l.type!=='desk');
    return `<button class="wd${d===sel?' on':''}${d===td?' td':''}" data-act="sel" data-d="${d}" aria-label="${thd(d)} ${TYPES[t].n}${lg?' บันทึกแล้ว':''}" ${d===sel?'aria-pressed="true"':''}><span class="wd-n">${DN[pd(d).getDay()]}</span><span class="wd-d num">${pd(d).getDate()}</span>${tIc(t,'wd-i')}<span class="wd-dot${lg?' f':''}"></span></button>`}).join('')}</div>`;
}
function vToday(){
  const td=today();
  const s=buildSession(sel,deskMode?'desk':null);cur=s;
  const P=PH[s.ph],T=TYPES[s.type],dow=pd(sel).getDay();
  const subPh=`สัปดาห์ ${s.ph+1}/4 · ${P.n}${s.ph===3?tip('deload'):''}`;
  let h=lt(sel===td?'วันนี้':thd(sel),`${sel===td?thd(sel)+' · ':''}${subPh}`)+weekStrip();
  // ----- hero -----
  const {tot,dn}=sessionCount(s),logged=isLogged(sel,s.type);
  const nEx=s.blocks.reduce((a,b)=>a+b.items.length,0);
  let meta=s.type==='rest'?'วันพักฟื้น':s.type==='game'?'วอร์มอัพ · ตีเกม · คูลดาวน์':`${s.est} นาที · ${nEx} ท่า · ${tot} เซ็ต`;
  h+=`<section class="grp hero" aria-label="เซสชันวันนี้"><div class="hero-h">${tIc(s.type,'hero-i')}<div><h2>${clean(T.n)}</h2><p class="meta">${meta}</p></div></div>`;
  if(s.type==='rest'){
    h+=`<p class="meta" style="margin:12px 0 16px">การพักคือส่วนหนึ่งของการฝึก นอน 7–8 ชม. ดื่มน้ำให้พอ เดินเบาๆ ได้</p><button class="btn tint" data-act="tomob">อยากขยับ: เปลี่ยนเป็นยืดเหยียด 20 นาที</button>`;
  }else{
    h+=`<div class="tally" role="img" aria-label="ทำแล้ว ${dn} จาก ${tot} เซ็ต">${s.blocks.map(b=>b.items.map(it=>`<span class="tg">${tallyCells(doneArr(s,it))}</span>`).join('')).join('')}</div>`;
    h+=`<div class="prog num">${logged?'บันทึกเซสชันนี้แล้ว':dn?`ทำแล้ว ${dn} จาก ${tot} เซ็ต`:'แต่ละช่องคือ 1 เซ็ต ทำเสร็จช่องจะเต็ม'}</div>`;
    const lbl=s.type==='game'?(dn?'ทำวอร์มอัพ/คูลดาวน์ต่อ':'เริ่มวอร์มอัพ'):logged?'เปิดดูอีกครั้ง':dn===0?'เริ่มฝึก':dn<tot?'ฝึกต่อ':'จบเซสชันและบันทึก';
    const act=(!logged&&dn===tot&&tot&&s.type!=='game')?'finish':'fopen';
    h+=`<button class="btn${logged?' tint':''}" data-act="${act}">${act==='fopen'&&!logged?ic('play'):''}${lbl}</button>`;
  }
  if(!deskMode&&dow!==GAME_DOW&&s.type!=='game'){
    const opts=Object.keys(TYPES).filter(k=>k!=='game'&&!TYPES[k].extra).map(k=>`<option value="${k}" ${k===s.type?'selected':''}>${TYPES[k].n}${k===state.week[dow]?' (ตามตาราง)':''}</option>`).join('');
    h+=`<div class="hero-ctl">${selRow({t:'เปลี่ยนเซสชันวันนี้',v:s.type===state.week[dow]?'ตามตาราง':'เปลี่ยนแล้ว',ch:'swapday'},opts)}`;
    if(s.type!=='rest'){const B=state.budget[sel]||0;
      h+=`<div class="rowx" style="border-top:.5px solid var(--sep)"><div class="lbl">วันนี้มีเวลาเท่าไร</div><div class="seg" role="group" aria-label="เวลาที่มี">${[[0,'เต็ม'],[45,'45 นาที'],[30,'30 นาที'],[20,'20 นาที']].map(([v,l])=>`<button class="${B===v?'on':''}" data-act="budget" data-v="${v}" aria-pressed="${B===v}">${l}</button>`).join('')}</div></div>`}
    h+=`</div>`;
  }else if(deskMode)h+=`<div class="hero-ctl">${row({t:'กลับเซสชันหลักของวัน',act:'desk',i:'left',chev:false,cls:'link'})}</div>`;
  else if(dow===GAME_DOW)h+=`<div class="hero-ctl"><div class="rowx"><p class="meta">วันศุกร์เป็นวันตีเกมเสมอ วันอื่นในสัปดาห์จะปรับความหนักรอบวันนี้ให้เอง</p></div></div>`;
  h+=`</section>`;
  // ----- ก่อนเริ่ม -----
  const pre=[];
  if(!['rest','mobility','desk'].includes(s.type)){const r=readiness(sel);
    pre.push(row({i:'heart',t:'ความพร้อมวันนี้',sub:r?(r.score>=12?'ดีมาก ทำเต็มโปรแกรมได้':r.score>=9?'ปานกลาง ลดเซ็ต 15%':r.score>=6?'ต่ำ ลดเซ็ต 30%':'ต่ำมาก แนะนำยืดเหยียด'):'นอน · พลังงาน · ความล้า (ไม่บังคับ)',v:r?`<span class="num">${r.score}/15</span>`:'เช็ก',act:'readyopen'}))}
  const p=activePain(sel),pa=Object.keys(p);
  pre.push(row({i:'cross',t:'อาการเจ็บ',sub:pa.length?pa.map(k=>`${AREAS[k]} ${p[k]}/10`).join(' · '):'ไม่มีอาการเจ็บ',v:pa.length?'อัปเดต':'บันทึก',act:'painopen'}));
  if(!deskMode&&sel===td&&testDue()&&state.logs.length>=3)pre.push(row({i:'ruler',t:'ถึงรอบทดสอบสมรรถภาพ',sub:'ทุก 4 สัปดาห์ ใช้เทียบความก้าวหน้า',v:'ทดสอบ',act:'testopen'}));
  h+=sec('ก่อนเริ่ม')+`<div class="grp">${pre.join('')}</div>`;
  // ----- ระบบปรับให้ -----
  if(s.notes.length||s.swap){
    h+=sec('ระบบปรับให้วันนี้')+`<div class="grp">${s.notes.map(n=>`<div class="rowx row n-${n.bad?'bad':n.good?'good':'warn'}" style="min-height:0;align-items:flex-start"><span class="dot"></span><span class="row-t" style="font-size:15px">${esc(clean(n.t))}</span></div>`).join('')}${s.swap?row({t:'เปลี่ยนวันนี้เป็นยืดเหยียด / ฟื้นฟู',act:'tomob',cls:'link',i:'wave'}):''}</div>`;
  }
  if(s.type==='game')return h+vGame(s);
  if(s.type==='rest')return h+deskRow();
  // ----- รายการท่า -----
  h+=renderBlocks(s);
  if(!logged&&tot)h+=`<button class="btn${dn===tot?'':' tint'}" data-act="finish" style="margin-bottom:24px">จบเซสชันและบันทึก</button>`;
  if(!deskMode)h+=deskRow();
  return h;
}
const deskRow=()=>`<div class="grp">${row({i:'chair',t:'ยืดระหว่างทำงาน 5 นาที',sub:'ท่ายืดสั้นๆ ข้างโต๊ะ',act:'desk'})}</div>`;
function renderBlocks(s,only){
  return (only||s.blocks).map(b=>sec(esc(clean(b.t)))+`<div class="grp">${b.items.map(it=>exRow(s,it)).join('')}</div>`).join('');
}
function exRow(s,it){
  const a=doneArr(s,it),all=a.every(Boolean);
  const tag=it.painSub?`<span class="tag">แทน ${EX[it.orig][0]} (เจ็บ${it.painSub})</span>`:it.orig&&it.orig!==it.id?`<small>แทน ${EX[it.orig][0]}</small>`:'';
  return `<button class="row ex-row${all?' done-row':''}" data-act="fopen" data-k="${it.slot}" aria-label="${esc(EX[it.id][0])} ${rxText(it)}${all?' ทำครบแล้ว':''}"><span class="thumb">${thumb(it.id)}</span><span class="row-t"><b>${EX[it.id][0]}</b><small class="num">${rxText(it)}${it.rest?` · พัก ${it.rest} วิ`:''}</small>${tag}</span><span class="tally sm">${tallyCells(a)}</span></button>`;
}
function vGame(s){
  const lg=state.logs.find(l=>l.date===sel&&l.type==='game');
  let h=renderBlocks(s,[s.blocks[0]]);
  if(lg)h+=sec('บันทึกเกม')+`<div class="grp"><div class="rowx"><b>บันทึกแล้ว</b><p class="meta num">${lg.minutes} นาที · ${lg.games||0} เกม${lg.wins!=null?` · ชนะ ${lg.wins} แพ้ ${lg.losses}`:''} · RPE ${lg.rpe}</p>${lg.partner?`<p class="meta">คู่: ${esc(lg.partner)}</p>`:''}${lg.mist&&lg.mist.length?`<p class="meta">จุดพลาด: ${lg.mist.join(', ')}</p>`:''}${lg.feel?`<p class="meta">ร่างกาย: ${lg.feel}</p>`:''}${lg.notes?`<p class="meta">${esc(lg.notes)}</p>`:''}</div></div>`;
  else h+=sec('บันทึกการตีเกม')+`<div class="grp">
   <div class="field"><div class="g2"><label><div class="lbl">เวลาเล่น (นาที)</div><input class="in num" type="number" id="gm" inputmode="numeric" value="120"></label><label><div class="lbl">คู่ที่เล่นด้วย</div><input class="in" type="text" id="gp" placeholder="ไม่บังคับ"></label></div></div>
   <div class="field"><div class="g2"><label><div class="lbl">ชนะ (เกม)</div><input class="in num" type="number" id="gw" inputmode="numeric" placeholder="0"></label><label><div class="lbl">แพ้ (เกม)</div><input class="in num" type="number" id="gl" inputmode="numeric" placeholder="0"></label></div></div>
   <div class="field"><div class="lbl">ความเหนื่อยโดยรวม (RPE 1–10) ${tip('rpe')}</div><div class="rpe">${[1,2,3,4,5,6,7,8,9,10].map(v=>`<button data-act="grpe" data-v="${v}" class="${gRpe===v?'on':''}" aria-pressed="${gRpe===v}">${v}</button>`).join('')}</div></div>
   <div class="field"><div class="lbl">จุดที่พลาดบ่อยวันนี้ (เลือกได้หลายข้อ)</div><div class="chips wrap">${MISTAKES.map(m=>`<button class="chip ${gMist.has(m)?'on':''}" data-act="gmist" data-m="${m}" aria-pressed="${gMist.has(m)}">${m}</button>`).join('')}</div></div>
   <div class="field"><label><div class="lbl">ร่างกายรู้สึก</div><select class="in" id="gf"><option value="">—</option><option>ตัวเบา เล่นดี</option><option>ปกติ</option><option>ตัวหนัก / ขาล้า</option><option>เจ็บบางจุด</option></select></label></div>
   <div class="field"><label><div class="lbl">โน้ต (จุดที่อยากพัฒนา)</div><textarea class="in" id="gn"></textarea></label></div>
   <div class="field"><button class="btn" data-act="gsave">บันทึกเกม</button></div></div>`;
  h+=renderBlocks(s,[s.blocks[1]]);
  return h;
}

/* ---------- ชีตย่อย ---------- */
let sheetKind='';
function sheet(h,kind){sheetKind=kind||'';$('#sheet').innerHTML=`<div class="grab" aria-hidden="true"></div>`+h;$('#modal').classList.add('show');document.body.classList.add('lock');$('#sheet').scrollTop=0;setTimeout(()=>$('#sheet').focus({preventScroll:true}),60)}
function closeSheet(){$('#modal').classList.remove('show');sheetKind='';if(anim){anim.stop();anim=null}if(!$('#focus').classList.contains('show')&&!$('#onb').classList.contains('show'))document.body.classList.remove('lock')}
const shh=(t,btn)=>`<div class="shh"><h2>${t}</h2><button class="x" data-act="fcancel">${btn||'เสร็จ'}</button></div>`;
function readySheet(){
  const c=state.checkins[sel]||{},r=readiness(sel),hh=state.health[sel]||{},base=rhrBase(sel);
  const sc=(f,lo,hi)=>`<div class="seg five" role="group" aria-label="${lo} ถึง ${hi}">${[1,2,3,4,5].map(v=>`<button class="${c[f]===v?'on':''}" data-act="ci" data-f="${f}" data-v="${v}" aria-pressed="${c[f]===v}">${v}</button>`).join('')}</div><div class="lbl" style="display:flex;justify-content:space-between;margin:6px 2px 0"><span>${lo}</span><span>${hi}</span></div>`;
  sheet(shh(`ความพร้อมวันนี้${r?` <span class="num" style="color:var(--ac-ink)">${r.score}/15</span>`:''}`)+
  `<p class="note">ตอบ 3 ข้อ แอปจะปรับปริมาณการฝึกให้ทันที ${tip('ready')}</p>
  <div class="grp"><div class="field"><div class="g2"><label><div class="lbl">นอนกี่ชั่วโมง</div><input class="in num" type="number" inputmode="decimal" step="0.5" data-ch="sleepH" value="${hh.sleep??''}" placeholder="เช่น 7"></label><label><div class="lbl">ชีพจรตอนตื่น</div><input class="in num" type="number" inputmode="numeric" data-ch="rhr" value="${hh.rhr??''}" placeholder="${base?'ปกติ ~'+Math.round(base):'ไม่บังคับ'}"></label></div></div>
  <div class="field"><div class="lbl">คุณภาพการนอน</div>${sc('sleep','แย่มาก','ดีมาก')}</div>
  <div class="field"><div class="lbl">พลังงานตอนนี้</div>${sc('energy','หมดแรง','เต็มที่')}</div>
  <div class="field"><div class="lbl">ความล้า / ปวดกล้ามเนื้อ</div>${sc('sore','ไม่ปวด','ปวดมาก')}</div></div>
  <p class="note">ดึงชั่วโมงนอนและชีพจรจากแอป Health อัตโนมัติได้ ดูวิธีในแท็บตั้งค่า</p>`,'ready');
}
function painSheet(){
  const p=activePain(sel);
  sheet(shh('เจ็บตรงไหน ระดับเท่าไร')+`<p class="note">0 = ไม่เจ็บ · 2–4 = เจ็บแต่ขยับได้ (แอปเปลี่ยนท่าที่เสี่ยง) · 6+ = เจ็บมาก (แอปตัดท่าที่ใช้ส่วนนั้นและแนะนำพัก) · แตะ 0 เมื่อหายแล้ว</p>
  <div class="grp">${Object.entries(AREAS).map(([k,n])=>`<div class="field"><div class="lbl">${n}</div><div class="seg" role="group" aria-label="ระดับความเจ็บ ${n}">${[0,2,4,6,8,10].map(v=>`<button class="${(p[k]||0)===v?'on':''}" data-act="painset" data-a="${k}" data-v="${v}" aria-pressed="${(p[k]||0)===v}">${v}</button>`).join('')}</div></div>`).join('')}</div>
  <p class="note">แอปไม่ใช่การวินิจฉัยทางการแพทย์ ถ้าบวม ชา ปวดตอนกลางคืน หรือไม่ดีขึ้นใน 1–2 สัปดาห์ ควรพบแพทย์หรือนักกายภาพ</p>`,'pain');
}
function termSheet(k){const t=TERMS[k];if(!t)return;sheet(shh(t[0],'เข้าใจแล้ว')+`<div class="term"><p>${t[1]}</p></div>`,'term')}
function exSheet(id){
  const ex=EX[id],D=(window.EXD||{})[id];if(!ex)return;
  const L=a=>(a||[]).map(t=>`<li>${t}</li>`).join('');
  let h=shh(`${ex[0]}${D?`<div class="meta" style="font-weight:400;font-size:15px">${D.m}</div>`:''}`,'ปิด');
  h+=FIG.has(id)?`<svg class="anim" id="anim" role="img" aria-label="หุ่นสาธิตท่า ${esc(ex[0])}"></svg>`:'';
  if(D){
    h+=`<div class="why">${ic('shuttle')}<span>${clean(D.w)}</span></div><h3>วิธีทำทีละขั้น</h3><ol>${L(D.s)}</ol>
    <h3>จังหวะ / การหายใจ</h3><p class="body">${D.b}</p><h3>ข้อผิดพลาดที่พบบ่อย</h3><ul class="l">${L(D.x)}</ul>
    <div class="g2" style="margin-top:14px"><div class="mini"><b>แบบง่ายลง</b>${D.e}</div><div class="mini"><b>แบบยากขึ้น</b>${D.h}</div></div>`;
    if(ex[2].u)h+=`<p class="note">ท่าข้างเดียว: เริ่มข้างที่อ่อนกว่า (มักเป็นข้างที่ไม่ได้ถือไม้) และทำจำนวนเท่ากันทั้งสองข้าง ช่วยลดความไม่สมดุลซ้าย–ขวา</p>`;
    const ra=Object.keys(RISK).filter(a=>RISK[a].includes(id));
    if(ra.length)h+=`<p class="note">ระวังถ้าเจ็บ: ${ra.map(a=>AREAS[a]).join(', ')}${ALT[id]?` · ท่าทดแทน: ${ALT[id].map(x=>EX[x][0]).join(', ')}`:''}</p>`;
    h+=`<a class="btn plain" style="margin-top:14px" href="https://www.youtube.com/results?search_query=${encodeURIComponent(D.q)}" target="_blank" rel="noopener">${ic('play')}ดูวิดีโอสาธิตบน YouTube</a>`;
  }else h+=`<p class="body">${ex[1]}</p>`;
  if(id==='rand_corner')h+=`<div class="grp" style="margin-top:14px">${rtCfg()}</div><button class="btn" data-act="rctry">ลองเลย 5 รอบ × 30 วิ</button>`;
  h+=`<p class="note">หุ่นเป็นภาพประกอบจังหวะการเคลื่อนไหว ดูวิดีโอประกอบเพื่อรายละเอียดท่าที่ถูกต้อง · เจ็บแหลมหรือชาให้หยุดทันที</p>`;
  sheet(h,'ex');
  if(FIG.has(id)){if(anim)anim.stop();anim=FIG.play($('#anim'),id)}
}

/* ================= โหมดโฟกัส ================= */
let F=null,fanim=null;
const flat=()=>cur?cur.blocks.flatMap(b=>b.items.map(it=>({b,it}))):[];
const firstUndone=it=>doneArr(cur,it).indexOf(false);
function openFocus(k){
  const L=flat();if(!L.length)return;
  let i=k?L.findIndex(x=>x.it.slot===k):L.findIndex(x=>firstUndone(x.it)>=0);if(i<0)i=0;
  const fu=firstUndone(L[i].it);F={i,set:fu<0?0:fu};
  $('#focus').classList.add('show');document.body.classList.add('lock');keepAwake();renderFocus();
}
function closeFocus(){$('#focus').classList.remove('show');if(fanim){fanim.stop();fanim=null}F=null;document.body.classList.remove('lock');keepScroll(render)}
const focusOpen=()=>F&&$('#focus').classList.contains('show');
function renderFocus(){
  if(!focusOpen())return;
  const L=flat();if(!L.length){closeFocus();return}if(F.i>=L.length)F.i=L.length-1;
  const {b,it}=L[F.i],ex=EX[it.id],{tot,dn}=sessionCount(cur);
  const sw=it.db?suggestW(it.id,cur.ph,it):null;
  const sug=it.db?(sw?`แนะนำ ${sw.w} กก.${ex[2].u?'/มือ':''} · ${sw.why}`:`ครั้งแรก: เลือกน้ำหนักที่ทำได้ ${it.v} ครั้งแล้วยังเหลือแรงอีก ~${it.rir||2} ครั้ง`):'';
  const tag=it.painSub?`<p class="f-tag">แทน ${EX[it.orig][0]} เพราะเจ็บ${it.painSub}</p>`:it.orig&&it.orig!==it.id?`<p class="f-rx">แทน ${EX[it.orig][0]}</p>`:'';
  const canSwap=!!ALT[it.orig||it.id];
  $('#focus').innerHTML=`<div class="f-in">
   <div class="f-top"><button class="f-btn" data-act="fclose" aria-label="ปิดโหมดโฟกัส">${ic('down')}</button><div class="f-pos num">ท่า ${F.i+1} จาก ${L.length}<small>${esc(clean(b.t))}</small></div><button class="f-btn" data-act="exinfo" data-id="${it.id}" aria-label="วิธีทำ ${esc(ex[0])}">${ic('info')}</button></div>
   <div class="f-prog" role="progressbar" aria-valuemin="0" aria-valuemax="${tot}" aria-valuenow="${dn}" aria-label="ความคืบหน้าทั้งเซสชัน"><i style="width:${tot?dn/tot*100:0}%"></i></div>
   ${FIG.has(it.id)?`<svg class="f-fig" id="ffig" role="img" aria-label="หุ่นสาธิตท่า ${esc(ex[0])}"></svg>`:''}
   <h2 class="f-name">${ex[0]}</h2>
   <p class="f-rx num">${rxText(it,true)}${it.hi?tip('rir'):''}${it.rest?` · พัก ${it.rest} วิ`:''}</p>${sug?`<p class="f-sug">${sug}</p>`:''}${tag}
   <div class="f-sets" id="fsets"></div>
   <div class="f-ctl" id="fctl"></div>
   <div class="f-nav"><button class="btn plain sq" data-act="fprev" ${F.i===0?'disabled':''} aria-label="ท่าก่อนหน้า">${ic('left')}</button>${canSwap?`<button class="btn plain" data-act="swap" data-k="${it.slot}">${ic('swap')}เปลี่ยนท่า</button>`:''}<button class="btn plain" data-act="fnext" ${F.i>=L.length-1?'disabled':''}>ท่าถัดไป${ic('chev')}</button></div>
  </div>`;
  if(fanim){fanim.stop();fanim=null}
  if(FIG.has(it.id))fanim=FIG.play($('#ffig'),it.id);
  refreshCtl();
}
function refreshCtl(){
  if(!focusOpen()||!$('#fctl'))return;
  const L=flat(),{it}=L[F.i],ex=EX[it.id],f=ex[2],a=doneArr(cur,it);
  const all=L.every(x=>firstUndone(x.it)<0);
  $('#fsets').innerHTML=a.map((d,j)=>`<button class="sc${d?' f':''}${j===F.set?' cur':''}" data-act="fset" data-i="${j}" aria-label="เซ็ต ${j+1}${d?' ทำแล้ว':''}" ${j===F.set?'aria-current="step"':''}>${d?ic('check'):j+1}</button>`).join('');
  const pr=$('.f-prog i');if(pr){const {tot,dn}=sessionCount(cur);pr.style.width=(tot?dn/tot*100:0)+'%'}
  let h='';
  if(T){
    h=`<div class="f-timer" role="timer"><div class="fl" id="fL">${esc(T.label)}</div><div class="ft" id="fT">${fmtClock(Math.ceil(Math.max(0,(T.end-Date.now())/1000)))}</div><div class="fb"><i id="fB"></i></div><div class="acts"><button class="btn plain" data-act="t15">+15 วิ</button><button class="btn" data-act="tskip">${T.isRest?'ข้ามการพัก':'หยุดจับเวลา'}</button></div></div>`;
  }else if(all&&!isLogged(cur.date,cur.type)&&cur.type!=='game'){
    h=`<div class="f-done"><div class="mark">${ic('check')}</div><h2>ครบทุกเซ็ตแล้ว</h2><p class="meta" style="margin:4px 0 16px">บันทึกเวลาและความเหนื่อย แล้วดูความต่อเนื่องของคุณ</p><button class="btn" data-act="finish">จบเซสชันและบันทึก</button></div>`;
  }else if(all){
    h=`<div class="f-done"><div class="mark">${ic('check')}</div><h2>${cur.type==='game'?'วอร์มอัพ/คูลดาวน์ครบ':'ทำครบแล้ว'}</h2><p class="meta" style="margin:4px 0 16px">${cur.type==='game'?'อย่าลืมบันทึกผลเกมในหน้าวันนี้':'เซสชันนี้บันทึกไว้แล้ว'}</p><button class="btn tint" data-act="fclose">กลับหน้าวันนี้</button></div>`;
  }else if(it.id==='rand_corner'){
    h=`<button class="btn" data-act="rcstart" data-k="${it.slot}">${ic('target')}เริ่มสุ่มมุม ${it.sets} รอบ × ${fmtSec(it.v)}</button>`;
  }else if(a[F.set]){
    h=`<p class="meta" style="text-align:center;margin-bottom:12px">เซ็ต ${F.set+1} ทำแล้ว${(()=>{const x=(getDraft(cur.date,cur.type).data[it.slot]||[])[F.set]||{};return x.r?` · ${x.w?x.w+' กก. × ':''}${x.r} ครั้ง`:''})()}</p><button class="btn plain" data-act="fundo">${ic('undo')}ยกเลิกเซ็ตนี้</button>`;
  }else if(f.t){
    h=`<div class="big-time num">${fmtClock(it.v)}<span class="meta" style="font-size:17px">${f.u?' /ข้าง':''}</span></div><button class="btn" data-act="fplay">${ic('play')}เริ่มจับเวลาเซ็ต ${F.set+1}</button>`;
  }else{
    const d=getDraft(cur.date,cur.type).data[it.slot]||[],x=d[F.set]||{},prev=F.set>0?(d[F.set-1]||{}):{};
    const sw=it.db?suggestW(it.id,cur.ph,it):null;
    const wv=x.w??prev.w??(sw?sw.w:''),rv=x.r??prev.r??it.v;
    h=`<div class="steps">${it.db?`<div class="step"><span class="lb">น้ำหนัก<br>${f.u?'ต่อมือ':'ต่อข้าง'}</span><button data-act="wstep" data-v="-1" aria-label="ลดน้ำหนัก">${ic('minus')}</button><input id="fw" inputmode="decimal" value="${wv}" placeholder="–" aria-label="น้ำหนัก กิโลกรัม"><span class="u">กก.</span><button data-act="wstep" data-v="1" aria-label="เพิ่มน้ำหนัก">${ic('plus')}</button></div>`:''}
      <div class="step"><span class="lb">จำนวน<br>ครั้ง${f.u?'/ข้าง':''}</span><button data-act="rstep" data-v="-1" aria-label="ลดจำนวนครั้ง">${ic('minus')}</button><input id="fr" inputmode="numeric" value="${rv}" aria-label="จำนวนครั้ง"><span class="u">ครั้ง</span><button data-act="rstep" data-v="1" aria-label="เพิ่มจำนวนครั้ง">${ic('plus')}</button></div></div>
      <button class="btn" data-act="flog">${ic('check')}บันทึกเซ็ต ${F.set+1}${it.hi?` · เป้า ${it.v}–${it.hi} ครั้ง`:''}</button>`;
  }
  $('#fctl').innerHTML=h;
}
function advanceAfter(it){
  const L=flat(),nx=firstUndone(it);let label='';
  if(nx>=0){F.set=nx;label=`พัก · ต่อไป${nx===it.sets-1?'เซ็ตสุดท้าย':' เซ็ต '+(nx+1)}`;if(nx===it.sets-1)say('ต่อไปเซ็ตสุดท้าย')}
  else{let j=-1;for(let s=1;s<=L.length;s++){const c=(F.i+s)%L.length;if(firstUndone(L[c].it)>=0){j=c;break}}
    if(j<0){beep(990,.3);renderFocus();return}
    const moved=j!==F.i;F.i=j;F.set=firstUndone(L[j].it);label=`พัก · ต่อไป ${EX[L[j].it.id][0]}`;if(moved){renderFocus()}}
  if(it.rest&&it.id!=='rand_corner')startTimer(label,it.rest,null,true);
  refreshCtl();
}
function stepW(dir){
  const el=$('#fw');if(!el)return;const v=parseFloat(el.value)||0,l=dbList();let n;
  if(l.length)n=dir>0?(l.find(x=>x>v)??(v||l[0])):([...l].reverse().find(x=>x<v)??l[0]);
  else n=Math.max(0,v+dir);
  el.value=n;const x=setArr(flat()[F.i].it.slot,F.set);x.w=String(n);save();
}
function stepR(dir){const el=$('#fr');if(!el)return;const n=Math.max(0,(parseInt(el.value)||0)+dir);el.value=n;const x=setArr(flat()[F.i].it.slot,F.set);x.r=String(n);save()}

/* ---------- ตาราง ---------- */
function vPlan(){
  const td=today(),m=mon(td),ph=phaseIdx(td),tdays=tournDays(td);
  let h=lt('ตาราง',`รอบ 4 สัปดาห์ · ตอนนี้ ${PH[ph].n}`);
  h+=sec('รอบฝึก 4 สัปดาห์')+`<div class="grp"><div class="phases">${PH.map((p,i)=>`<div class="${i===ph?'on':''}" ${i===ph?'aria-current="step"':''}>สัปดาห์ ${i+1}<b>${p.n}</b></div>`).join('')}</div><div class="rowx" style="padding-top:0"><p class="meta">${PH[ph].d}</p></div>${row({t:'เริ่มรอบใหม่ตั้งแต่สัปดาห์นี้',act:'cycle',cls:'link',chev:false})}</div>`;
  h+=`<p class="foot">สัปดาห์ที่ 4 เป็นสัปดาห์เบา (Deload) ${tip('deload')}</p>`;
  h+=sec('โหมดก่อนแข่ง')+`<div class="grp"><label class="row has-i">${ic('trophy','row-i')}<span class="row-t">วันแข่งรายการถัดไป${tdays!=null?`<small>อีก ${tdays} วัน</small>`:''}</span><input class="row-in" type="date" data-ch="tourn" value="${state.settings.tourn||''}" aria-label="วันแข่งรายการถัดไป"></label>${state.settings.tourn?row({t:'ล้างวันแข่ง',act:'tournclr',cls:'link',chev:false}):''}</div>`;
  h+=`<p class="foot">ใส่วันแข่ง แอปจะลดปริมาณการฝึก 10 วันก่อนแข่ง (Taper) ${tip('taper')}</p>`;
  const opts=t=>Object.keys(TYPES).filter(k=>k!=='game'&&!TYPES[k].extra).map(k=>`<option value="${k}" ${k===t?'selected':''}>${TYPES[k].n}</option>`).join('');
  h+=sec('วันฝึกประจำสัปดาห์')+`<div class="grp">${ORDER.map(dow=>{
    const d=addD(m,(dow+6)%7);
    if(dow===GAME_DOW)return row({tag:'div',i:'shuttle',t:DNF[dow],v:'ตีเกม (ล็อก)',chev:false});
    const t=state.week[dow]||'rest',w=ctxAdjust(d,t).notes;
    return selRow({i:TIC[t],t:DNF[dow],sub:w.length?`<span class="warnline">${clean(w[0].split(' — ')[0])} · ระบบลดให้เอง</span>`:'',v:TYPES[t].n,ch:'week',attrs:`data-d="${dow}"`},opts(t));
  }).join('')}</div>`;
  const curW=JSON.stringify(state.week);
  h+=sec('ตารางสำเร็จรูป')+`<div class="grp">${Object.entries(PRESETS).map(([k,p])=>row({t:p.n,act:'preset',attrs:`data-p="${k}"`,chev:false,post:JSON.stringify({...p.w,5:'game'})===curW?ic('check','row-i'):''})).join('')}</div>`;
  h+=sec('หลักการที่ระบบใช้ปรับโปรแกรม')+`<div class="foot" style="margin-top:0"><ul>
  <li>วันพฤหัส (ก่อนเกม) งานขาหนักลดครึ่งและตัดท่ากระโดด</li>
  <li>วันพุธ (2 วันก่อนเกม) งานขาหนักลด 20% · วันเสาร์ (หลังเกม) ลด 30%</li>
  <li>งานขาหนัก 2 วันติดกัน วันที่สองลด 15%</li>
  <li>ความพร้อมต่ำ หรือชีพจรตอนตื่นสูงกว่าปกติ → ลดเซ็ต / ตัดกระโดด / แนะนำพัก</li>
  <li>มีอาการเจ็บ → เปลี่ยนเป็นท่าที่ไม่ลงน้ำหนักจุดนั้น หรือตัดออกถ้าเจ็บมาก</li>
  <li>ภาระสัปดาห์นี้สูงกว่าค่าเฉลี่ย 3 สัปดาห์ก่อนเกิน 30% → ลด 15%</li>
  <li>เวลาน้อย → ตัดท่าเสริมก่อน เก็บท่าหลักไว้</li>
  <li>น้ำหนักเดิมเพิ่มทีละครั้งจนถึงเพดานทุกเซ็ต แล้วค่อยขยับดัมเบล</li>
  <li>คุมความหนักด้วย "เหลือแรง" ไม่ฝืนจนหมดแรง ให้ขายังสดสำหรับการตีแบด</li></ul></div>`;
  return h;
}

/* ---------- คลังท่า ---------- */
function vLib(){
  let h=lt('คลังท่า',`${CATS.reduce((a,[,ids])=>a+ids.length,0)} ท่า · แตะเพื่อดูหุ่นสาธิตและวิธีทำ`);
  h+=`<label class="search">${ic('search')}<input type="search" id="libq" placeholder="ค้นหาท่า เช่น squat, ไหล่, ข้อเท้า" aria-label="ค้นหาท่า"></label>`;
  h+=`<div class="chips" role="group" aria-label="หมวดท่า"><button class="chip ${!libCat?'on':''}" data-act="libcat" data-c="">ทั้งหมด</button>${CATS.map(([c])=>`<button class="chip ${libCat===c?'on':''}" data-act="libcat" data-c="${c}" aria-pressed="${libCat===c}">${clean(c)}</button>`).join('')}</div>`;
  return h+`<div id="liblist">${libList('')}</div>`;
}
function libList(q){
  q=q.trim().toLowerCase();
  return CATS.filter(([c])=>!libCat||libCat===c).map(([c,ids])=>{
    const items=ids.filter(id=>{if(!q)return true;const D=(window.EXD||{})[id]||{};return (EX[id][0]+' '+EX[id][1]+' '+(D.m||'')+' '+c).toLowerCase().includes(q)});
    if(!items.length)return '';
    return sec(clean(c))+`<div class="grp">${items.map(id=>`<button class="row" data-act="exinfo" data-id="${id}"><span class="thumb">${thumb(id)}</span><span class="row-t"><b>${EX[id][0]}</b><small>${((window.EXD||{})[id]||{}).m||EX[id][1]}</small></span>${ic('chev','chev')}</button>`).join('')}</div>`;
  }).join('')||`<div class="grp"><div class="empty">${ic('search')}<div>ไม่พบท่าที่ค้นหา ลองคำอื่น เช่น ชื่อกล้ามเนื้อหรือภาษาอังกฤษ</div></div></div>`;
}

/* ---------- ความก้าวหน้า ---------- */
function streak(){const has=w=>state.logs.some(l=>l.type!=='desk'&&mon(l.date)===w);let w=mon(today());if(!has(w))w=addD(w,-7);let n=0;while(has(w)&&n<520){n++;w=addD(w,-7)}return n}
function heatmap(){
  const td=today(),start=addD(mon(td),-77);let cells='',months='',lastM=-1;
  for(let wk=0;wk<12;wk++){const ws=addD(start,wk*7),mo=pd(ws).getMonth();months+=`<span>${mo!==lastM?TM[mo]:''}</span>`;lastM=mo;
    for(let d=0;d<7;d++){const day=addD(ws,d),L=state.logs.filter(l=>l.date===day);
      const c=day>td?'fu':L.some(l=>l.type==='game')?'g':L.some(l=>l.type!=='desk')?'t':L.length?'d':'';
      cells+=`<i class="${c}${day===td?' now':''}"></i>`}}
  const n=state.logs.filter(l=>l.date>=start&&l.type!=='desk').length;
  return `<div class="heat"><div class="heat-m" aria-hidden="true">${months}</div><div class="heat-g" role="img" aria-label="12 สัปดาห์ล่าสุด ฝึกและตีเกมรวม ${n} ครั้ง">${cells}</div>
  <div class="legend"><span><i style="background:var(--ac)"></i>ฝึก</span><span><i style="background:var(--game)"></i>ตีเกม</span><span><i style="background:var(--fill)"></i>ไม่ได้ฝึก</span></div></div>`;
}
function weekSummary(){
  const td=today(),m=mon(td),days=[0,1,2,3,4,5,6].map(i=>addD(m,i));
  const planned=days.filter(d=>typeOf(d)!=='rest').length;
  const done=new Set(state.logs.filter(l=>mon(l.date)===m&&l.type!=='desk').map(l=>l.date+l.type)).size;
  const sl=days.map(d=>(state.health[d]||{}).sleep).filter(Boolean),slAvg=sl.length?Math.round(sl.reduce((a,b)=>a+b,0)/sl.length*10)/10:null;
  const a=acwr(td),pain=activePain(td),pa=Object.keys(pain),t=state.tests[state.tests.length-1],as=t&&t.r.hopL&&t.r.hopR?Math.round(Math.abs(t.r.hopL-t.r.hopR)/Math.max(t.r.hopL,t.r.hopR)*100):null;
  const games=state.logs.filter(l=>l.type==='game'&&mon(l.date)===m);
  const rec=[];
  if(!state.logs.length)rec.push('ยังไม่มีบันทึก เริ่มเซสชันแรกจากแท็บวันนี้ แล้วสรุปตรงนี้จะเริ่มแนะนำให้');
  if(a&&a.ratio>1.3)rec.push('ภาระสัปดาห์นี้สูงกว่าปกติมาก สัปดาห์หน้าลดวันหนักลง 1 วัน');
  if(a&&a.ratio<.7&&done>0)rec.push('ภาระต่ำกว่าปกติ ค่อยๆ เพิ่มกลับ ไม่เพิ่มทีเดียวเกิน 10–20%');
  if(state.logs.length&&done<planned-1&&td>=addD(m,4))rec.push('ฝึกได้น้อยกว่าแผน ลองเลือก "20 นาที" ในวันที่ยุ่ง จะได้ฝึกต่อเนื่อง');
  if(pa.length)rec.push(`มีอาการเจ็บ${pa.map(x=>AREAS[x]).join(', ')} เพิ่มวันป้องกันบาดเจ็บ ถ้าไม่ดีขึ้นใน 1–2 สัปดาห์ควรพบผู้เชี่ยวชาญ`);
  if(slAvg&&slAvg<6.5)rec.push(`นอนเฉลี่ย ${slAvg} ชม. การนอน 7–9 ชม. ช่วยฟื้นตัวและความเร็วในการตอบสนอง`);
  if(as!=null&&as>=15)rec.push(`ขาซ้าย–ขวาแรงต่างกัน ${as}% ทำท่าขาเดียวโดยเริ่มขาที่อ่อนกว่า และเพิ่ม 1 เซ็ตให้ขาที่อ่อน`);
  if(testDue()&&state.logs.length>=3)rec.push('ถึงรอบทดสอบสมรรถภาพ (ทุก 4 สัปดาห์)');
  const lb=state.settings.lastBackup;if(state.logs.length>3&&(!lb||dayDiff(lb,td)>14))rec.push('ไม่ได้สำรองข้อมูลเกิน 2 สัปดาห์ ไปที่ตั้งค่า → สำรองข้อมูล');
  if(!rec.length)rec.push('ทุกอย่างอยู่ในเกณฑ์ดี ทำต่อแบบนี้');
  const W=games.reduce((s,l)=>s+(+l.wins||0),0),Lo=games.reduce((s,l)=>s+(+l.losses||0),0);
  return sec('สัปดาห์นี้')+`<div class="grp"><div class="stat"><div><b>${done}<span class="meta" style="font-size:17px">/${planned}</span></b><small>วันที่ฝึกแล้ว / แผน</small></div><div><b>${W}–${Lo}</b><small>ชนะ–แพ้ (เกม)</small></div></div>
  <div class="rowx"><p class="meta num">${slAvg?`นอนเฉลี่ย ${slAvg} ชม. · `:''}ภาระ ${weekLoad(m)}${a?` (เฉลี่ย ${Math.round(a.avg)})`:''} ${tip('load')}</p></div>
  ${rec.map(r=>`<div class="rowx row n-warn" style="min-height:0;align-items:flex-start"><span class="dot"></span><span class="row-t" style="font-size:15px">${r}</span></div>`).join('')}</div>`;
}
function spark(vals,hiGood){
  if(vals.length<2)return '';const w=96,h=28,mn=Math.min(...vals),mx=Math.max(...vals),r=mx-mn||1;
  const pts=vals.map((v,i)=>`${(i/(vals.length-1)*w).toFixed(1)},${(h-4-(v-mn)/r*(h-8)).toFixed(1)}`).join(' ');
  const up=vals[vals.length-1]>vals[0],good=hiGood?up:!up;
  return `<span class="spark"><svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${good?'var(--ac)':'var(--warn)'}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg></span>`;
}
function vTests(){
  const T_=state.tests,last=T_[T_.length-1];
  let h=sec('ทดสอบสมรรถภาพ')+`<div class="grp">${row({i:'ruler',t:last?`ล่าสุด ${thd(last.date)}`:'ยังไม่เคยทดสอบ',sub:last?(testDue()?'ถึงรอบทดสอบแล้ว':`ครั้งถัดไป ${sdd(addD(last.date,28))}`):'ทดสอบครั้งแรกเพื่อใช้เทียบความก้าวหน้า',v:'ทดสอบ',act:'testopen'})}`;
  TESTS.forEach(t=>{
    const keys=t.lr?[t.id+'L',t.id+'R']:[t.id];
    const lines=keys.map(k=>{const vals=T_.map(x=>x.r[k]).filter(v=>v!=null&&v!=='').map(Number);if(!vals.length)return '';const lv=vals[vals.length-1],pv=vals.length>1?vals[vals.length-2]:null;
      const dlt=pv!=null?lv-pv:null,good=dlt==null?null:(t.hi?dlt>0:dlt<0);
      return `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span class="num">${t.lr?(k.endsWith('L')?'ซ้าย ':'ขวา '):''}<b>${lv}</b> ${t.u}${dlt?` <span style="color:${good?'var(--ac-ink)':'var(--warn)'}">${dlt>0?'+':''}${Math.round(dlt*10)/10}</span>`:''}</span>${spark(vals,t.hi)}</div>`}).join('');
    if(!lines)return;
    const a=t.lr&&last&&last.r[t.id+'L']&&last.r[t.id+'R']?Math.round(Math.abs(last.r[t.id+'L']-last.r[t.id+'R'])/Math.max(last.r[t.id+'L'],last.r[t.id+'R'])*100):null;
    h+=`<div class="rowx row" style="display:block"><b>${t.n}</b>${lines}${a!=null?`<div class="meta" style="color:${a>=15?'var(--warn)':'var(--tx2)'}">ซ้าย–ขวาต่างกัน ${a}%${a>=15?' ควรเสริมข้างที่อ่อน':' อยู่ในเกณฑ์ดี'}</div>`:''}</div>`;
  });
  return h+`</div>`;
}
function testSheet(){
  sheet(shh('ทดสอบสมรรถภาพ','ปิด')+`<p class="note">วอร์มอัพก่อน 10 นาที ทดสอบในวันที่ร่างกายสด (ไม่ใช่วันหลังเกม) และใช้วิธีเดิมทุกครั้งเพื่อเทียบผลได้ ข้ามข้อที่ทำไม่ได้</p>
  ${TESTS.map(t=>`<div class="grp" style="margin-bottom:12px"><div class="field"><b>${t.n} <span class="meta" style="font-weight:400">(${t.u} · ${t.hi?'มากดี':'น้อยดี'})</span></b><p class="meta">${t.how}</p>
   <div class="g2">${t.lr?`<input class="in num" type="number" inputmode="decimal" id="t_${t.id}L" placeholder="ซ้าย" aria-label="${t.n} ซ้าย"><input class="in num" type="number" inputmode="decimal" id="t_${t.id}R" placeholder="ขวา" aria-label="${t.n} ขวา">`:`<input class="in num" type="number" inputmode="decimal" id="t_${t.id}" placeholder="${t.u}" aria-label="${t.n}">${t.w?`<input class="in num" type="number" inputmode="decimal" id="t_gobW" placeholder="น้ำหนัก กก." aria-label="น้ำหนักดัมเบล">`:''}`}</div></div></div>`).join('')}
  <button class="btn" data-act="testsave">บันทึกผลทดสอบ</button>`,'test');
}
function gameInsights(){
  const g=state.logs.filter(l=>l.type==='game').sort((a,b)=>a.date.localeCompare(b.date));if(!g.length)return '';
  const W=g.reduce((s,l)=>s+(+l.wins||0),0),Lo=g.reduce((s,l)=>s+(+l.losses||0),0);
  const mc={};g.slice(-8).forEach(l=>(l.mist||[]).forEach(m=>mc[m]=(mc[m]||0)+1));
  const top=Object.entries(mc).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const grp=[[],[]];g.forEach(l=>{const r=readiness(l.date);if(r&&(+l.wins||+l.losses))grp[r.score>=12?0:1].push(l)});
  const wr=a=>{const w=a.reduce((s,l)=>s+(+l.wins||0),0),t=a.reduce((s,l)=>s+(+l.wins||0)+(+l.losses||0),0);return t?Math.round(w/t*100):null};
  let cmp='';if(grp[0].length>=2&&grp[1].length>=2){const a=wr(grp[0]),b=wr(grp[1]);cmp=`<div class="rowx row"><span class="row-t" style="font-size:15px">วันที่ความพร้อมดี ชนะ ${a}% · วันที่ความพร้อมต่ำ ชนะ ${b}%${a-b>=10?' การพักผ่อนส่งผลต่อเกมชัดเจน':''}</span></div>`}
  return sec('สถิติการตีเกม')+`<div class="grp"><div class="stat"><div><b>${g.length}</b><small>ครั้งที่ตีเกม</small></div><div><b>${W+Lo?Math.round(W/(W+Lo)*100)+'%':'–'}</b><small>ชนะ ${W} แพ้ ${Lo}</small></div></div>${top.length?`<div class="rowx row"><span class="row-t" style="font-size:15px"><small>จุดที่พลาดบ่อย (8 ครั้งล่าสุด)</small>${top.map(([m,c])=>`${m} (${c})`).join(' · ')}</span></div>`:''}${cmp}</div>`;
}
function vHist(){
  const td=today(),m=mon(td),st=streak();
  const wks=[7,6,5,4,3,2,1,0].map(i=>addD(m,-7*i)),loads=wks.map(weekLoad),mx=Math.max(1,...loads),a=acwr(td);
  const total=state.logs.filter(l=>l.type!=='desk').length;
  let h=lt('ก้าวหน้า',total?`บันทึกทั้งหมด ${total} ครั้ง`:'');
  h+=sec('ความต่อเนื่อง')+`<div class="grp"><div class="stat"><div><b style="display:flex;align-items:center;gap:6px">${st}${st?ic('flame'):''}</b><small>สัปดาห์ติดต่อกันที่ได้ฝึก</small></div><div><b>${state.logs.filter(l=>l.date>=addD(m,-21)&&l.type!=='desk').length}</b><small>ครั้งใน 4 สัปดาห์</small></div></div>${heatmap()}</div>`;
  h+=weekSummary()+vTests()+gameInsights();
  h+=sec('ภาระการฝึกรายสัปดาห์')+`<div class="grp"><div class="rowx">${loads.some(Boolean)?`<p class="meta">นาที × RPE รวมเวทและตีแบด ${tip('load')}</p><div class="bars">${loads.map((v,i)=>`<div class="${i===7?'cur':''}" style="height:${v/mx*100}%" title="${v}"></div>`).join('')}</div><div class="blbl">${wks.map(w=>`<span>${sdd(w)}</span>`).join('')}</div>
  <p class="meta" style="margin-top:10px">${a?(a.ratio>1.3?`<span style="color:var(--warn)">สัปดาห์นี้สูงกว่าค่าเฉลี่ย ${Math.round((a.ratio-1)*100)}% ระวังบาดเจ็บ</span>`:`สัปดาห์นี้ ${a.cur} / ค่าเฉลี่ย ${Math.round(a.avg)} อยู่ในช่วงปลอดภัย`):'บันทึกต่อเนื่อง 3 สัปดาห์ขึ้นไปจะเห็นการเตือนภาระเกิน'}</p>`:`<div class="empty" style="padding:12px 0">${ic('chart')}<div>กราฟจะขึ้นหลังบันทึกเซสชันแรก ${tip('load')}</div></div>`}</div></div>`;
  const ws=Object.entries(state.lastW).filter(([id])=>EX[id]);
  if(ws.length)h+=sec('น้ำหนักล่าสุดต่อท่า')+`<div class="grp">${ws.map(([id,w])=>row({tag:'div',t:EX[id][0],sub:sdd(w.date),v:`<b class="num" style="color:var(--tx)">${w.w} กก.</b><br><small style="color:${w.ok?'var(--ac-ink)':'var(--tx2)'}">${w.ok?'พร้อมเพิ่มน้ำหนัก':'เพิ่มจำนวนครั้งก่อน'}</small>`,chev:false})).join('')}</div>`;
  const logs=[...state.logs].sort((x,y)=>y.date.localeCompare(x.date)||y.id-x.id).slice(0,40);
  h+=sec('ประวัติ')+`<div class="grp">${logs.length?logs.map(l=>row({tag:'div',i:TIC[l.type]||'body',t:TYPES[l.type]?.n||l.type,sub:`<span class="num">${thd(l.date)} · ${l.minutes} นาที · RPE ${l.rpe}${l.type==='game'&&l.wins!=null?` · ชนะ ${l.wins} แพ้ ${l.losses}`:''}${l.total?` · ${l.done}/${l.total} เซ็ต`:''}</span>${l.notes?`<br>${esc(l.notes)}`:''}`,chev:false,post:`<button class="x" data-act="del" data-id="${l.id}" aria-label="ลบบันทึก ${thd(l.date)}">ลบ</button>`})).join(''):`<div class="empty">${ic('book')}<div>ยังไม่มีบันทึก<br>ทำเซสชันแรกจากแท็บวันนี้ แล้วประวัติจะขึ้นที่นี่</div><div style="height:12px"></div><button class="btn sm" data-nav="today">ไปหน้าวันนี้</button></div>`}</div>`;
  return h;
}

/* ---------- ตั้งค่า ---------- */
function vSet(){
  const st=state.settings,lb=st.lastBackup;
  const url=location.origin+location.pathname;
  let h=lt('ตั้งค่า');
  h+=sec('โปรไฟล์การฝึก')+`<div class="grp">
   ${selRow({i:'body',t:'ระดับ',v:lvN(st.level),ch:'level'},LEVELS.map(([k,n,d])=>`<option value="${k}" ${k===st.level?'selected':''}>${n} (${d})</option>`).join(''))}
   ${selRow({i:'target',t:'เป้าหมายหลัก',v:glN(st.goal),ch:'goal'},GOALS.map(([k,n])=>`<option value="${k}" ${k===st.goal?'selected':''}>${n}</option>`).join(''))}
   <label class="row has-i">${ic('dumbbell','row-i')}<span class="row-t">ดัมเบลที่มี<small>กก. ต่อข้าง คั่นด้วย ,</small></span><input class="row-in num" type="text" data-ch="db" value="${esc(st.dumbbells)}" aria-label="น้ำหนักดัมเบลที่มี"></label>
   <label class="row has-i">${ic('calendar','row-i')}<span class="row-t">วันเริ่มรอบ 4 สัปดาห์</span><input class="row-in" type="date" data-ch="start" value="${st.start}" aria-label="วันเริ่มรอบ 4 สัปดาห์"></label></div>`;
  h+=sec('เสียง')+`<div class="grp"><label class="row has-i">${ic('speaker','row-i')}<span class="row-t">เสียงพูดภาษาไทย<small>เริ่ม · อีก 10 วินาที · มุมคอร์ท</small></span><input class="sw" type="checkbox" data-ch="voice" ${st.voice!==false?'checked':''} aria-label="เสียงพูดภาษาไทย"></label>${rtCfg(true)}</div>`;
  h+=sec('ข้อมูลสุขภาพ')+`<details class="grp"><summary class="row has-i">${ic('heart','row-i')}<span class="row-t">ดึงข้อมูลจากแอป Health อัตโนมัติ<small>ชั่วโมงนอนและชีพจรตอนตื่น ผ่านแอปคำสั่งลัด</small></span>${ic('chev','chev')}</summary>
   <div class="rowx"><ol style="margin:0;padding-left:20px;font-size:15px;line-height:1.6">
   <li>เปิดแอปคำสั่งลัด สร้างคำสั่งลัดใหม่ ชื่อ "SmashFit เช้า"</li>
   <li>เพิ่ม "ค้นหาตัวอย่างสุขภาพ" → การนอน (Sleep Analysis) 1 วันล่าสุด → รวมเป็นชั่วโมง</li>
   <li>เพิ่ม "ค้นหาตัวอย่างสุขภาพ" → ชีพจรขณะพัก (Resting Heart Rate) ค่าล่าสุด</li>
   <li>เพิ่ม "เปิด URL": <code>${esc(url)}?sleep=[ชั่วโมงนอน]&amp;rhr=[ชีพจร]</code></li>
   <li>ตั้งระบบอัตโนมัติให้รันทุกเช้า หรือกดก่อนฝึก</li></ol></div></details>`;
  h+=sec('สำรองข้อมูล')+`<div class="grp">${FRAMED?'':row({i:'download',t:'ดาวน์โหลดไฟล์สำรอง (.json)',sub:lb?`สำรองล่าสุด ${thd(lb)}`:'ยังไม่เคยสำรอง',act:'dl'})}
   <label class="row has-i">${ic('upload','row-i')}<span class="row-t">กู้คืนจากไฟล์</span>${ic('chev','chev')}<input type="file" accept=".json,application/json" data-ch="impfile" style="position:absolute;inset:0;opacity:0;cursor:pointer" aria-label="เลือกไฟล์สำรอง"></label>
   <details ${FRAMED?'open':''}><summary class="row has-i">${ic('copy','row-i')}<span class="row-t">คัดลอก/วางข้อความแทนไฟล์</span>${ic('chev','chev')}</summary>
   <div class="field"><textarea class="in" id="exp" readonly aria-label="ข้อมูลสำรอง">${esc(JSON.stringify(state))}</textarea><button class="btn tint" data-act="copy">คัดลอกข้อมูลสำรอง</button></div>
   <div class="field"><textarea class="in" id="imp" placeholder='วางข้อมูลสำรอง {"settings":...}' aria-label="วางข้อมูลสำรอง"></textarea><button class="btn tint" data-act="import">กู้คืนจากข้อความ</button></div></details></div>`;
  h+=`<p class="foot">ข้อมูลเก็บในเครื่องนี้เท่านั้น ไม่มีบัญชีหรือเซิร์ฟเวอร์ ควรสำรองทุก 1–2 สัปดาห์</p>`;
  h+=sec('ใช้งานเหมือนแอปบน iPhone')+`<div class="grp"><div class="rowx"><ol style="margin:0;padding-left:20px;font-size:15px;line-height:1.6"><li>เปิดหน้านี้ใน Safari</li><li>แตะปุ่มแชร์ แล้วเลือก "เพิ่มไปยังหน้าจอโฮม"</li><li>เปิดจากไอคอนทุกครั้ง ข้อมูลจะอยู่ที่เดียวกัน</li></ol></div>${row({i:'phone',t:'ดูหน้าต้อนรับอีกครั้ง',act:'onbshow'})}</div>`;
  h+=`<div class="grp">${row({t:'ล้างข้อมูลทั้งหมด',act:'reset',cls:'danger',chev:false})}</div>`;
  return h;
}

/* ================= หน้าต้อนรับ ================= */
let ONB=null;
function showOnb(){ONB={step:0,level:state.settings.level,goal:state.settings.goal,preset:'balanced',db:state.settings.dumbbells};$('#onb').classList.add('show');document.body.classList.add('lock');renderOnb()}
function renderOnb(){
  const s=ONB.step,dots=`<div class="tally" aria-label="ขั้นที่ ${s+1} จาก 3">${[0,1,2].map(i=>`<i${i<=s?' class="f"':''}></i>`).join('')}</div>`;
  const opt=(grp,k,n,d)=>`<button class="row opt" role="radio" aria-checked="${ONB[grp]===k}" data-act="onbpick" data-g="${grp}" data-v="${k}"><span class="row-t">${n}${d?`<small>${d}</small>`:''}</span>${ic('check','ok')}</button>`;
  let h=`<div class="onb-in"><div class="onb-top">${s?`<button class="btn sm plain" data-act="onbback">${ic('left')}ย้อนกลับ</button>`:'<span></span>'}${dots}<button class="btn sm plain" data-act="onbskip">ข้าม</button></div>`;
  if(s===0)h+=`<div class="mark-logo">${ic('shuttle')}</div><h1>โค้ชฟิตเนส<br>สำหรับนักแบด</h1><p class="lead">Smash Fit จัดโปรแกรมเวท ฟุตเวิร์ค และยืดเหยียดให้ทุกวัน แล้วปรับให้เองตามชีวิตจริงของคุณ</p>
    <div class="grp">${row({tag:'div',i:'shuttle',t:'ปรับรอบวันตีเกม',sub:'วันศุกร์คือวันตีเกม วันก่อนและหลังจะเบาลงให้ขาสด',chev:false})}${row({tag:'div',i:'cross',t:'ปรับตามอาการเจ็บและความพร้อม',sub:'เจ็บตรงไหน แอปเปลี่ยนหรือตัดท่าที่เสี่ยงให้',chev:false})}${row({tag:'div',i:'book',t:'ทุกท่ามีหุ่นสาธิต',sub:'วิธีทำทีละขั้น ข้อผิดพลาด และลิงก์วิดีโอ',chev:false})}</div>
    <p class="foot" style="margin:0">ไม่ต้องสมัคร ข้อมูลเก็บในเครื่องนี้เท่านั้น</p><div class="end"><button class="btn" data-act="onbnext">เริ่มตั้งค่า (3 ขั้น)</button></div>`;
  else if(s===1)h+=`<h1>คุณเล่นเวทระดับไหน</h1><p class="lead">ใช้กำหนดจำนวนเซ็ตเริ่มต้น เปลี่ยนได้ทีหลังในตั้งค่า</p>
    <div class="grp" role="radiogroup" aria-label="ระดับ">${LEVELS.map(([k,n,d])=>opt('level',k,n,d)).join('')}</div>
    ${sec('เป้าหมายหลัก')}<div class="grp" role="radiogroup" aria-label="เป้าหมาย">${GOALS.map(([k,n,d])=>opt('goal',k,n,d)).join('')}</div><div class="end"><button class="btn" data-act="onbnext">ถัดไป</button></div>`;
  else h+=`<h1>อุปกรณ์และตารางซ้อม</h1><p class="lead">บอกน้ำหนักดัมเบลที่มี แอปจะแนะนำน้ำหนักให้ทุกเซ็ต</p>
    <div class="grp"><label class="row">${ic('dumbbell','row-i')}<span class="row-t">ดัมเบลที่มี<small>กก. ต่อข้าง คั่นด้วย ,</small></span><input class="row-in num" id="onbdb" type="text" value="${esc(ONB.db)}" aria-label="น้ำหนักดัมเบลที่มี"></label></div>
    ${sec('ตารางประจำสัปดาห์ (ศุกร์ตีเกมเสมอ)')}<div class="grp" role="radiogroup" aria-label="ตารางสำเร็จรูป">${Object.entries(PRESETS).map(([k,p])=>opt('preset',k,p.n,ORDER.filter(d=>d!==GAME_DOW).map(d=>`${DN[d]} ${TYPES[p.w[d]||'rest'].n}`).join(' · '))).join('')}</div>
    <div class="end"><button class="btn" data-act="onbdone">เริ่มใช้งาน</button></div>`;
  $('#onb').innerHTML=h+`</div>`;$('#onb').scrollTop=0;
}
function finishOnb(apply){
  if(apply){const st=state.settings;st.level=ONB.level;st.goal=ONB.goal;const db=$('#onbdb');if(db&&db.value.trim())st.dumbbells=db.value.trim();state.week={...PRESETS[ONB.preset].w,5:'game'};st.start=mon(today())}
  state.settings.onboarded=true;save();ONB=null;$('#onb').classList.remove('show');document.body.classList.remove('lock');view='today';render();window.scrollTo(0,0);
  if(apply)toast('ตั้งค่าเรียบร้อย เริ่มฝึกได้เลย');
}

/* ================= ฉลอง ================= */
function celebrate(log){
  const m=mon(log.date),planned=[0,1,2,3,4,5,6].filter(i=>typeOf(addD(m,i))!=='rest').length;
  const wk=new Set(state.logs.filter(l=>mon(l.date)===m&&l.type!=='desk').map(l=>l.date+l.type)).size,st=streak();
  const n=Math.max(planned,wk);
  const cells=Array.from({length:n},(_,i)=>`<i class="${i<wk?'f':''}${i===wk-1&&log.type!=='desk'?' new':''}"></i>`).join('');
  sheet(`<div class="cele" role="status"><div class="cele-mark">${ic('check')}</div><h2>${wk>=planned&&log.type!=='desk'?'ครบตามแผนสัปดาห์นี้':'บันทึกแล้ว'}</h2><p class="meta num">${TYPES[log.type].n} · ${log.minutes} นาที${log.total?` · ${log.done}/${log.total} เซ็ต`:''}</p>
   <div class="tally lg" aria-hidden="true">${cells}</div><p class="wk num">สัปดาห์นี้ฝึกแล้ว ${wk} จาก ${planned} วัน</p>${st>=2?`<p class="streak">${ic('flame')}ต่อเนื่อง ${st} สัปดาห์</p>`:''}
   <button class="btn" data-act="fcancel">เยี่ยม</button></div>`,'cele');
}

/* ================= โหมดสุ่มมุมคอร์ท ================= */
const RT_SPD={slow:[2200,3000],mid:[1500,2200],fast:[1000,1500]};
const RT_LBL=['หน้าซ้าย','หน้าขวา','กลางซ้าย','กลางขวา','หลังซ้าย','หลังขวา'];
function rtCfg(noVoice){const s=state.settings.rtSpd||'mid';
  return selRow({i:'target',t:'ความเร็วโหมดสุ่มมุม',v:{slow:'ช้า',mid:'กลาง',fast:'เร็ว'}[s],ch:'rtspd'},`<option value="slow" ${s==='slow'?'selected':''}>ช้า (มือใหม่)</option><option value="mid" ${s==='mid'?'selected':''}>กลาง</option><option value="fast" ${s==='fast'?'selected':''}>เร็ว</option>`)+(noVoice?'':`<label class="row has-i">${ic('speaker','row-i')}<span class="row-t">เสียงพูดบอกมุม</span><input class="sw" type="checkbox" data-ch="voice" ${state.settings.voice!==false?'checked':''} aria-label="เสียงพูดบอกมุม"></label>`)}
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
    $('#rtPh').textContent=RT.phase==='prep'?'เตรียมตัว…':RT.phase==='work'?'ทำงาน!':'พัก เดินกลับกลางคอร์ท หายใจ';
    if(RT.phase==='work'&&now>=RT.next){clear();let i;do{i=Math.floor(Math.random()*6)}while(i===RT.last);RT.last=i;RT.cells[i].classList.add('on');beep(880,.12);say(RT_LBL[i]);RT.next=now+sp[0]+Math.random()*(sp[1]-sp[0]);setTimeout(()=>{if(RT&&RT.last===i)RT.cells[i].classList.remove('on')},Math.min(900,sp[0]-200))}
    if(now>=RT.end){
      if(RT.phase==='prep'){RT.phase='work';RT.end=now+RT.work*1000;RT.next=now+400;beep(990,.3)}
      else if(RT.phase==='work'){clear();beep(990,.35);setTimeout(()=>beep(990,.35),400);
        if(RT.round>=RT.rounds){const d=RT.onDone;rtStop();toast('ครบทุกรอบ เยี่ยมมาก');say('ครบทุกรอบ');d&&d();return}
        RT.phase='rest';RT.end=now+RT.rest*1000;say('พัก')}
      else{RT.round++;RT.phase='work';RT.end=now+RT.work*1000;RT.next=now+400;beep(990,.3)}
    }
  },100);
}
function rtStop(){if(RT){clearInterval(RT.iv);RT=null}$('#rt').classList.remove('show');document.querySelectorAll('#court div').forEach(c=>c.classList.remove('on'));try{speechSynthesis.cancel()}catch(e){}}

/* ================= ตัวจับเวลา ================= */
let T=null,actx=null,wl=null;
function unlockAudio(){try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume()}catch(e){}}
function beep(f=880,d=.18){try{if(!actx)return;const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=f;o.connect(g);g.connect(actx.destination);g.gain.setValueAtTime(.25,actx.currentTime);g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+d);o.start();o.stop(actx.currentTime+d)}catch(e){}}
function keepAwake(){try{if(navigator.wakeLock&&!wl)navigator.wakeLock.request('screen').then(l=>{wl=l;l.addEventListener('release',()=>wl=null)}).catch(()=>{})}catch(e){}}
function startTimer(label,sec,done,isRest){
  unlockAudio();if(T)clearInterval(T.iv);
  T={label,end:Date.now()+sec*1000,total:sec,done,last:null,isRest};
  $('#tl').textContent=label;$('#timer').classList.add('show');
  refreshCtl();T.iv=setInterval(tick,200);tick();keepAwake();
  if(!isRest)say('เริ่ม');
}
function tick(){
  if(!T)return;const left=Math.max(0,(T.end-Date.now())/1000),s=Math.ceil(left),pct=Math.min(100,100-left/T.total*100)+'%';
  $('#tt').textContent=fmtClock(s);$('#tb').style.width=pct;
  const fT=$('#fT');if(fT){fT.textContent=fmtClock(s);$('#fB').style.width=pct}
  if(s!==T.last){if(s===10&&T.total>=20)say('อีก 10 วินาที');if(s>0&&s<=3)beep(660,.12)}T.last=s;
  if(left<=0){const d=T.done,r=T.isRest;stopTimer();beep(990,.35);setTimeout(()=>beep(990,.35),400);if(r)say('ไปต่อ');d&&d()}
}
function stopTimer(){if(T){clearInterval(T.iv);T=null}$('#timer').classList.remove('show');refreshCtl()}

/* ================= Helpers ================= */
function toast(t){const e=$('#toast');e.innerHTML=ic('check')+esc(clean(t));e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),2000)}
function setArr(k,i){const dr=getDraft(cur.date,cur.type);if(!dr.start)dr.start=Date.now();const a=dr.data[k]||(dr.data[k]=[]);a[i]=a[i]||{};return a[i]}
const itemByKey=k=>{for(const b of cur.blocks)for(const it of b.items)if(it.slot===k)return it;return null};
function markDone(k,i,val){
  const x=setArr(k,i),it=itemByKey(k);x.done=val;
  if(val&&!EX[it.id][2].t){if(x.r==null||x.r==='')x.r=it.v;if(it.db&&(x.w==null||x.w==='')){const sw=suggestW(it.id,cur.ph,it);if(sw)x.w=sw.w}}
  save();
}
const keepScroll=fn=>{const y=window.scrollY;fn();window.scrollTo(0,y)};
function dlBackup(){
  try{const blob=new Blob([JSON.stringify(state)],{type:'application/json'}),a=document.createElement('a');
    a.href=URL.createObjectURL(blob);a.download=`smashfit-backup-${today()}.json`;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),4000);state.settings.lastBackup=today();save();toast('ดาวน์โหลดไฟล์สำรองแล้ว เก็บไว้ใน iCloud Drive');
  }catch(e){toast('ดาวน์โหลดไม่ได้ ใช้วิธีคัดลอกแทน')}
}
function loadBackup(txt){try{const s=JSON.parse(txt);if(!s.week||!Array.isArray(s.logs))throw 0;state=normalize(s);save();render();toast('กู้คืนสำเร็จ')}catch(err){toast('ไฟล์หรือข้อความนี้ไม่ใช่ข้อมูลสำรองของ Smash Fit')}}
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
function openFinish(){
  const dr=getDraft(cur.date,cur.type);const mins=dr.start?Math.min(180,Math.max(5,Math.round((Date.now()-dr.start)/60000))):(cur.est||30);rpeSel=0;
  sheet(shh(`จบเซสชัน: ${TYPES[cur.type].n}`,'ยกเลิก')+`<div class="grp"><div class="field"><label><div class="lbl">ใช้เวลา (นาที)</div><input class="in num" type="number" id="fm" inputmode="numeric" value="${mins}"></label></div>
  <div class="field"><div class="lbl">ความหนักโดยรวม (RPE) ${tip('rpe')}</div><div class="rpe">${[1,2,3,4,5,6,7,8,9,10].map(v=>`<button data-act="rpe" data-v="${v}" aria-pressed="false">${v}</button>`).join('')}</div><div class="lbl" style="margin-top:6px">5 สบาย · 7 หนักแต่คุมได้ · 9 เกือบหมดแรง</div></div>
  <div class="field"><label><div class="lbl">โน้ต</div><textarea class="in" id="fn"></textarea></label></div></div>
  <button class="btn" data-act="fsave">บันทึก</button>`,'finish');
}

/* ================= Events ================= */
document.addEventListener('click',e=>{
  const nb=e.target.closest('[data-nav]');if(nb){if($('#modal').classList.contains('show'))closeSheet();view=nb.dataset.nav;deskMode=false;render();window.scrollTo(0,0);return}
  const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act;
  if(a==='mclose'){if(e.target===b)closeSheet();return}
  if(b.disabled)return;
  unlockAudio();
  const k=b.dataset.k,i=+b.dataset.i;
  switch(a){
    case 'sel':sel=b.dataset.d;gRpe=0;gMist=new Set();deskMode=false;render();break;
    case 'exinfo':exSheet(b.dataset.id);break;
    case 'term':termSheet(b.dataset.t);break;
    case 'fopen':openFocus(k);break;
    case 'fclose':closeFocus();break;
    case 'fprev':if(F.i>0){F.i--;const fu=firstUndone(flat()[F.i].it);F.set=fu<0?0:fu;renderFocus()}break;
    case 'fnext':if(F.i<flat().length-1){F.i++;const fu=firstUndone(flat()[F.i].it);F.set=fu<0?0:fu;renderFocus()}break;
    case 'fset':F.set=i;refreshCtl();break;
    case 'wstep':stepW(+b.dataset.v);break;
    case 'rstep':stepR(+b.dataset.v);break;
    case 'flog':{const it=flat()[F.i].it,x=setArr(it.slot,F.set),fw=$('#fw'),fr=$('#fr');if(fr)x.r=fr.value||String(it.v);if(fw&&fw.value!=='')x.w=fw.value;markDone(it.slot,F.set,true);if(navigator.vibrate)navigator.vibrate(15);advanceAfter(it);break}
    case 'fundo':{const it=flat()[F.i].it;markDone(it.slot,F.set,false);refreshCtl();break}
    case 'fplay':{const it=flat()[F.i].it,set=F.set,slot=it.slot;startTimer(`${EX[it.id][0]} · เซ็ต ${set+1}`,it.v,()=>{markDone(slot,set,true);if(focusOpen()&&flat()[F.i]&&flat()[F.i].it.slot===slot)advanceAfter(itemByKey(slot));else refreshCtl()});break}
    case 'swap':{const it=itemByKey(k),o=it.orig||it.id,list=[o,...ALT[o]];const nx=list[(list.indexOf(it.id)+1)%list.length];
      const sw=state.swaps[cur.date]||(state.swaps[cur.date]={});if(nx===o)delete sw[k];else sw[k]=nx;
      const dr=getDraft(cur.date,cur.type);delete dr.data[k];save();keepScroll(render);if(focusOpen()){F.set=0;renderFocus()}toast(`เปลี่ยนเป็น ${EX[nx][0]}`);break}
    case 'rcstart':{const it=itemByKey(k);rtStart(it.sets,it.v,it.rest,()=>{for(let j=0;j<it.sets;j++)markDone(k,j,true);if(focusOpen())advanceAfter(it)});break}
    case 'rctry':closeSheet();rtStart(5,30,30,null);break;
    case 'rtstop':rtStop();break;
    case 't15':if(T){T.end+=15000;T.total+=15}break;
    case 'tskip':if(T){const d=T.done;stopTimer();d&&d()}break;
    case 'ci':{const c=state.checkins[sel]||(state.checkins[sel]={});c[b.dataset.f]=+b.dataset.v;save();readySheet();keepScroll(render);break}
    case 'readyopen':readySheet();break;
    case 'budget':{const v=+b.dataset.v;if(v)state.budget[sel]=v;else delete state.budget[sel];save();keepScroll(render);break}
    case 'painopen':painSheet();break;
    case 'painset':{const p=state.pain[sel]||(state.pain[sel]={});p[b.dataset.a]=+b.dataset.v;save();const y=$('#sheet').scrollTop;painSheet();$('#sheet').scrollTop=y;keepScroll(render);break}
    case 'desk':deskMode=!deskMode;render();window.scrollTo(0,0);break;
    case 'tomob':state.overrides[sel]='mobility';save();render();break;
    case 'testopen':testSheet();break;
    case 'testsave':{const r={};document.querySelectorAll('#sheet input[id^="t_"]').forEach(x=>{if(x.value!=='')r[x.id.slice(2)]=+x.value});
      if(!Object.keys(r).length){toast('ใส่ผลอย่างน้อย 1 ข้อ');break}state.tests.push({date:today(),r});save();closeSheet();view='hist';render();toast('บันทึกผลทดสอบแล้ว');break}
    case 'finish':openFinish();break;
    case 'rpe':rpeSel=+b.dataset.v;b.parentNode.querySelectorAll('button').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)});break;
    case 'fcancel':closeSheet();break;
    case 'fsave':{
      if(!rpeSel){toast('เลือกความหนัก (RPE) ก่อนบันทึก');break}
      const dr=getDraft(cur.date,cur.type),mins=+$('#fm').value||0;let tot=0,dn=0;const items=[];
      cur.blocks.forEach(bl=>bl.items.forEach(it=>{const d=dr.data[it.slot]||[];tot+=it.sets;const sets=[];for(let j=0;j<it.sets;j++){const x=d[j]||{};if(x.done)dn++;sets.push({w:x.w!=null&&x.w!==''?+x.w:null,r:x.r!=null&&x.r!==''?+x.r:null,done:!!x.done})}
        items.push({id:it.id,sets});
        if(it.db){const ws=sets.filter(x=>x.done&&x.w).map(x=>x.w);if(ws.length){const ok=sets.every(x=>x.done&&(x.r??it.v)>=(it.hi||it.v));state.lastW[it.id]={w:Math.max(...ws),ok,rpe:rpeSel,date:cur.date}}}}));
      const log={id:Date.now(),date:cur.date,type:cur.type,minutes:mins,rpe:rpeSel,load:mins*rpeSel,done:dn,total:tot,items,notes:$('#fn').value.trim(),ph:cur.ph};
      state.logs.push(log);delete state.drafts[cur.date+'|'+cur.type];save();closeSheet();stopTimer();
      if(focusOpen()){$('#focus').classList.remove('show');if(fanim){fanim.stop();fanim=null}F=null}
      deskMode=false;render();celebrate(log);break}
    case 'grpe':gRpe=+b.dataset.v;b.parentNode.querySelectorAll('button').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)});break;
    case 'gmist':{const m=b.dataset.m;gMist.has(m)?gMist.delete(m):gMist.add(m);b.classList.toggle('on');b.setAttribute('aria-pressed',gMist.has(m));break}
    case 'gsave':{
      if(!gRpe){toast('เลือกความเหนื่อย (RPE) ก่อนบันทึก');break}const mins=+$('#gm').value||0,w=+$('#gw').value||0,l=+$('#gl').value||0;
      const log={id:Date.now(),date:sel,type:'game',minutes:mins,games:w+l,wins:w,losses:l,partner:$('#gp').value.trim(),mist:[...gMist],rpe:gRpe,load:mins*gRpe,feel:$('#gf').value,notes:$('#gn').value.trim()};
      state.logs.push(log);save();gRpe=0;gMist=new Set();render();celebrate(log);break}
    case 'cycle':state.settings.start=mon(today());save();render();toast('เริ่มรอบใหม่แล้ว');break;
    case 'tournclr':state.settings.tourn='';save();render();break;
    case 'preset':state.week={...PRESETS[b.dataset.p].w,5:'game'};save();keepScroll(render);toast('ใช้ตาราง: '+PRESETS[b.dataset.p].n);break;
    case 'libcat':libCat=b.dataset.c;render();break;
    case 'del':if(b.classList.contains('arm')){state.logs=state.logs.filter(l=>String(l.id)!==b.dataset.id);save();keepScroll(render)}else{b.classList.add('arm');b.textContent='ยืนยันลบ';setTimeout(()=>{if(b.isConnected){b.classList.remove('arm');b.textContent='ลบ'}},2500)}break;
    case 'dl':dlBackup();break;
    case 'copy':{const t=$('#exp');const ok=()=>{state.settings.lastBackup=today();save();toast('คัดลอกแล้ว')};try{navigator.clipboard.writeText(t.value).then(ok).catch(()=>{t.select();toast('กดค้างที่ข้อความเพื่อคัดลอก')})}catch(err){t.select();toast('กดค้างที่ข้อความเพื่อคัดลอก')}break}
    case 'import':loadBackup($('#imp').value);break;
    case 'reset':if(b.dataset.arm){state=defState();save();render();toast('ล้างข้อมูลแล้ว');showOnb()}else{b.dataset.arm=1;b.querySelector('.row-t').textContent='แตะอีกครั้งเพื่อยืนยัน ลบทุกอย่างและกู้คืนไม่ได้';setTimeout(()=>{if(b.isConnected){delete b.dataset.arm;b.querySelector('.row-t').textContent='ล้างข้อมูลทั้งหมด'}},3500)}break;
    case 'onbnext':if(ONB.step<2){ONB.step++;renderOnb()}break;
    case 'onbback':ONB.step=Math.max(0,ONB.step-1);renderOnb();break;
    case 'onbpick':{ONB[b.dataset.g]=b.dataset.v;const db=$('#onbdb');if(db)ONB.db=db.value;renderOnb();break}
    case 'onbskip':finishOnb(false);break;
    case 'onbdone':finishOnb(true);break;
    case 'onbshow':showOnb();break;
  }
});
document.addEventListener('input',e=>{
  const t=e.target;if(t.id==='libq'){$('#liblist').innerHTML=libList(t.value);return}
  if((t.id==='fw'||t.id==='fr')&&F){const x=setArr(flat()[F.i].it.slot,F.set);x[t.id==='fw'?'w':'r']=t.value;save()}
});
document.addEventListener('change',e=>{
  const t=e.target,c=t.dataset.ch;if(!c)return;
  const st=state.settings;
  if(c==='swapday'){const dow=pd(sel).getDay();if(t.value===state.week[dow])delete state.overrides[sel];else state.overrides[sel]=t.value;save();keepScroll(render)}
  else if(c==='week'){state.week[t.dataset.d]=t.value;save();keepScroll(render)}
  else if(c==='level'||c==='goal'){st[c]=t.value;save();keepScroll(render);toast('บันทึกแล้ว')}
  else if(c==='db'){st.dumbbells=t.value;save();toast('บันทึกแล้ว')}
  else if(c==='start'&&t.value){st.start=t.value;save();toast('บันทึกแล้ว')}
  else if(c==='tourn'){st.tourn=t.value;save();keepScroll(render)}
  else if(c==='rtspd'){st.rtSpd=t.value;save();const v=t.closest('.row').querySelector('.row-v');if(v)v.textContent={slow:'ช้า',mid:'กลาง',fast:'เร็ว'}[t.value]}
  else if(c==='voice'){st.voice=t.checked;save()}
  else if(c==='sleepH'||c==='rhr'){const h=state.health[sel]||(state.health[sel]={});const v=parseFloat(t.value);
    if(c==='sleepH'){if(v>0){h.sleep=v;(state.checkins[sel]=state.checkins[sel]||{}).sleep=sleepScore(v)}else delete h.sleep}
    else{if(v>0)h.rhr=v;else delete h.rhr}
    save();if(sheetKind==='ready')readySheet();keepScroll(render)}
  else if(c==='impfile'){const f=t.files&&t.files[0];if(!f)return;const r=new FileReader();r.onload=()=>loadBackup(r.result);r.readAsText(f)}
});
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape')return;
  if($('#modal').classList.contains('show'))closeSheet();
  else if(RT)rtStop();
  else if(focusOpen())closeFocus();
});
/* ปัดชีตลงเพื่อปิด */
(function(){let y0=null,dy=0;const sh=$('#sheet');
  sh.addEventListener('touchstart',e=>{y0=sh.scrollTop<=0?e.touches[0].clientY:null;dy=0},{passive:true});
  sh.addEventListener('touchmove',e=>{if(y0==null)return;dy=e.touches[0].clientY-y0;if(dy>0){sh.style.transform=`translateY(${dy}px)`;sh.style.transition='none'}},{passive:true});
  sh.addEventListener('touchend',()=>{if(y0==null)return;sh.style.transition='transform .25s var(--ease)';if(dy>110)closeSheet();sh.style.transform='';y0=null});
})();
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&T)tick()});

/* ================= เริ่มต้น ================= */
importHealth();
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist().catch(()=>{})}catch(e){}
if('serviceWorker' in navigator&&document.querySelector('link[rel="manifest"]')){try{navigator.serviceWorker.register('sw.js').catch(()=>{})}catch(e){}}
render();
if(!state.settings.onboarded)showOnb();
