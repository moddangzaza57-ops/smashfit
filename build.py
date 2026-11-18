"""สร้างไฟล์เว็บจากซอร์ส
   python3 build.py  → ได้โฟลเดอร์ docs/ พร้อมขึ้น GitHub Pages
   และ dist/smashfit.html (ไฟล์เดียว ไม่มีส่วน PWA ใช้เปิดตรงๆ หรือทดสอบ)"""
import os, shutil, time
S='src/'
shell=open(S+'shell.html',encoding='utf-8').read()
def inline(h):
    for f in ['figure.js','exdata.js','data.js','app.js','ui.js']:
        h=h.replace(f'<script src="{f}"></script>','<script>\n'+open(S+f,encoding='utf-8').read()+'\n</script>')
    return h
pwa='''<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">'''
os.makedirs('dist',exist_ok=True)
open('dist/smashfit.html','w',encoding='utf-8').write(inline(shell.replace('<!--PWA-->','')))
if os.path.isdir('docs'): shutil.rmtree('docs')
shutil.copytree('web','docs')
open('docs/index.html','w',encoding='utf-8').write(inline(shell.replace('<!--PWA-->',pwa)))
ver=time.strftime('%Y%m%d%H%M%S')
sw=open('docs/sw.js',encoding='utf-8').read().replace('__VERSION__',ver)
open('docs/sw.js','w',encoding='utf-8').write(sw)
open('docs/.nojekyll','w').write('')
print('built docs/ version',ver)
