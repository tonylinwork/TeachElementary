const fs = require('fs');
const path = require('path');
const target = path.join(__dirname, '..', 'src', 'data', 'g6c_ch10_1.json');
const raw = fs.readFileSync(target, 'utf8');
const data = JSON.parse(raw);

function transformMath(str) {
  return str.replace(/\$([^$]*)\$/g, (match, math) => {
    // Mask out content that should not be touched:
    // - inside \overline{...}, \angle ..., \triangle ..., \overrightarrow{...}, \vec{...}
    // We'll process by tokens. Simpler: walk and skip until end of relevant macro.
    let result = '';
    let i = 0;
    while (i < math.length) {
      // Check for protected macros
      const rest = math.slice(i);
      // \angle followed by something that ends at next math operator/whitespace+digit boundary
      // Actually for angles, content runs until we hit space-NOT-followed-by-uppercase, =, +, -, etc.
      // Strategy: detect \angle and skip a span of letters/subscripts that form the angle name.
      const angleMatch = rest.match(/^\\angle\s*([A-Z](?:_\{?[0-9]+\}?)?(?:\s*[A-Z](?:_\{?[0-9]+\}?)?){0,4})/);
      if (angleMatch) {
        result += angleMatch[0];
        i += angleMatch[0].length;
        continue;
      }
      const triMatch = rest.match(/^\\triangle\s*([A-Z]{2,5})/);
      if (triMatch) {
        result += triMatch[0];
        i += triMatch[0].length;
        continue;
      }
      const overMatch = rest.match(/^\\overline\{[^}]*\}/);
      if (overMatch) {
        result += overMatch[0];
        i += overMatch[0].length;
        continue;
      }
      // Check for 2-uppercase-letter segment at current position
      const segMatch = rest.match(/^(?<![A-Z])([A-Z]{2})(?![A-Z])(?!\})/);
      // Note: lookbehind on rest doesn't help since rest starts at i. Check manually:
      const prevChar = i > 0 ? math[i - 1] : '';
      const isPrevUpper = /[A-Z]/.test(prevChar);
      if (!isPrevUpper && segMatch) {
        const two = segMatch[1];
        const after = math[i + 2] || '';
        const isAfterUpper = /[A-Z]/.test(after);
        if (!isAfterUpper && after !== '}') {
          result += '\\overline{' + two + '}';
          i += 2;
          continue;
        }
      }
      result += math[i];
      i++;
    }
    return '$' + result + '$';
  });
}

let count = 0;
function walk(node) {
  if (typeof node === 'string') {
    const orig = node;
    const out = transformMath(node);
    if (out !== orig) {
      count += (out.match(/\\overline\{/g) || []).length - (orig.match(/\\overline\{/g) || []).length;
    }
    return out;
  }
  if (Array.isArray(node)) return node.map(walk);
  if (node && typeof node === 'object') {
    const out = {};
    for (const k in node) out[k] = walk(node[k]);
    return out;
  }
  return node;
}

const out = walk(data);
fs.writeFileSync(target, JSON.stringify(out, null, 2) + '\n');
console.log('Added', count, 'overlines to', path.basename(target));
