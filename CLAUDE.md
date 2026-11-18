# Smash Fit — คู่มือโปรเจกต์สำหรับ Claude Code

เว็บแอปฟิตเนสส่วนตัวสำหรับนักแบดมินตันวัยทำงาน ใช้บน iPhone ผ่าน Safari → "เพิ่มไปยังหน้าจอโฮม" (PWA)
ไม่มีเซิร์ฟเวอร์ ไม่มีบัญชีผู้ใช้ ข้อมูลทั้งหมดเก็บใน localStorage ของเครื่อง (key `smashfit.v1`)

## โครงสร้าง
- `src/shell.html` — HTML + CSS ทั้งหมด (มี `<!--PWA-->` ให้ build ใส่ manifest/icon)
- `src/figure.js` — เอนจินหุ่นแอนิเมชัน SVG + ท่าทางของแต่ละท่า (`FIG.P[id]`)
- `src/exdata.js` — คำอธิบายละเอียดของแต่ละท่า (`EXD[id]`)
- `src/data.js` — ค่าคงที่: ประเภทวัน, รอบ 4 สัปดาห์, คลังท่า `EX`, เทมเพลต `TPL`, ท่าทดแทน `ALT`, ความเสี่ยงตามอาการเจ็บ `RISK`, แบบทดสอบ `TESTS`
- `src/app.js` — ตรรกะทั้งหมด (สร้างเซสชัน, ปรับโปรแกรม, UI, ตัวจับเวลา, โหมดสุ่มมุม)
- `web/` — manifest, service worker (`sw.js`), ไอคอน
- `build.py` — รวมทุกอย่างเป็น `docs/` (สำหรับ GitHub Pages) และ `dist/smashfit.html`
- `docs/` — **ไฟล์ที่ build แล้ว ห้ามแก้ด้วยมือ** แก้ใน `src/` หรือ `web/` แล้วรัน `python3 build.py`

## กติกา
- ท่าใหม่ต้องเพิ่มครบ 3 ที่: `EX` (data.js), `EXD` (exdata.js), `FIG.P` (figure.js) และใส่ใน `CATS`
- ข้อความ UI เป็นภาษาไทย
- ห้ามใส่รูป/วิดีโอที่มีลิขสิทธิ์ ใช้หุ่น SVG ที่วาดเอง + ลิงก์ค้นหา YouTube
- ทุกครั้งที่แก้: รัน `python3 build.py` แล้ว commit ทั้ง `src/` และ `docs/` (build.py เปลี่ยนเวอร์ชัน service worker ให้เอง ผู้ใช้จะได้เวอร์ชันใหม่)
- ห้ามเปลี่ยน storage key หรือรูปแบบข้อมูลแบบที่ทำให้ข้อมูลเก่าหาย ถ้าจำเป็นให้เพิ่มการแปลงใน `normalize()`

## ทดสอบ
- เปิด `dist/smashfit.html` ในเบราว์เซอร์ หรือ `cd docs && python3 -m http.server` แล้วเปิด http://localhost:8000
- ทดสอบการนำเข้าข้อมูล Health: `http://localhost:8000/?sleep=7.5&rhr=55`
