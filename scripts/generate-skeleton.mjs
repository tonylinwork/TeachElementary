// One-shot skeleton generator: reads existing summary HTML files from
// D:\Secretary\teach_refs\summaries\ and produces minimal chapter JSON
// files in src/data/ (summary populated, sections empty).
//
// Run from D:\TeachElementary:  node scripts/generate-skeleton.mjs

import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const SUMMARIES_DIR = 'D:\\Secretary\\teach_refs\\summaries';
const DATA_DIR = path.resolve('src', 'data');

// Mapping: chapter id → summary source filename (in SUMMARIES_DIR, .html).
// null = no source yet (placeholder).
const SOURCE_MAP = {
    g4a_ch1_1: null,
    g4a_ch1_2: '小四_主題1_整數的加減法_重點.html',
    g4a_ch2_1: '小四_主題2_整數乘除法_重點.html',
    g4a_ch2_2: '小四_主題2_整數乘除法_重點.html',
    g4a_ch3_1: '小四_主題3_整數的四則運算_重點.html',
    g4a_ch4_1: null,
    g4a_ch4_2: null,

    g4b_ch1_1: null,
    g4b_ch1_2: '小四_主題4_分數的加減法_重點.html',
    g4b_ch2_1: null,
    g4b_ch2_2: '小四_主題5_小數的加減法_重點.html',
    g4b_ch2_3: '小四_主題6_小數的乘除法_重點.html',
    g4b_ch3_1: '小四_主題7_面積_重點.html',
    g4b_ch4_1: null,
    g4b_ch5_1: null,

    g5a_ch1_1: '小五_主題1_整數的乘除法_重點.html',
    g5a_ch1_2: '小五_主題2_整數的四則運算_重點.html',
    g5a_ch2_1: '小五_因數與公因數_重點.html',
    g5a_ch2_2: null,
    g5a_ch3_1: null,
    g5a_ch3_2: '小五_分數的乘法_重點.html',
    g5a_ch4_1: null,
    g5a_ch4_2: '小五_統計圖表_重點.html',

    g5b_ch1_1: '小五下_數的十進位結構_重點.html',
    g5b_ch2_1: '小五下_分數的計算_重點.html',
    g5b_ch2_2: '小五_分數的除法_重點.html',
    g5b_ch3_1: '小五_小數的乘除法_重點.html',
    g5b_ch3_2: '小五_比率與百分率_重點.html',
    g5b_ch4_1: '小五_主題6_重量與容積_重點.html',
    g5b_ch4_2: '小五_主題3_速率與時間_重點.html',
    g5b_ch5_1: '小五_線對稱_重點.html',

    g6a_ch1_1: '小六_分數的乘法_重點.html',
    g6a_ch1_2: '小六_分數的除法_重點.html',
    g6a_ch2_1: '小六_運算規則_重點.html',
    g6a_ch3_1: '小六上_基準量與比較量_重點.html',
    g6a_ch3_2: '小六_比與比例式_重點.html',
    g6a_ch4_1: '小六_圓形與扇形_重點.html',
    g6a_ch5_1: '小六_因數_重點.html',
    g6a_ch5_2: '小六_倍數_重點.html',

    g6b_ch1_1: '小六_分數小數四則複習_重點.html',
    g6b_ch2_1: null,
    g6b_ch2_2: '小六_柱體體積與表面積_重點.html',
    g6b_ch3_1: '小六_速率_重點.html',
    g6b_ch3_2: '小六_放大縮小與比例尺_重點.html',
    g6b_ch4_1: '小六_線對稱與全等_重點.html',
    g6b_ch5_1: '小六_怎樣解題_重點.html',
    g6b_ch6_1: '小六_統計_重點.html',
};

const PLACEHOLDER_SUMMARY = '<div class="text-slate-500"><p>本章節摘要待補。</p><p class="text-xs mt-2">📝 將在後續補上完整教學重點。</p></div>';

const extractBody = (html) => {
    // Pull everything inside <body>...</body>. Strip the outer container div
    // if present, since the summary panel already wraps content.
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let inner = bodyMatch ? bodyMatch[1] : html;
    // Remove <div class="container">...</div> wrapper if present
    const containerMatch = inner.match(/<div\s+class="container"[^>]*>([\s\S]*?)<\/div>\s*$/i);
    if (containerMatch) inner = containerMatch[1];
    return inner.trim();
};

const chapters = JSON.parse(await readFile(path.join(DATA_DIR, 'chapters.json'), 'utf8'));
const titleById = Object.fromEntries(chapters.map((c) => [c.id, c.title]));

const availableFiles = new Set(await readdir(SUMMARIES_DIR));

let withSummary = 0;
let placeholder = 0;
const warnings = [];

for (const [id, srcFile] of Object.entries(SOURCE_MAP)) {
    const title = titleById[id];
    if (!title) {
        warnings.push(`No title in chapters.json for ${id}`);
        continue;
    }

    let summary;
    if (srcFile) {
        if (!availableFiles.has(srcFile)) {
            warnings.push(`Source file missing for ${id}: ${srcFile}`);
            summary = PLACEHOLDER_SUMMARY;
            placeholder += 1;
        } else {
            const html = await readFile(path.join(SUMMARIES_DIR, srcFile), 'utf8');
            summary = extractBody(html);
            withSummary += 1;
        }
    } else {
        summary = PLACEHOLDER_SUMMARY;
        placeholder += 1;
    }

    const data = { title, summary, sections: [] };
    await writeFile(path.join(DATA_DIR, `${id}.json`), JSON.stringify(data, null, 2), 'utf8');
}

console.log(`Generated ${withSummary + placeholder} chapter files: ${withSummary} with summary, ${placeholder} placeholder.`);
if (warnings.length) {
    console.warn('Warnings:');
    for (const w of warnings) console.warn('  -', w);
}
