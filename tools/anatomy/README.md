# หุ่นกายวิภาค 3D (web/anatomy-1.glb)

สร้างจาก Z-Anatomy (CC BY-SA 4.0, พัฒนาต่อจาก BodyParts3D © DBCLS, CC BY-SA 2.1 JP)
ไฟล์ต้นฉบับ `Startup.blend` (~300 MB) **ไม่เก็บใน repo** ดาวน์โหลดเองจาก https://www.z-anatomy.com/

## สร้างใหม่
ต้องมี Blender 4.x ขึ้นไป (ทดสอบกับ 5.3)

```
blender -b --factory-startup --disable-autoexec Startup.blend --python tools/anatomy/build_rig.py -- web/anatomy-2.glb 110000
```

- เลือกกล้ามชั้นนอก + ผิว (หัว มือ เท้า) จัดเป็นกลุ่มกล้ามตาม `MUS` ใน data.js
- ลดโพลีกอนเหลือราว 110k–155k สามเหลี่ยม (อาร์กิวเมนต์สุดท้าย)
- สร้างกระดูก pelvis/spine/head/scap(ไหปลาร้า)/uarm/farm/hand/thigh/shin/foot จากตำแหน่งกระดูกจริง
- น้ำหนักผิวคิดจากระยะถึง "ผิว" ของแต่ละส่วน (ลำตัวหนา แขนบาง) จึงไม่ดึงกล้ามข้างซี่โครงไปกับแขน
- ไม่ใช้ส่วนที่เป็น CC BY-NC (หูชั้นใน ไต)

เปลี่ยนโมเดลแล้วให้ **เปลี่ยนเลขในชื่อไฟล์** (anatomy-2.glb) และแก้ `MODEL` ใน web/anatomyReal.js
เพราะ service worker เก็บไฟล์โมเดลไว้ถาวรตามชื่อไฟล์ และอัปเดต `anatomy-N.glb.LICENSE.txt`
