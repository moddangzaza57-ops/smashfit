'use strict';
/* ================= ค่าคงที่ ================= */
const KEY='smashfit.v1';
const GAME_DOW=5; // วันศุกร์ = ตีเกม (ล็อก)
const DN=['อา','จ','อ','พ','พฤ','ศ','ส'];
const DNF=['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
const TM=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const ORDER=[1,2,3,4,5,6,0];

// load: 0 พัก, 1 เบา, 2 ปานกลาง, 3 หนัก | legs: ใช้ขาหนัก
const TYPES={
  game:{n:'ตีเกมแบด',ic:'🏸',load:3,legs:true},
  lower:{n:'เวทขา–สะโพก',ic:'🦵',load:3,legs:true},
  upper:{n:'เวทบน–ไหล่–แขน',ic:'💪',load:2,legs:false},
  full:{n:'เวททั้งตัว',ic:'🏋️',load:3,legs:true},
  power:{n:'พลังระเบิด + สปีด',ic:'⚡',load:3,legs:true},
  footwork:{n:'ฟุตเวิร์ค',ic:'👟',load:2,legs:true},
  cardio:{n:'คาร์ดิโอแบบแบด (HIIT)',ic:'🔥',load:3,legs:true},
  prehab:{n:'ป้องกันบาดเจ็บ + แกนกลาง',ic:'🛡️',load:1,legs:false},
  mobility:{n:'ยืดเหยียด / ฟื้นฟู',ic:'🧘',load:1,legs:false},
  rest:{n:'พัก',ic:'😴',load:0,legs:false},
  desk:{n:'ยืดระหว่างทำงาน 5 นาที',ic:'🪑',load:0,legs:false,extra:true}
};

// รอบ 4 สัปดาห์ (periodization)
// lo–hi = ช่วงจำนวนครั้ง (Double progression) · rir = เหลือแรงอีกกี่ครั้งตอนจบเซ็ต
const PH=[
  {n:'ปรับพื้นฐาน',d:'เน้นท่าถูก 3 เซ็ต × 10–12 ครั้ง เหลือแรง ~3 ครั้ง',sets:3,lo:10,hi:12,rir:'3',rest:60,rounds:3,plus:0},
  {n:'สร้างแรง',d:'3 เซ็ต × 8–10 ครั้ง เหลือแรง ~2 ครั้ง',sets:3,lo:8,hi:10,rir:'2',rest:75,rounds:4,plus:0},
  {n:'หนัก + พลัง',d:'4 เซ็ต × 6–8 ครั้ง เหลือแรง 1–2 ครั้ง พลังระเบิดเพิ่ม 1 เซ็ต',sets:4,lo:6,hi:8,rir:'1–2',rest:90,rounds:4,plus:10},
  {n:'Deload',d:'2 เซ็ต น้ำหนัก ~80% เหลือแรง ~4 ครั้ง ให้ร่างกายซ่อมแซม',sets:2,lo:8,hi:10,rir:'4',rest:60,rounds:2,plus:0}
];

// คลังท่า: [ชื่อ, วิธีทำ, flags]  t=จับเวลา(วินาที) u=ทีละข้าง db=เวทดัมเบลหลัก p=ท่ากระโดด
const EX={
  jacks:['Jumping Jacks','วอร์มให้ตัวอุ่น หายใจสม่ำเสมอ',{t:1}],
  leg_swing:['เหวี่ยงขา หน้า–หลัง / ข้าง','จับผนัง เหวี่ยงขาผ่อนคลาย เพิ่มระยะทีละน้อย',{u:1}],
  arm_circle:['หมุนแขน + หมุนไหล่','วงเล็กไปวงใหญ่ ทั้งไปหน้าและไปหลัง',{}],
  wgs:["World's Greatest Stretch",'ก้าวยาว ศอกลงข้างเท้าหน้า แล้วบิดลำตัวเปิดแขนขึ้นฟ้า',{u:1}],
  inchworm:['Inchworm','ก้มแตะพื้น เดินมือออกไปถึงท่าวิดพื้น แล้วเดินมือกลับ',{}],
  goblet_squat:['Goblet Squat','ถือดัมเบลแนบอก ย่อจนต้นขาขนานพื้น เข่าชี้ตามปลายเท้า หลังตรง',{db:1}],
  db_rdl:['Romanian Deadlift (ดัมเบล)','เข่างอนิดเดียว พับสะโพกไปด้านหลัง หลังตรง ดัมเบลไล่ลงตามแนวขาจนตึงหลังต้นขา',{db:1}],
  rev_lunge:['Reverse Lunge','ก้าวถอยหลัง เข่าหลังเกือบแตะพื้น ดันส้นเท้าหน้ากลับที่เดิม',{db:1,u:1}],
  lat_lunge:['Lateral Lunge','ก้าวออกข้างกว้าง นั่งลงที่สะโพกฝั่งที่ก้าว เหมือนรับลูกข้างคอร์ท แล้วดันกลับเร็ว',{db:1,u:1}],
  bss:['Bulgarian Split Squat','เท้าหลังพาดเก้าอี้ ลงตรงๆ ลำตัวเอนหน้าเล็กน้อย คุมเข่าไม่ให้บิดเข้าใน',{db:1,u:1}],
  sl_rdl:['Single-leg RDL','ยืนขาเดียว พับสะโพก ขาหลังยืดเป็นเส้นตรง ฝึกทรงตัวและหลังต้นขา',{db:1,u:1}],
  calf:['Single-leg Calf Raise','ยืนขอบบันไดขาเดียว ขึ้นสุด ลงช้า 3 วินาที ช่วยเอ็นร้อยหวาย (ถือดัมเบลได้)',{u:1}],
  tib:['Tibialis Raise','พิงกำแพง เท้าห่างออกมา ยกปลายเท้าขึ้น–ลง ช่วยหน้าแข้งและข้อเท้า',{}],
  copen:['Copenhagen Plank (แบบง่าย)','นอนตะแคง เข่าบนพาดเก้าอี้ ยกสะโพกค้างไว้ ป้องกันขาหนีบ',{t:1,u:1}],
  floor_press:['DB Floor Press','นอนหงายบนพื้น ศอกทำมุม ~45° กับลำตัว ดันขึ้นแล้วลงช้า',{db:1}],
  row:['One-arm DB Row','มือหนึ่งยันเก้าอี้ ดึงดัมเบลเข้าหาสะโพก บีบสะบัก',{db:1,u:1}],
  ohp:['Half-kneeling DB Press','คุกเข่าข้างเดียว เกร็งท้อง ดันดัมเบลขึ้นเหนือหัว ไม่แอ่นหลัง',{db:1,u:1}],
  pullover:['DB Pullover','นอนหงาย ถือดัมเบลสองมือ เหยียดไปเหนือหัวแล้วดึงกลับ เสริมแรงตบ',{db:1}],
  rear_fly:['Rear Delt Fly','ก้มตัว กางแขนออกข้าง บีบสะบัก ใช้น้ำหนักเบา',{}],
  push_press:['DB Push Press','ย่อเล็กน้อยแล้วส่งแรงจากขาดันดัมเบลขึ้นเหนือหัวอย่างเร็ว',{db:1}],
  ext_rot:['Side-lying External Rotation','นอนตะแคง ศอกแนบลำตัว งอ 90° หมุนแขนขึ้นช้าๆ ใช้น้ำหนักเบามาก (ป้องกันไหล่)',{u:1}],
  ytw:['Prone Y-T-W','นอนคว่ำ ยกแขนเป็นตัว Y, T, W อย่างละครั้ง = 1 รอบ (มือเปล่าหรือดัมเบลเบามาก)',{}],
  wrist_curl:['Wrist Curl + Extension','วางแขนบนเข่า งอและเหยียดข้อมืออย่างละครึ่ง ช่วยข้อมือ/ข้อศอก',{u:1}],
  prosup:['Pronation / Supination','จับปลายดัมเบลด้านเดียว หมุนข้อมือคว่ำ–หงายช้าๆ (สำคัญกับการตีแบด)',{u:1}],
  ankle_bal:['ยืนขาเดียว','ยืนขาเดียวบนพื้นนุ่ม ถ้าง่ายไปให้หลับตา ป้องกันข้อเท้าพลิก',{t:1,u:1}],
  deadbug:['Dead Bug','นอนหงาย หลังล่างแนบพื้นตลอด เหยียดแขน–ขาฝั่งตรงข้ามสลับกัน',{u:1}],
  side_plank:['Side Plank','ลำตัวตรงจากหัวถึงเท้า สะโพกไม่ตก',{t:1,u:1}],
  suitcase:['Suitcase Carry','ถือดัมเบลข้างเดียว เดินตัวตรง ไม่เอียงตามน้ำหนัก',{t:1,u:1}],
  woodchop:['DB Woodchop','หมุนลำตัวจากสะโพก สวิงดัมเบลทแยงขึ้น เลียนแบบการตบ',{u:1}],
  pogo:['Pogo Hops','กระเด้งข้อเท้าเร็วๆ เข่างอน้อย ลงเบาที่ปลายเท้า',{t:1,p:1}],
  skater:['Skater Jump','กระโดดไปด้านข้างลงขาเดียว ทรงตัวนิ่ง 1 วินาที',{u:1,p:1}],
  lat_bound:['Lateral Bound + Stick','กระโดดข้างให้ไกลที่สุด ลงขาเดียวนิ่ง',{u:1,p:1}],
  split_jump:['Split Squat Jump','กระโดดสลับขาหน้า–หลัง ลงนุ่ม คุมเข่า',{p:1}],
  squat_jump:['Squat Jump','ย่อครึ่งเดียวแล้วกระโดดสุดแรง ลงนุ่ม พักให้เต็มทุกเซ็ต',{p:1}],
  quick_feet:['Quick Feet','ซอยเท้าถี่ที่สุดอยู่กับที่ ลำตัวต่ำแบบท่าเตรียมรับ',{t:1}],
  split_step:['Split-step + ออกตัว 4 ทิศ','สปลิตสเต็ปแล้วพุ่งออกทิศสุ่ม 1–2 ก้าว กลับกลางคอร์ท',{t:1}],
  lat_shuffle:['Lateral Shuffle','สไลด์ข้างต่ำๆ เท้าไม่ไขว้กัน',{t:1}],
  chasse:['Chassé ถอยหลัง','ถอยแบบสไลด์ข้างไปท้ายคอร์ท แล้วกลับกลาง',{t:1}],
  front_back:['หน้าเน็ต ↔ ท้ายคอร์ท','ลันจ์รับหน้าเน็ต แล้วถอย chassé ไปกระโดดตบ',{t:1}],
  six_corner:['Shadow 6 มุมคอร์ท','จำลองคอร์ท ไปแตะ 6 มุมพร้อมทำท่าตี กลับกลางทุกครั้ง',{t:1}],
  shadow_int:['Shadow Interval (เร็วสุด)','ฟุตเวิร์คเต็มคอร์ทเร็วที่สุดในเวลาที่กำหนด',{t:1}],
  burpee:['Burpee','ลงวิดพื้นแล้วกระโดดขึ้น ถ้าหนักไปให้ตัดการกระโดดออก',{t:1}],
  mtn_climb:['Mountain Climber','ท่าวิดพื้น สลับดึงเข่าเข้าอกเร็วๆ',{t:1}],
  rope:['กระโดดเชือก (หรือจำลอง)','กระโดดเบาๆ ด้วยข้อเท้า',{t:1}],
  hip9090:['Hip 90/90','นั่งขาทั้งสองงอ 90° สลับหมุนเข่าซ้าย–ขวาช้าๆ',{t:1}],
  tspine:['Open Book (หมุนอก)','นอนตะแคง เข่างอ เปิดแขนบนหมุนอกไปอีกฝั่ง',{u:1}],
  ankle_df:['Ankle Mobility พิงกำแพง','ดันเข่าไปแตะกำแพง ส้นเท้าไม่ยก',{u:1}],
  sleeper:['Sleeper Stretch (ไหล่)','นอนตะแคงทับไหล่ ใช้มืออีกข้างกดแขนลงเบาๆ',{t:1,u:1}],
  calf_str:['ยืดน่อง','ดันกำแพง ขาหลังตรง ส้นเท้าติดพื้น',{t:1,u:1}],
  hip_flex:['ยืดสะโพกหน้า','คุกเข่าข้างเดียว ดันสะโพกไปหน้า เกร็งก้น',{t:1,u:1}],
  ham_str:['ยืดหลังต้นขา','นั่งเหยียดขา พับตัวจากสะโพก',{t:1}],
  wrist_str:['ยืดข้อมือ / แขนท่อนล่าง','เหยียดแขน ดึงนิ้วลงและขึ้นเบาๆ',{t:1}],
  walk:['เดิน / ปั่นจักรยานเบาๆ','ให้เลือดไหลเวียน ยังคุยได้สบาย',{t:1}],
  jog_skip:['จ็อก / Skip เบาๆ','ให้ตัวอุ่นก่อนเริ่ม',{t:1}],
  shadow_swing:['สวิงแร็กเก็ตเปล่า','ตีลมทุกท่า เริ่มเบาไปแรง',{t:1}],
  sprint_short:['พุ่งสั้น 3–4 ก้าว','ปลุกความเร็วก่อนลงเกม',{}],
  push_up:['Push-up','ลำตัวตรงเป็นแผ่นเดียว (ทำบนเข่าได้)',{}],
  ham_slide:['Towel Hamstring Curl','นอนหงาย ส้นเท้าบนผ้า ยกสะโพก ไถออก–ดึงเข้า',{}],
  air_squat:['Bodyweight Squat','สควอทมือเปล่า ยื่นแขนไปหน้าตอนลง วอร์มสะโพก–เข่า–ข้อเท้าก่อนยกเวทขา',{}],
  glute_bridge:['Glute Bridge','นอนหงายชันเข่า ยกสะโพกขึ้นบีบก้น ค้าง 1 วินาที ปลุกกล้ามก้นก่อนเล่นขา',{}],
  chest_str:['ยืดอก–ไหล่หน้า (พิงกำแพง)','วางแขนพิงขอบกำแพงระดับไหล่ หมุนตัวออกจนตึงอก',{t:1,u:1}],
  rand_corner:['🎯 สุ่มมุมคอร์ท (ฝึกตอบสนอง)','แอปสุ่มบอกมุม ให้สปลิตสเต็ปแล้วพุ่งไป',{t:1}]
};
// กล้ามเนื้อที่ใช้ในแต่ละท่า (หุ่น 3D): 'โดนตรง|ช่วย'  — ชื่อกล้ามดู MUSCLE_TH ใน web/anatomy3d.js
// quads ต้นขาหน้า · hams หลังต้นขา · glutes ก้นใหญ่ · gmed ก้นข้าง/สะโพกข้าง · adductors ขาหนีบ · hipflex หน้าสะโพก · calves น่อง · tibialis หน้าแข้ง
// pecs อก · delts ไหล่ · rotcuff ไหล่ส่วนลึก · traps สะบัก/หลังบน · lats ปีก · biceps แขนหน้า · triceps แขนหลัง · forearms ปลายแขน · abs หน้าท้อง · obliques เอว · erectors หลังล่าง
const MUS={
  jacks:'delts calves|gmed adductors',leg_swing:'hipflex hams|gmed adductors',arm_circle:'delts rotcuff|traps',wgs:'hipflex hams adductors|obliques glutes',
  inchworm:'hams delts|abs pecs triceps',air_squat:'quads glutes|adductors',glute_bridge:'glutes|hams erectors',
  goblet_squat:'quads glutes|adductors erectors abs',db_rdl:'hams glutes|erectors forearms traps',rev_lunge:'quads glutes|hams adductors gmed',
  lat_lunge:'adductors glutes quads|gmed hams',bss:'quads glutes|hams adductors gmed',sl_rdl:'hams glutes|gmed erectors calves',
  calf:'calves|tibialis',tib:'tibialis|',copen:'adductors|obliques abs',ham_slide:'hams|glutes erectors',
  floor_press:'pecs triceps|delts',push_up:'pecs triceps|delts abs',row:'lats traps|biceps delts forearms',ohp:'delts triceps|traps abs obliques',
  pullover:'lats pecs|triceps abs',rear_fly:'delts traps|rotcuff',push_press:'delts triceps quads|glutes traps abs',
  ext_rot:'rotcuff|delts',ytw:'traps rotcuff|delts erectors',wrist_curl:'forearms|',prosup:'forearms|',ankle_bal:'calves tibialis|gmed abs',
  deadbug:'abs|hipflex obliques',side_plank:'obliques gmed|abs delts',suitcase:'obliques forearms|traps gmed abs',woodchop:'obliques abs|delts glutes',
  pogo:'calves|quads tibialis',skater:'glutes gmed quads|adductors calves',lat_bound:'glutes gmed quads|adductors calves',
  split_jump:'quads glutes|calves hams',squat_jump:'quads glutes calves|hams',
  quick_feet:'calves|quads tibialis',split_step:'calves quads|glutes adductors',lat_shuffle:'gmed adductors quads|calves glutes',
  chasse:'gmed quads calves|adductors',front_back:'quads glutes|calves adductors delts',six_corner:'quads glutes adductors|calves delts',
  rand_corner:'quads glutes calves|adductors gmed',shadow_int:'quads calves glutes|delts adductors',burpee:'quads pecs delts|triceps abs glutes',
  mtn_climb:'abs hipflex|delts quads',rope:'calves|delts forearms',
  hip9090:'glutes gmed|hipflex adductors',tspine:'obliques pecs|traps',ankle_df:'calves|tibialis',sleeper:'rotcuff|delts',
  calf_str:'calves|hams',hip_flex:'hipflex quads|',ham_str:'hams|erectors',wrist_str:'forearms|',chest_str:'pecs delts|',
  walk:'|quads hams calves glutes',jog_skip:'calves|quads hams glutes',shadow_swing:'delts pecs|obliques triceps forearms rotcuff',sprint_short:'quads glutes calves|hams'
};
const MUS_TH={quads:'ต้นขาหน้า',hams:'หลังต้นขา',glutes:'ก้น',gmed:'สะโพกด้านข้าง',adductors:'ขาหนีบ/ต้นขาด้านใน',hipflex:'หน้าสะโพก',calves:'น่อง',tibialis:'หน้าแข้ง',pecs:'อก',delts:'ไหล่',rotcuff:'ไหล่ส่วนลึก',traps:'สะบัก/หลังบน',lats:'ปีก (หลังกลาง)',biceps:'แขนหน้า',triceps:'แขนหลัง',forearms:'ปลายแขน/ข้อมือ',abs:'หน้าท้อง',obliques:'เอว/ข้างลำตัว',erectors:'หลังล่าง'};
const musclesOf=id=>{const [p,s]=(MUS[id]||'|').split('|');return {primary:p.split(' ').filter(Boolean),secondary:(s||'').split(' ').filter(Boolean)}};
const CATS=[['วอร์มอัพ',['jacks','leg_swing','arm_circle','wgs','inchworm','air_squat','glute_bridge','jog_skip','shadow_swing','sprint_short']],['ขา–สะโพก',['goblet_squat','db_rdl','rev_lunge','lat_lunge','bss','sl_rdl','ham_slide','calf','tib','copen']],['บน–ไหล่–แขน',['floor_press','push_up','row','ohp','pullover','rear_fly','push_press']],['ป้องกันบาดเจ็บ',['ext_rot','ytw','wrist_curl','prosup','ankle_bal']],['แกนกลาง',['deadbug','side_plank','suitcase','woodchop']],['พลังระเบิด',['pogo','skater','lat_bound','split_jump','squat_jump']],['ฟุตเวิร์ค',['quick_feet','split_step','lat_shuffle','chasse','front_back','six_corner','rand_corner']],['คาร์ดิโอ',['shadow_int','burpee','mtn_climb','rope']],['ยืดเหยียด–ฟื้นฟู',['walk','hip9090','tspine','ankle_df','sleeper','calf_str','hip_flex','ham_str','chest_str','wrist_str']]];

const I=(id,sets,v,rest=30)=>({id,sets,v,rest});
/* วอร์มอัพ/คูลดาวน์เฉพาะแต่ละโปรแกรม
   วอร์มอัพแบบ RAMP: Raise (ให้ตัวอุ่น) → Activate/Mobilise (ปลุกกล้ามและข้อต่อที่จะใช้ในโปรแกรมหลัก) → Potentiate (ซ้อมท่าหลักแบบเบา/เร็ว)
   ใช้ท่าเคลื่อนไหว (dynamic) ก่อนฝึก ไม่ยืดค้างนานก่อนเล่นพลัง · คูลดาวน์ = ลดชีพจร แล้วยืดค้างกล้ามที่เพิ่งใช้หนัก
   เรียงท่าสำคัญไว้หน้า: ถ้าเวลาน้อย ระบบตัดวอร์มอัพเหลือ 3 ท่าแรก และคูลดาวน์เหลือท่าแรก */
const W=(t,items)=>({t,fixed:1,items});
const WU={
  // เวทขา: สควอท/RDL/ลันจ์/ลันจ์ข้าง → ปลุกก้น สะโพก ข้อเท้า หลังต้นขา
  lower:W('วอร์มอัพ (ขา–สะโพก)',[I('jog_skip',1,120,0),I('leg_swing',1,10,0),I('air_squat',1,10,0),I('glute_bridge',1,12,0),I('wgs',1,4,0),I('ankle_df',1,8,0),I('inchworm',1,4,0)]),
  // เวทบน: ดัน/ดึง/ดันเหนือหัว/pullover → ปลุกสะบัก ไหล่ อกส่วนบน ข้อมือ
  upper:W('วอร์มอัพ (ไหล่–อก–หลัง)',[I('jacks',1,60,0),I('arm_circle',1,15,0),I('ytw',1,5,0),I('tspine',1,8,0),I('ext_rot',1,12,0),I('inchworm',1,4,0),I('push_up',1,6,0)]),
  // ทั้งตัว: ผสมขา + ไหล่
  full:W('วอร์มอัพ (ทั้งตัว)',[I('jog_skip',1,120,0),I('leg_swing',1,10,0),I('arm_circle',1,15,0),I('air_squat',1,10,0),I('glute_bridge',1,10,0),I('wgs',1,4,0),I('ytw',1,5,0),I('inchworm',1,4,0)]),
  // พลังระเบิด: ต้องอุ่นนานกว่า + ข้อเท้าพร้อมรับแรงกระแทก + ปลุกความเร็วก่อนกระโดด
  power:W('วอร์มอัพ (ก่อนกระโดด/พลัง)',[I('jog_skip',1,180,0),I('leg_swing',1,10,0),I('ankle_df',1,8,0),I('air_squat',1,10,0),I('glute_bridge',1,10,0),I('wgs',1,4,0),I('quick_feet',1,15,0),I('sprint_short',1,3,0)]),
  // ฟุตเวิร์ค: ข้อเท้า สะโพก การเคลื่อนข้าง + แขนตีไม้
  footwork:W('วอร์มอัพ (ก่อนฟุตเวิร์ค)',[I('jog_skip',1,120,0),I('leg_swing',1,10,0),I('ankle_df',1,8,0),I('wgs',1,4,0),I('lat_shuffle',1,20,0),I('shadow_swing',1,30,0),I('sprint_short',1,3,0)]),
  // HIIT: ค่อยๆ เร่งชีพจร + เตรียมไหล่/สะโพกสำหรับ burpee, mountain climber
  cardio:W('วอร์มอัพ (ก่อน HIIT)',[I('jog_skip',1,180,0),I('jacks',1,30,0),I('leg_swing',1,10,0),I('arm_circle',1,15,0),I('air_squat',1,10,0),I('inchworm',1,4,0)]),
  // ป้องกันบาดเจ็บ: อุ่นเบาๆ + ข้อต่อที่จะฝึก
  prehab:W('วอร์มอัพ (เบา)',[I('jacks',1,60,0),I('arm_circle',1,15,0),I('tspine',1,6,0),I('ankle_df',1,8,0)])
};
const CD={
  lower:W('คูลดาวน์ (ขา–สะโพก)',[I('ham_str',1,45,0),I('hip_flex',1,45,0),I('calf_str',1,45,0),I('hip9090',1,60,0),I('walk',1,90,0)]),
  upper:W('คูลดาวน์ (ไหล่–อก–ข้อมือ)',[I('chest_str',1,30,0),I('sleeper',1,45,0),I('tspine',1,6,0),I('wrist_str',1,30,0)]),
  full:W('คูลดาวน์ (ทั้งตัว)',[I('ham_str',1,45,0),I('hip_flex',1,45,0),I('chest_str',1,30,0),I('sleeper',1,45,0),I('walk',1,90,0)]),
  power:W('คูลดาวน์ (หลังกระโดด)',[I('walk',1,120,0),I('calf_str',1,45,0),I('ham_str',1,45,0),I('hip_flex',1,45,0),I('ankle_df',1,8,0)]),
  footwork:W('คูลดาวน์ (หลังฟุตเวิร์ค)',[I('walk',1,120,0),I('calf_str',1,45,0),I('hip9090',1,60,0),I('hip_flex',1,45,0),I('ham_str',1,45,0)]),
  cardio:W('คูลดาวน์ (หลัง HIIT)',[I('walk',1,180,0),I('calf_str',1,45,0),I('ham_str',1,45,0),I('hip_flex',1,45,0),I('tspine',1,6,0)]),
  prehab:W('คูลดาวน์',[I('sleeper',1,45,0),I('wrist_str',1,30,0),I('calf_str',1,30,0)])
};
const GAME_WARM={t:'วอร์มอัพก่อนลงสนาม (~10 นาที)',fixed:1,items:[I('jog_skip',1,180,0),I('leg_swing',1,10,0),I('arm_circle',1,15,0),I('ankle_df',1,8,0),I('wgs',1,4,0),I('ext_rot',1,15,0),I('lat_shuffle',1,20,0),I('split_step',1,20,0),I('shadow_swing',1,60,0),I('sprint_short',1,4,0)]};
const GAME_COOL={t:'คูลดาวน์หลังเกม',fixed:1,items:[I('walk',1,180,0),I('calf_str',1,45,0),I('hip_flex',1,45,0),I('ham_str',1,45,0),I('sleeper',1,45,0),I('chest_str',1,30,0),I('wrist_str',1,30,0)]};

function mk(ctx){
  const lv=ctx.level;
  const S=id=>{let s=ctx.P.sets; if(lv==='beg')s=Math.min(3,s); if(lv==='adv'&&ctx.ph!==3)s+=1; return {id,sets:s,v:ctx.P.lo,hi:ctx.P.hi,rir:ctx.P.rir,rest:ctx.P.rest,db:1}};
  const P=(id,v)=>({id,sets:Math.max(2,3+(ctx.ph===2?1:0)-(ctx.ph===3?1:0)),v,rest:75});
  const R=(id,sec,rest=40)=>({id,sets:ctx.P.rounds+(lv==='adv'?1:0),v:sec+ctx.P.plus,rest});
  return {S,P,R};
}
const TPL={
  lower:c=>{const {S}=mk(c);return [WU.lower,{t:'เวทหลัก',items:[S('goblet_squat'),S('db_rdl'),S('rev_lunge'),S('lat_lunge')]},{t:'เสริม / หลังขา–ข้อเท้า–ขาหนีบ',pr:2,items:[I('ham_slide',2,8,45),I('calf',3,15,45),I('tib',2,15,30),I('copen',2,20,30)]},CD.lower]},
  upper:c=>{const {S}=mk(c);return [WU.upper,{t:'เวทหลัก',items:[S('floor_press'),S('row'),S('ohp'),S('pullover')]},{t:'ไหล่–ข้อมือ (แรงตบ + ป้องกัน)',pr:2,items:[I('rear_fly',3,15,45),I('ext_rot',2,15,30),I('wrist_curl',2,15,30),I('prosup',2,12,30)]},{t:'แกนกลาง',pr:2,items:[I('woodchop',3,10,45)]},CD.upper]},
  full:c=>{const {S}=mk(c);return [WU.full,{t:'เวทหลัก',items:[S('goblet_squat'),S('row'),S('sl_rdl'),S('ohp'),S('lat_lunge')]},{t:'แกนกลาง',pr:2,items:[I('suitcase',2,30,30),I('side_plank',2,30,20)]},CD.full]},
  power:c=>{const {S,P}=mk(c);return [WU.power,{t:'พลังระเบิด (ทำตอนสด พักให้เต็ม)',items:[P('pogo',20),P('skater',5),P('lat_bound',4),P('split_jump',5),P('squat_jump',5)]},{t:'แรง',items:[S('bss'),S('push_press')]},{t:'แกนกลาง',pr:2,items:[I('woodchop',3,8,45)]},CD.power]},
  footwork:c=>{const {R}=mk(c);return [WU.footwork,{t:'ฟุตเวิร์ค (เน้นคุณภาพ ไม่ใช่เหนื่อย)',items:[R('quick_feet',20),R('split_step',30),R('lat_shuffle',30),R('chasse',30),R('front_back',30),R('six_corner',40,60)]},{t:'🎯 ฝึกตอบสนอง (สุ่มมุม)',pr:2,items:[R('rand_corner',30,30)]},{t:'ข้อเท้า',pr:2,items:[I('ankle_bal',2,30,15),I('calf',2,15,30)]},CD.footwork]},
  cardio:c=>{const {R}=mk(c);return [WU.cardio,{t:'วงจร HIIT',items:[R('shadow_int',30,30),R('burpee',30,30),R('mtn_climb',30,30),R('rope',60,60)]},CD.cardio]},
  prehab:()=>[WU.prehab,{t:'ไหล่–ข้อมือ',items:[I('ext_rot',3,15,30),I('ytw',3,6,30),I('wrist_curl',2,15,30),I('prosup',2,12,30)]},{t:'ขา–ข้อเท้า',pr:2,items:[I('tib',2,20,30),I('ankle_bal',2,30,15),I('copen',2,20,30)]},{t:'แกนกลาง',pr:2,items:[I('deadbug',3,8,30),I('side_plank',2,30,20)]},CD.prehab],
  mobility:()=>[{t:'ฟื้นฟู ~20 นาที',items:[I('walk',1,300,0),I('hip9090',2,60,0),I('tspine',2,8,0),I('ankle_df',2,10,0),I('hip_flex',1,45,0),I('ham_str',1,60,0),I('sleeper',1,45,0),I('calf_str',1,45,0),I('wrist_str',1,30,0)]}],
  rest:()=>[],
  desk:()=>[{t:'ยืดระหว่างวัน (ยืนข้างโต๊ะได้)',items:[I('arm_circle',1,15,0),I('wrist_str',1,30,0),I('leg_swing',1,10,0),I('calf_str',1,30,0),I('hip_flex',1,30,0)]}]
};
const PRESETS={
  balanced:{n:'สมดุล (แนะนำ)',w:{1:'lower',2:'footwork',3:'upper',4:'mobility',6:'prehab',0:'rest'}},
  perf:{n:'เน้นสมรรถนะ',w:{0:'power',1:'upper',2:'lower',3:'footwork',4:'mobility',6:'prehab'}},
  busy:{n:'งานยุ่ง (2 วันเวท)',w:{1:'full',2:'rest',3:'upper',4:'rest',6:'mobility',0:'rest'}}
};


// ท่าทดแทน (ปุ่มเปลี่ยนท่า และใช้ตอนมีอาการเจ็บ)
const ALT={goblet_squat:['rev_lunge','bss','sl_rdl','ham_slide'],db_rdl:['sl_rdl','ham_slide'],rev_lunge:['bss','goblet_squat','sl_rdl'],lat_lunge:['rev_lunge','copen','side_plank'],
 bss:['rev_lunge','goblet_squat'],sl_rdl:['db_rdl','ham_slide'],ham_slide:['sl_rdl','db_rdl'],floor_press:['push_up','row'],push_up:['floor_press'],
 row:['rear_fly','ytw'],ohp:['floor_press','rear_fly'],pullover:['row','rear_fly'],push_press:['ohp','goblet_squat'],rear_fly:['ytw','row'],
 calf:['tib','ankle_bal'],tib:['calf'],copen:['side_plank','deadbug'],woodchop:['deadbug','suitcase'],deadbug:['woodchop'],
 side_plank:['deadbug','suitcase'],suitcase:['side_plank','deadbug'],pogo:['quick_feet','rope'],skater:['lat_lunge','ankle_bal'],lat_bound:['skater','lat_lunge'],
 split_jump:['rev_lunge'],squat_jump:['goblet_squat','push_press'],burpee:['mtn_climb','shadow_int'],mtn_climb:['deadbug','burpee'],
 shadow_int:['six_corner','quick_feet'],six_corner:['front_back','lat_shuffle'],front_back:['six_corner','lat_shuffle'],chasse:['lat_shuffle'],
 lat_shuffle:['quick_feet'],quick_feet:['split_step'],rope:['quick_feet'],ext_rot:['ytw','rear_fly'],ytw:['ext_rot','rear_fly'],
 wrist_curl:['prosup','wrist_str'],prosup:['wrist_curl','wrist_str'],ankle_bal:['tib'],rand_corner:['six_corner'],jog_skip:['walk'],jacks:['walk'],air_squat:['glute_bridge'],glute_bridge:['deadbug'],chest_str:['tspine']};

// อาการเจ็บ → ท่าที่ลงน้ำหนักบริเวณนั้น
const AREAS={shoulder:'ไหล่',elbow:'ข้อศอก/ข้อมือ',back:'หลังล่าง',hip:'สะโพก/ขาหนีบ',knee:'เข่า',ham:'หลังต้นขา',calf:'น่อง/เอ็นร้อยหวาย',ankle:'ข้อเท้า'};
const JUMPY=['pogo','skater','lat_bound','split_jump','squat_jump','burpee','rope','jacks','quick_feet','split_step','sprint_short','jog_skip','front_back','six_corner','shadow_int','rand_corner','chasse'];
const RISK={
 shoulder:['ohp','chest_str','push_press','pullover','floor_press','push_up','burpee','mtn_climb','woodchop','side_plank','copen','inchworm','shadow_swing'],
 elbow:['wrist_curl','prosup','push_up','floor_press','row','suitcase','pullover','shadow_swing','burpee','mtn_climb','side_plank'],
 back:['db_rdl','sl_rdl','row','push_press','burpee','woodchop','squat_jump','goblet_squat','suitcase'],
 hip:['lat_lunge','copen','bss','skater','lat_bound','split_jump','wgs','lat_shuffle','six_corner','front_back','shadow_int','rand_corner','hip9090'],
 knee:['goblet_squat','air_squat','bss','rev_lunge','lat_lunge','ankle_df',...JUMPY,'mtn_climb'],
 ham:['db_rdl','sl_rdl','ham_slide','leg_swing','inchworm','sprint_short','split_jump','squat_jump','front_back','shadow_int'],
 calf:['calf',...JUMPY],
 ankle:['calf','lat_lunge','lat_shuffle','ankle_bal','skater',...JUMPY]
};

// ทดสอบสมรรถภาพทุก 4 สัปดาห์
const TESTS=[
 {id:'hop',n:'กระโดดไกลขาเดียว',u:'ซม.',lr:1,hi:1,how:'ยืนขาเดียวหลังเส้น กระโดดไปข้างหน้าให้ไกลที่สุดแล้วลงขาเดิมนิ่ง 2 วินาที วัดจากเส้นถึงส้นเท้า ทำข้างละ 2 ครั้งเอาค่าดีที่สุด'},
 {id:'six',n:'Shadow 6 มุม 12 จุด',u:'วินาที',hi:0,how:'เริ่มกลางพื้นที่ ไปแตะ หน้าซ้าย→หน้าขวา→กลางซ้าย→กลางขวา→หลังซ้าย→หลังขวา กลับกลางทุกครั้ง ทำ 2 รอบ (12 จุด) จับเวลา'},
 {id:'gob',n:'Goblet squat จำนวนครั้งสูงสุด',u:'ครั้ง',hi:1,w:1,how:'ใช้ดัมเบลน้ำหนักเดิมทุกครั้ง ทำจนท่าเริ่มเสีย (ไม่ใช่จนหมดแรง) บันทึกน้ำหนักด้วย'},
 {id:'sp',n:'Side plank ค้างนานสุด',u:'วินาที',lr:1,hi:1,how:'ค้างจนสะโพกเริ่มตก ทำทั้งสองข้าง'},
 {id:'push',n:'วิดพื้นจำนวนครั้งสูงสุด',u:'ครั้ง',hi:1,how:'ท่าเดียวกันทุกครั้ง (เต็มตัวหรือบนเข่า) ทำจนท่าเริ่มเสีย'}
];
const MISTAKES=['เสิร์ฟเสีย','ตีติดเน็ต','ตีออก','ฟุตเวิร์คช้า','เหนื่อยท้ายเกม','รับตบไม่ได้','ตัดสินใจผิด','สื่อสารคู่ไม่ดี'];
