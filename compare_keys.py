import json, os, re
base = os.path.join('src','i18n','locales')
locales = ['en','fr','mg']
keys = {}
def parse(obj, prefix=''):
    out = []
    for k, v in obj.items():
        key = f'{prefix}.{k}' if prefix else k
        if isinstance(v, dict):
            out += parse(v, key)
        else:
            out.append(key)
    return out
for loc in locales:
    file = os.path.join(base, loc, 'annonceDetail.json')
    with open(file, 'r', encoding='utf-8') as f:
        obj = json.load(f)
    keys[loc] = set(parse(obj))
with open('src/pages/AnnonceDetail.tsx', 'r', encoding='utf-8') as f:
    src = f.read()
used = set(re.findall(r"t\(['\"]annonceDetail:([^)'"]+)['\"]", src))
used_keys = sorted(used)
print('used', len(used_keys))
for key in used_keys:
    print(key)
print()
for loc in locales:
    missing = sorted(k for k in used_keys if k not in keys[loc])
    print(loc, len(missing))
    for k in missing:
        print('  ', k)
print()
for loc in locales:
    extra = sorted(k for k in keys[loc] if k not in used_keys)
    print('extra in', loc, len(extra))
    for k in extra:
        print('  ', k)
