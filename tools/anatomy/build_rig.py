"""Z-Anatomy -> Smash Fit anatomy GLB
blender -b --factory-startup --disable-autoexec Startup.blend --python build_rig.py -- OUT.glb [target_tris]
- เลือกกล้ามชั้นนอก + ผิว (หัว มือ เท้า) จัดเป็นกลุ่มกล้าม 19 กลุ่มของแอป
- ลดโพลีกอน, สร้างกระดูกจากตำแหน่งกระดูกจริงในโมเดล
- คำนวณน้ำหนักผิว (skin weights) เอง: Gaussian ตามระยะถึงกระดูกที่กล้ามมัดนั้นพาดผ่าน -> ข้อพับนุ่ม
Model: Z-Anatomy / BodyParts3D (CC BY-SA 4.0 / CC BY-SA 2.1 JP)"""
import bpy, bmesh, sys, json, math
import numpy as np
from mathutils import Vector

args = sys.argv[sys.argv.index('--') + 1:]
OUT = args[0]
TARGET = int(args[1]) if len(args) > 1 else 60000

G = {  # กลุ่มกล้ามของแอป -> ชื่อกล้ามใน Z-Anatomy (ไม่รวม .r/.l)
 'pecs': ['Sternocostal head of pectoralis major muscle', 'Clavicular head of pectoralis major muscle', '(Abdominal part of pectoralis major muscle)'],
 'delts': ['Clavicular part of deltoid muscle', 'Acromial part of deltoid muscle', 'Scapular spinal part of deltoid muscle'],
 'traps': ['Descending part of trapezius muscle', 'Transverse part of trapezius muscle', 'Ascending part of trapezius muscle', 'Rhomboid major muscle'],
 'lats': ['Latissimus dorsi muscle', 'Teres major muscle'],
 'rotcuff': ['Infraspinatus muscle', 'Teres minor muscle'],
 'biceps': ['Long head of biceps brachii', 'Short head of biceps brachii', 'Brachialis muscle'],
 'triceps': ['Long head of triceps brachii', 'Lateral head of triceps brachii', 'Medial head of triceps brachii'],
 'forearms': ['Brachioradialis muscle', 'Extensor carpi radialis longus', 'Extensor carpi radialis brevis', 'Extensor digitorum', 'Humeral head of flexor carpi ulnaris',
              'Palmaris longus muscle', 'Flexor carpi radialis', 'Humeral head of extensor carpi ulnaris', 'Superficial head of pronator teres', 'Abductor pollicis longus', 'Extensor digiti minimi'],
 'abs': ['Rectus abdominis muscle'],
 'obliques': ['External abdominal oblique muscle'],
 'serratus': ['Serratus anterior muscle'],
 'erectors': ['Iliocostalis lumborum muscle', 'Longissimus thoracis muscle'],
 'glutes': ['Gluteus maximus muscle'],
 'gmed': ['Gluteus medius muscle', 'Tensor fasciae latae'],
 'hipflex': ['Sartorius muscle'],
 'quads': ['Rectus femoris muscle', 'Vastus lateralis muscle', 'Vastus medialis muscle'],
 'itband': ['Iliotibial tract'],
 'hams': ['Long head of biceps femoris', 'Short head of biceps femoris', 'Semitendinosus muscle', 'Semimembranosus muscle'],
 'adductors': ['Adductor longus', 'Gracilis muscle', 'Adductor magnus', 'Pectineus muscle'],
 'calves': ['Medial head of gastrocnemius', 'Lateral head of gastrocnemius', 'Soleus muscle', 'Calcaneal tendon'],
 'tibialis': ['Tibialis anterior muscle', 'Extensor digitorum longus', 'Fibularis longus muscle'],
 'neck': ['Sternocleidomastoid muscle', 'Splenius capitis muscle', 'Levator scapulae'],
 # กล้ามชั้นลึกไว้เติมช่องว่าง (สีพื้น ไม่ไฮไลต์)
 'fill': ['Vastus intermedius muscle', 'Adductor brevis', 'Coracobrachialis muscle', 'Tibialis posterior muscle', 'Flexor digitorum longus', 'Fibularis brevis muscle',
          'Extensor hallucis longus', 'Supinator', 'Humero-ulnar head of flexor digitorum superficialis', 'Iliacus muscle', 'Psoas major', 'Gluteus minimus muscle',
          'Quadratus lumborum muscle', 'Splenius colli muscle', 'Internal abdominal oblique muscle', 'Subscapularis muscle', 'Pectoralis minor muscle', 'Flexor hallucis longus'],
}
# กระดูกที่กล้ามแต่ละกลุ่มพาดผ่าน (ใช้คำนวณน้ำหนักผิว) S=ข้างเดียวกัน
ALLOW = {
 'pecs': ['spine', 'scap', 'uarm'], 'delts': ['scap', 'uarm'], 'traps': ['spine', 'head', 'scap'], 'lats': ['spine', 'scap', 'uarm'], 'rotcuff': ['spine', 'scap', 'uarm'],
 'biceps': ['uarm', 'farm', 'scap'], 'triceps': ['uarm', 'farm', 'scap'], 'forearms': ['farm', 'uarm', 'hand'],
 'abs': ['spine', 'pelvis'], 'obliques': ['spine', 'pelvis'], 'serratus': ['spine', 'scap'], 'erectors': ['spine', 'pelvis'],
 'glutes': ['pelvis', 'thigh'], 'gmed': ['pelvis', 'thigh'], 'hipflex': ['pelvis', 'thigh', 'shin'],
 'quads': ['thigh', 'shin', 'pelvis'], 'itband': ['thigh', 'shin', 'pelvis'], 'hams': ['thigh', 'shin', 'pelvis'], 'adductors': ['thigh', 'pelvis'],
 'calves': ['shin', 'thigh', 'foot'], 'tibialis': ['shin', 'foot'], 'neck': ['spine', 'head', 'scap'],
 'fill': ['spine', 'pelvis', 'thigh', 'shin', 'foot', 'scap', 'uarm', 'farm', 'hand'],
 'skin_head': ['head', 'spine'], 'skin_hand': ['hand', 'farm'], 'skin_foot': ['foot', 'shin'],
}

def O(n):
    return bpy.data.objects.get(n)

def world_verts(o):
    m = o.matrix_world
    return np.array([tuple(m @ v.co) for v in o.data.vertices])

def top(o, k=.03):
    v = world_verts(o); return Vector(v[v[:, 2] > v[:, 2].max() - k].mean(0))

def bot(o, k=.03):
    v = world_verts(o); return Vector(v[v[:, 2] < v[:, 2].min() + k].mean(0))

def cen(o):
    return Vector(world_verts(o).mean(0))

# ---------- จุดข้อต่อจากกระดูกจริง ----------
J = {}
for s, sx in (('r', 'R'), ('l', 'L')):
    fem, tib, tal, hum, uln, rad = (O(f'{n}.{s}') for n in ('Femur', 'Tibia', 'Talus', 'Humerus', 'Ulna', 'Radius'))
    fv = world_verts(fem)
    head = fv[fv[:, 2] > fv[:, 2].max() - .045]
    head = head[np.abs(head[:, 0]) < np.median(np.abs(head[:, 0]))]  # ส่วนหัวกระดูกต้นขา (ด้านใน)
    J['hip' + sx] = Vector(head.mean(0)) - Vector((0, 0, .02))
    J['knee' + sx] = (bot(fem) + top(tib)) / 2
    J['ankle' + sx] = cen(tal)
    J['shoulder' + sx] = top(hum) - Vector((0, 0, .025))
    J['elbow' + sx] = (bot(hum) + top(uln)) / 2
    J['wrist' + sx] = (bot(rad, .015) + bot(uln, .015)) / 2
    cv = world_verts(O(f'Clavicle.{s}'))
    J['sc' + sx] = Vector(cv[np.abs(cv[:, 0]) < np.abs(cv[:, 0]).min() + .015].mean(0))  # ข้อต่อกระดูกไหปลาร้า-กระดูกอก
J['pelvis'] = (J['hipR'] + J['hipL']) / 2
J['chest'] = (J['shoulderR'] + J['shoulderL']) / 2
J['headTop'] = Vector((0, J['chest'].y + .01, max(world_verts(O('Frontal bone'))[:, 2])))

# ---------- เลือกชิ้นส่วน + ลดโพลีกอน ----------
deps = bpy.context.evaluated_depsgraph_get()
parts = []  # (group, side, obj)
for g, names in G.items():
    for n in names:
        for s in ('r', 'l'):
            o = O(f'{n}.{s}')
            if o and o.type == 'MESH' and len(o.data.polygons):
                parts.append((g, s, o))
            elif not o:
                print('MISSING', n, s)
# ผิว: หัว มือ เท้า จาก "Regions of human body"
for o in bpy.data.objects:
    if o.type != 'MESH' or not len(o.data.polygons):
        continue
    cols = [c.name for c in o.users_collection]
    if not any(c.startswith('9:') or 'egion' in c for c in cols):
        continue
    nl = o.name.lower()
    if any(k in nl for k in ('line', 'plane', 'regions', 'text', 'label')):
        continue
    wv = world_verts(o)
    if (wv.max(0) - wv.min(0)).max() > .35:  # ตัดป้ายข้อความ/เส้นอ้างอิงขนาดใหญ่
        continue
    c = Vector(wv.mean(0))
    side = 'r' if c.x < 0 else 'l'
    if c.z > 1.50:
        parts.append(('skin_head', 'c', o))
    elif c.z < .10:
        parts.append(('skin_foot', side, o))
    elif abs(c.x) > .265 and c.z < .87:
        parts.append(('skin_hand', side, o))
total = sum(len(o.data.polygons) for _, _, o in parts)
ratio = min(1, TARGET / total)
print('parts', len(parts), 'faces', total, 'ratio', round(ratio, 4))

col = bpy.data.collections.new('OUT'); bpy.context.scene.collection.children.link(col)
groups = {}
for g, s, o in parts:
    r = ratio if not g.startswith('skin') else min(1, ratio * 2.2)
    mod = o.modifiers.new('dec', 'DECIMATE'); mod.ratio = max(r, 120 / max(1, len(o.data.polygons)))
    ev = o.evaluated_get(bpy.context.evaluated_depsgraph_get())
    me = bpy.data.meshes.new_from_object(ev); me.transform(o.matrix_world)
    o.modifiers.remove(mod)
    key = f'{g}_{s}'
    bm = groups.get(key)
    if bm is None:
        bm = groups[key] = bmesh.new()
    bm.from_mesh(me); bpy.data.meshes.remove(me)

# ---------- โครงกระดูก ----------
arm = bpy.data.armatures.new('rig'); ao = bpy.data.objects.new('rig', arm); col.objects.link(ao)
bpy.context.view_layer.objects.active = ao; ao.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
EB = arm.edit_bones
def bone(name, a, b, parent=None):
    e = EB.new(name); e.head = a; e.tail = b
    if parent: e.parent = EB[parent]; e.use_connect = False
    return e
bone('pelvis', J['pelvis'], J['pelvis'] + Vector((0, 0, .08)))
bone('spine', J['pelvis'], J['chest'], 'pelvis')
bone('head', J['chest'], J['headTop'], 'spine')
toes = {}
for s, sx in (('r', 'R'), ('l', 'L')):
    fv = np.concatenate([world_verts(o) for g, ss, o in parts if g == 'skin_foot' and ss == s])
    toe = Vector(fv[fv[:, 1].argmin()]); toe.z = J['ankle' + sx].z - .04  # ปลายเท้า (หน้า = -y)
    hv = np.concatenate([world_verts(o) for g, ss, o in parts if g == 'skin_hand' and ss == s])
    tip = Vector(hv[hv[:, 2].argmin()])
    bone('thigh.' + sx, J['hip' + sx], J['knee' + sx], 'pelvis')
    bone('shin.' + sx, J['knee' + sx], J['ankle' + sx], 'thigh.' + sx)
    bone('foot.' + sx, J['ankle' + sx], toe, 'shin.' + sx)
    bone('scap.' + sx, J['sc' + sx], J['shoulder' + sx], 'spine')  # ไหปลาร้า/สะบัก: ยกตามแขนตอนชูขึ้น
    bone('uarm.' + sx, J['shoulder' + sx], J['elbow' + sx], 'scap.' + sx)
    bone('farm.' + sx, J['elbow' + sx], J['wrist' + sx], 'uarm.' + sx)
    bone('hand.' + sx, J['wrist' + sx], tip, 'farm.' + sx)
segs = {b.name: (np.array(b.head), np.array(b.tail)) for b in EB}
bpy.ops.object.mode_set(mode='OBJECT')

# ---------- น้ำหนักผิว: Gaussian ตามระยะถึงกระดูกที่อนุญาต -> ข้อพับเนียน ----------
def seg_dist(P, a, b):
    ab = b - a; t = np.clip(((P - a) @ ab) / (ab @ ab), 0, 1)
    return np.linalg.norm(P - (a + t[:, None] * ab), axis=1)
SIG = .045
RAD = {'spine': .115, 'pelvis': .1, 'head': .07, 'scap': .03, 'uarm': .035, 'farm': .03, 'hand': .02, 'thigh': .065, 'shin': .045, 'foot': .03}
meshes = []
for key, bm in groups.items():
    g, s = key.rsplit('_', 1)
    me = bpy.data.meshes.new('G_' + key); bm.to_mesh(me); bm.free(); me.validate(clean_customdata=False)
    mo = bpy.data.objects.new('G_' + key, me); col.objects.link(mo)
    P = np.array([tuple(v.co) for v in me.vertices])
    sx = 'R' if s == 'r' else 'L'
    names = []
    for b in ALLOW[g]:
        if b in ('pelvis', 'spine', 'head'):
            names.append(b)
        elif s == 'c':
            names += [b + '.R', b + '.L']
        else:
            names.append(b + '.' + sx)
    # ระยะถึง "ผิว" ของแต่ละส่วน (ลำตัวหนา แขนบาง) — ไม่งั้นกล้ามข้างซี่โครงจะติดไปกับแขนที่ห้อยข้างลำตัว
    D = np.stack([np.maximum(0, seg_dist(P, *segs[n]) - RAD[n.split('.')[0]]) for n in names], 1)
    W = np.exp(-(D - D.min(1, keepdims=True)) ** 2 / (2 * SIG ** 2))  # สัมพัทธ์กับกระดูกที่ใกล้สุด
    W[W < .02] = 0
    idx = np.argsort(-W, 1)[:, :3]  # เก็บ 3 กระดูกที่มีผลมากสุด
    keep = np.zeros_like(W); np.put_along_axis(keep, idx, np.take_along_axis(W, idx, 1), 1)
    keep /= keep.sum(1, keepdims=True)
    for j, n in enumerate(names):
        vg = mo.vertex_groups.new(name=n)
        for i in np.nonzero(keep[:, j])[0]:
            vg.add([int(i)], float(keep[i, j]), 'REPLACE')
    mo.parent = ao; m = mo.modifiers.new('arm', 'ARMATURE'); m.object = ao
    mat = bpy.data.materials.new(g); me.materials.append(mat)
    for p in me.polygons: p.use_smooth = True
    meshes.append(mo)

print('meshes', len(meshes), 'tris', sum(sum(len(p.vertices) - 2 for p in mo.data.polygons) for mo in meshes))
bpy.ops.object.select_all(action='DESELECT')
for o in [ao] + meshes: o.select_set(True)
bpy.context.view_layer.objects.active = ao
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', use_selection=True, export_skins=True, export_animations=False,
                          export_yup=True, export_apply=False, export_materials='EXPORT', export_normals=True, export_texcoords=False,
                          export_def_bones=False)
json.dump({k: [round(x, 4) for x in v] for k, v in J.items()}, open(OUT.replace('.glb', '.joints.json'), 'w'))
print('exported', OUT)
