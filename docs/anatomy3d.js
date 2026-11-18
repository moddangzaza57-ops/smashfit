/* Smash Fit — หุ่น 3D ตามหลักกายวิภาค (anatomy)
   - ท่าทางมาจากเอนจินเดิม (FIG.pose: ข้อต่อ 2D ตามความยาวกระดูกจริง) แล้วแปลงเป็นข้อต่อ 3D
   - ร่างกาย = ปล้องเรียว + ข้อต่อกลม ไม่ต้องใช้ไฟล์โมเดล ไม่มีปัญหาลิขสิทธิ์ ใช้ออฟไลน์ได้
   - กล้ามเนื้อแยกชิ้นวางตามตำแหน่งจริง (ต้นขาหน้า/หลัง ก้น น่อง อก ปีก ฯลฯ)
     กล้ามที่โดนตรงกระพริบสีแดง · กล้ามที่ช่วยเป็นสีแดงอ่อน (ข้อมูลจาก MUS ใน data.js)
   ใช้: const v=create(canvas); v.play('goblet_squat',{primary:[...],secondary:[...]}) */
import * as THREE from './vendor/three.module.min.js';

const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const perp=(v,axis)=>v.clone().sub(axis.clone().multiplyScalar(v.dot(axis)));

export const MUSCLE_TH={quads:'ต้นขาหน้า',hams:'หลังต้นขา',glutes:'ก้น',gmed:'สะโพกด้านข้าง',adductors:'ขาหนีบ/ต้นขาด้านใน',hipflex:'หน้าสะโพก',
  calves:'น่อง',tibialis:'หน้าแข้ง',pecs:'อก',delts:'ไหล่',rotcuff:'ไหล่ส่วนลึก',traps:'สะบัก/หลังบน',lats:'ปีก (หลังกลาง)',
  biceps:'แขนหน้า',triceps:'แขนหลัง',forearms:'ปลายแขน/ข้อมือ',abs:'หน้าท้อง',obliques:'เอว/ข้างลำตัว',erectors:'หลังล่าง'};

export function supported(){try{const c=document.createElement('canvas');return !!(window.WebGLRenderingContext&&(c.getContext('webgl2')||c.getContext('webgl')))}catch(e){return false}}

export function create(canvas){
  const FIG=window.FIG;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(30,1,1,3000);
  scene.add(new THREE.HemisphereLight(0xffffff,0x8d8d96,1.2));
  const key=new THREE.DirectionalLight(0xffffff,1.65);key.position.set(130,280,190);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-170,right:170,top:200,bottom:-120,near:10,far:900});key.shadow.bias=-.0008;scene.add(key);
  const rim=new THREE.DirectionalLight(0xffffff,.6);rim.position.set(-170,140,-150);scene.add(rim);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(170,48),new THREE.ShadowMaterial({opacity:.2}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);

  const skin=new THREE.MeshStandardMaterial({color:0xe7d9cc,roughness:.7});
  const base=new THREE.MeshStandardMaterial({color:0xdcc3b2,roughness:.6});
  const hot=new THREE.MeshStandardMaterial({color:0xe0262f,roughness:.42,emissive:0xff1a1a,emissiveIntensity:.5});
  const warm=new THREE.MeshStandardMaterial({color:0xf2a49b,roughness:.5,emissive:0xff6a5a,emissiveIntensity:.12});
  const iron=new THREE.MeshStandardMaterial({color:0x2f3236,roughness:.35,metalness:.55});
  const propM=new THREE.MeshStandardMaterial({color:0xc7c9ce,roughness:.85});
  const rkM=new THREE.MeshStandardMaterial({color:0x2a6fdb,roughness:.4,metalness:.2});

  const unitSphere=new THREE.SphereGeometry(1,28,18);
  const mk=(geo,mat)=>{const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.matrixAutoUpdate=false;scene.add(m);return m};
  const SEG={thigh:[7.8,5.4],shin:[5.0,3.4],foot:[3.0,2.5],uarm:[4.7,3.6],farm:[3.6,2.6],neck:[4.3,4.8]};
  const segGeo=k=>new THREE.CylinderGeometry(SEG[k][1],SEG[k][0],1,22,1,false);
  const segMesh={};
  for(const s of [0,1])for(const k of ['thigh','shin','foot','uarm','farm'])segMesh[k+s]=mk(segGeo(k),skin);
  segMesh.neck=mk(segGeo('neck'),skin);
  const joints={};['knee','ankle','elb','wr','sh','hipj','hand'].forEach(j=>[0,1].forEach(i=>joints[j+i]=mk(unitSphere,skin)));
  const torso={pelvis:mk(unitSphere,skin),abd:mk(unitSphere,skin),chest:mk(unitSphere,skin),yoke:mk(unitSphere,skin),head:mk(unitSphere,skin)};

  // อุปกรณ์: ดัมเบล 2 ชิ้น, ไม้แบด, ไม้/คาน (rod)
  const mkDB=()=>{const g=new THREE.Group();const h=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,12,10),iron);h.rotation.z=Math.PI/2;h.castShadow=true;g.add(h);
    [-7,7].forEach(x=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(3.7,3.7,3.2,20),iron);p.rotation.z=Math.PI/2;p.position.x=x;p.castShadow=true;g.add(p)});g.visible=false;scene.add(g);return g};
  const dbs=[mkDB(),mkDB()];
  const racket=new THREE.Group();{const h=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,30,8),rkM);h.position.y=15;const head=new THREE.Mesh(new THREE.TorusGeometry(8,.9,8,28),rkM);head.scale.set(1,1.3,1);head.position.y=38;
    const str=new THREE.Mesh(new THREE.CircleGeometry(7.6,24),new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.35,side:THREE.DoubleSide}));str.scale.set(1,1.3,1);str.position.y=38;
    [h,head].forEach(m=>m.castShadow=true);racket.add(h,head,str);racket.visible=false;scene.add(racket)}
  const rods=[0,1].map(()=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,1,10),iron);m.matrixAutoUpdate=false;m.castShadow=true;m.visible=false;scene.add(m);return m});
  const props=new THREE.Group();scene.add(props);

  // กล้ามที่แขน–ขา: [id, ปล้อง, [ตำแหน่งตามความยาว 0..1, หน้า(+)/หลัง(-), นอก(+)/ใน(-)], รัศมี]
  const LIMB=[
    ['quads','thigh',[.52,.42,.05],[5.5,16.5,4.6]],['hams','thigh',[.5,-.42,0],[4.7,15,4]],['adductors','thigh',[.32,0,-.45],[3.9,11,3.6]],
    ['calves','shin',[.3,-.48,0],[4.1,9.5,3.7]],['tibialis','shin',[.4,.45,.1],[2.3,9,2.1]],
    ['delts','uarm',[.08,0,.15],[5.7,7,5.7]],['biceps','uarm',[.56,.42,0],[3.2,9,2.8]],['triceps','uarm',[.5,-.44,0],[3.4,10,3]],['forearms','farm',[.3,0,0],[3.8,8.5,3.6]]
  ];
  // กล้ามที่ลำตัว: [id, ศูนย์กลาง, [ข้าง, ขึ้น, หน้า], รัศมี]
  const TORSO=[
    ['pecs','chest',[6.8,2.6,7.6],[7,5.6,2.8]],['abs','abd',[0,0,8],[5.4,13,2.3]],['obliques','abd',[10.4,0,3.4],[3.3,11.5,4.3]],
    ['lats','chest',[9,-6,-5.4],[5.2,12.5,3.3]],['traps','chest',[5,11,-5.6],[7.3,5.6,3.1]],['erectors','abd',[3.4,0,-7.6],[2.7,13.5,2.5]],
    ['glutes','pelvis',[6.2,-3,-6.4],[6.8,7,4.6]],['gmed','pelvis',[11.6,1.5,-1.5],[3.4,5.2,4.4]],['hipflex','pelvis',[6.4,-1.5,7],[3.4,6.5,2.4]],
    ['rotcuff','chest',[12.4,7,-4],[3.7,4,2.7]]
  ];
  const mus=[];
  for(const s of [0,1]){
    LIMB.forEach(([id,seg,pos,r])=>mus.push({id,seg:seg+s,pos,r,m:mk(unitSphere,base)}));
    TORSO.forEach(([id,at,pos,r])=>{const skip=id==='abs'&&s===1;const m=mk(unitSphere,base);m.visible=!skip;
      mus.push({id,at,pos:id==='abs'?pos:[pos[0]*(s?-1:1),pos[1],pos[2]],r,m,skip})});
  }

  const M=new THREE.Matrix4(),S3=new THREE.Vector3();
  function place(mesh,center,X,Y,Z,sc){M.makeBasis(X,Y,Z);M.scale(S3.copy(sc));M.setPosition(center);mesh.matrix.copy(M);mesh.matrixWorldNeedsUpdate=true}
  function placeSeg(mesh,a,b,X,Z){const ax=b.clone().sub(a),len=ax.length()||1;ax.divideScalar(len);place(mesh,a.clone().add(b).multiplyScalar(.5),X,ax,Z,V(1,len,1))}
  function frameFor(a,b,antHint,fallback,out){
    const ax=b.clone().sub(a).normalize();let ant=perp(antHint,ax);
    if(ant.length()<.25)ant=perp(fallback,ax);if(ant.length()<.05)ant=perp(V(0,1,0),ax);
    ant.normalize();const lat=ax.clone().cross(ant).normalize();if(lat.dot(out)<0)lat.negate();return {ax,ant,lat};
  }

  let cur=null,raf=0,t0=0,yaw=.62,pitch=.12,dist=330,target=V(0,70,0),hl={},side=true,userYaw=null;
  const to3=p=>side?V(p[0],p[1],0):V(0,p[1],p[0]);

  function setProps(ex){
    props.clear();(ex.props||[]).forEach(q=>{let m;
      if(q.c==='wall'){m=new THREE.Mesh(new THREE.BoxGeometry(6,230,150),propM);m.position.set(q.x+3,115,0)}
      else if(q.c==='step'){m=new THREE.Mesh(new THREE.BoxGeometry(q.w,q.h,60),propM);m.position.set(q.x+q.w/2,q.h/2,0)}
      else if(q.c==='chair'){m=new THREE.Group();const seat=new THREE.Mesh(new THREE.BoxGeometry(q.w,4,40),propM);seat.position.set(q.x+q.w/2,q.h-2,0);m.add(seat);
        [[q.x+3,-17],[q.x+q.w-3,-17],[q.x+3,17],[q.x+q.w-3,17]].forEach(([x,z])=>{const l=new THREE.Mesh(new THREE.BoxGeometry(3,q.h-4,3),propM);l.position.set(x,(q.h-4)/2,z);m.add(l)})}
      if(m){m.traverse(o=>{o.castShadow=true;o.receiveShadow=true});props.add(m)}});
    props.visible=side;
  }

  function build(P,t){
    const ex=cur.ex,dzH=8.6,dzS=16.5;
    const hip=to3(P.hip),S=to3(P.S),head=to3(P.head);
    const up=S.clone().sub(hip).normalize();
    let sideV=side?V(0,0,1):to3(P.sh[0]).sub(to3(P.sh[1]));if(sideV.length()<.01)sideV=V(0,0,1);
    sideV=perp(sideV.normalize(),up).normalize();const fwd=up.clone().cross(sideV).normalize();
    const off=(p,i,d)=>side?to3(p).add(V(0,0,(i?-1:1)*d)):to3(p);
    const L=[0,1].map(i=>{const g=P.legs[i];return {H:side?hip.clone().add(sideV.clone().multiplyScalar((i?-1:1)*dzH)):to3(g.H),K:off(g.K,i,dzH),A:off(g.A,i,dzH+1),T:off(g.T,i,dzH+1.5),Hl:off(g.Hl,i,dzH+1)}});
    const A=[0,1].map(i=>{const g=P.arms[i];return {S:side?S.clone().add(sideV.clone().multiplyScalar((i?-1:1)*dzS)).add(up.clone().multiplyScalar(-3)):to3(g.S).add(up.clone().multiplyScalar(-3)),
      E:off(g.E,i,dzS+1),W:off(g.W,i,dzS+1),D:g.D?off(g.D,i,dzS+1):null,Rd:g.Rd?off(g.Rd,i,dzS+1):null}});
    const pel=hip.clone().add(up.clone().multiplyScalar(2)),abd=hip.clone().lerp(S,.42),che=hip.clone().lerp(S,.74),yoke=hip.clone().lerp(S,.93);
    place(torso.pelvis,pel,sideV,up,fwd,V(13.6,10.5,9.8));place(torso.abd,abd,sideV,up,fwd,V(12.4,17,9.2));
    place(torso.chest,che,sideV,up,fwd,V(16,15.5,10.6));place(torso.yoke,yoke,sideV,up,fwd,V(17.4,6.5,8.4));
    place(torso.head,head,sideV,up,fwd,V(9,10.6,9.6));
    placeSeg(segMesh.neck,S.clone().add(up.clone().multiplyScalar(1)),head.clone().add(up.clone().multiplyScalar(-6)),sideV,fwd);
    const segs={};
    [0,1].forEach(i=>{const out=sideV.clone().multiplyScalar(i?-1:1),l=L[i],a=A[i];
      const th=frameFor(l.H,l.K,l.A.clone().sub(l.K).negate(),fwd,out);
      const sn=frameFor(l.K,l.A,side?l.T.clone().sub(l.A):fwd,fwd,out);
      const ua=frameFor(a.S,a.E,a.W.clone().sub(a.E),fwd,out),fa=frameFor(a.E,a.W,fwd,up,out);
      segs['thigh'+i]={a:l.H,b:l.K,f:th};segs['shin'+i]={a:l.K,b:l.A,f:sn};segs['uarm'+i]={a:a.S,b:a.E,f:ua};segs['farm'+i]={a:a.E,b:a.W,f:fa};
      placeSeg(segMesh['thigh'+i],l.H,l.K,th.lat,th.ant);placeSeg(segMesh['shin'+i],l.K,l.A,sn.lat,sn.ant);
      const ft=frameFor(l.Hl,l.T,up,fwd,out);placeSeg(segMesh['foot'+i],l.Hl,l.T,ft.lat,ft.ant);
      placeSeg(segMesh['uarm'+i],a.S,a.E,ua.lat,ua.ant);placeSeg(segMesh['farm'+i],a.E,a.W,fa.lat,fa.ant);
      const J=(n,p,r)=>place(joints[n+i],p,sideV,up,fwd,V(r,r,r));
      J('knee',l.K,5.3);J('ankle',l.A,3.6);J('elb',a.E,3.7);J('wr',a.W,2.9);J('sh',a.S,5.3);J('hipj',l.H,7.5);
      const hand=a.D?a.W.clone().lerp(a.D,.5):a.W.clone().add(fa.ax.clone().multiplyScalar(3.2));J('hand',hand,3.3);
      a.hand=hand;a.fa=fa;
      const rod=rods[i];if(a.Rd){rod.visible=true;placeSeg(rod,a.W,a.Rd,fa.lat,fa.ant)}else rod.visible=false;
    });
    // ดัมเบล: b=สองมือ, n=มือใกล้, f=มือไกล, g=ถือดัมเบลเดียวแนบอก (goblet)
    const db=ex.db;dbs.forEach(g=>g.visible=false);
    if(db==='g'){const g=dbs[0];g.visible=true;g.position.copy(A[0].hand.clone().lerp(A[1].hand,.5));g.quaternion.setFromUnitVectors(V(1,0,0),up)}
    else if(db){[0,1].forEach(i=>{if(db==='b'||(db==='n'&&i===0)||(db==='f'&&i===1)){const g=dbs[i];g.visible=true;g.position.copy(A[i].hand);g.quaternion.setFromUnitVectors(V(1,0,0),A[i].fa.lat.clone())}})}
    if(ex.rk){racket.visible=true;racket.position.copy(A[0].hand);racket.quaternion.setFromUnitVectors(V(0,1,0),A[0].fa.ax)}else racket.visible=false;
    // กล้ามเนื้อ + จังหวะกระพริบ (~1 ครั้ง/วินาที)
    const pulse=.5+.5*Math.sin(t*6.2);hot.emissiveIntensity=.22+.9*pulse;hot.color.setRGB(.76+.22*pulse,.1,.12);
    for(const x of mus){if(x.skip)continue;
      if(x.seg){const g=segs[x.seg],len=g.b.distanceTo(g.a),r0=SEG[x.seg.slice(0,-1)][0];
        const c=g.a.clone().add(g.f.ax.clone().multiplyScalar(len*x.pos[0])).add(g.f.ant.clone().multiplyScalar(r0*x.pos[1])).add(g.f.lat.clone().multiplyScalar(r0*x.pos[2]));
        place(x.m,c,g.f.lat,g.f.ax,g.f.ant,V(x.r[0],x.r[1]*(len/42),x.r[2]))}
      else{const ctr=x.at==='pelvis'?pel:x.at==='abd'?abd:che;
        const c=ctr.clone().add(sideV.clone().multiplyScalar(x.pos[0])).add(up.clone().multiplyScalar(x.pos[1])).add(fwd.clone().multiplyScalar(x.pos[2]));
        place(x.m,c,sideV,up,fwd,V(...x.r))}
      x.m.material=hl[x.id]===2?hot:hl[x.id]===1?warm:base;
    }
  }
  function fit(id){
    const n=24,d=FIG.dur(id),b=new THREE.Box3();
    for(let i=0;i<n;i++){const P=FIG.pose(id,d*i/n);[P.hip,P.S,P.head,...P.legs.flatMap(g=>[g.K,g.A,g.T]),...P.arms.flatMap(g=>[g.E,g.W])].forEach(p=>b.expandByPoint(to3(p)))}
    b.expandByScalar(FIG.P[id].rk?44:16);const c=b.getCenter(V()),sz=b.getSize(V());target.copy(c);target.y=Math.max(c.y,sz.y*.45);
    dist=Math.max(sz.x,sz.y,sz.z)*1.5+50;
  }
  let visible=true;
  const io=('IntersectionObserver' in window)?new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible&&cur&&!raf)raf=requestAnimationFrame(frame)}):null;
  if(io)io.observe(canvas);
  function frame(now){
    raf=0;if(!cur||!canvas.isConnected)return;
    if(document.hidden||!visible)return; // หยุดวาดเมื่อมองไม่เห็น ประหยัดแบต
    const t=(now-t0)/1000,d=cur.d,P=FIG.pose(cur.id,(t%d+d)%d);build(P,t);
    const y=userYaw!=null?userYaw:yaw;
    cam.position.set(target.x+dist*Math.sin(y)*Math.cos(pitch),target.y+dist*Math.sin(pitch)+18,target.z+dist*Math.cos(y)*Math.cos(pitch));cam.lookAt(target);
    renderer.render(scene,cam);raf=requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&cur&&!raf)raf=requestAnimationFrame(frame)});
  function resize(){const w=canvas.clientWidth||300,h=canvas.clientHeight||300;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
  if('ResizeObserver' in window)new ResizeObserver(()=>{resize()}).observe(canvas);
  // ลากซ้าย–ขวาเพื่อหมุนดูรอบตัว
  let drag=null;
  canvas.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY,userYaw!=null?userYaw:yaw,pitch];try{canvas.setPointerCapture(e.pointerId)}catch(_){}});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;userYaw=drag[2]-(e.clientX-drag[0])*.011;pitch=Math.max(-.15,Math.min(.95,drag[3]+(e.clientY-drag[1])*.006))});
  const end=()=>{drag=null};canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  canvas.style.touchAction='pan-y';
  return {
    play(id,muscles){
      if(!FIG.has(id))return false;const ex=FIG.P[id];side=FIG.view(id)!=='front';
      hl={};((muscles&&muscles.secondary)||[]).forEach(m=>hl[m]=1);((muscles&&muscles.primary)||[]).forEach(m=>hl[m]=2);
      cur={id,ex,d:FIG.dur(id)};userYaw=null;pitch=.12;yaw=side?.62:.4;setProps(ex);fit(id);resize();t0=performance.now();
      if(!raf)raf=requestAnimationFrame(frame);return true},
    stop(){cur=null;if(raf){cancelAnimationFrame(raf);raf=0}},
    resize
  };
}
