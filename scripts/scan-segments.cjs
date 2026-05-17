const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'src', 'data');
const allMatches = {};
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.json') || f === 'chapters.json' || f === 'summaryData.json') continue;
  const text = fs.readFileSync(path.join(dir, f), 'utf8');
  const re = /\$([^$]*)\$/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const math = m[1];
    const segRe = /(?<!overline\{)(?<![A-Z])([A-Z]{2})(?![A-Z])(?!\})/g;
    let sm;
    while ((sm = segRe.exec(math)) !== null) {
      const key = sm[1];
      allMatches[key] = (allMatches[key] || []);
      allMatches[key].push(f);
    }
  }
}
const sorted = Object.entries(allMatches).sort((a, b) => b[1].length - a[1].length);
for (const [k, files] of sorted) {
  const uniq = [...new Set(files)];
  console.log(k.padEnd(4), files.length, 'in', uniq.slice(0, 5).join(', ') + (uniq.length > 5 ? ', ...' : ''));
}
