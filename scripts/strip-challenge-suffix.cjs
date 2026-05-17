const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '..', 'src', 'data');

// Pattern: "小五挑戰 N-1 ..." or "小六挑戰 N-1 ..." → "小五挑戰 N ..." / "小六挑戰 N ..."
const re = /(小[五六]挑戰)\s+(\d+)-1\s+/g;

let totalChanges = 0;

// Update chapters.json
const chaptersPath = path.join(dataDir, 'chapters.json');
let chaptersText = fs.readFileSync(chaptersPath, 'utf8');
const chaptersMatches = [...chaptersText.matchAll(re)];
chaptersText = chaptersText.replace(re, '$1 $2 ');
fs.writeFileSync(chaptersPath, chaptersText);
totalChanges += chaptersMatches.length;
console.log(`chapters.json: ${chaptersMatches.length} title(s) updated`);

// Update each g5c_*.json and g6c_*.json
for (const f of fs.readdirSync(dataDir)) {
  if (!/^g[56]c_/.test(f)) continue;
  const fp = path.join(dataDir, f);
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const before = data.title;
  data.title = data.title.replace(re, '$1 $2 ');
  if (before !== data.title) {
    fs.writeFileSync(fp, JSON.stringify(data, null, 2) + '\n');
    console.log(`${f}: ${before} → ${data.title}`);
    totalChanges++;
  }
}

console.log(`\nTotal: ${totalChanges} title changes`);
