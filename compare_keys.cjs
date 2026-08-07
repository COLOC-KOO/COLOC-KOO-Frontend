const fs = require('fs');
const path = require('path');
const locales = ['en', 'fr', 'mg'];
const base = path.join('src', 'i18n', 'locales');

function parse(obj, prefix = '') {
  const out = [];
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      out.push(...parse(value, fullKey));
    } else {
      out.push(fullKey);
    }
  }
  return out;
}

const keys = {};
for (const locale of locales) {
  const filePath = path.join(base, locale, 'annonceDetail.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const obj = JSON.parse(raw);
  keys[locale] = new Set(parse(obj));
}

const src = fs.readFileSync('src/pages/AnnonceDetail.tsx', 'utf8');
const used = new Set();
const regex = /t\(['\"]annonceDetail:([^)'"]+)['\"]/g;
let match;
while ((match = regex.exec(src))) {
  used.add(match[1]);
}

const usedKeys = [...used].sort();
console.log('used', usedKeys.length);
usedKeys.forEach(k => console.log(k));
console.log();
for (const locale of locales) {
  const missing = usedKeys.filter(k => !keys[locale].has(k));
  console.log(locale, missing.length);
  missing.forEach(k => console.log('  ', k));
}
console.log();
for (const locale of locales) {
  const extra = [...keys[locale]].filter(k => !usedKeys.includes(k)).sort();
  console.log('extra in', locale, extra.length);
  extra.forEach(k => console.log('  ', k));
}
