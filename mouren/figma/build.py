# Собирает плагин Figma: manifest.json + code.js с данными и картинками внутри
import json, base64, io, os, zipfile
from PIL import Image
D = os.path.dirname(os.path.abspath(__file__)) + '/'
OUT = D + 'mouren-figma-plugin/'
os.makedirs(OUT, exist_ok=True)
data = json.load(open(D + 'data.json'))
srcs = set()
def walk(r):
    if r['k'] == 'i': srcs.add(r['src'])
    for c in r.get('ch', []): walk(c)
for s in data['screens']: walk(s['root'])
images = {}
for name in sorted(srcs):
    im = Image.open(D + '../dist/img/' + name)
    im.thumbnail((1600, 1600))
    buf = io.BytesIO()
    im.save(buf, 'PNG', optimize=True)
    images[name] = base64.b64encode(buf.getvalue()).decode()
src = open(D + 'plugin-src.js').read()
src = src.replace('/*__DATA__*/null', json.dumps(data, ensure_ascii=False, separators=(',', ':')))
src = src.replace('/*__IMAGES__*/null', json.dumps(images))
open(OUT + 'code.js', 'w').write(src)
manifest = {
    'name': 'mouren — макет сайта',
    'id': 'mouren-site-import',
    'api': '1.0.0',
    'main': 'code.js',
    'editorType': ['figma'],
    'documentAccess': 'dynamic-page',
    'networkAccess': {'allowedDomains': ['none']},
}
json.dump(manifest, open(OUT + 'manifest.json', 'w'), ensure_ascii=False, indent=2)
print('code.js', round(os.path.getsize(OUT + 'code.js') / 1e6, 2), 'MB', 'images', list(images))
