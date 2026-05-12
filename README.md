# 林哲數學 Elementary

國小數學練習與重點整理網站 (小四上 ~ 小六下)，姊妹專案為 [TeachJunior](https://github.com/tonylinwork/teach-junior) 國中版。

採 React + Vite + TypeScript + Tailwind + KaTeX。章節重點摘要已就緒，題目 (是非 / 單選 / 多選) 後續逐章補上。

## 章節結構

依台灣國小數學主流教科書 (翰林 / 康軒) 順序排列，共 **47 章節 / 6 冊**：

| 冊別 | 章 | 主要章節 |
|---|---|---|
| 小四上 | 4 | 整數的加減 / 整數的乘除 / 四則運算 / 角度與圖形 |
| 小四下 | 5 | 分數 / 小數 / 周長與面積 / 容量與重量 / 統計 |
| 小五上 | 4 | 整數運算 / 因數倍數 / 分數 / 多邊形與統計 |
| 小五下 | 5 | 數的結構 / 分數的計算 / 小數與比率 / 體積與速率 / 線對稱 |
| 小六上 | 5 | 分數乘除 / 四則運算 / 比與比例 / 圓 / 因數倍數 |
| 小六下 | 6 | 四則運算 / 立體圖形 / 比例應用 / 對稱 / 怎樣解題 / 統計 |

完整章節編號見 `src/data/chapters.json`。

## 內容資料來源

- **既有逐字稿整理**：`D:\Secretary\teach_refs\summaries\` 內鄧強老師 YouTube 教學影片轉錄而成的 36 份重點 md/html
- **依國小課綱直接撰寫**：頻道沒對應影片的 11 章 (例：一億以內的數、角度、統計圖表) 由 Claude 依台灣國小標準課綱補齊

## 開發

```powershell
cd D:\TeachElementary
npm install         # 已執行過，repo 不含 node_modules
npm run dev         # http://localhost:5173
npm run build       # 編譯到 dist/
npm run lint
npm run validate:data  # 檢查所有 chapter JSON 結構
```

## 章節資料維護

### 章節 JSON Schema

每個章節是一份 `src/data/<id>.json`，最小骨架：

```json
{
  "title": "小四上 1-2 整數的加減法",
  "summary": "<ul><li>本章重點...</li></ul>",
  "sections": []
}
```

完整含題目時，`sections` 每筆有 `type` (`true_false` / `single_choice` / `multi_choice`)、`name`、`questions[]`，每題有 `id`、`number`、`type`、`content`、`answer`、`explanation`，題型範例參考 TeachJunior。

### 一次重生骨架

從 `D:\Secretary\teach_refs\summaries\` 內最新 HTML 重新生成所有章節骨架 (sections 會被清空，慎用)：

```powershell
node scripts/generate-skeleton.mjs
```

對應關係由 `scripts/generate-skeleton.mjs` 的 `SOURCE_MAP` 控制 (chapter id → source HTML filename)。新增章節先改這個 map 再跑。

### 補待補章節

`SOURCE_MAP` 中 `null` 的章節 (11 章) 表示還沒寫摘要：

- g4a_ch1_1 一億以內的數
- g4a_ch4_1 角度
- g4a_ch4_2 平面圖形
- g4b_ch1_1 分數的認識
- g4b_ch2_1 小數的認識
- g4b_ch4_1 容量與重量
- g4b_ch5_1 統計圖表
- g5a_ch2_2 倍數與公倍數
- g5a_ch3_1 異分母分數的加減
- g5a_ch4_1 多邊形
- g6b_ch2_1 圓柱與圓錐

寫完對應的 md/html 放進 `D:\Secretary\teach_refs\summaries\`，更新 `SOURCE_MAP`，再跑 `node scripts/generate-skeleton.mjs`。

### 加題目

每章 `sections: []` 等題目套上。題型限制為**是非 / 單選 / 多選**——不用填充題 (TeachJunior 經驗：自動答案比對不可靠)。

題目產生流程同 TeachJunior：逐字稿 → 子代理出題 → 主對話貼進 JSON → 跑 `npm run validate:data` 驗證。

## 部署

預期部署到 Vercel (`teach-elementary.vercel.app`)：

1. 推到 GitHub
2. Vercel 連專案
3. Build command: `npm run build`，Output: `dist`

## 與 TeachJunior 的差異

- 章節編號 `g4a` ~ `g6b` (TeachJunior 是 `g1a` ~ `g3b`)
- `BOOKS_CONFIG` 從 6 冊國中改成 6 冊國小
- `parseChapterTitle` regex 改抓 `小[四五六][上下]`
- 驗證腳本 (`validate-data.mjs`) 允許 `sections: []` 骨架模式
- QuizApp 在 `sections` 為空時顯示「本章題目待補」提示
