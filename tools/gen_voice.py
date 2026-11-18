"""สร้างเสียงพากย์ภาษาไทยของ Smash Fit ด้วย ElevenLabs แล้วเก็บเป็นไฟล์ mp3 ถาวรใน web/audio/

วิธีใช้ (รันในโฟลเดอร์โปรเจกต์):
    py tools/gen_voice.py                 # ถามคีย์ (ไม่แสดงบนจอ) แล้วให้เลือกเสียง
    py tools/gen_voice.py --voice <ID>    # ระบุ voice id เอง
    py tools/gen_voice.py --only n5,n4    # สร้างใหม่เฉพาะบางคลิป

- คีย์ API อ่านจากตัวแปร ELEVENLABS_API_KEY หรือพิมพ์ตอนรัน ไม่ถูกบันทึกลงไฟล์ใดๆ
- รายการคำพูดอ่านจาก `const VOICE={...}` ใน src/ui.js (แก้คำที่นั่นที่เดียว)
- เสร็จแล้วรัน `py build.py` แล้ว commit web/audio/ + docs/
"""
import argparse, getpass, json, os, re, sys, time, urllib.error, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'web', 'audio')
API = 'https://api.elevenlabs.io/v1'


def clips():
    src = open(os.path.join(ROOT, 'src', 'ui.js'), encoding='utf-8').read()
    m = re.search(r'const VOICE=(\{.*?\});', src)
    if not m:
        sys.exit('ไม่พบ const VOICE={...} ใน src/ui.js')
    return json.loads(m.group(1))


def call(path, key, body=None, accept='application/json'):
    req = urllib.request.Request(API + path, data=json.dumps(body).encode() if body is not None else None,
                                 headers={'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': accept},
                                 method='POST' if body is not None else 'GET')
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def pick_voice(key):
    try:
        data = json.loads(call('/voices', key))
    except urllib.error.HTTPError as e:
        sys.exit(f'ดึงรายชื่อเสียงไม่ได้ (HTTP {e.code}) ใส่ --voice <ID> เองได้ โดยคัดลอก Voice ID จากหน้า Voices บนเว็บ ElevenLabs')
    voices = data.get('voices', [])
    if not voices:
        sys.exit('บัญชีนี้ไม่มีเสียงให้เลือก')
    for i, v in enumerate(voices[:30], 1):
        lab = v.get('labels') or {}
        print(f'{i:2}. {v["name"]:<24} {lab.get("gender", ""):<7} {lab.get("accent", ""):<12} {v["voice_id"]}')
    ans = input('เลือกหมายเลขเสียง (Enter = 1): ').strip() or '1'
    return voices[int(ans) - 1]['voice_id']


def tts(key, voice, text, model, lang):
    body = {'text': text, 'model_id': model}
    if lang:
        body['language_code'] = lang
    return call(f'/text-to-speech/{voice}?output_format=mp3_44100_128', key, body, accept='audio/mpeg')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--voice')
    ap.add_argument('--model', default='eleven_v3')
    ap.add_argument('--only', help='คีย์คลิปคั่นด้วย , เช่น n5,n4 (สร้างใหม่เฉพาะคลิปนี้ แม้มีไฟล์อยู่แล้ว)')
    ap.add_argument('--force', action='store_true', help='สร้างใหม่ทุกคลิป แม้มีไฟล์อยู่แล้ว (ใช้เครดิตเต็มจำนวน)')
    a = ap.parse_args()
    allc = clips()
    os.makedirs(OUT, exist_ok=True)
    # ประหยัดเครดิต: คลิปที่มีไฟล์อยู่แล้วจะไม่สร้างซ้ำ เว้นแต่สั่ง --only หรือ --force
    if a.only:
        todo = {k: v for k, v in allc.items() if k in a.only.split(',')}
    else:
        todo = {k: v for k, v in allc.items() if a.force or not os.path.exists(os.path.join(OUT, k + '.mp3'))}
    if not todo:
        print('มีไฟล์เสียงครบทุกคลิปแล้ว ไม่ต้องสร้างใหม่ (ไม่ใช้เครดิต) · ถ้าต้องการสร้างใหม่ใช้ --only <คีย์> หรือ --force')
        return
    print('จะสร้าง', len(todo), 'คลิป:', ', '.join(todo))
    key = os.environ.get('ELEVENLABS_API_KEY') or getpass.getpass('ElevenLabs API key (ไม่แสดงบนจอ ไม่ถูกบันทึก): ').strip()
    if not key:
        sys.exit('ไม่มีคีย์')
    voice = a.voice or pick_voice(key)
    lang = 'th'
    for k, text in todo.items():
        for attempt in range(3):
            try:
                audio = tts(key, voice, text, a.model, lang)
                break
            except urllib.error.HTTPError as e:
                msg = e.read().decode('utf-8', 'replace')[:200]
                if e.code in (400, 422) and lang and 'language' in msg:
                    lang = None  # โมเดลนี้ไม่รับ language_code → ลองใหม่โดยไม่ระบุ
                    continue
                if e.code == 429 and attempt < 2:
                    time.sleep(3)
                    continue
                sys.exit(f'สร้างคลิป {k} ไม่สำเร็จ (HTTP {e.code}): {msg}')
        open(os.path.join(OUT, k + '.mp3'), 'wb').write(audio)
        print(f'  ✓ {k:<6} {text}  ({len(audio) // 1024} KB)')
    have = sorted(f[:-4] for f in os.listdir(OUT) if f.endswith('.mp3') and f[:-4] in allc)
    json.dump({'v': time.strftime('%Y%m%d%H%M%S'), 'voice': voice, 'model': a.model, 'clips': have},
              open(os.path.join(OUT, 'voice.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    missing = sorted(set(allc) - set(have))
    print(f'\nเสร็จ {len(have)}/{len(allc)} คลิป → web/audio/' + (f'  (ยังขาด: {", ".join(missing)})' if missing else ''))
    print('ขั้นต่อไป: py build.py แล้วบอก Claude ให้ commit + push')


if __name__ == '__main__':
    main()
