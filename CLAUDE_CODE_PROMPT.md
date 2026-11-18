ช่วยเอาเว็บแอป Smash Fit ในโฟลเดอร์นี้ขึ้น GitHub Pages ให้หน่อย อ่าน CLAUDE.md ก่อน แล้วทำตามนี้:

1. รัน `python3 build.py` เพื่อสร้างโฟลเดอร์ docs/ ล่าสุด
2. ทดสอบ: `cd docs && python3 -m http.server 8000` แล้วเช็คว่า http://localhost:8000 เปิดได้ ไม่มี error ใน console และ service worker ลงทะเบียนสำเร็จ
3. git init (ถ้ายังไม่มี), commit ทุกไฟล์ (ยกเว้นที่อยู่ใน .gitignore)
4. สร้าง repository สาธารณะชื่อ `smashfit` ใน GitHub ของฉันด้วย `gh repo create` แล้ว push branch main
5. เปิด GitHub Pages ให้ deploy จาก branch `main` โฟลเดอร์ `/docs` (ใช้ `gh api` ได้)
6. รอจน deploy เสร็จ แล้วเช็คว่า URL จริงเปิดได้ และ manifest.webmanifest, sw.js, icons โหลดได้ (HTTP 200)
7. บอก URL สุดท้ายให้ฉัน พร้อมวิธีกด "เพิ่มไปยังหน้าจอโฮม" ใน Safari

ถ้าเครื่องยังไม่ได้ล็อกอิน GitHub ให้แนะนำฉันรัน `gh auth login` ก่อน ห้ามใส่รหัสผ่านหรือ token ลงในไฟล์ใดๆ
