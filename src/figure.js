/* Smash Fit — หุ่นแอนิเมชันสาธิตท่า (วาดเอง ไม่ใช้รูปภายนอก)
   พิกัด: พื้น y=0, y ขึ้นบน, หุ่นหันขวา (+x) ในมุมด้านข้าง
   pose: hip[x,y] t=มุมลำตัวจากแนวตั้ง(+ก้มไปหน้า) a=ข้อเท้า[[x,y]x2] h=มือเทียบไหล่ f=มุมเท้า(+ปลายเท้าชี้ลง)
         kb/eb=ทิศงอเข่า/ศอก e/he=ศอก(เทียบไหล่)/มือ(เทียบศอก)แบบกำหนดตรง k=เข่าเทียบสะโพกแบบกำหนดตรง
         ha=มือทั้งสองแบบพิกัดจริง do=ฝ่ามือต่อจากข้อมือ rod=ดัมเบลจับปลาย tl=สเกลลำตัว (มุมมองย่อ) */
var FIG=(function(){
'use strict';
const L={T:52,N:9,HR:10,UA:30,FA:28,TH:44,SH:42,FT:13};
const R=Math.PI/180;
const C={near:'var(--fig-near)',far:'var(--fig-far)',db:'var(--fig-db)',rk:'var(--fig-rk)',gr:'var(--fig-gr)',pr:'var(--fig-pr)'};
function base(v){return {hip:[0,89],t:0,tl:1,hd:0,a:v==='front'?[[10,4],[-10,4]]:[[3,4],[-3,4]],h:v==='front'?[[4,-56],[-4,-56]]:[[2,-56],[-2,-56]],f:[0,0],kb:v==='front'?[1,-1]:[1,1],eb:v==='front'?[1,-1]:[-1,-1]}}

// ---------- ท่าทาง ----------
const ST={};
const RDY={hip:[-6,74],t:18,a:[[10,4],[-12,4]],h:[[24,-14],[22,-30]]};
const FB=[RDY,{hip:[40,52],t:18,a:[[84,4],[-4,6]],f:[-20,30],h:[[46,-4],[-30,-30]]},RDY,{hip:[-40,96],t:-12,a:[[-34,18],[-58,22]],f:[25,30],h:[[-6,54],[30,12]],eb:[-1,1]}];
const walk=(db,d)=>({db,d:d||.38,hold:0,m:'loop',k:[
  {hip:[0,86],a:[[20,4],[-20,8]],f:[-10,30],h:[[db?0:-10,-55],[10,-54]]},
  {hip:[0,89],a:[[0,4],[-4,20]],f:[0,20],h:[[0,-56],[0,-56]]},
  {hip:[0,86],a:[[-20,8],[20,4]],f:[30,-10],h:[[db?0:10,-55],[-10,-54]]},
  {hip:[0,89],a:[[-4,20],[0,4]],f:[20,0],h:[[0,-56],[0,-56]]}]});
const skate=x=>({v:'front',m:'loop',d:.4,k:[
  {hip:[x,66],t:12,a:[[x+6,4],[x-16,24]],h:[[-34,-36],[34,-30]]},
  {hip:[0,98],a:[[10,26],[-10,26]],h:[[10,-50],[-10,-50]]},
  {hip:[-x,66],t:-12,a:[[-x+16,24],[-x-6,4]],h:[[-34,-30],[34,-36]]},
  {hip:[0,98],a:[[10,26],[-10,26]],h:[[10,-50],[-10,-50]]}]});
const PL={hip:[-2,42],t:66,a:[[-80,10],[-80,10]],f:[60,60],h:[[0,-59],[0,-59]]};
const lieSide={hip:[-40,12],t:90,a:[[-118,8],[-120,6]],kb:[-1,-1]};
const kneelH={hip:[0,50],a:[[42,4],[-42,7]],f:[0,175]};
const P={
 jacks:{v:'front',d:.45,hold:.05,k:[{a:[[9,4],[-9,4]]},{hip:[0,91],a:[[30,6],[-30,6]],h:[[34,46],[-34,46]]}]},
 leg_swing:{d:.7,k:[{a:[[50,30],[-2,4]],h:[[8,-46],[8,-46]]},{a:[[-48,16],[-2,4]],h:[[8,-46],[8,-46]]}]},
 arm_circle:{m:'loop',hold:0,d:.28,k:[0,60,120,180,240,300].map(g=>({h:[[56*Math.sin(g*R),-56*Math.cos(g*R)],[56*Math.sin(g*R),-56*Math.cos(g*R)]]}))},
 wgs:{d:.9,k:[{},{hip:[0,44],t:62,a:[[52,4],[-72,8]],f:[0,50],h:[[-6,-60],[-4,-60]]},{hip:[0,44],t:62,a:[[52,4],[-72,8]],f:[0,50],h:[[-6,-60],[2,56]],eb:[-1,1]}]},
 inchworm:{d:.9,k:[{hip:[-60,89],a:[[-57,4],[-63,4]]},{hip:[-62,88],t:160,a:[[-57,4],[-63,4]],h:[[4,-36],[2,-36]]},{hip:[18,42],t:66,a:[[-60,10],[-60,10]],f:[60,60],h:[[0,-56],[0,-56]]}]},
 goblet_squat:{db:'g',d:1.1,k:[{t:5,h:[[16,-20],[16,-20]]},{hip:[-22,46],t:35,h:[[18,-22],[18,-22]]}]},
 db_rdl:{db:'b',d:1.2,k:[{h:[[3,-56],[1,-56]]},{hip:[-20,84],t:78,h:[[0,-56],[0,-56]]}]},
 rev_lunge:{db:'b',d:1.1,k:[{hip:[8,89],a:[[10,4],[6,4]]},{hip:[-12,48],t:8,a:[[10,4],[-75,11]],f:[0,55]}]},
 lat_lunge:{v:'front',db:'g',d:1.1,k:[{hip:[-15,89],a:[[-5,4],[-25,4]],h:[[-10,-26],[10,-26]]},{hip:[22,56],t:6,a:[[58,4],[-25,4]],h:[[-10,-26],[10,-26]]}]},
 bss:{db:'b',d:1.2,props:[{c:'chair',x:-84,w:36,h:42}],k:[{hip:[0,86],t:6,a:[[24,4],[-62,48]],f:[0,175]},{hip:[-6,46],t:16,a:[[24,4],[-62,48]],f:[0,175]}]},
 sl_rdl:{db:'n',d:1.3,k:[{a:[[3,4],[-10,12]],h:[[1,-56],[0,-56]]},{hip:[-8,84],t:84,a:[[3,4],[-93,78]],f:[0,80],h:[[0,-56],[0,-56]]}]},
 calf:{db:'f',d:1,props:[{c:'step',x:-20,w:40,h:12},{c:'wall',x:50}],k:[{hip:[3,95],a:[[6,10.5],[-12,45]],f:[-25,10],h:[[40,-6],[0,-56]]},{hip:[6.6,111],a:[[9.6,26],[-9,60]],f:[50,20],h:[[38,-22],[0,-56]]}]},
 tib:{d:.7,props:[{c:'wall',x:-42}],k:[{hip:[-26,83],t:-6,a:[[10,4],[6,4]]},{hip:[-26,83],t:-6,a:[[10,4],[6,4]],f:[-40,-40]}]},
 copen:{d:1.2,props:[{c:'chair',x:-75,w:32,h:30}],k:[{hip:[-5,14],t:72,a:[[-90,40],[-82,5]],h:[[24,-36],[-26,-26]]},{hip:[-5,30],t:82,a:[[-90,36],[-75,26]],h:[[24,-39],[-26,-26]]}]},
 floor_press:{db:'b',d:1.1,k:[{hip:[0,12],t:90,a:[[-46,4],[-46,4]],kb:[-1,-1],e:[[1,29],[1,29]],he:[[0,28],[0,28]]},{hip:[0,12],t:90,a:[[-46,4],[-46,4]],kb:[-1,-1],e:[[-4,-8],[-4,-8]],he:[[2,27],[2,27]]}]},
 row:{db:'n',d:1,props:[{c:'chair',x:28,w:46,h:44}],k:[{hip:[-12,80],t:74,a:[[8,4],[-38,4]],h:[[0,-54],[12,-48]]},{hip:[-12,80],t:74,a:[[8,4],[-38,4]],e:[[-22,-12],null],he:[[8,-26],null],h:[[0,-54],[12,-48]]}]},
 ohp:{db:'n',d:1,k:[{...kneelH,e:[[8,-26],[2,-29]],he:[[2,30],[2,-26]]},{...kneelH,e:[[3,29],[2,-29]],he:[[1,28],[2,-26]]}]},
 pullover:{db:'g',d:1.2,k:[{hip:[0,12],t:90,a:[[-46,4],[-46,4]],kb:[-1,-1],e:[[0,29],[0,29]],he:[[0,28],[0,28]]},{hip:[0,12],t:90,a:[[-46,4],[-46,4]],kb:[-1,-1],e:[[26,12],[26,12]],he:[[26,4],[26,4]]}]},
 rear_fly:{v:'front',tl:.55,db:'b',d:1,k:[{hip:[0,78],tl:.55,a:[[14,4],[-14,4]],h:[[-6,-50],[6,-50]]},{hip:[0,78],tl:.55,a:[[14,4],[-14,4]],h:[[52,-10],[-52,-10]]}]},
 push_press:{db:'b',m:'loop',d:.5,k:[{e:[[6,-26],[6,-26]],he:[[2,30],[2,30]]},{hip:[0,80],e:[[6,-26],[6,-26]],he:[[2,30],[2,30]]},{hip:[0,90],a:[[3,8],[-3,8]],f:[25,25],e:[[2,29],[2,29]],he:[[1,28],[1,28]]}]},
 ext_rot:{db:'n',d:1.2,k:[{...lieSide,h:[[0,0],[22,-8]],e:[[-28,6],null],he:[[0,-22],null]},{...lieSide,h:[[0,0],[22,-8]],e:[[-28,6],null],he:[[0,24],null]}]},
 ytw:{m:'loop',d:.8,k:[
   {hip:[0,10],t:90,a:[[-86,9],[-86,7]],f:[150,150],e:[[28,8],[28,8]],he:[[27,6],[27,6]]},
   {hip:[0,10],t:90,a:[[-86,9],[-86,7]],f:[150,150],e:[[2,10],[2,10]],he:[[1,8],[1,8]]},
   {hip:[0,10],t:90,a:[[-86,9],[-86,7]],f:[150,150],e:[[-16,12],[-16,12]],he:[[10,8],[10,8]]}]},
 wrist_curl:{db:'n',d:.6,props:[{c:'chair',x:-42,w:34,h:46}],k:[{hip:[-20,52],t:52,a:[[34,4],[30,4]],e:[[-14,-27],[-12,-27]],he:[[27,0],[27,-1]],do:[[7,-6],null]},{hip:[-20,52],t:52,a:[[34,4],[30,4]],e:[[-14,-27],[-12,-27]],he:[[27,0],[27,-1]],do:[[7,7],null]}]},
 prosup:{d:.9,props:[{c:'chair',x:-42,w:34,h:46}],k:[{hip:[-20,52],t:52,a:[[34,4],[30,4]],e:[[-14,-27],[-12,-27]],he:[[27,0],[27,-1]],rod:[[2,22],null]},{hip:[-20,52],t:52,a:[[34,4],[30,4]],e:[[-14,-27],[-12,-27]],he:[[27,0],[27,-1]],rod:[[2,-16],null]}]},
 ankle_bal:{d:.9,k:[{a:[[3,4],[-8,40]],h:[[22,-40],[-22,-40]]},{hip:[2,89],t:3,a:[[3,4],[-6,42]],h:[[26,-36],[-18,-42]]}]},
 deadbug:{d:1.1,k:[{hip:[0,12],t:90,a:[[-42,56],[-44,56]],kb:[-1,-1],f:[-90,-90],h:[[0,56],[0,56]]},{hip:[0,12],t:90,a:[[-84,14],[-44,56]],kb:[-1,-1],f:[-20,-90],h:[[0,56],[54,6]]}]},
 side_plank:{d:1.4,k:[{hip:[-5,26],t:74,a:[[-88,5],[-86,7]],h:[[24,-36],[0,48]]},{hip:[-5,32],t:78,a:[[-88,5],[-86,7]],h:[[24,-39],[0,50]]}]},
 suitcase:walk('n'),
 woodchop:{v:'front',db:'g',d:.9,k:[{hip:[-4,74],t:-12,a:[[22,4],[-22,4]],ha:[-38,34]},{hip:[4,88],t:10,a:[[22,4],[-22,4]],ha:[44,150]}]},
 pogo:{d:.22,hold:0,k:[{hip:[0,87],h:[[14,-46],[14,-46]]},{hip:[0,100],a:[[3,16],[-3,16]],f:[35,35],h:[[14,-46],[14,-46]]}]},
 skater:skate(34),
 lat_bound:skate(46),
 split_jump:{m:'loop',d:.4,hold:.1,k:[
   {hip:[-6,50],a:[[24,4],[-66,11]],f:[0,55],h:[[-14,-50],[16,-48]]},
   {hip:[0,98],a:[[10,18],[-10,18]],f:[20,20],h:[[0,-54],[0,-54]]},
   {hip:[6,50],a:[[-54,11],[36,4]],f:[55,0],h:[[16,-48],[-14,-50]]},
   {hip:[0,98],a:[[10,18],[-10,18]],f:[20,20],h:[[0,-54],[0,-54]]}]},
 squat_jump:{d:.45,k:[{hip:[-22,48],t:38,h:[[-22,-50],[-22,-50]]},{hip:[0,104],a:[[3,19],[-3,19]],f:[35,35],h:[[8,54],[8,54]]}]},
 air_squat:{d:1,k:[{t:4,h:[[6,-54],[4,-54]]},{hip:[-24,46],t:36,h:[[54,-2],[52,-2]]}]},
 glute_bridge:{d:1.1,k:[{hip:[0,10],t:96,a:[[-36,4],[-38,4]],kb:[-1,-1],f:[-60,-60],h:[[-44,-6],[-44,-6]]},{hip:[0,38],t:122,a:[[-36,4],[-38,4]],kb:[-1,-1],f:[-60,-60],h:[[-44,-6],[-44,-6]]}]},
 chest_str:{d:1.6,props:[{c:'wall',x:-62}],k:[{t:0,h:[[-52,2],[4,-54]]},{hip:[6,89],t:6,h:[[-58,0],[4,-54]]}]},
 push_up:{d:1,k:[{hip:[-2,42],t:66,a:[[-80,10],[-80,10]],f:[60,60],h:[[0,-59],[0,-59]]},{hip:[-2,26],t:78,a:[[-80,10],[-80,10]],f:[60,60],h:[[0,-38],[0,-38]]}]},
 quick_feet:{d:.14,hold:0,k:[{hip:[-8,74],t:22,a:[[8,13],[-12,4]],f:[20,0],h:[[22,-26],[22,-28]]},{hip:[-8,74],t:22,a:[[8,4],[-12,13]],f:[0,20],h:[[22,-26],[22,-28]]}]},
 split_step:{rk:1,m:'loop',d:.35,k:[RDY,{hip:[-6,86],t:14,a:[[12,14],[-14,14]],f:[25,25],h:[[24,-12],[22,-28]]},{hip:[-6,70],t:16,a:[[16,4],[-18,4]],h:[[24,-14],[22,-30]]},{hip:[28,56],t:22,a:[[66,4],[-10,6]],f:[-15,30],h:[[48,-4],[-10,-40]]}]},
 lat_shuffle:{v:'front',d:.3,hold:.05,k:[-30,-10,10,30].map((x,i)=>i%2?{hip:[x,76],a:[[x+10,4],[x-10,4]],h:[[14,-30],[-14,-30]]}:{hip:[x,72],a:[[x+22,4],[x-22,4]],h:[[14,-30],[-14,-30]]})},
 chasse:{rk:1,d:.35,k:[{hip:[20,74],t:15,a:[[34,4],[6,4]],h:[[24,-14],[20,-30]]},{hip:[0,80],t:8,a:[[18,10],[-10,4]],f:[20,0],h:[[24,-14],[20,-30]]},{hip:[-20,74],a:[[-4,4],[-36,4]],h:[[10,10],[20,-30]]},{hip:[-40,96],t:-12,a:[[-34,18],[-56,20]],f:[25,30],h:[[-6,54],[30,10]],eb:[-1,1]}]},
 front_back:{rk:1,m:'loop',d:.5,k:FB},
 six_corner:{rk:1,m:'loop',d:.45,k:FB},
 shadow_int:{rk:1,m:'loop',d:.32,hold:.05,k:FB},
 rand_corner:{rk:1,m:'loop',d:.35,k:[RDY,{hip:[-6,86],t:14,a:[[12,14],[-14,14]],f:[25,25],h:[[24,-12],[22,-28]]},{hip:[40,52],t:18,a:[[84,4],[-4,6]],f:[-20,30],h:[[46,-4],[-30,-30]]},RDY,{hip:[-6,86],t:14,a:[[12,14],[-14,14]],f:[25,25],h:[[24,-12],[22,-28]]},{hip:[-40,96],t:-12,a:[[-34,18],[-58,22]],f:[25,30],h:[[-6,54],[30,12]],eb:[-1,1]}]},
 burpee:{m:'loop',d:.4,k:[{},{hip:[-14,42],t:80,h:[[0,-47],[0,-47]]},PL,{hip:[-14,42],t:80,h:[[0,-47],[0,-47]]},{hip:[0,104],a:[[3,18],[-3,18]],f:[35,35],h:[[6,54],[6,54]]}]},
 mtn_climb:{d:.25,hold:0,k:[{...PL,a:[[-18,22],[-80,10]],f:[30,60]},{...PL,a:[[-80,10],[-18,22]],f:[60,30]}]},
 rope:{d:.22,hold:0,k:[{hip:[0,88],h:[[14,-46],[14,-46]]},{hip:[0,96],a:[[3,12],[-3,12]],f:[30,30],h:[[18,-42],[18,-42]]}]},
 hip9090:{v:'front',d:1.1,k:[{hip:[0,14],a:[[38,4],[-30,4]],k:[[44,10],[14,34]],h:[[14,-58],[-14,-58]]},{hip:[0,14],a:[[30,4],[-38,4]],k:[[-14,34],[-44,10]],h:[[14,-58],[-14,-58]]}]},
 tspine:{d:1.4,k:[{...lieSide,a:[[-74,8],[-76,6]],k:[[-30,16],[-30,12]],e:[[0,-28],[0,-28]],he:[[0,-26],[0,-26]]},{...lieSide,a:[[-74,8],[-76,6]],k:[[-30,16],[-30,12]],e:[[0,28],[0,-28]],he:[[0,26],[0,-26]]}]},
 ankle_df:{d:1,props:[{c:'wall',x:64}],k:[{...kneelH,a:[[34,4],[-42,7]],h:[[58,-4],[58,0]]},{...kneelH,hip:[12,50],a:[[34,4],[-42,7]],h:[[48,-4],[48,0]]}]},
 sleeper:{d:1.3,k:[{...lieSide,e:[[12,10],[6,-4]],he:[[-6,12],[0,26]]},{...lieSide,e:[[12,10],[6,-4]],he:[[-4,-6],[2,8]]}]},
 calf_str:{d:1.4,props:[{c:'wall',x:62}],k:[{hip:[4,78],t:22,a:[[26,4],[-40,4]],h:[[38,6],[38,4]]},{hip:[10,74],t:28,a:[[26,4],[-40,4]],h:[[26,0],[26,-2]]}]},
 hip_flex:{d:1.4,k:[{...kneelH,h:[[30,-30],[30,-30]]},{...kneelH,hip:[14,47],t:-6,h:[[24,-32],[24,-32]]}]},
 ham_str:{d:1.5,k:[{hip:[0,12],a:[[86,6],[84,6]],f:[-60,-60],ha:[40,22]},{hip:[0,12],t:58,a:[[86,6],[84,6]],f:[-60,-60],ha:[78,14]}]},
 wrist_str:{d:1.2,k:[{h:[[56,2],[50,6]],do:[[0,-9],null]},{h:[[56,2],[50,6]],do:[[0,9],null]}]},
 walk:walk(null),
 jog_skip:{d:.3,hold:0,k:[{hip:[0,92],a:[[6,4],[12,40]],h:[[-16,-46],[16,-40]]},{hip:[0,92],a:[[12,40],[6,4]],h:[[16,-40],[-16,-46]]}]},
 shadow_swing:{rk:1,m:'loop',d:.35,k:[{t:-6,a:[[14,4],[-18,4]],h:[[-26,26],[30,24]],eb:[-1,1]},{t:6,a:[[14,4],[-18,4]],h:[[14,54],[20,-20]],eb:[-1,1]},{t:14,hip:[2,86],a:[[14,4],[-18,4]],h:[[30,-38],[-10,-40]]}]},
 sprint_short:{d:.3,k:[RDY,{hip:[30,70],t:35,a:[[60,10],[-6,4]],f:[10,30],h:[[-10,-40],[30,-20]]}]},
 ham_slide:{d:1.2,k:[{hip:[0,38],t:122,a:[[-36,4],[-38,4]],kb:[-1,-1],f:[-60,-60],h:[[-44,-6],[-44,-6]]},{hip:[0,22],t:103,a:[[-82,4],[-82,4]],kb:[-1,-1],f:[-60,-60],h:[[-46,-6],[-46,-6]]}]}
};

// ---------- คำนวณ ----------
function ik(A,B,l1,l2,s){
  const dx=B[0]-A[0],dy=B[1]-A[1];let d=Math.hypot(dx,dy)||1e-6;const ux=dx/d,uy=dy/d;
  d=Math.min(Math.max(d,Math.abs(l1-l2)+.01),l1+l2-.01);
  const a=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-a*a));
  return [[A[0]+a*ux+s*h*(-uy),A[1]+a*uy+s*h*ux],[A[0]+d*ux,A[1]+d*uy]];
}
const add=(p,q)=>[p[0]+q[0],p[1]+q[1]];
function lerp(a,b,t){if(a==null)return b;if(b==null)return a;if(typeof a==='number')return a+(b-a)*t;return a.map((x,i)=>lerp(x,b[i],t))}
const LK=['hip','t','tl','hd','a','h','f','e','he','k','ha','do','rod'];
function full(ex,p){return Object.assign(base(ex.v),p)}
function poseAt(ex,time){
  const F=ex.k.map(p=>full(ex,p)),n=F.length,d=ex.d||.8,hold=ex.hold==null?.25:ex.hold;
  const seq=ex.m==='loop'||n<2?F.map((_,i)=>i):[...F.map((_,i)=>i),...F.slice(1,-1).map((_,i)=>n-2-i)];
  const seg=d+hold,tot=seg*seq.length;let u=((time%tot)+tot)%tot;const i=Math.floor(u/seg);u-=i*seg;
  const A=F[seq[i]],B=F[seq[(i+1)%seq.length]];
  let t=u<hold?0:(u-hold)/d;t=.5-.5*Math.cos(Math.PI*t);
  const o={};LK.forEach(k=>o[k]=lerp(A[k],B[k],t));o.kb=(t<.5?A:B).kb;o.eb=(t<.5?A:B).eb;return o;
}
function solve(ex,p){
  const fr=ex.v==='front',tr=p.t*R,hip=p.hip,S=add(hip,[L.T*p.tl*Math.sin(tr),L.T*p.tl*Math.cos(tr)]);
  const px=[Math.cos(tr),-Math.sin(tr)];
  const sh=fr?[add(S,[12*px[0],12*px[1]]),add(S,[-12*px[0],-12*px[1]])]:[S,S];
  const hp=fr?[add(hip,[8*px[0],8*px[1]]),add(hip,[-8*px[0],-8*px[1]])]:[hip,hip];
  const ha=(tr+p.hd*R),head=add(S,[(L.N+L.HR)*Math.sin(ha),(L.N+L.HR)*Math.cos(ha)]);
  const legs=[0,1].map(i=>{let K,A;
    if(p.k&&p.k[i]){K=add(hp[i],p.k[i]);A=p.a[i]}else{[K,A]=ik(hp[i],p.a[i],L.TH,L.SH,p.kb[i])}
    const f=p.f[i]*R;let T,H;
    if(fr){const s=i?-1:1;T=add(A,[s*7,-3]);H=add(A,[-s*1,-3])}else{T=add(A,[L.FT*Math.cos(f),-L.FT*Math.sin(f)]);H=add(A,[-3*Math.cos(f),3*Math.sin(f)])}
    return {H:hp[i],K,A,T,Hl:H}});
  const arms=[0,1].map(i=>{let E,W;
    if(p.e&&p.e[i]){E=add(sh[i],p.e[i]);W=add(E,p.he[i])}
    else{const tg=p.ha?p.ha:add(sh[i],p.h[i]);[E,W]=ik(sh[i],tg,L.UA,L.FA,p.eb[i])}
    const D=p.do&&p.do[i]?add(W,p.do[i]):null,Rd=p.rod&&p.rod[i]?add(W,p.rod[i]):null;
    return {S:sh[i],E,W,D,Rd}});
  return {hip,S,head,legs,arms,fr,hp,sh};
}

// ---------- วาด ----------
const f1=v=>Math.round(v*10)/10;
const ln=(a,b,c,w)=>`<line x1="${f1(a[0])}" y1="${f1(-a[1])}" x2="${f1(b[0])}" y2="${f1(-b[1])}" style="stroke:${c}" stroke-width="${w}" stroke-linecap="round"/>`;
const dot=(a,r,c,s)=>`<circle cx="${f1(a[0])}" cy="${f1(-a[1])}" r="${r}" style="fill:${c}${s?`;stroke:${s};stroke-width:2`:''}"/>`;
function dbAt(p,fr,horiz){if(fr||horiz){return ln([p[0]-11,p[1]],[p[0]+11,p[1]],C.db,4)+`<rect x="${f1(p[0]-15)}" y="${f1(-p[1]-6)}" width="6" height="12" rx="2" style="fill:${C.db}"/><rect x="${f1(p[0]+9)}" y="${f1(-p[1]-6)}" width="6" height="12" rx="2" style="fill:${C.db}"/>`}return dot(p,7.5,C.db,'var(--fig-bg)')}
function prop(q){
  if(q.c==='wall')return `<rect x="${q.x}" y="-230" width="8" height="230" style="fill:${C.pr}"/>`;
  if(q.c==='step')return `<rect x="${q.x}" y="${-q.h}" width="${q.w}" height="${q.h}" rx="2" style="fill:${C.pr}"/>`;
  if(q.c==='chair')return `<rect x="${q.x}" y="${-q.h}" width="${q.w}" height="6" rx="2" style="fill:${C.pr}"/><rect x="${q.x+2}" y="${-q.h}" width="4" height="${q.h}" style="fill:${C.pr}"/><rect x="${q.x+q.w-6}" y="${-q.h}" width="4" height="${q.h}" style="fill:${C.pr}"/>`;
  return '';
}
function draw(ex,s){
  let o='';const fr=s.fr;
  const limbL=(g,c)=>ln(g.H,g.K,c,9)+ln(g.K,g.A,c,8)+ln(g.Hl,g.T,c,6);
  const limbA=(g,c)=>ln(g.S,g.E,c,8)+ln(g.E,g.W,c,7)+(g.D?ln(g.W,g.D,c,5):'');
  const nearC=C.near,farC=fr?C.near:C.far;
  o+=limbL(s.legs[1],farC)+limbA(s.arms[1],farC);
  if(fr){o+=ln(s.hp[0],s.hp[1],C.near,11)+ln(s.sh[0],s.sh[1],C.near,11)}
  o+=ln(s.hip,s.S,C.near,fr?20:13);
  o+=dot(s.head,L.HR,C.near);
  o+=limbL(s.legs[0],nearC)+limbA(s.arms[0],nearC);
  const db=ex.db,hands=s.arms.map(g=>g.D||g.W);
  if(db==='b'){o+=dbAt(hands[1],fr)+dbAt(hands[0],fr)}
  else if(db==='n')o+=dbAt(hands[0],fr);
  else if(db==='f')o+=dbAt(hands[1],fr);
  else if(db==='g')o+=dbAt(fr?[(hands[0][0]+hands[1][0])/2,(hands[0][1]+hands[1][1])/2]:hands[0],false);
  s.arms.forEach(g=>{if(g.Rd)o+=ln(g.W,g.Rd,C.db,4)+dot(g.Rd,6,C.db)});
  if(ex.rk){const g=s.arms[0],dx=g.W[0]-g.E[0],dy=g.W[1]-g.E[1],m=Math.hypot(dx,dy)||1,u=[dx/m,dy/m];
    const e1=add(g.W,[u[0]*20,u[1]*20]),c=add(g.W,[u[0]*34,u[1]*34]),ang=Math.atan2(-u[1],u[0])/R;
    o+=ln(g.W,e1,C.rk,3)+`<ellipse cx="${f1(c[0])}" cy="${f1(-c[1])}" rx="14" ry="9" transform="rotate(${f1(ang)} ${f1(c[0])} ${f1(-c[1])})" style="fill:none;stroke:${C.rk}" stroke-width="3"/>`}
  return o;
}
function bounds(ex){
  let x0=1e9,x1=-1e9,y1=0;const n=ex.k.length*(ex.m==='loop'?1:2)*((ex.d||.8)+(ex.hold==null?.25:ex.hold));
  for(let i=0;i<=24;i++){const s=solve(ex,poseAt(ex,n*i/24));
    const pts=[s.head,s.S,s.hip,...s.legs.flatMap(g=>[g.K,g.A,g.T]),...s.arms.flatMap(g=>[g.E,g.W,g.D,g.Rd].filter(Boolean))];
    pts.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])});
    x0=Math.min(x0,s.head[0]-L.HR);x1=Math.max(x1,s.head[0]+L.HR);y1=Math.max(y1,s.head[1]+L.HR);
    if(ex.rk){x0-=0;}
  }
  (ex.props||[]).forEach(q=>{x0=Math.min(x0,q.x);x1=Math.max(x1,q.x+(q.w||8))});
  const pad=ex.rk?42:16;x0-=pad;x1+=pad;const top=y1+(ex.rk?40:14);
  let w=x1-x0,h=top+12;if(w<h*1.25){const c=(x0+x1)/2;w=h*1.25;x0=c-w/2}else{h=w/1.25}
  return {x:x0,y:-(h-12),w,h};
}
const cache={};
function vb(id){const ex=P[id];if(!cache[id])cache[id]=bounds(ex);return cache[id]}
function frame(id,time){
  const ex=P[id];if(!ex)return '';const b=vb(id),s=solve(ex,poseAt(ex,time));
  return `<line x1="${f1(b.x)}" y1="0" x2="${f1(b.x+b.w)}" y2="0" style="stroke:${C.gr}" stroke-width="2"/>`+
    (ex.props||[]).map(prop).join('')+`<ellipse cx="${f1(s.hip[0])}" cy="2" rx="28" ry="3" fill="#000" opacity=".25"/>`+draw(ex,s);
}
function svg(id,time,cls){const b=vb(id);return `<svg class="${cls||''}" viewBox="${f1(b.x)} ${f1(b.y)} ${f1(b.w)} ${f1(b.h)}" xmlns="http://www.w3.org/2000/svg">${frame(id,time||0)}</svg>`}
function play(el,id){
  if(!P[id])return {stop(){}};const b=vb(id);let on=true,t0=null;
  el.setAttribute('viewBox',`${f1(b.x)} ${f1(b.y)} ${f1(b.w)} ${f1(b.h)}`);
  const loop=ts=>{if(!on)return;if(t0==null)t0=ts;el.innerHTML=frame(id,(ts-t0)/1000);requestAnimationFrame(loop)};
  requestAnimationFrame(loop);return {stop(){on=false}};
}
function thumbT(id){const ex=P[id];if(!ex)return 0;const d=ex.d||.8,h=ex.hold==null?.25:ex.hold;return h+d+.01}
return {P,svg,frame,play,has:id=>!!P[id],thumbT,
  // สำหรับหุ่น 3D: ข้อต่อ 2D ณ เวลา t, ความยาว 1 รอบท่า (วินาที), มุมมอง side/front
  pose:(id,t)=>solve(P[id],poseAt(P[id],t)),dur:id=>{const ex=P[id];return ex.k.length*(ex.m==="loop"?1:2)*((ex.d||.8)+(ex.hold==null?.25:ex.hold))},view:id=>P[id].v||"side"};
})();
if(typeof module!=='undefined')module.exports=FIG;
