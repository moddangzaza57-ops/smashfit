/* Smash Fit — หุ่นกายวิภาคจริง ขับด้วยท่าทางของแอป (FIG.pose)
   โมเดล web/anatomy-1.glb ดัดแปลงจาก Z-Anatomy / BodyParts3D (CC BY-SA 4.0 / CC BY-SA 2.1 JP) — ดู anatomy-1.glb.LICENSE.txt
   สร้างใหม่ได้ด้วย tools/anatomy/build_rig.py (Blender) · ถ้าเปลี่ยนโมเดลให้เปลี่ยนเลขในชื่อไฟล์ (sw.js เก็บไฟล์นี้ถาวร)
   แต่ละกระดูกหมุนด้วย "กรอบอ้างอิง" (ทิศกระดูก + แกนข้างลำตัว) จึงไม่บิดเกลียว · น้ำหนักผิวทำให้ข้อพับโค้งนุ่ม
   ท่า 2D บอกตำแหน่งข้อต่อในระนาบเดียว จึงต้องบอกเพิ่มว่าลำตัว "หงาย/คว่ำ/ตะแคง" และท่าที่ต้องใช้ความลึก (นอนตะแคง, 90/90, Y-T-W) เขียนเป็น 3D ตรงๆ */
import * as THREE from './vendor/three.module.min.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';

const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const perp=(v,a)=>v.clone().sub(a.clone().multiplyScalar(v.dot(a)));
const D2R=Math.PI/180,nz=(x,y,z)=>V(x,y,z).normalize(),sm=x=>.5-.5*Math.cos(Math.PI*Math.max(0,Math.min(1,x)));

const MODEL=new URL('./anatomy-1.glb',import.meta.url).href;
let BUF=null;
export function supported(){try{const c=document.createElement('canvas');return !!(window.WebGLRenderingContext&&(c.getContext('webgl2')||c.getContext('webgl')))}catch(e){return false}}
// โหลดไฟล์โมเดลครั้งเดียว (ใช้ร่วมกันทุกจอ) — ui.js รอให้เสร็จก่อนสลับจากหุ่น 2D
export function ready(){if(!BUF)BUF=fetch(MODEL).then(r=>{if(!r.ok)throw new Error('model '+r.status);return r.arrayBuffer()}).catch(e=>{BUF=null;throw e});return BUF}
// สร้างตัวแสดงผลทันที (โมเดลแปลงเบื้องหลัง) · ใช้: const v=create(canvas); v.play(id,{primary,secondary})
export function create(canvas){
  let real=null,want=null;
  ready().then(buf=>build(canvas,buf)).then(v=>{real=v;if(want)v.play(...want)}).catch(()=>{});
  return {play(id,mus){if(!window.FIG.has(id))return false;want=[id,mus||{}];if(real)real.play(id,mus||{});return true},
    stop(){want=null;if(real)real.stop()},resize(){if(real)real.resize()}};
}
async function build(canvas,buf){
  const FIG=window.FIG;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(28,1,.05,50);
  scene.add(new THREE.HemisphereLight(0xffffff,0x7a7a84,1.25));
  const key=new THREE.DirectionalLight(0xffffff,2.2);key.position.set(-1.6,3.2,2.4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);
  Object.assign(key.shadow.camera,{left:-1.5,right:1.5,top:2.2,bottom:-1,near:.1,far:10});key.shadow.bias=-.0005;key.shadow.normalBias=.02;scene.add(key);
  const rim=new THREE.DirectionalLight(0xffffff,.9);rim.position.set(2,1.6,-2);scene.add(rim);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(1.8,48),new THREE.ShadowMaterial({opacity:.18}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);

  const base=new THREE.MeshStandardMaterial({color:0xe4e4e8,roughness:.48,metalness:0,side:THREE.DoubleSide});
  const tendon=new THREE.MeshStandardMaterial({color:0xf6f6f8,roughness:.35});
  const skinM=new THREE.MeshStandardMaterial({color:0xcfcfd4,roughness:.6});
  // สีกล้ามที่โดนตรง/ช่วย ตรงกับจุดสีในคำอธิบายใต้หุ่น (.mus .mp/.ms ใน shell.html)
  const hot=new THREE.MeshStandardMaterial({side:THREE.DoubleSide,color:0xe0262f,roughness:.42,emissive:0xff1a1a,emissiveIntensity:.35});
  const warm=new THREE.MeshStandardMaterial({side:THREE.DoubleSide,color:0xf2a49b,roughness:.45,emissive:0xff6a5a,emissiveIntensity:.08});
  // สีอุปกรณ์มาจากโทนของแอป (--fig-db ดัมเบล, --fig-rk ไม้แบด, --fig-pr ม้านั่ง/กำแพง) อัปเดตทุกครั้งที่เปลี่ยนท่า
  const propM=new THREE.MeshStandardMaterial({roughness:.7}),wallM=new THREE.MeshStandardMaterial({roughness:.8,transparent:true,opacity:.32,depthWrite:false});
  const iron=new THREE.MeshStandardMaterial({roughness:.35,metalness:.4}),rkM=new THREE.MeshStandardMaterial({roughness:.4,metalness:.15});
  const css=(n,d)=>{try{return getComputedStyle(document.documentElement).getPropertyValue(n).trim()||d}catch(e){return d}};
  function tint(){iron.color.set(css('--fig-db','#18794e'));rkM.color.set(css('--fig-rk','#0060df'));const p=css('--fig-pr','#d1d1d6');propM.color.set(p);wallM.color.set(p)}

  const gltf=await new GLTFLoader().parseAsync(buf.slice(0),'');
  const root=gltf.scene;scene.add(root);
  const parts=[];let skel=null;
  root.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;if(o.isSkinnedMesh)skel=o.skeleton;
    let n=o;while(n&&!/^G_/.test(n.name))n=n.parent;const m=(n?n.name:'').match(/^G_(.+?)_([rlc])(?:_\d+)?$/);const grp=m?m[1]:'';
    parts.push({o,grp});o.material=grp.startsWith('skin')?skinM:grp==='itband'?tendon:base});
  const B={};skel.bones.forEach(b=>B[b.name.replace('_','.')]=b);
  const bn=n=>B[n]||B[n.replace('.','')]||B[n.replace('.','_')];
  root.updateMatrixWorld(true);
  const wpos=b=>b.getWorldPosition(V()),wb=n=>wpos(bn(n));
  const rest={};
  const tailRest={pelvis:o=>wpos(o).add(V(0,.1,0)),spine:()=>wpos(bn('head')),head:o=>wpos(o).add(V(0,.3,0))};
  for(const s of ['R','L']){tailRest['thigh.'+s]=()=>wpos(bn('shin.'+s));tailRest['shin.'+s]=()=>wpos(bn('foot.'+s));tailRest['foot.'+s]=o=>wpos(o).add(V(0,-.04,.14));
    tailRest['scap.'+s]=()=>wpos(bn('uarm.'+s));tailRest['uarm.'+s]=()=>wpos(bn('farm.'+s));tailRest['farm.'+s]=()=>wpos(bn('hand.'+s));tailRest['hand.'+s]=o=>wpos(o).add(wpos(o).sub(wpos(bn('farm.'+s))).normalize().multiplyScalar(.15))}
  const ORDER=['pelvis','spine','head','thigh.R','shin.R','foot.R','thigh.L','shin.L','foot.L','scap.R','uarm.R','farm.R','hand.R','scap.L','uarm.L','farm.L','hand.L'].filter(n=>bn(n));
  const SCAP=!!bn('scap.R');
  for(const n of ORDER){const b=bn(n);const h=wpos(b),t=tailRest[n](b);rest[n]={q:b.getWorldQuaternion(new THREE.Quaternion()),dir:t.sub(h).normalize(),head:h}}
  // แกนอ้างอิงลำตัว: SIDE = ด้านซ้ายของร่างกาย, FRONT = ด้านหน้า (ท่ายืนตรง)
  const SIDE=V(1,0,0),FRONT=V(0,0,1);
  // กรอบของกระดูก: แกน Y = ทิศกระดูก, แกน X = "ซ้ายของร่างกาย" ที่ตั้งฉากกับกระดูก
  // ถ้ากระดูกชี้ไปทางซ้าย/ขวาพอดี (กางแขน) ใช้ หน้า×กระดูก แทน เพื่อไม่ให้หมุนกระโดด
  function frameQ(dir,side,front){dir=dir.clone().normalize();let x=perp(side,dir);const w=x.length();
    if(w<.35){const alt=perp((front||FRONT).clone().cross(dir),dir);if(alt.length()>1e-4)x.add(alt.normalize().multiplyScalar(1-w/.35))}
    if(x.length()<1e-5)x=perp(V(0,0,1),dir);x.normalize();const z=x.clone().cross(dir).normalize();
    return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,dir,z))}
  for(const n of ORDER)rest[n].f=frameQ(rest[n].dir,n.startsWith('scap')?V(0,1,0):SIDE,FRONT); // ไหปลาร้าชี้ออกข้าง จึงอ้างอิงแกนขึ้นแทน

  // ความยาวกระดูกจริงของโมเดล (ใช้ทำ IK)
  const LEN={};for(const s of ['R','L']){
    LEN['thigh.'+s]=rest['thigh.'+s].head.distanceTo(rest['shin.'+s].head);LEN['shin.'+s]=rest['shin.'+s].head.distanceTo(rest['foot.'+s].head);
    LEN['uarm.'+s]=rest['uarm.'+s].head.distanceTo(rest['farm.'+s].head);LEN['farm.'+s]=rest['farm.'+s].head.distanceTo(rest['hand.'+s].head)}
  const LEG=LEN['thigh.R']+LEN['shin.R'],UA=LEN['uarm.R'],ARMK=(LEN['uarm.R']+LEN['farm.R'])/(58*LEG/86);
  // ไหล่ล่างเทียบกึ่งกลางสะโพก (ใช้ตั้งองศาท่าแพลงก์ตะแคงให้ศอกอยู่ใต้ไหล่พอดี)
  const SH_UP=rest['uarm.L'].head.y-rest.pelvis.head.y,SH_LAT=rest['uarm.L'].head.x-rest.pelvis.head.x,HIP_LAT=rest['thigh.L'].head.x-rest.pelvis.head.x;
  // สเกลท่า 2D ให้เท่าตัวโมเดล: ขา FIG 44+42=86 หน่วย -> ขาโมเดลจริง, ยกข้อเท้าให้ฝ่าเท้าแตะพื้น
  const K=LEG/86, YOFF=rest['foot.R'].head.y-4*K;
  let side=true,exCur=null,curId=null,nearS='R',rodV=null;
  const to3=p=>side?V(0,p[1]*K+YOFF,p[0]*K):V(p[0]*K,p[1]*K+YOFF,0);
  // IK สองท่อน: จากโคน A ไปเป้า T ด้วยความยาว l1,l2 งอไปทาง pole
  function ik2(A,T,l1,l2,pole){
    const d=T.clone().sub(A);let dist=Math.min(d.length(),(l1+l2)*.999);dist=Math.max(dist,Math.abs(l1-l2)+1e-3);const dir=d.normalize();
    const a=(l1*l1-l2*l2+dist*dist)/(2*dist),h=Math.sqrt(Math.max(0,l1*l1-a*a));
    let p=perp(pole.clone().sub(A),dir);if(p.length()<1e-5)p=perp(V(0,0,1),dir);p.normalize();
    const mid=A.clone().add(dir.clone().multiplyScalar(a)).add(p.multiplyScalar(h));return {mid,end:A.clone().add(dir.clone().multiplyScalar(dist))}}
  const world={};
  function setBone(n,dir,sV,fV,extra){const r=rest[n];let q=frameQ(dir,sV,fV).multiply(r.f.clone().invert()).multiply(r.q.clone());if(extra)q=extra.clone().multiply(q);
    world[n]=q;const b=bn(n),pq=b.parent.isBone?world[ORDER.find(k=>bn(k)===b.parent)]:b.parent.getWorldQuaternion(new THREE.Quaternion());
    b.quaternion.copy(pq.clone().invert().multiply(q));b.updateMatrixWorld(true)}
  const PALM=V(0,0,1); // ท่ายืนกายวิภาค: ฝ่ามือหันหน้า

  /* Q = {hip,S,head: ตำแหน่งโลก, sV: ทิศ "ซ้ายของร่างกาย" ของเชิงกราน, sS/sH: ของอก/หัว (บิดลำตัว),
         leg(s,H)->{K(ทิศเข่า),A(ข้อเท้า),T(ทิศเท้า)}, arm(s,Sh)->{E(ทิศศอก),W(ข้อมือ),D?,palm?}} */
  function apply(Q){
    const tor=Q.S.clone().sub(Q.hip),sV=Q.sV.clone().normalize(),fV=sV.clone().cross(tor).normalize();
    const sS=(Q.sS||sV).clone().normalize(),fS=sS.clone().cross(tor).normalize(),sH=(Q.sH||sS).clone().normalize();
    const pb=bn('pelvis');pb.position.copy(pb.parent.worldToLocal(Q.hip.clone()));
    setBone('pelvis',tor,sV,fV);setBone('spine',tor,sS,fS);setBone('head',Q.head.clone().sub(Q.S),sH,sH.clone().cross(Q.head.clone().sub(Q.S)).normalize());
    for(const s of ['R','L']){
      const H=wb('thigh.'+s),g=Q.leg(s,H);
      const lg=ik2(H,g.A,LEN['thigh.'+s],LEN['shin.'+s],g.K);
      setBone('thigh.'+s,lg.mid.clone().sub(H),sV,fV);setBone('shin.'+s,lg.end.clone().sub(lg.mid),sV,fV);setBone('foot.'+s,g.T,sV,fV);
      let Sh=wb('uarm.'+s),a=Q.arm(s,Sh);
      if(SCAP){ // ไหล่ทั้งชุด (ไหปลาร้า+สะบัก) ยกขึ้นเมื่อชูแขนสูง และยื่นไปหน้าเมื่อเหยียดแขนไปข้างหน้า (scapulohumeral rhythm)
        const sc='scap.'+s,up=tor.clone().normalize(),o=(s==='R'?sS.clone().negate():sS.clone());
        const a0=ik2(Sh,a.W,LEN['uarm.'+s],LEN['farm.'+s],a.E),dU=a0.mid.clone().sub(Sh).normalize();
        const elev=Math.acos(Math.max(-1,Math.min(1,-dU.dot(up)))),te=Math.min(28*D2R,Math.max(0,.3*(elev-25*D2R))),tp=Math.max(-10,Math.min(14,14*dU.dot(fS)))*D2R;
        const qs=new THREE.Quaternion().setFromAxisAngle(o.clone().cross(up).normalize(),te).multiply(new THREE.Quaternion().setFromAxisAngle(o.clone().cross(fS).normalize(),tp));
        const spD=world.spine.clone().multiply(rest.spine.q.clone().invert());
        setBone(sc,rest[sc].dir.clone().applyQuaternion(spD).applyQuaternion(qs),up,fS);
        Sh=wb('uarm.'+s);a=Q.arm(s,Sh)}
      const am=ik2(Sh,a.W,LEN['uarm.'+s],LEN['farm.'+s],a.E),fa=am.end.clone().sub(am.mid);
      setBone('uarm.'+s,am.mid.clone().sub(Sh),sS,fS);setBone('farm.'+s,fa,sS,fS);
      const hd=a.D?a.D.clone():fa.clone();setBone('hand.'+s,hd,sS,fS);
      // หมุนปลายแขน (pronation/supination): ลงน้ำหนักบนพื้น = ฝ่ามือคว่ำ, อื่นๆ = ฝ่ามือหันเข้าลำตัว (หรือกำหนดเอง)
      const axis=hd.clone().normalize();
      const cur=PALM.clone().applyQuaternion(rest['hand.'+s].q.clone().invert()).applyQuaternion(world['hand.'+s]);
      const onFloor=am.end.y<.22&&am.end.y<Sh.y-.2;
      let want=a.palm?a.palm.clone():onFloor?V(0,-1,0):sS.clone().multiplyScalar(s==='R'?1:-1);
      want=perp(want,axis);const c2=perp(cur,axis);
      if(want.length()>.15&&c2.length()>.15){want.normalize();c2.normalize();
        const ang=Math.atan2(c2.clone().cross(want).dot(axis),c2.dot(want));
        setBone('farm.'+s,fa,sS,fS,new THREE.Quaternion().setFromAxisAngle(fa.clone().normalize(),ang*.6));
        setBone('hand.'+s,hd,sS,fS,new THREE.Quaternion().setFromAxisAngle(axis,ang))}
    }
  }

  // ---- จากท่า 2D: ด้านข้าง = ระนาบ sagittal, ด้านหน้า = ระนาบ coronal ----
  // ท่าลำตัวนอนราบใน 2D ไม่รู้ว่าหงายหรือคว่ำ (ค่าเริ่มต้น = คว่ำ) — ท่าเหล่านี้ต้องนอนหงาย
  const TWIST={wgs:P=>75*Math.max(0,Math.min(1,(P.arms[1].W[1]-P.S[1])/40))};
  const FACE_UP={floor_press:1,pullover:1,deadbug:1,glute_bridge:1,ham_slide:1};
  function from2D(P){
    const ex=exCur,up=!!FACE_UP[curId],hip=to3(P.hip),S=to3(P.S),head=to3(P.head);
    if(!side){ // มุมหน้า: ลำตัวสั้นลง (tl) = ก้มตัวไปข้างหน้า
      const r=Math.hypot(P.S[0]-P.hip[0],P.S[1]-P.hip[1])/52;
      if(r<.96){const lean=Math.sqrt(1-r*r)*52*K;S.z+=lean;head.copy(S).add(S.clone().sub(hip).normalize().multiplyScalar(.2))}}
    if(head.y<.13)head.y=.13; // หัววางบนพื้น (สะพานสะโพก/นอนหงาย) ไม่จมพื้น
    let sV;if(side)sV=V(up?-1:1,0,0);else{sV=to3(P.sh[0]).sub(to3(P.sh[1]));if(sV.length()<1e-4)sV=SIDE.clone()}
    const map=side?(up?{L:0,R:1}:{R:0,L:1}):{L:0,R:1};nearS=map.R===0?'R':'L';
    const a0=P.arms[0];rodV=a0.Rd?to3(a0.Rd).sub(to3(a0.W)):null;
    const two=ex&&(ex.db==='g'||ex.k.some(k=>k.ha)),absArm=ex&&(ex.k.some(k=>k.ha)||(ex.props&&ex.props.length));
    // บิดลำตัว: ท่า World's greatest stretch เปิดอกตามแขนที่ชูขึ้น
    let sS=null,sH=null;const tw=TWIST[curId];
    if(tw){const th=tw(P)*D2R,ax=S.clone().sub(hip).normalize();sS=sV.clone().applyAxisAngle(ax,th);sH=sV.clone().applyAxisAngle(ax,th*1.3)}
    return {hip,S,head,sV,sS,sH,
      leg:(s,H)=>{const g=P.legs[map[s]],fix=p=>{const v=to3(p);if(side)v.x=H.x;else v.z=H.z;return v};
        if(side)return {K:fix(g.K),A:fix(g.A),T:to3(g.T).sub(to3(g.A))};
        // มุมหน้า: 2D วาดเข่างอออกด้านข้างเพื่อสื่อว่างอ แต่เข่าจริงงอไปข้างหน้าได้ทางเดียว -> ชี้เข่าไปหน้า (เอียงออกตามปลายเท้าเล็กน้อย)
        const A=fix(g.A),Kd=fix(g.K),mid=H.clone().add(A).multiplyScalar(.5);
        return {K:mid.clone().add(V((Kd.x-mid.x)*.5,0,.3)),A,T:V((A.x-H.x)*.8,-.25,1)}},
      arm:(s,Sh)=>{const a=P.arms[map[s]],fix=p=>{
          // แขนลอยอิสระ: ใช้ทิศจากไหล่จริง (ไหล่ยกได้) สเกลตามความยาวแขนโมเดล -> แขนเหยียดตรงยังตรง
          // มือแตะพื้น/อุปกรณ์/จับจุดเดียวกัน: ใช้ตำแหน่งจริงในโลก
          const free=!(absArm||a.W[1]<16),v=free?Sh.clone().add(to3(p).sub(to3(a.S)).multiplyScalar(ARMK)):to3(p);
          // มุมหน้า: ไม่รู้ความลึก -> ถ้าแขนงอ มือยื่นไปข้างหน้า (ท่าเตรียมพร้อม) ศอกอยู่ข้างลำตัว
          if(!side&&free&&!two){const L=LEN['uarm.'+s]+LEN['farm.'+s],dd=to3(a.W).sub(to3(a.S)).length()*ARMK;
            if(p===a.W)return v.setZ(Sh.z+.85*Math.sqrt(Math.max(0,(.97*L)**2-dd*dd)));return v.setZ(Sh.z-.04)}if(side)v.x=two?(Sh.x<0?-.035:.035):Sh.x;else{v.z=Sh.z+(two?.22:0);if(two)v.x=(to3(P.arms[0].W).x+to3(P.arms[1].W).x)/2+(Sh.x<0?-.04:.04)}return v};
        // ไม้หมุนข้อมือ (prosup): หันฝ่ามือให้นิ้วโป้งชี้ไปทางไม้
        const palm=a.Rd?to3(a.Rd).sub(to3(a.W)).normalize().cross(to3(a.W).sub(to3(a.E)).normalize()):null;
        return {E:fix(a.E),W:fix(a.W),D:a.D?to3(a.D).sub(to3(a.W)):null,palm}}}}

  // ---- ท่าที่ต้องใช้ความลึก: เขียนเป็น 3D (เมตร) — หัวไปทาง +z, กล้องมองจาก -x ----
  // นอนตะแคงทับซีกซ้าย: ซีกขวาอยู่บน (+y), หน้าหันเข้ากล้อง (-x)
  const LS=V(0,-1,0);
  const sideLegs=(fw,dn,shin)=>(s,H)=>{const K=H.clone().add(V(-fw,s==='R'?-.07:0,-dn));return {K,A:K.clone().add(shin),T:nz(-.6,0,-.8)}};
  const lying={hip:V(0,.16,-.15),S:V(0,.2,.37)};
  // ตั้งองศาลำตัวแพลงก์ตะแคง: ไหล่ล่างต้องสูงจากพื้น = ต้นแขน (ศอกตั้งฉากใต้ไหล่)
  function sideAngle(y0,along,lat){let a=.3;for(let i=0;i<8;i++){const f=y0+along*Math.sin(a)-lat*Math.cos(a)-(.05+UA);const df=along*Math.cos(a)+lat*Math.sin(a);a-=f/df}return a}
  const P3={
    // หมุนไหล่ออกท่านอนตะแคง: ศอกแนบสีข้าง งอ 90° หมุนปลายแขนจากหน้าท้องขึ้นเพดาน
    ext_rot:w=>({...lying,head:V(0,.2,.62),sV:LS,leg:sideLegs(.27,.25,V(.1,0,-.35)),
      arm:(s,Sh)=>{if(s==='L')return {E:Sh.clone().add(V(-.04,-.03,.27)),W:Sh.clone().add(V(-.09,-.03,.52))};
        const E=Sh.clone().add(V(0,-.05,-.26)),ph=(-50+130*w)*D2R;return {E,W:E.clone().add(V(-Math.cos(ph)*.25,Math.sin(ph)*.25,0)),palm:V(0,-1,0)}}}),
    // Sleeper: ไหล่ล่างงอ 90° ไปข้างหน้า ศอกงอ 90° มือบนกดปลายแขนลงหาพื้น
    sleeper:w=>({...lying,head:V(0,.19,.62),sV:LS,leg:sideLegs(.27,.25,V(.1,0,-.35)),
      arm:(s,Sh)=>{const ph=62*w*D2R,ShL=s==='L'?Sh:wb('uarm.L'),EL=ShL.clone().add(V(-.27,0,0)),WL=EL.clone().add(V(0,Math.cos(ph)*.24,-Math.sin(ph)*.24));
        if(s==='L')return {E:EL,W:WL};return {E:Sh.clone().add(V(-.14,.06,-.2)),W:WL.clone().add(V(-.02,.05,0)),palm:V(0,-1,0)}}}),
    // Open book: เข่างอซ้อนกัน แขนล่างวางหน้าอก แขนบนกวาดข้ามไปอีกฝั่ง อก+หัวหมุนตาม
    tspine:w=>{const th=78*w*D2R;return {...lying,head:V(0,.2,.62),sV:LS,sS:V(-Math.sin(th),-Math.cos(th),0),sH:V(-Math.sin(th*1.15),-Math.cos(th*1.15),0),
      leg:(s,H)=>{const Kp=H.clone().add(V(-.4,s==='R'?-.08:0,-.03));return {K:Kp,A:Kp.clone().add(V(0,0,-.37)),T:nz(-.6,0,-.8)}},
      arm:(s,Sh)=>{if(s==='L')return {E:Sh.clone().add(V(-.27,-.02,.01)),W:Sh.clone().add(V(-.52,-.03,.02)),palm:V(0,1,0)};
        const ph=(-29+204*w)*D2R,d=V(-Math.cos(ph),Math.sin(ph),0);return {E:Sh.clone().add(d.clone().multiplyScalar(.27)).add(V(0,0,-.03)),W:Sh.clone().add(d.multiplyScalar(.53))}}}},
    // Side plank (ศอก): ลำตัวตรงหัวถึงเท้า ศอกล่างอยู่ใต้ไหล่ แขนบนชี้เพดาน (ท่ายุบ-ยกสะโพกเล็กน้อย)
    side_plank:w=>{const sag=.06*(1-w),a=sideAngle(.06+.05,LEG+SH_UP,SH_LAT+sag),u=V(0,Math.sin(a),Math.cos(a)),l=V(0,Math.cos(a),-Math.sin(a));
      const A0=V(0,.06+.05*Math.cos(a),-.8),hip=A0.clone().add(u.clone().multiplyScalar(LEG)).sub(l.clone().multiplyScalar(sag)),S=A0.clone().add(u.clone().multiplyScalar(LEG+SH_UP));
      return {hip,S,head:S.clone().add(u.clone().multiplyScalar(.25)),sV:l.clone().negate(),
        leg:(s,H)=>{const A=A0.clone().add(l.clone().multiplyScalar(s==='R'?.05:-.05));return {K:H.clone().add(A).multiplyScalar(.5).add(V(-.08,0,0)),A,T:nz(-1,.05,-.15)}},
        arm:(s,Sh)=>{if(s==='L'){const E=V(Sh.x,.05,Sh.z);return {E,W:E.clone().add(V(-.24,0,.03)),palm:V(0,-1,0)}}
          return {E:Sh.clone().add(V(-.02,.27,0)),W:Sh.clone().add(V(-.02,.54,0)),palm:V(0,0,1)}}}},
    // Copenhagen (แบบง่าย): เข่าบนพาดม้านั่ง ยกสะโพกขึ้นเป็นแนวตรง ขาล่างยกขึ้นไปใต้ม้านั่ง
    copen:w=>{const hb=.32,sag=.16*(1-w),Kc=V(0,hb+.05,-.42),a=sideAngle(Kc.y,LEN['thigh.R']+SH_UP,SH_LAT+HIP_LAT+sag),u=V(0,Math.sin(a),Math.cos(a)),l=V(0,Math.cos(a),-Math.sin(a));
      const hip=Kc.clone().add(u.clone().multiplyScalar(LEN['thigh.R'])).sub(l.clone().multiplyScalar(HIP_LAT+sag)),S=hip.clone().add(u.clone().multiplyScalar(SH_UP)).add(l.clone().multiplyScalar(sag*.7));
      return {hip,S,head:S.clone().add(u.clone().multiplyScalar(.25)),sV:l.clone().negate(),
        leg:(s,H)=>{if(s==='R')return {K:Kc.clone().add(V(-.08,0,0)),A:Kc.clone().sub(u.clone().multiplyScalar(LEN['shin.R'])),T:nz(-1,-.1,-.2)};
          const A=V(0,.06+(hb-.13)*w,Kc.z-.3+.18*w);return {K:H.clone().add(A).multiplyScalar(.5).add(V(-.08,0,0)),A,T:nz(-1,0,-.2)}},
        arm:(s,Sh)=>{if(s==='L'){const E=V(Sh.x,.05,Sh.z);return {E,W:E.clone().add(V(-.24,0,.03)),palm:V(0,-1,0)}}
          return {E:Sh.clone().add(V(-.06,-.05,-.25)),W:Sh.clone().add(V(-.1,-.1,-.5))}}}},
    // 90/90: นั่ง ขาหน้าต้นขาชี้หน้า หน้าแข้งพาดขวาง, ขาหลังต้นขาออกข้าง หน้าแข้งชี้หลัง แล้วสลับข้างแบบปัดน้ำฝน (เข่าตั้งขึ้นตอนกลาง)
    hip9090:w=>{const hip=V(0,.13,0);
      const fr=(o,H)=>({K:H.clone().add(V(o*.18,-.08,.36)),A:H.clone().add(V(o*.18-o*.36,-.08,.3))});
      const bk=(o,H)=>({K:H.clone().add(V(o*.38,-.08,-.12)),A:H.clone().add(V(o*.44,-.08,-.48))});
      const md=(o,H)=>({K:H.clone().add(V(o*.1,.24,.3)),A:H.clone().add(V(o*.22,-.08,.5))});
      return {hip,S:V(0,.64,-.1),head:V(0,.9,-.06),sV:SIDE,
        leg:(s,H)=>{const o=H.x<0?-1:1,A=s==='R'?fr(o,H):bk(o,H),Bk=s==='R'?bk(o,H):fr(o,H),M=md(o,H);
          const f=w<.5?sm(w*2):sm(w*2-1),p=w<.5?[A,M]:[M,Bk];const Kp=p[0].K.clone().lerp(p[1].K,f),Ap=p[0].A.clone().lerp(p[1].A,f);
          return {K:Kp,A:Ap,T:Ap.clone().sub(Kp).normalize().add(V(0,-.2,0))}},
        arm:(s,Sh)=>{const o=Sh.x<0?-1:1;return {E:Sh.clone().add(V(o*.1,-.25,-.1)),W:V(Sh.x+o*.1,.06,Sh.z-.24),palm:V(0,-1,0)}}}},
    // ยืดอกพิงกำแพง: แขนซ้ายกางระดับไหล่ ฝ่ามือแนบกำแพงด้านข้าง (เยื้องไปหลังเล็กน้อย) แล้วหมุนลำตัวออกจากกำแพง
    chest_str:w=>{const th=-26*w*D2R,ry=a=>V(Math.cos(a),0,-Math.sin(a)),hip=rest.pelvis.head.clone();
      return {hip,S:hip.clone().add(V(0,.52,0)),head:hip.clone().add(V(0,.8,.02)),sV:ry(th*.4),sS:ry(th),sH:ry(th*1.2),
        leg:(s,H)=>{const A=V(H.x,rest['foot.R'].head.y,H.z+(s==='R'?.04:-.02));return {K:H.clone().add(A).multiplyScalar(.5).add(V(0,0,.1)),A,T:nz(H.x*.6,-.25,1)}},
        arm:(s,Sh)=>s==='L'?{E:Sh.clone().add(V(.25,.03,-.1)),W:V(.67,1.39,-.1),palm:V(1,0,0)}:{E:Sh.clone().add(V(-.03,-.26,-.05)),W:Sh.clone().add(V(-.04,-.52,.04))}}},
    // Y-T-W นอนคว่ำ: แขนเป็นตัว Y (เหนือหัว), T (กางข้าง), W (ศอกงอดึงลง) ยกพ้นพื้น
    ytw:(w,i)=>{const keys=[
        o=>({E:nz(o*.55,.18,.8).multiplyScalar(.27),W:nz(o*.55,.18,.8).multiplyScalar(.53),palm:V(-o,0,0)}),
        o=>({E:nz(o,.15,.05).multiplyScalar(.27),W:nz(o,.15,.05).multiplyScalar(.53),palm:V(0,0,1)}),
        o=>({E:V(o*.19,.08,-.18),W:V(o*.32,.12,.02),palm:nz(0,-.7,.7)})];
      return {hip:V(0,.13,-.2),S:V(0,.18,.32),head:V(0,.21,.57),sV:SIDE,
        leg:(s,H)=>{const A=H.clone().add(V(0,-.06,-LEG*.995));return {K:H.clone().add(A).multiplyScalar(.5).add(V(0,-.05,0)),A,T:nz(0,-.5,-1)}},
        arm:(s,Sh)=>{const o=s==='R'?-1:1,a=keys[i%3](o),b=keys[(i+1)%3](o);
          return {E:Sh.clone().add(a.E.lerp(b.E,w)),W:Sh.clone().add(a.W.lerp(b.W,w)),palm:a.palm.lerp(b.palm,w)}}}}
  };
  // อุปกรณ์ประกอบ (ม้านั่ง/สเต็ป/ผนัง) เป็นกล่องเรียบๆ
  const propsG=new THREE.Group();scene.add(propsG);
  const box=(x0,x1,y0,y1,z0,z1,mat)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0),mat||propM);m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);m.castShadow=m.receiveShadow=true;propsG.add(m)};
  const bench=(x0,x1,z0,z1,h)=>{box(x0,x1,h-.04,h,z0,z1);for(const x of [x0+.02,x1-.04])for(const z of [z0+.02,z1-.04])box(x,x+.025,0,h-.04,z,z+.025)};
  function buildProps(id){while(propsG.children.length){const c=propsG.children.pop();c.geometry.dispose()}
    if(id==='copen'){bench(-.2,.2,-.6,-.28,.32);return}
    if(id==='chest_str'){box(.71,.77,0,1.95,-.75,-.06,wallM);return}
    const ex=FIG.P[id];if(!ex||!ex.props||!side)return;
    for(const q of ex.props){const z0=q.x*K,z1=(q.x+(q.w||8))*K,h=(q.h||0)*K+YOFF;
      if(q.c==='chair')bench(-.24,.24,z0,z1,h);else if(q.c==='step')box(-.3,.3,0,h,z0,z1);else if(q.c==='wall')box(-.4,.4,0,1.9,z0,z1,wallM)}}

  // ---- ดัมเบล / ไม้แบด / ไม้หมุนข้อมือ อยู่ในอุ้งมือ ----
  const mkDB=()=>{const g=new THREE.Group(),h=new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,.15,10),iron);h.rotation.z=Math.PI/2;g.add(h);
    for(const x of [-.085,.085]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.046,.046,.035,20),iron);p.rotation.z=Math.PI/2;p.position.x=x;g.add(p)}
    g.traverse(o=>o.castShadow=true);g.visible=false;scene.add(g);return g};
  const dbs=[mkDB(),mkDB()];
  const racket=new THREE.Group();{const cy=(r,l,y)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,l,10),rkM);m.position.y=y;m.castShadow=true;racket.add(m)};
    cy(.014,.2,.1);cy(.005,.24,.32);const head=new THREE.Mesh(new THREE.TorusGeometry(.1,.006,8,36),rkM);head.scale.set(1,1.27,1);head.position.y=.565;head.castShadow=true;racket.add(head);
    const str=new THREE.Mesh(new THREE.CircleGeometry(.096,28),new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.3,side:THREE.DoubleSide,depthWrite:false}));str.scale.set(1,1.27,1);str.position.y=.565;racket.add(str);
    racket.visible=false;scene.add(racket)}
  const rod=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,1,10),iron);rod.castShadow=true;rod.visible=false;scene.add(rod);
  // จุดกำในมือ: a=ทิศนิ้ว, n=ฝ่ามือ, h=แนวด้ามที่กำ (ขวางฝ่ามือ)
  function grip(s){const n0='hand.'+s,dq=world[n0].clone().multiply(rest[n0].q.clone().invert());
    const a=rest[n0].dir.clone().applyQuaternion(dq).normalize(),n=perp(PALM.clone().applyQuaternion(dq),a).normalize();
    return {p:wb(n0).add(a.clone().multiplyScalar(.075)).add(n.clone().multiplyScalar(.02)),a,n,h:a.clone().cross(n).normalize()}}
  function gear(){const ex=exCur;dbs.forEach(g=>g.visible=false);racket.visible=false;rod.visible=false;if(!ex)return;
    const far=nearS==='R'?'L':'R',put=(g,p,ax)=>{g.visible=true;g.position.copy(p);g.quaternion.setFromUnitVectors(V(1,0,0),ax)};
    if(ex.db==='g'){const A=grip('R'),Bq=grip('L');put(dbs[0],A.p.lerp(Bq.p,.5),V(0,1,0))}
    else if(ex.db==='b'){const A=grip('R'),Bq=grip('L');put(dbs[0],A.p,A.h);put(dbs[1],Bq.p,Bq.h)}
    else if(ex.db==='n'||ex.db==='f'){const G=grip(ex.db==='n'?nearS:far);put(dbs[0],G.p,G.h)}
    if(ex.rk){const G=grip(nearS);racket.visible=true;racket.position.copy(G.p).sub(G.a.clone().multiplyScalar(.08));
      racket.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(G.h,G.a,G.n))}
    if(rodV&&rodV.length()>.01){const G=grip(nearS),L=rodV.length()*1.3,d=rodV.clone().normalize();rod.visible=true;rod.scale.set(1,L,1);
      rod.position.copy(G.p).add(d.clone().multiplyScalar(L/2-.03));rod.quaternion.setFromUnitVectors(V(0,1,0),d)}}

  function poseAt(id,t){
    const f=P3[id];
    if(f){const d=FIG.dur(id),ex=FIG.P[id];nearS='R';rodV=null;
      if(ex.m==='loop'){const n=ex.k.length,u=((t/d)%1+1)%1*n,i=Math.floor(u);apply(f(sm((u-i-.24)/.76),i))}
      else apply(f(.5-.5*Math.cos(2*Math.PI*t/d),0));return}
    apply(from2D(FIG.pose(id,t)))}
  function poseGear(id,t){poseAt(id,t);gear()}

  // มุมกล้องเริ่มต้นเฉพาะท่า (ท่านอนตะแคง/คว่ำ มองจากด้านหน้าเฉียงบน จะเห็นเข่างอและแขนชัด)
  const CAM={ext_rot:[-1.2,.62],sleeper:[-1.2,.62],tspine:[-1.05,.62],side_plank:[-1.25,.28],copen:[-1.25,.3],ytw:[-1.1,.5],calf:[-1.3,.12],calf_str:[-1.25,.12],ankle_df:[-1.3,.12],wgs:[-.95,.15],chest_str:[-.45,.12],hip9090:[-.35,.3],deadbug:[-.95,.4],
    floor_press:[-.95,.42],pullover:[-.95,.4],glute_bridge:[-.9,.3],ham_slide:[-.9,.3]};
  let lastId=null,cur=null,raf=0,t0=0,yaw=-.7,pitch=.1,dist=3.2,target=V(0,.8,0),userYaw=null,hl={};
  const tip=(n,len)=>wb(n).add(rest[n].dir.clone().applyQuaternion(world[n].clone().multiply(rest[n].q.clone().invert())).multiplyScalar(len));
  function fit(id){const n=FIG.P[id]&&FIG.P[id].rk?48:16,d=FIG.dur(id),bx=new THREE.Box3();
    for(let i=0;i<n;i++){poseGear(id,d*i/n);for(const k of ORDER)bx.expandByPoint(wb(k));bx.expandByPoint(tip('head',.24));bx.expandByPoint(tip('hand.R',.12));bx.expandByPoint(tip('hand.L',.12))}
    for(const g of [...dbs,racket])if(g.visible)bx.expandByObject(g);bx.expandByObject(propsG);bx.expandByScalar(.08);const c=bx.getCenter(V()),sz=bx.getSize(V());target.copy(c);target.y=Math.max(c.y,sz.y*.42);
    // ระยะกล้องให้เห็นทั้งตัว: ขนาดใหญ่สุด / tan(ครึ่ง FOV) ปรับตามสัดส่วนจอ
    fitSz=Math.max(sz.x,sz.y,sz.z);fitCam()}
  let fitSz=2;function fitCam(){const asp=(canvas.clientWidth||300)/(canvas.clientHeight||300);dist=fitSz*.5/Math.tan(14*D2R)/Math.min(1,asp)*1.02+.25}
  function place(y){cam.position.set(target.x+dist*Math.sin(y)*Math.cos(pitch),target.y+dist*Math.sin(pitch)+.15,target.z+dist*Math.cos(y)*Math.cos(pitch));cam.lookAt(target)}
  let visible=true;
  const io=('IntersectionObserver' in window)?new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible&&cur&&!raf)raf=requestAnimationFrame(frame)}):null;
  if(io)io.observe(canvas);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&cur&&!raf)raf=requestAnimationFrame(frame)});
  function frame(now){raf=0;if(!cur||!canvas.isConnected)return;
    if(document.hidden||!visible)return; // หยุดวาดเมื่อมองไม่เห็น ประหยัดแบต
    const t=(now-t0)/1000,d=cur.d;try{poseGear(cur.id,(t%d+d)%d)}catch(e){}
    const pulse=.5+.5*Math.sin(t*6.2);hot.emissiveIntensity=.12+.55*pulse;
    place(userYaw!=null?userYaw:yaw);renderer.render(scene,cam);raf=requestAnimationFrame(frame)}
  function resize(){const w=canvas.clientWidth||300,h=canvas.clientHeight||300;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
  if('ResizeObserver' in window)new ResizeObserver(()=>{resize();if(cur)fitCam()}).observe(canvas);
  // ลากซ้าย–ขวาเพื่อหมุนดูรอบตัว
  let drag=null;canvas.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY,userYaw!=null?userYaw:yaw,pitch];try{canvas.setPointerCapture(e.pointerId)}catch(_){}});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;userYaw=drag[2]-(e.clientX-drag[0])*.011;pitch=Math.max(-.15,Math.min(.95,drag[3]+(e.clientY-drag[1])*.006))});
  const end=()=>{drag=null};canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.style.touchAction='pan-y';
  return {play(id,mus){if(!FIG.has(id))return false;tint();side=FIG.view(id)!=='front';hl={};(mus.secondary||[]).forEach(m=>hl[m]=1);(mus.primary||[]).forEach(m=>hl[m]=2);
      parts.forEach(p=>{p.o.material=hl[p.grp]===2?hot:hl[p.grp]===1?warm:p.grp.startsWith('skin')?skinM:p.grp==='itband'?tendon:base});
      lastId=curId=id;exCur=FIG.P[id];cur={id,d:FIG.dur(id)};const cm=CAM[id];yaw=cm?cm[0]:side?-.75:-.35;pitch=cm?cm[1]:.1;userYaw=null;resize();buildProps(id);fit(id);t0=performance.now();if(!raf)raf=requestAnimationFrame(frame);return true},
    stop(){cur=null},resize,setYaw(y){userYaw=y},
    freeze(t,y,p){cur=null;if(raf){cancelAnimationFrame(raf);raf=0}userYaw=y==null?null:y;if(p!=null)pitch=p;resize();fitCam();poseGear(lastId,t);place(userYaw!=null?userYaw:yaw);renderer.render(scene,cam)}};
}
