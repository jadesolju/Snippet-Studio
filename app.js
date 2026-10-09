
function sanitizeRawHtml(html) {
  if (!html || typeof html !== "string") return "";
  return html.replace(/^#+\s+[^\n<]+\n+/gm, "").trim();
}


function formatHtml(html) {
  if (!html) return "";
  let formatted = "";
  let indent = 0;
  const tab = "  ";
  const clean = html.replace(/>\s*</g, ">\n<").trim();
  const lines = clean.split("\n");
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    if (line.match(/^<\/\s*[\w:-]+/)) {
      indent = Math.max(0, indent - 1);
    }
    formatted += tab.repeat(indent) + line + "\n";
    if (
      line.match(/^<\s*[\w:-]+(?:\s+[^>]*?)?>/) &&
      !line.match(/^<\s*(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr|!--)/i) &&
      !line.endsWith("/>") &&
      !line.match(/^<\s*[\w:-]+[^>]*>.*?<\/\s*[\w:-]+>/)
    ) {
      indent += 1;
    }
  }
  return formatted.trim();
}

function formatCss(css) {
  if (!css) return "";
  return css
    .replace(/;\s*/g, ";\n  ")
    .replace(/\{\s*/g, " {\n  ")
    .replace(/\s*\}\s*/g, "\n}\n\n")
    .replace(/  \n/g, "")
    .trim();
}

function parseColorInfo(value) {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  
  // 1. Tuple like (255, 255, 255, 0.08) or (255,255,255)
  const tupleMatch = trimmed.match(/^\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([\d.]+)\s*)?\)$/);
  if (tupleMatch) {
    const r = Math.min(255, parseInt(tupleMatch[1], 10));
    const g = Math.min(255, parseInt(tupleMatch[2], 10));
    const b = Math.min(255, parseInt(tupleMatch[3], 10));
    const alpha = tupleMatch[4] !== undefined ? tupleMatch[4] : null;
    const hex = "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
    return {
      type: "tuple",
      r, g, b, alpha,
      alphaPercent: alpha !== null ? Math.round(Number(alpha) * 100) : 100,
      hex,
      format: (newHex, newAlpha) => {
        const nr = parseInt(newHex.slice(1, 3), 16);
        const ng = parseInt(newHex.slice(3, 5), 16);
        const nb = parseInt(newHex.slice(5, 7), 16);
        const a = newAlpha !== undefined ? newAlpha : (alpha !== null ? alpha : null);
        return a !== null ? `(${nr},${ng},${nb},${a})` : `(${nr},${ng},${nb})`;
      },
      withAlphaPercent: (percent) => {
        const a = Number((Math.max(0, Math.min(100, Number(percent))) / 100).toFixed(2));
        return `(${r},${g},${b},${a})`;
      }
    };
  }

  // 2. rgba(...) or rgb(...)
  const rgbMatch = trimmed.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([\d.]+)\s*)?\)$/i);
  if (rgbMatch) {
    const r = Math.min(255, parseInt(rgbMatch[1], 10));
    const g = Math.min(255, parseInt(rgbMatch[2], 10));
    const b = Math.min(255, parseInt(rgbMatch[3], 10));
    const isRgba = trimmed.toLowerCase().startsWith("rgba") || rgbMatch[4] !== undefined;
    const alpha = rgbMatch[4] !== undefined ? rgbMatch[4] : (isRgba ? "1" : null);
    const hex = "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
    return {
      type: isRgba ? "rgba" : "rgb",
      r, g, b, alpha,
      alphaPercent: alpha !== null ? Math.round(Number(alpha) * 100) : 100,
      hex,
      format: (newHex, newAlpha) => {
        const nr = parseInt(newHex.slice(1, 3), 16);
        const ng = parseInt(newHex.slice(3, 5), 16);
        const nb = parseInt(newHex.slice(5, 7), 16);
        const a = newAlpha !== undefined ? newAlpha : alpha;
        return a !== null ? `rgba(${nr}, ${ng}, ${nb}, ${a})` : `rgb(${nr}, ${ng}, ${nb})`;
      },
      withAlphaPercent: (percent) => {
        const a = Number((Math.max(0, Math.min(100, Number(percent))) / 100).toFixed(2));
        return `rgba(${r}, ${g}, ${b}, ${a})`;
      }
    };
  }

  // 3. Hex code #rgb, #rgba, #rrggbb, #rrggbbaa
  const hexMatch = trimmed.match(/^#([0-9a-f]{3,8})$/i);
  if (hexMatch) {
    let rawHex = hexMatch[1];
    let alpha = null;
    let hex = rawHex;
    if (rawHex.length === 3) {
      hex = rawHex[0]+rawHex[0] + rawHex[1]+rawHex[1] + rawHex[2]+rawHex[2];
    } else if (rawHex.length === 4) {
      alpha = (parseInt(rawHex[3]+rawHex[3], 16) / 255).toFixed(2);
      hex = rawHex[0]+rawHex[0] + rawHex[1]+rawHex[1] + rawHex[2]+rawHex[2];
    } else if (rawHex.length === 8) {
      alpha = (parseInt(rawHex.slice(6, 8), 16) / 255).toFixed(2);
      hex = rawHex.slice(0, 6);
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return {
      type: "hex",
      hex: "#" + hex.toLowerCase(),
      alpha,
      alphaPercent: alpha !== null ? Math.round(Number(alpha) * 100) : 100,
      format: (newHex) => newHex,
      withAlphaPercent: (percent) => {
        const a = Number((Math.max(0, Math.min(100, Number(percent))) / 100).toFixed(2));
        return `rgba(${r}, ${g}, ${b}, ${a})`;
      }
    };
  }

  return null;
}

const codeLabels = {
  template: "HTML แม่แบบ (Style tag)",
  html: "HTML",
  css: "CSS ส่วนกลาง",
  regex: "Regex",
  output: "ข้อความทดสอบ (Output)",
  settings: "การตั้งค่า",
};

const tokenLabels = {
  char: "ชื่อตัวละคร",
  user: "ชื่อผู้ใช้",
  n: "จำนวน / ตัวเลข",
  time: "เวลา",
  date: "วันที่",
  location: "สถานที่",
  amount: "จำนวนเงิน",
  content: "ข้อความตัวอย่าง",
};

const defaultBackgroundUrl = "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Y3lkNHRsYXEydG5neTdpZWpkdXlrdzR2YnFqMzN2Z3cxM3A5bzRicyZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/13NOyaMNX5UZYk/giphy.gif";

const searchInput = document.querySelector("#search-input");
const categorySelect = document.querySelector("#category-select");
const snippetList = document.querySelector("#snippet-list");
const totalCount = document.querySelector("#total-count");
const visibleCount = document.querySelector("#visible-count");
const listCount = document.querySelector("#list-count");
const loadingState = document.querySelector("#loading-state");
const errorState = document.querySelector("#error-state");
const detailContent = document.querySelector("#detail-content");
const detailCategory = document.querySelector("#detail-category");
const detailTitle = document.querySelector("#detail-title");
const detailSummary = document.querySelector("#detail-summary");
const detailPosition = document.querySelector("#detail-position");
const codeTabs = document.querySelector("#code-tabs");
const codeOutput = document.querySelector("#code-output");
const codeEditorInput = document.querySelector("#code-editor-input");
const resetCodeButton = document.querySelector("#reset-code-button");
const customCodeBySnippet = new Map();
const activeCodeLabel = document.querySelector("#active-code-label");
const codeFormatCount = document.querySelector("#code-format-count");
const codeNote = document.querySelector("#code-note");
const fieldList = document.querySelector("#field-list");
const noFields = document.querySelector("#no-fields");
const quickEditTabs = document.querySelector("#quick-edit-tabs");
const tabCountAll = document.querySelector("#tab-count-all");
const tabCountText = document.querySelector("#tab-count-text");
const tabCountStyle = document.querySelector("#tab-count-style");
const tabCountMedia = document.querySelector("#tab-count-media");
const quickTabMedia = document.querySelector("#quick-tab-media");
let activeQuickEditTab = "all";
const previewFrame = document.querySelector("#preview-frame");
const copyButton = document.querySelector("#copy-button");
const toast = document.querySelector("#toast");
const previousButton = document.querySelector("#previous-button");
const nextButton = document.querySelector("#next-button");
const visualEditEnabled = document.querySelector("#visual-edit-enabled");
const quickEditCount = document.querySelector("#quick-edit-count");
const backgroundEnabled = document.querySelector("#background-enabled");
const backgroundUrl = document.querySelector("#background-url");
const htmlPartsPanel = document.querySelector("#html-parts-panel");
const htmlPartsList = document.querySelector("#html-parts-list");
const htmlPartCount = document.querySelector("#html-part-count");
const rubiiSlotControls = document.querySelector("#rubii-slot-controls");
const rubiiSlotSelect = document.querySelector("#rubii-slot-select");
const rubiiRegexCaptureCount = document.querySelector("#rubii-regex-capture-count");
const rubiiRegexCaptureList = document.querySelector("#rubii-regex-capture-list");
const extraRegexRuleList = document.querySelector("#rubii-extra-regex-list");
const regexFallbackFormat = document.querySelector("#regex-fallback-format");
const maxRegexCaptures = 33;

let categories = [];
let snippets = [];
let selectedCategoryId = "all";
let selectedSnippetId = "";
let activeCodeKey = "template";
let currentFields = [];
let toastTimer;
const editValuesBySnippet = new Map();
const backgroundBySnippet = new Map();
const htmlPartsBySnippet = new Map();
const rubiiSettingsBySnippet = new Map();
let lastCodeSnippetId = "";

function isRubiiHtmlSnippet(snippet) {
  return Boolean(snippet.code?.html && !snippet.editable?.tagName);
}

const snippetTagMap = {
  "snippet-01": "widget",
  "snippet-02": "event-card",
  "snippet-03": "standby-widget",
  "snippet-04": "notice-card",
  "snippet-05": "alert-card",
  "snippet-06": "calendar-card",
  "snippet-07": "alert-log",
  "snippet-08": "date-notice",
  "snippet-09": "line-chat",
  "snippet-10": "ig-dm",
  "snippet-11": "messenger",
  "snippet-12": "ig-post",
  "snippet-13": "ig-story",
  "snippet-14": "fb-status",
  "snippet-15": "notification-center",
  "snippet-16": "ig-profile",
  "snippet-17": "activity-log",
  "snippet-18": "onlyfans",
  "snippet-19": "fansly",
  "snippet-20": "patreon",
  "snippet-21": "x-private",
  "snippet-22": "hidden-album",
  "snippet-23": "chatgpt",
  "snippet-24": "gemini",
  "snippet-25": "grok",
  "snippet-26": "kbank-transfer",
  "snippet-27": "scb-transfer",
  "snippet-28": "ktb-transfer",
  "snippet-29": "bay-transfer",
  "snippet-30": "uob-transfer",
  "snippet-31": "truemoney-transfer",
  "snippet-32": "transfer-success",
  "snippet-33": "money-sent",
  "snippet-34": "transfer-receipt",
  "snippet-35": "payment-dispatch",
  "snippet-36": "thai-receipt",
  "snippet-38": "kbank-slip",
  "snippet-39": "scb-slip",
  "snippet-40": "ktb-slip",
  "snippet-41": "bay-slip",
  "snippet-42": "truemoney-slip",
  "snippet-43": "ig-photo",
  "snippet-44": "fb-photo",
  "snippet-45": "x-photo",
  "snippet-46": "fb-feed",
  "snippet-47": "x-feed",
  "snippet-48": "google-search",
  "snippet-49": "google-trends",
  "snippet-50": "safari",
  "snippet-51": "cafe-receipt",
  "snippet-52": "cafe-life",
  "snippet-53": "daily-status",
  "snippet-54": "cozy-room",
  "snippet-55": "moment-slice",
  "snippet-56": "emotion-index",
  "snippet-57": "target-monitor",
  "snippet-58": "affection-matrix",
  "snippet-59": "emotion-sync",
  "snippet-60": "pocket-save",
  "snippet-61": "daily-schedule",
  "snippet-62": "weekly-plan",
  "snippet-63": "action-memo",
  "snippet-64": "grand-prix",
  "snippet-65": "pixel-pocket",
  "snippet-66": "dmg-classic",
  "snippet-67": "music-player",
  "snippet-68": "vinyl-player",
  "snippet-69": "listening-now",
  "snippet-70": "apple-lyrics",
  "snippet-71": "y2k-cyber",
  "snippet-72": "speedway-drive",
  "snippet-73": "digital-paradise",
  "snippet-74": "retro-window",
  "snippet-75": "cyber-hud",
  "snippet-76": "incognito-mode",
};

function defaultRubiiTagName(snippet) {
  if (snippet.id && snippetTagMap[snippet.id]) {
    return snippetTagMap[snippet.id];
  }
  const suffix = String(snippet.id ?? "card").replace(/[^a-z\d]/gi, "").toLowerCase() || "card";
  return `rubii${suffix}`;
}

function normalize(value) {
  return String(value ?? "").toLocaleLowerCase("th").trim();
}

function categoryFor(id) {
  return categories.find((category) => category.id === id);
}

function currentQuery() {
  return normalize(searchInput.value);
}

function matchesSearch(snippet, query = currentQuery()) {
  if (!query) return true;
  const category = categoryFor(snippet.categoryId);
  return normalize(`${snippet.title} ${snippet.summary} ${snippet.id} ${category?.title ?? ""}`).includes(query);
}

function visibleSnippets() {
  return snippets.filter((snippet) =>
    (selectedCategoryId === "all" || snippet.categoryId === selectedCategoryId) && matchesSearch(snippet),
  );
}

function renderCategories() {
  const query = currentQuery();
  const entries = [{ id: "all", title: "ทุกหมวด", count: snippets.filter((item) => matchesSearch(item, query)).length }];
  for (const category of categories) {
    const count = snippets.filter((item) => item.categoryId === category.id && matchesSearch(item, query)).length;
    if (count > 0 || !query) entries.push({ ...category, count });
  }

  categorySelect.replaceChildren();
  for (const entry of entries) {
    const option = document.createElement("option");
    option.value = entry.id;
    option.textContent = `${entry.title} · ${entry.count}`;
    categorySelect.append(option);
  }
  categorySelect.value = entries.some((entry) => entry.id === selectedCategoryId) ? selectedCategoryId : "all";
  visibleCount.textContent = visibleSnippets().length;
}

function renderSnippetList(items) {
  snippetList.replaceChildren();
  listCount.textContent = items.length;
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "no-results";
    empty.textContent = "ไม่พบตัวอย่าง ลองค้นด้วยคำอื่นหรือเลือกหมวดอื่นดูนะ";
    snippetList.append(empty);
    return;
  }

  for (const [index, snippet] of items.entries()) {
    const category = categoryFor(snippet.categoryId);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "snippet-button";
    button.setAttribute("aria-current", String(snippet.id === selectedSnippetId));
    const number = document.createElement("span");
    number.className = "snippet-number";
    number.textContent = String(index + 1).padStart(2, "0");
    const label = document.createElement("span");
    label.className = "snippet-label";
    const title = document.createElement("strong");
    title.textContent = snippet.title;
    const subtitle = document.createElement("small");
    subtitle.textContent = category?.title ?? "ตัวอย่าง";
    label.append(title, subtitle);
    button.append(number, label);
    button.addEventListener("click", () => {
      selectedSnippetId = snippet.id;
      render();
    });
    snippetList.append(button);
  }
}

function visibleTextStringsFromHtml(source) {
  const doc = new DOMParser().parseFromString(source, "text/html");
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const strings = [];
  let node;
  while ((node = walker.nextNode())) {
    if (node.parentElement?.closest("script,style,template,noscript")) continue;
    const text = node.nodeValue.trim();
    if (text) strings.push(text);
  }
  return strings;
}

function suggestedTextVariableMatches(text) {
  const source = String(text ?? "");
  const explicitRanges = [...source.matchAll(/\([^()\n]{1,120}\)|\{\{[^{}]+\}\}%?|\b\d{1,3}%(?!\w)/g)]
    .map((match) => ({ start: match.index, end: match.index + match[0].length }));
  const definitions = [
    {
      type: "prompt",
      pattern: /\[[^\]\r\n]{3,120}\]/g,
      accept: (value) => /(?:ระบุ|อธิบาย|เขียน|กำหนด|(?:รายละเอียด|คำบรรยาย|สไตล์ประจำตัว|สถานที่|ความคิดในใจ|ความรู้สึก|ข้อความโพสต์)\s*[:：])/i.test(value),
    },
    { type: "reference", pattern: /(?:\b(?:Ref|Reference)|รหัสอ้างอิง(?:ธุรกรรม)?|เลขอ้างอิง)\s*:\s*([A-Z\d][A-Z\d-]{3,})/gi, captureGroup: 1 },
    { type: "date", pattern: /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*,?\s*\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+20\d{2}\b/gi },
    { type: "date", pattern: /\b\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+20\d{2}\b/gi },
    { type: "date", pattern: /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+20\d{2}\b/gi },
    { type: "date", pattern: /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+20\d{2}\b/gi },
    { type: "date", pattern: /\b20\d{2}[./-]\d{1,2}[./-]\d{1,2}\b/g },
    { type: "date", pattern: /\b\d{1,2}[./-]\d{1,2}[./-](?:\d{2}|20\d{2})\b/g },
    { type: "date", pattern: /\d{1,2}\s+(?:ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|พ\.ค\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\.|ต\.ค\.|พ\.ย\.|ธ\.ค\.|มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม)\s+\d{2,4}/gi },
    { type: "time", pattern: /\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?(?:\s*น\.)?/gi },
    { type: "time", pattern: /\b\d{1,2}'\d{2}"\d{2}\b/g },
    { type: "amount", pattern: /(?:[$£€¥฿]\s*\d[\d,]*(?:\.\d{1,2})?\+?|\d[\d,]*(?:\.\d{1,2})?\s*(?:บาท|THB|USD|GBP|EUR|AUD|CAD|JPY|CNY|KRW|INR)\b)/gi },
    { type: "count", pattern: /\d[\d,]*(?:\.\d+)?(?:\s?[KMB])?(?=\s*(?:likes?|comments?|followers?|subscribers?|members?|users?|views?|posts?|credits?|coins?)\b)/gi },
    { type: "count", pattern: /\d[\d,]*(?:\.\d+)?(?=\s*(?:คน|ไลก์|คอมเมนต์|ผู้ติดตาม|สมาชิก|รายการ|ครั้ง))/gi },
    { type: "relativeTime", pattern: /\b\d+\s*(?:seconds?|secs?|minutes?|mins?|hours?|hrs?|days?|weeks?|months?|years?)\s+ago\b/gi },
    { type: "relativeTime", pattern: /\d+\s*(?:นาที|ชั่วโมง|วัน)\s*ที่แล้ว/g },
    { type: "relativeTime", pattern: /\b\d+\s*(?:s|sec|secs|second|seconds|m|min|mins|minute|minutes|h|hr|hrs|hour|hours)\s*read\b/gi },
  ];
  const suggestions = [];
  for (const definition of definitions) {
    for (const match of source.matchAll(definition.pattern)) {
      const value = match[definition.captureGroup ?? 0];
      if (!value) continue;
      if (definition.accept && !definition.accept(value)) continue;
      const start = match.index + match[0].indexOf(value);
      const end = start + value.length;
      if (explicitRanges.some((range) => start < range.end && end > range.start)) continue;
      if (suggestions.some((item) => start < item.end && end > item.start)) continue;
      suggestions.push({ value, start, end, type: definition.type });
    }
  }
  return suggestions.sort((a, b) => a.start - b.start);
}

function suggestedVariableLabel(type) {
  return ({
    prompt: "ข้อความบอกใบ้",
    reference: "เลขอ้างอิง",
    date: "วันที่",
    time: "เวลา/ระยะเวลา",
    amount: "จำนวนเงิน",
    count: "ตัวเลขสถิติ",
    relativeTime: "เวลาที่ผ่านมา",
  })[type] ?? "ค่าที่อาจเปลี่ยน";
}

function collectFields(snippet) {
  const fields = [];
  const codeText = Object.values(snippet.code ?? {}).filter(Boolean).join("\n");

  if (snippet.editable?.tagName) {
    fields.push({
      id: "tagName",
      kind: "tagName",
      label: "ชื่อแท็ก",
      value: snippet.editable.tagName,
      inputType: "text",
    });
  } else if (isRubiiHtmlSnippet(snippet)) {
    fields.push({
      id: "rubiiTagName",
      kind: "rubiiTagName",
      label: "ชื่อ Style tag ใน Rubii",
      value: defaultRubiiTagName(snippet),
      inputType: "text",
    });
  }

  // 1. Collect template tokens {{ ... }}
  const seenTokens = new Set();
  for (const match of codeText.matchAll(/\{\{\s*([^{}]+?)\s*\}\}/g)) {
    const token = match[0];
    if (snippet.editable?.tagName && match[1].trim() === "tagName") continue;
    if (seenTokens.has(token)) continue;
    seenTokens.add(token);
    const key = match[1].trim();
    let label = tokenLabels[key] ?? `ค่า ${key}`;
    if (key === "char") label = "ชื่อตัวละคร ({{char}})";
    else if (key === "user") label = "ชื่อผู้ใช้ ({{user}})";
    else if (key === "color") label = "สีเน้นหลัก ({{color}})";
    else if (key === "location") label = "สถานที่ ({{location}})";
    fields.push({
      id: `token-${fields.length}`,
      kind: "token",
      token,
      label,
      value: token,
      inputType: "text",
    });
  }

  // 2. Scan CSS declarations in style attributes to identify exact color contexts
  const seenPlaceholders = new Set();
  const styleAttributes = /\bstyle\s*=\s*(["'])([\s\S]*?)\1/gi;
  let isRoot = true;

  for (const match of codeText.matchAll(styleAttributes)) {
    const styleContent = match[2];
    const declarations = /(^|;)\s*([\w-]+)\s*:\s*([^;]+)/g;
    
    // Check context hints around the tag
    const beforeTag = codeText.slice(Math.max(0, match.index - 120), match.index);
    let contextHint = isRoot ? "การ์ดหลัก" : "";
    if (beforeTag.includes("border-radius:50%") || beforeTag.includes("width:34px") || beforeTag.includes("width:36px") || beforeTag.includes("width:40px")) {
      contextHint = "ไอคอน / โปรไฟล์";
    } else if (beforeTag.includes("border-left") || beforeTag.includes("padding-left")) {
      contextHint = "เส้นเน้น / คอมเมนต์";
    } else if (beforeTag.includes("border-top") || beforeTag.includes("border-bottom")) {
      contextHint = "เส้นคั่นสถิติ / เมนู";
    } else if (beforeTag.includes("ACTIVITY") || beforeTag.includes("NOTIFICATION")) {
      contextHint = "ป้ายสถานะ";
    }

    for (const dec of styleContent.matchAll(declarations)) {
      const prop = dec[2].toLowerCase().trim();
      const val = dec[3].trim();

      const colorMatches = val.matchAll(/\((?:[^()\n]{1,120})\)/g);
      for (const cm of colorMatches) {
        const token = cm[0];
        if (seenPlaceholders.has(token)) continue;

        // Skip non-color css functions (e.g. blur, calc, url, var, scale, rotate)
        const beforeMatch = val.slice(Math.max(0, cm.index - 10), cm.index).toLowerCase();
        if (beforeMatch.endsWith("blur") || beforeMatch.endsWith("calc") || beforeMatch.endsWith("url") || beforeMatch.endsWith("var") || beforeMatch.endsWith("scale") || beforeMatch.endsWith("rotate")) {
          continue;
        }

        const colorInfo = parseColorInfo(token);
        if (!colorInfo) continue;

        seenPlaceholders.add(token);

        let label = "สี";
        if (prop.startsWith("background")) {
          label = isRoot ? "สีพื้นหลังการ์ดหลัก (Main BG)" : (contextHint ? `สีพื้นหลัง${contextHint}` : "สีพื้นหลังกล่อง (Box BG)");
        } else if (prop.startsWith("border-left") || prop.startsWith("border-right")) {
          label = "สีเส้นคั่นข้าง / เส้นเน้น (Accent Line)";
        } else if (prop.startsWith("border-top") || prop.startsWith("border-bottom")) {
          label = "สีเส้นคั่นแถบ / เส้นแบ่ง (Divider)";
        } else if (prop.startsWith("border")) {
          label = isRoot ? "สีเส้นขอบการ์ด (Card Border)" : (contextHint ? `สีเส้นขอบ${contextHint}` : "สีเส้นขอบกล่อง (Border)");
        } else if (prop.includes("shadow")) {
          label = "สีเงาตกกระทบ (Card Shadow)";
        } else if (prop === "color") {
          label = "สีข้อความ (Text Color)";
        }

        fields.push({
          id: `placeholder-${fields.length}`,
          kind: "literal",
          token,
          label,
          value: token,
          inputType: "text",
        });
      }
    }
    isRoot = false;
  }

  // 3. Scan HTML text nodes for user placeholders (วัน, เวลา, ข้อความ, สถานที่, ฯลฯ)
  const literalPattern = /\((?:[^()\n]{1,120})\)/g;
  const htmlWithoutStyles = codeText.replace(/\bstyle\s*=\s*(["'])[\s\S]*?\1/gi, '');
  for (const match of htmlWithoutStyles.matchAll(literalPattern)) {
    const token = match[0];
    if (seenPlaceholders.has(token)) continue;
    seenPlaceholders.add(token);
    const content = token.slice(1, -1).trim();

    let label = "ข้อความตัวอย่าง";
    if (content === "HH:MM" || content.startsWith("เวลา")) label = "เวลา (Time)";
    else if (content === "วัน") label = "วัน (Day)";
    else if (content === "วันที่") label = "วันที่ (Date)";
    else if (content.startsWith("เดือน/ปี")) label = "เดือน / ปี (Month/Year)";
    else if (content.startsWith("สถานที่")) label = "สถานที่ (Location)";
    else if (content.startsWith("สถานการณ์")) label = "สถานการณ์ / แจ้งเตือน (Status)";
    else if (content.startsWith("ข้อความ")) label = "ข้อความหลัก (Message)";
    else if (content.startsWith("ความคิด") || content.startsWith("มุมมอง")) label = "ความคิดเห็นเสริม (Comment)";
    else if (content.startsWith("จำนวนเงิน") || content.startsWith("ราคา")) label = "จำนวนเงิน (Amount)";
    else if (content.length <= 25) label = content;

    fields.push({
      id: `placeholder-${fields.length}`,
      kind: "literal",
      token,
      label,
      value: token,
      inputType: "text",
    });
  }

  // 3b. Surface likely changing text as review-only suggestions, never as markers.
  for (const text of visibleTextStringsFromHtml(htmlWithoutStyles)) {
    for (const suggestion of suggestedTextVariableMatches(text)) {
      if (seenPlaceholders.has(suggestion.value)) continue;
      seenPlaceholders.add(suggestion.value);
      fields.push({
        id: `suggestion-${fields.length}`,
        kind: "literal",
        token: suggestion.value,
        label: `ตรวจดู · ${suggestedVariableLabel(suggestion.type)}`,
        value: suggestion.value,
        inputType: "text",
        suggested: true,
        suggestionType: suggestion.type,
      });
    }
  }

  // 4. Collect image URLs
  const urls = new Map();
  for (const match of codeText.matchAll(/url\(\s*(["']?)([^"')]+)\1\s*\)/gi)) {
    const url = match[2].trim();
    if (url && !url.startsWith("{{")) urls.set(url, { url, kind: "background" });
  }
  for (const match of codeText.matchAll(/\bsrc\s*=\s*(["'])(.*?)\1/gi)) {
    const url = match[2].trim();
    if (url && !url.startsWith("{{") && !urls.has(url)) urls.set(url, { url, kind: "image" });
  }

  let imageNumber = 0;
  for (const { url, kind } of urls.values()) {
    imageNumber += 1;
    fields.push({
      id: `url-${imageNumber}`,
      kind: "url",
      original: url,
      label: kind === "background" ? "URL รูปพื้นหลัง" : `URL รูปไอคอน/รูปภาพ ${imageNumber}`,
      value: url,
      inputType: "url",
    });
  }

  return fields;
}

function fieldValues(snippet) {
  if (!editValuesBySnippet.has(snippet.id)) editValuesBySnippet.set(snippet.id, {});
  const stored = editValuesBySnippet.get(snippet.id);
  for (const field of currentFields) {
    if (!(field.id in stored)) stored[field.id] = field.value;
  }
  return stored;
}

function applyQuickEditFilter(tabKey) {
  activeQuickEditTab = tabKey;
  if (quickEditTabs) {
    const tabs = quickEditTabs.querySelectorAll(".quick-edit-tab");
    tabs.forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.quickTab === tabKey);
    });
  }

  const rows = fieldList.querySelectorAll(".field-row");
  let visibleCount = 0;
  rows.forEach((row) => {
    const isMatch = tabKey === "all" || row.dataset.fieldCategory === tabKey;
    row.hidden = !isMatch;
    if (isMatch) visibleCount++;
  });

  noFields.hidden = visibleCount > 0;
  if (visibleCount === 0 && currentFields.length > 0) {
    noFields.textContent = "ไม่มีรายการในหมวดหมู่นี้";
  } else if (currentFields.length === 0) {
    noFields.textContent = "ตัวอย่างนี้ไม่มีค่าที่แก้ไขได้แยกไว้";
  }
}

function buildFieldEditor(snippet) {
  currentFields = collectFields(snippet);
  const values = fieldValues(snippet);
  fieldList.replaceChildren();
  noFields.hidden = currentFields.length > 0;
  if (quickEditCount) quickEditCount.textContent = currentFields.length ? `${currentFields.length} ค่า` : "—";

  let countText = 0;
  let countStyle = 0;
  let countMedia = 0;

  for (const field of currentFields) {
    const row = document.createElement("div");
    row.className = "field-row";
    
    const labelRow = document.createElement("div");
    labelRow.className = "field-label-row";
    
    const label = document.createElement("label");
    label.htmlFor = `field-${field.id}`;
    label.textContent = field.label;
    labelRow.append(label);
    if (field.suggested) {
      const badge = document.createElement("span");
      badge.className = "field-suggestion-badge";
      badge.textContent = "ตรวจเอง";
      labelRow.append(badge);
    }

    const inputGroup = document.createElement("div");
    inputGroup.className = "field-input-group";

    const input = document.createElement("input");
    input.id = `field-${field.id}`;
    input.dataset.fieldId = field.id;
    input.type = field.inputType;
    input.value = values[field.id];
    input.spellcheck = false;
    if (field.kind === "tagName" || field.kind === "rubiiTagName") input.pattern = "[A-Za-z][A-Za-z0-9_-]*";

    const currentValue = values[field.id] || field.value;
    const colorInfo = parseColorInfo(currentValue);

    let fieldCategory = "text";
    if (field.kind === "url") {
      fieldCategory = "media";
      countMedia++;
    } else if (colorInfo) {
      fieldCategory = "style";
      countStyle++;
    } else {
      fieldCategory = "text";
      countText++;
    }
    row.dataset.fieldCategory = fieldCategory;

    if (colorInfo) {
      row.classList.add("field-row-color");
      const badge = document.createElement("span");
      badge.className = "field-color-badge";
      badge.textContent = `RGBA ${colorInfo.alphaPercent}%`;
      labelRow.append(badge);

      const picker = document.createElement("input");
      picker.type = "color";
      picker.className = "field-color-picker";
      picker.value = colorInfo.hex;
      picker.title = "คลิกเพื่อเลือกสี (มี EyeDropper ดูดสีได้)";
      picker.setAttribute("aria-label", `เลือกสีสำหรับ ${field.label}`);

      // Opacity row
      const opacityRow = document.createElement("div");
      opacityRow.className = "field-opacity-row";
      
      const opacityLabel = document.createElement("label");
      opacityLabel.className = "field-opacity-label";
      opacityLabel.innerHTML = `<svg class="ui-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/></svg><span>ความโปร่งใส (Opacity)</span>`;
      
      const opacitySlider = document.createElement("input");
      opacitySlider.type = "range";
      opacitySlider.className = "field-opacity-slider";
      opacitySlider.min = "0";
      opacitySlider.max = "100";
      opacitySlider.step = "1";
      opacitySlider.value = String(colorInfo.alphaPercent);
      opacitySlider.setAttribute("aria-label", `ปรับความโปร่งใส ${field.label}`);

      const opacityNumber = document.createElement("input");
      opacityNumber.type = "number";
      opacityNumber.className = "field-opacity-number";
      opacityNumber.min = "0";
      opacityNumber.max = "100";
      opacityNumber.step = "1";
      opacityNumber.value = String(colorInfo.alphaPercent);
      opacityNumber.setAttribute("aria-label", `เปอร์เซ็นต์ความโปร่งใส ${field.label}`);

      const percentUnit = document.createElement("span");
      percentUnit.className = "field-opacity-unit";
      percentUnit.textContent = "%";

      const updateColorValue = (formattedValue) => {
        const prevVal = values[field.id];
        input.value = formattedValue;
        values[field.id] = formattedValue;
        
        const latestInfo = parseColorInfo(formattedValue);
        if (latestInfo) {
          badge.textContent = `RGBA ${latestInfo.alphaPercent}%`;
          opacitySlider.value = String(latestInfo.alphaPercent);
          opacityNumber.value = String(latestInfo.alphaPercent);
          picker.value = latestInfo.hex;
        }

        if (customCodeBySnippet.has(snippet.id) && customCodeBySnippet.get(snippet.id)["html"]) {
          let customHtml = customCodeBySnippet.get(snippet.id)["html"];
          if (prevVal && customHtml.includes(prevVal)) {
            customHtml = customHtml.split(prevVal).join(formattedValue);
            customCodeBySnippet.get(snippet.id)["html"] = customHtml;
          }
        }

        updateCodePanel(snippet);
        renderPreview(snippet);
      };

      picker.addEventListener("input", () => {
        const currentVal = input.value;
        const currentInfo = parseColorInfo(currentVal) || colorInfo;
        const currentAlpha = (Number(opacitySlider.value) / 100).toFixed(2);
        const formatted = currentInfo.format(picker.value, currentAlpha);
        updateColorValue(formatted);
      });

      const onOpacityChange = (val) => {
        if (val === "") return;
        const percent = Math.max(0, Math.min(100, Number(val)));
        const currentVal = input.value;
        const currentInfo = parseColorInfo(currentVal) || colorInfo;
        const formatted = currentInfo.withAlphaPercent(percent);
        updateColorValue(formatted);
      };

      opacitySlider.addEventListener("input", () => onOpacityChange(opacitySlider.value));
      opacityNumber.addEventListener("input", () => onOpacityChange(opacityNumber.value));

      input.addEventListener("input", () => {
        const newInfo = parseColorInfo(input.value);
        if (newInfo) {
          picker.value = newInfo.hex;
          badge.textContent = `RGBA ${newInfo.alphaPercent}%`;
          opacitySlider.value = String(newInfo.alphaPercent);
          opacityNumber.value = String(newInfo.alphaPercent);
        }
      });

      inputGroup.append(picker, input);
      opacityRow.append(opacityLabel, opacitySlider, opacityNumber, percentUnit);
      row.append(labelRow, inputGroup, opacityRow);
    } else {
      inputGroup.append(input);
      row.append(labelRow, inputGroup);
    }

    fieldList.append(row);
  }

  // Update tab counts
  if (tabCountAll) tabCountAll.textContent = String(currentFields.length);
  if (tabCountText) tabCountText.textContent = String(countText);
  if (tabCountStyle) tabCountStyle.textContent = String(countStyle);
  if (tabCountMedia) tabCountMedia.textContent = String(countMedia);
  if (quickTabMedia) quickTabMedia.hidden = countMedia === 0;

  // Validate active tab
  if (
    (activeQuickEditTab === "text" && countText === 0) ||
    (activeQuickEditTab === "style" && countStyle === 0) ||
    (activeQuickEditTab === "media" && countMedia === 0)
  ) {
    activeQuickEditTab = "all";
  }

  applyQuickEditFilter(activeQuickEditTab);

  renderHtmlParts(snippet);
  renderRubiiSlotControls(snippet);
  renderBackgroundControls(snippet);
}

const voidTags = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);

function scanHtmlTags(source) {
  const tags = [];
  let cursor = 0;
  while (cursor < source.length) {
    const start = source.indexOf("<", cursor);
    if (start < 0) break;
    if (source.startsWith("<!--", start)) {
      const close = source.indexOf("-->", start + 4);
      const end = close < 0 ? source.length : close + 3;
      tags.push({ kind: "comment", start, end });
      cursor = end;
      continue;
    }

    let quote = "";
    let end = start + 1;
    while (end < source.length) {
      const character = source[end];
      if (quote) {
        if (character === quote) quote = "";
      } else if (character === "\"" || character === "'") {
        quote = character;
      } else if (character === ">") {
        end += 1;
        break;
      }
      end += 1;
    }
    const value = source.slice(start, end);
    const closing = value.match(/^<\s*\/\s*([a-z][\w:-]*)/i);
    const opening = value.match(/^<\s*([a-z][\w:-]*)/i);
    if (closing) tags.push({ kind: "close", name: closing[1].toLowerCase(), start, end });
    else if (opening && !/^<\s*[!?]/.test(value)) {
      const name = opening[1].toLowerCase();
      tags.push({ kind: "open", name, start, end, empty: voidTags.has(name) || /\/\s*>$/.test(value) });
    }
    cursor = Math.max(end, start + 1);
  }
  return tags;
}

function textLabelFor(source, fallback) {
  const doc = new DOMParser().parseFromString(source, "text/html");
  const text = (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
  if (text) return text.length > 58 ? `${text.slice(0, 58)}…` : text;
  const tag = source.match(/<\s*([a-z][\w:-]*)/i)?.[1]?.toLowerCase();
  return tag ? `โครงสร้าง <${tag}>` : fallback;
}

const colorProperties = /^(?:color|background|background-color|border(?:-[a-z]+)?(?:-color)?|outline(?:-color)?|box-shadow|text-shadow|fill|stroke)$/;
const colorTokens = /#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})\b|rgba?\([^)]*\)|hsla?\([^)]*\)|\b(?:transparent|black|white|red|green|blue|yellow|orange|purple|pink|gray|grey|silver|navy|teal|lime|maroon|olive|aqua|fuchsia|rebeccapurple)\b/gi;

function colorsInHtml(source) {
  const found = new Map();
  const styleAttributes = /\bstyle\s*=\s*(["'])([\s\S]*?)\1/gi;
  for (const attribute of source.matchAll(styleAttributes)) {
    const contentStart = attribute.index + attribute[0].indexOf(attribute[2]);
    const declarations = /(^|;)\s*([\w-]+)\s*:\s*([^;]+)/g;
    for (const declaration of attribute[2].matchAll(declarations)) {
      const property = declaration[2].toLowerCase();
      if (!colorProperties.test(property)) continue;
      const valueOffset = contentStart + declaration.index + declaration[0].lastIndexOf(declaration[3]);
      for (const match of declaration[3].matchAll(colorTokens)) {
        const value = match[0];
        const key = value.toLowerCase();
        if (!found.has(key)) found.set(key, { original: value, property });
      }
    }
  }
  return [...found.values()];
}

function colorToHex(value) {
  if (/^#[\da-f]{8}$/i.test(value)) return value.slice(0, 7);
  if (/^#[\da-f]{4}$/i.test(value)) return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  if (/^#[\da-f]{6}$/i.test(value)) return value;
  if (/^#[\da-f]{3}$/i.test(value)) return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  const context = document.createElement("canvas").getContext("2d");
  if (!context) return "#000000";
  context.fillStyle = "#000000";
  context.fillStyle = value;
  const normalized = context.fillStyle;
  const rgb = normalized.match(/^rgba?\(\s*(\d+)[, ]+\s*(\d+)[, ]+\s*(\d+)/i);
  if (rgb) return `#${rgb.slice(1, 4).map((part) => Number(part).toString(16).padStart(2, "0")).join("")}`;
  if (/^#[\da-f]{6}$/i.test(normalized)) return normalized;
  return "#000000";
}

function colorAlphaPercent(value) {
  if (/^transparent$/i.test(value.trim())) return 0;
  const hex = value.match(/^#(?:[\da-f]{3}|[\da-f]{6})([\da-f])$/i) ?? value.match(/^#[\da-f]{6}([\da-f]{2})$/i);
  if (hex) {
    const alpha = hex[1].length === 1 ? Number.parseInt(hex[1] + hex[1], 16) : Number.parseInt(hex[1], 16);
    return Math.round((alpha / 255) * 100);
  }
  const alpha = value.match(/(?:rgba?|hsla?)\([^)]*[,/]\s*([\d.]+)(%)?\s*\)$/i);
  if (alpha) return Math.max(0, Math.min(100, Math.round(Number(alpha[1]) * (alpha[2] ? 1 : 100))));
  return 100;
}

function colorWithOpacity(value, percent) {
  const hex = colorToHex(value);
  const rgb = hex.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!rgb) return value;
  const channels = rgb.slice(1).map((part) => Number.parseInt(part, 16));
  const alpha = Number((Math.max(0, Math.min(100, Number(percent))) / 100).toFixed(2));
  return `rgba(${channels.join(", ")}, ${alpha})`;
}

function colorWithPickerValue(hex, original) {
  const rgb = hex.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!rgb) return hex;
  const channels = rgb.slice(1).map((part) => Number.parseInt(part, 16));
  const alphaMatch = original.match(/^rgba\(\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*([\d.]+)\s*\)$/i);
  if (alphaMatch) return `rgba(${channels.join(", ")}, ${alphaMatch[1]})`;
  if (colorAlphaPercent(original) < 100) return colorWithOpacity(hex, colorAlphaPercent(original));
  const rgbMatch = original.match(/^rgb\(/i);
  return rgbMatch ? `rgb(${channels.join(", ")})` : hex;
}

function labelForColorProperty(property) {
  if (property === "color") return "สีข้อความ";
  if (property.startsWith("background")) return "สีพื้นหลัง";
  if (property.startsWith("border")) return "สีเส้นขอบ";
  if (property.startsWith("outline")) return "สีเส้นเน้น";
  if (property.includes("shadow")) return "สีเงา";
  if (property === "fill") return "สีเติม";
  if (property === "stroke") return "สีเส้น";
  return "สี";
}


function extractTextStringsFromHtml(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const strings = [];
  let node;
  const seen = new Set();
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent || parent.closest("script,style,template,noscript")) continue;
    const text = node.nodeValue.trim();
    if (text && text.length >= 1 && !seen.has(text) && !/^([✕🤍↗️🎙️🔍🕒📈⭐📱🔒🛍️💬aA🔄🧾0-9\s:•+-]|&#\d+;)+$/.test(text)) {
      seen.add(text);
      strings.push(text);
    }
  }
  return strings;
}

function buildPartTextEditor(part, textarea, snippet) {
  const texts = extractTextStringsFromHtml(part.source);
  if (!texts.length) return null;
  const group = document.createElement("div");
  group.className = "part-text-controls";
  const heading = document.createElement("span");
  heading.className = "part-text-heading";
  heading.innerHTML = `<span class="heading-with-icon"><svg class="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg><strong>ปรับแต่งข้อความในส่วนนี้</strong> (พิมพ์แก้ได้ทันที)</span>`;
  group.append(heading);

  for (const originalText of texts) {
    let currentText = originalText;
    const row = document.createElement("div");
    row.className = "part-text-row";

    const label = document.createElement("span");
    label.className = "part-text-label";
    label.textContent = originalText.length > 28 ? originalText.slice(0, 28) + "…" : originalText;
    label.title = originalText;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "part-text-input";
    input.value = currentText;
    input.spellcheck = false;
    input.placeholder = originalText;
    input.setAttribute("aria-label", `แก้ไขข้อความ ${originalText}`);

    input.addEventListener("input", () => {
      const nextText = input.value;
      if (nextText !== currentText && currentText) {
        part.source = part.source.split(currentText).join(nextText);
        currentText = nextText;
        textarea.value = part.source;
        renderRubiiSlotControls(snippet);
        updateCodePanel(snippet);
        renderPreview(snippet);
      }
    });

    row.append(label, input);
    group.append(row);
  }
  return group;
}

function buildPartColorEditor(part, textarea, snippet) {
  const colors = colorsInHtml(part.source);
  if (!colors.length) return null;
  const group = document.createElement("div");
  group.className = "part-color-controls";
  const heading = document.createElement("span");
  heading.className = "part-color-heading";
  heading.innerHTML = `<span class="heading-with-icon"><svg class="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/></svg><strong>ตั้งค่าสี & Opacity ของส่วนนี้</strong></span>`;
  group.append(heading);

  for (const color of colors) {
    let currentValue = color.original;
    const row = document.createElement("div");
    row.className = "part-color-row";
    const name = document.createElement("span");
    name.textContent = `${labelForColorProperty(color.property)} · ${color.original}`;
    const picker = document.createElement("input");
    picker.type = "color";
    picker.value = colorToHex(currentValue);
    picker.setAttribute("aria-label", `เลือก${labelForColorProperty(color.property)}`);
    const code = document.createElement("input");
    code.type = "text";
    code.value = currentValue;
    code.spellcheck = false;
    code.setAttribute("aria-label", `โค้ด${labelForColorProperty(color.property)}`);
    const opacityRow = document.createElement("div");
    opacityRow.className = "part-opacity-row";
    const opacityLabel = document.createElement("label");
    opacityLabel.textContent = "ความทึบ";
    const opacity = document.createElement("input");
    opacity.type = "range";
    opacity.min = "0";
    opacity.max = "100";
    opacity.step = "1";
    opacity.value = String(colorAlphaPercent(currentValue));
    opacity.setAttribute("aria-label", `ปรับความทึบของ${labelForColorProperty(color.property)}`);
    const opacityNumber = document.createElement("input");
    opacityNumber.type = "number";
    opacityNumber.min = "0";
    opacityNumber.max = "100";
    opacityNumber.step = "1";
    opacityNumber.value = opacity.value;
    opacityNumber.setAttribute("aria-label", `เปอร์เซ็นต์ความทึบของ${labelForColorProperty(color.property)}`);
    const percent = document.createElement("span");
    percent.textContent = "%";

    const updateColor = (nextValue) => {
      if (!nextValue) return;
      if (nextValue !== currentValue) {
        part.source = part.source.split(currentValue).join(nextValue);
        currentValue = nextValue;
        code.value = nextValue;
        name.textContent = `${labelForColorProperty(color.property)} · ${nextValue}`;
        picker.value = colorToHex(nextValue);
        textarea.value = part.source;
        renderRubiiSlotControls(snippet);
        updateCodePanel(snippet);
        renderPreview(snippet);
      }
      const alphaPercent = colorAlphaPercent(currentValue);
      opacity.value = String(alphaPercent);
      opacityNumber.value = String(alphaPercent);
    };

    const setOpacity = (value) => {
      if (value === "") return;
      const nextPercent = Math.max(0, Math.min(100, Number(value)));
      const nextColor = colorWithOpacity(currentValue, nextPercent);
      updateColor(nextColor);
    };

    picker.addEventListener("input", () => updateColor(colorWithPickerValue(picker.value, currentValue)));
    code.addEventListener("input", () => {
      const nextValue = code.value.trim();
      if (CSS.supports("color", nextValue)) updateColor(nextValue);
    });
    opacity.addEventListener("input", () => setOpacity(opacity.value));
    opacityNumber.addEventListener("change", () => setOpacity(opacityNumber.value));
    row.append(name, picker, code);
    opacityLabel.append(opacity, opacityNumber, percent);
    opacityRow.append(opacityLabel);
    group.append(row);
    group.append(opacityRow);
  }
  return group;
}

function splitHtmlIntoParts(source) {
  const tags = scanHtmlTags(source);
  const rootOpen = tags.find((tag) => tag.kind === "open");
  if (!rootOpen) {
    return { prefix: "", suffix: "", parts: [{ label: "เนื้อหา HTML", source }] };
  }

  const stack = [rootOpen.name];
  const ranges = [];
  let partStart = null;
  let rootClose = null;
  for (const tag of tags) {
    if (tag.start <= rootOpen.start) continue;
    if (tag.kind === "open") {
      if (stack.length === 1 && !tag.empty) partStart = tag.start;
      if (stack.length === 1 && tag.empty) ranges.push({ start: tag.start, end: tag.end });
      if (!tag.empty) stack.push(tag.name);
    } else if (tag.kind === "close") {
      const matching = stack.lastIndexOf(tag.name);
      if (matching >= 0) stack.length = matching;
      if (stack.length === 1 && partStart !== null) {
        ranges.push({ start: partStart, end: tag.end });
        partStart = null;
      }
      if (stack.length === 0) {
        rootClose = tag;
        break;
      }
    }
  }

  if (!rootClose) return { prefix: "", suffix: "", parts: [{ label: "เนื้อหา HTML", source }] };
  const innerStart = rootOpen.end;
  const innerEnd = rootClose.start;
  if (!ranges.length) {
    const sourcePart = source.slice(innerStart, innerEnd);
    return {
      prefix: source.slice(0, innerStart),
      suffix: source.slice(innerEnd),
      parts: [{ label: textLabelFor(sourcePart, "เนื้อหาในการ์ด"), source: sourcePart }],
    };
  }

  const parts = ranges.map((range, index) => {
    const start = index === 0 ? innerStart : range.start;
    const end = index + 1 < ranges.length ? ranges[index + 1].start : innerEnd;
    const partSource = source.slice(start, end);
    const elementSource = source.slice(range.start, range.end);
    return { label: textLabelFor(elementSource, `ส่วนที่ ${index + 1}`), source: partSource };
  });
  return {
    prefix: source.slice(0, innerStart),
    suffix: source.slice(innerEnd),
    parts,
  };
}

function htmlPartState(snippet) {
  if (!htmlPartsBySnippet.has(snippet.id)) {
    htmlPartsBySnippet.set(snippet.id, splitHtmlIntoParts(snippet.code?.html ?? ""));
  }
  return htmlPartsBySnippet.get(snippet.id);
}

function renderHtmlParts(snippet) {
  const source = snippet.code?.html ?? "";
  htmlPartsPanel.hidden = !source;
  htmlPartsList.replaceChildren();
  if (!source) {
    htmlPartCount.textContent = "0 ส่วน";
    return;
  }

  const state = htmlPartState(snippet);
  htmlPartCount.textContent = `${state.parts.length} ส่วน`;
  state.parts.forEach((part, index) => {
    const card = document.createElement("details");
    card.className = "html-part-card";
    const summary = document.createElement("summary");
    const label = document.createElement("span");
    label.className = "html-part-label";
    const title = document.createElement("strong");
    title.textContent = `ส่วนที่ ${String(index + 1).padStart(2, "0")}`;
    const preview = document.createElement("small");
    preview.textContent = part.label;
    label.append(title, preview);
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "part-copy-button";
    copy.innerHTML = `<svg class="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>คัดลอกชิ้นนี้</span>`;
    copy.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      await copyText(part.source, `คัดลอก HTML ส่วนที่ ${index + 1} แล้ว`);
    });
    summary.append(label, copy);
    const textarea = document.createElement("textarea");
    textarea.className = "html-part-source";
    textarea.spellcheck = false;
    textarea.setAttribute("aria-label", `โค้ด HTML ส่วนที่ ${index + 1}`);
    textarea.value = part.source;
    textarea.addEventListener("input", () => {
      part.source = textarea.value;
      renderRubiiSlotControls(snippet);
      updateCodePanel(snippet);
      renderPreview(snippet);
    });
    textarea.addEventListener("change", () => {
      const wasOpen = htmlPartsPanel.open;
      renderHtmlParts(snippet);
      htmlPartsPanel.open = wasOpen;
      const refreshed = htmlPartsList.querySelectorAll(".html-part-card")[index];
      if (refreshed) refreshed.open = true;
    });
    card.append(summary, textarea);
    htmlPartsList.append(card);
  });
}

function backgroundState(snippet) {
  if (!backgroundBySnippet.has(snippet.id)) backgroundBySnippet.set(snippet.id, { enabled: false, url: defaultBackgroundUrl });
  return backgroundBySnippet.get(snippet.id);
}

function renderBackgroundControls(snippet) {
  const state = backgroundState(snippet);
  backgroundEnabled.checked = state.enabled;
  backgroundUrl.value = state.url;
  const urlField = document.querySelector(".background-url-field");
  if (urlField) urlField.hidden = !state.enabled;
}

function assembleRawHtml(snippet) {
  const state = htmlPartState(snippet);
  const combined = `${state.prefix}${state.parts.map((part) => part.source).join("")}${state.suffix}`; return sanitizeRawHtml(combined);
}

function applyFieldValues(snippet, source, options = {}) {
  let text = source;
  const values = fieldValues(snippet);
  for (const field of currentFields) {
    if (options.preserveMacros && (field.token === "{{char}}" || field.token === "{{user}}" || field.token?.startsWith("{{"))) {
      continue;
    }
    const value = values[field.id] ?? field.value;
    if (field.kind === "tagName") {
      if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(value)) continue;
      const original = snippet.editable.tagName;
      text = text.split("{{tagName}}").join(value);
      text = text.split(`<${original}`).join(`<${value}`).split(`</${original}`).join(`</${value}`);
    } else if (field.kind === "token" || field.kind === "literal") {
      text = text.split(field.token).join(value);
    } else if (field.kind === "url") {
      text = text.split(field.original).join(value);
    }
  }
  return text;
}

function editedCode(snippet, key) {
  if (customCodeBySnippet.has(snippet.id) && key in customCodeBySnippet.get(snippet.id)) {
    return customCodeBySnippet.get(snippet.id)[key];
  }
  if (isRubiiHtmlSnippet(snippet) && key !== "html") {
    return buildRubiiSections(snippet)[key] ?? "";
  }
  const source = key === "html" ? assembleRawHtml(snippet) : (snippet.code?.[key] ?? "");
  return applyFieldValues(snippet, source);
}

function escapeHtmlAttribute(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function htmlWithBackground(snippet, html) {
  const state = backgroundState(snippet);
  const url = state.url.trim();
  if (!state.enabled || !url) return html;
  const root = scanHtmlTags(html).find((tag) => tag.kind === "open");
  if (!root) return html;
  const cssUrl = url.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/[\r\n\f]/g, "");
  const additions = `background-image:url('${cssUrl}');background-size:cover;background-position:center;background-repeat:no-repeat;`;
  const rootTag = html.slice(root.start, root.end);
  const styleAttribute = rootTag.match(/\bstyle\s*=\s*(["'])([\s\S]*?)\1/i);
  let updatedRoot;
  if (styleAttribute) {
    const existing = styleAttribute[2].replace(/\s*$/, "").replace(/;?$/, ";");
    const merged = `${existing}${additions}`;
    updatedRoot = rootTag.replace(styleAttribute[0], `style="${merged}"`);
  } else {
    const insertAt = rootTag.lastIndexOf(">");
    updatedRoot = `${rootTag.slice(0, insertAt)} style="${additions}"${rootTag.slice(insertAt)}`;
  }
  return `${html.slice(0, root.start)}${updatedRoot}${html.slice(root.end)}`;
}

function rubiiTextSlots(source) {
  const doc = new DOMParser().parseFromString(source, "text/html");
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent || parent.closest("script,style,template,noscript")) continue;
    if (node.nodeValue.trim()) nodes.push(node);
  }

  const slots = [];
  const dynamicPattern = /\([^()]*\)|\{\{[^{}]+\}\}%?|\b\d{1,3}%(?!\w)/g;
  for (const [nodeIndex, textNode] of nodes.entries()) {
    const text = textNode.nodeValue;
    const matches = [...text.matchAll(dynamicPattern)];
    const candidates = matches.map((match) => ({
      target: match[0],
      start: match.index,
      end: match.index + match[0].length,
      explicit: true,
    }));
    const markerTypes = new Set(["time", "prompt", "reference", "date", "amount"]);
    candidates.push(...suggestedTextVariableMatches(text).map((suggestion) => {
      const isMarker = markerTypes.has(suggestion.type);
      return {
        target: suggestion.value,
        start: suggestion.start,
        end: suggestion.end,
        explicit: isMarker,
        suggested: !isMarker,
        suggestionType: suggestion.type,
      };
    }));
    candidates.sort((a, b) => a.start - b.start || a.end - b.end);
    if (!candidates.length && text.trim().length >= 3) {
      const start = text.indexOf(text.trim());
      candidates.push({ target: text.trim(), start, end: start + text.trim().length, example: true });
    }

    for (const [matchIndex, candidate] of candidates.entries()) {
      const target = candidate.target.trim();
      if (!target) continue;
      const words = `${target} ${text}`.toLocaleLowerCase("th");
      let score = candidate.explicit ? 5 : candidate.suggested ? 1 : 0;
      if (candidate.suggestionType === "time" || candidate.suggestionType === "prompt" || candidate.suggestionType === "reference") score += 5;
      if (/สถานการณ์|ข้อความ|โพสต์|caption|รายละเอียด|message|บทสนทนา|คำบรรยาย|เหตุการณ์|บันทึก|โน้ต/.test(words)) score += 12;
      if (/จำนวนเงิน|ยอดโอน|ยอดเงิน|สินค้า|รายการ|เนื้อหา|คำตอบ|ตอบกลับ/.test(words)) score += 8;
      if (isRubiiPercentageTarget(target)) score += 8;
      if (/สถานที่|วันที่|เดือน|\bวัน\b|เวลา|hh:mm|\{\{char\}\}/i.test(target)) score -= 3;
      score += Math.min(target.length, 60) / 20;
      const context = text.replace(/\s+/g, " ").trim();
      const label = candidate.suggested
        ? `${suggestedVariableLabel(candidate.suggestionType)} · ${target}`
        : `${target} · ${context === target ? "ข้อความ" : context}`;
      slots.push({
        id: `${nodeIndex}:${matchIndex}`,
        nodeIndex,
        start: candidate.start,
        end: candidate.end,
        target: candidate.target,
        label,
        score,
        explicit: Boolean(candidate.explicit),
        suggested: Boolean(candidate.suggested),
        suggestionType: candidate.suggestionType,
      });
    }
  }
  return { doc, nodes, slots };
}

function renderRubiiSlotControls(snippet) {
  rubiiSlotControls.hidden = !isRubiiHtmlSnippet(snippet);
  rubiiSlotSelect.replaceChildren();
  if (!isRubiiHtmlSnippet(snippet)) return;

  const { slots } = rubiiTextSlots(assembleRawHtml(snippet));
  const state = rubiiSettingsBySnippet.get(snippet.id) ?? {};
  const preferred = typeof state.slotId === "string" && state.slotId
    ? (slots.some((slot) => slot.id === state.slotId) ? state.slotId : "")
    : (
        [...slots]
          .filter((slot) => !/^\{\{.*\}\}$/.test(slot.target))
          .sort((a, b) => b.score - a.score)[0]?.id
        ?? slots.find((slot) => slot.explicit)?.id
        ?? ""
      );
  state.slotId = preferred ?? "";
  if (!Array.isArray(state.regexSlotIds)) {
    const explicitSlots = [];
    const seenTargets = new Set();
    const validCandidateSlots = slots.filter((slot) => !/^\{\{.*\}\}$/.test(slot.target));
    const pool = validCandidateSlots.length ? validCandidateSlots : slots;
    for (const slot of pool) {
      if (slot.explicit && slot.score > 0 && !seenTargets.has(slot.target)) {
        seenTargets.add(slot.target);
        explicitSlots.push(slot);
      }
    }
    state.regexSlotIds = explicitSlots.slice(0, maxRegexCaptures).map((slot) => slot.id);
  }
  state.regexSlotIds = state.regexSlotIds.filter((id) => slots.some((slot) => slot.id === id)).slice(0, maxRegexCaptures);
  if (!Array.isArray(state.extraRegexRules)) state.extraRegexRules = [];
  rubiiSettingsBySnippet.set(snippet.id, state);
  const addFallbackButton = document.querySelector("#add-regex-fallback-button");
  if (addFallbackButton) {
    addFallbackButton.disabled = state.regexSlotIds.length === 0;
    addFallbackButton.title = addFallbackButton.disabled ? "เลือกช่อง Regex อย่างน้อยหนึ่งช่องก่อน" : "สร้าง Pattern สำรองและคัดลอก Replacement จาก Regex หลัก";
  }

  if (!slots.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "ไม่มีข้อความให้แทน — ใช้โครง HTML ทั้งก้อน";
    rubiiSlotSelect.append(option);
    rubiiSlotSelect.disabled = true;
    rubiiRegexCaptureList.replaceChildren();
    rubiiRegexCaptureCount.textContent = "0 / 33";
    renderExtraRegexRules(state, snippet);
    return;
  }

  rubiiSlotSelect.disabled = false;
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "เลือกข้อความเพื่อกำหนดเป็น $1";
  rubiiSlotSelect.append(placeholder);
  for (const slot of slots) {
    const option = document.createElement("option");
    option.value = slot.id;
    option.textContent = slot.label.length > 110 ? `${slot.label.slice(0, 107)}…` : slot.label;
    rubiiSlotSelect.append(option);
  }
  rubiiSlotSelect.value = preferred;

  const selectedIds = new Set(state.regexSlotIds);
  rubiiRegexCaptureList.replaceChildren();
  for (const slot of slots) {
    const label = document.createElement("label");
    label.className = "rubii-regex-capture-option";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.regexSlotId = slot.id;
    checkbox.checked = selectedIds.has(slot.id);
    checkbox.disabled = !checkbox.checked && selectedIds.size >= maxRegexCaptures;
    const number = checkbox.checked ? `${state.regexSlotIds.indexOf(slot.id) + 1}. ` : "";
    const marker = document.createElement("span");
    marker.className = `rubii-regex-capture-kind${slot.suggested ? " is-suggestion" : ""}`;
    marker.textContent = slot.explicit ? "marker" : slot.suggested ? "ตรวจดู" : "ตัวอย่าง";
    if (slot.suggested) marker.title = "ระบบเดาว่าอาจเปลี่ยน แนะนำให้ตรวจสอบก่อนเลือก";
    const text = document.createElement("span");
    text.className = "rubii-regex-capture-text";
    text.textContent = `${number}${slot.label}`;
    label.append(checkbox, text, marker);
    rubiiRegexCaptureList.append(label);
  }
  rubiiRegexCaptureCount.textContent = `${state.regexSlotIds.length} / ${maxRegexCaptures}`;
  renderExtraRegexRules(state, snippet);
}

function renderExtraRegexRules(state, snippet) {
  extraRegexRuleList.replaceChildren();
  const source = htmlWithBackground(snippet, assembleRawHtml(snippet));
  const { slots } = rubiiTextSlots(source);
  const regexSlots = (state.regexSlotIds ?? []).map((id) => slots.find((slot) => slot.id === id)).filter(Boolean).slice(0, maxRegexCaptures);
  const regexReplacement = regexSlots.length ? buildRubiiTemplate(snippet, regexSlots).template : "";
  const tagValue = fieldValues(snippet).rubiiTagName;
  const tagName = /^[A-Za-z][A-Za-z0-9_-]*$/.test(tagValue ?? "") ? tagValue : defaultRubiiTagName(snippet);
  for (const [index, rule] of state.extraRegexRules.entries()) {
    const isGeneratedFallback = ["pipe", "comma", "newline"].includes(rule.generatedFormat);
    const card = document.createElement("section");
    card.className = "rubii-extra-regex-card";
    card.dataset.regexRuleId = rule.id;
    const heading = document.createElement("div");
    heading.className = "rubii-extra-regex-card-heading";
    const name = document.createElement("input");
    name.type = "text";
    name.dataset.regexRuleField = "name";
    name.value = rule.name ?? `Regex เพิ่มเติม ${index + 1}`;
    name.setAttribute("aria-label", `ชื่อ Regex เพิ่มเติม ${index + 1}`);
    const stage = document.createElement("select");
    stage.dataset.regexRuleField = "stage";
    stage.setAttribute("aria-label", `จุดทำงานของ Regex ${index + 1}`);
    for (const [value, label] of [["raw", "เนื้อหาต้นฉบับ"], ["displayed", "ข้อความที่แสดง"]]) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      stage.append(option);
    }
    stage.value = rule.stage ?? "raw";
    stage.disabled = isGeneratedFallback;
    const actions = document.createElement("div");
    actions.className = "rubii-regex-rule-actions";
    for (const [direction, label, title] of [[-1, "↑", "เลื่อนกฎขึ้น"], [1, "↓", "เลื่อนกฎลง"]]) {
      const move = document.createElement("button");
      move.type = "button";
      move.className = "part-copy-button";
      move.dataset.moveRegexRule = rule.id;
      move.dataset.direction = String(direction);
      move.disabled = direction < 0 ? index === 0 : index === state.extraRegexRules.length - 1;
      move.title = title;
      move.setAttribute("aria-label", `${title}: ${rule.name ?? `Regex เพิ่มเติม ${index + 1}`}`);
      move.textContent = label;
      actions.append(move);
    }
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "part-copy-button";
    remove.dataset.removeRegexRule = rule.id;
    remove.textContent = "ลบ";
    actions.append(remove);
    if (isGeneratedFallback) {
      const format = document.createElement("select");
      format.setAttribute("aria-label", `ตัวคั่นของ Regex สำรอง ${index + 1}`);
      for (const [value, label] of [["pipe", "คั่นด้วย |"], ["comma", "คั่นด้วย ,"], ["newline", "ขึ้นบรรทัดใหม่"]]) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        format.append(option);
      }
      format.value = rule.generatedFormat;
      format.addEventListener("change", () => {
        rule.generatedFormat = format.value;
        renderRubiiSlotControls(snippet);
        updateCodePanel(snippet);
      });
      heading.append(name, format, actions);
    } else {
      heading.append(name, stage, actions);
    }

    const patternLabel = document.createElement("label");
    patternLabel.className = "rubii-regex-rule-field";
    patternLabel.innerHTML = isGeneratedFallback
      ? "<span>Pattern <small>สร้างอัตโนมัติจากช่องที่เลือก</small></span>"
      : "<span>Pattern <small>/pattern/flags</small></span>";
    const pattern = document.createElement("textarea");
    pattern.dataset.regexRuleField = "pattern";
    pattern.value = isGeneratedFallback ? buildRegexPattern(tagName, regexSlots, rule.generatedFormat) : rule.pattern ?? "";
    pattern.readOnly = isGeneratedFallback;
    pattern.placeholder = "/pattern/flags";
    pattern.setAttribute("aria-label", `Pattern ของ Regex ${index + 1}`);
    patternLabel.append(pattern);

    const replacementLabel = document.createElement("label");
    replacementLabel.className = "rubii-regex-rule-field";
    replacementLabel.innerHTML = isGeneratedFallback
      ? "<span>Replacement <small>ใช้ชุดเดียวกับ Regex หลัก</small></span>"
      : "<span>Replacement <small>ใช้ $1–$33 ตาม capture group</small></span>";
    const replacement = document.createElement("textarea");
    replacement.dataset.regexRuleField = "replacement";
    replacement.value = isGeneratedFallback ? regexReplacement : rule.replacement ?? "";
    replacement.readOnly = isGeneratedFallback;
    replacement.placeholder = "HTML หรือข้อความแทนที่";
    replacement.setAttribute("aria-label", `Replacement ของ Regex ${index + 1}`);
    replacementLabel.append(replacement);
    card.append(heading, patternLabel, replacementLabel);
    extraRegexRuleList.append(card);
  }
}

function isRubiiPercentageTarget(target) {
  return /^\d{1,3}%$/.test(String(target ?? "").trim().replace(/^\((.*)\)$/s, "$1"));
}

function isRubiiPercentageSlot(slot) {
  const target = String(slot?.target ?? "").trim();
  return isRubiiPercentageTarget(target) || /^\{\{[^{}]+\}\}%$/.test(target);
}

function buildRubiiTemplate(snippet, chosenSlots) {
  const source = htmlWithBackground(snippet, assembleRawHtml(snippet));
  const { doc, nodes, slots } = rubiiTextSlots(source);
  const selectedSlots = chosenSlots.map((selected) => slots.find((slot) => slot.id === selected.id)).filter(Boolean);
  const replacementsByNode = new Map();
  const progressBarMap = new Map();

  const slotById = new Map();
  selectedSlots.forEach((slot, index) => {
    const varName = isRubiiPercentageSlot(slot) ? "$" + (index + 1) + "%" : "$" + (index + 1);
    slotById.set(slot.id, { varName, slotIndex: index, slot });
  });

  slots.forEach((slot) => {
    if (slotById.has(slot.id)) {
      const { varName, slotIndex } = slotById.get(slot.id);
      if (!replacementsByNode.has(slot.nodeIndex)) replacementsByNode.set(slot.nodeIndex, []);
      replacementsByNode.get(slot.nodeIndex).push({ slot, replacement: varName });

      if (isRubiiPercentageSlot(slot)) {
        const textNode = nodes[slot.nodeIndex];
        const selectedPercentage = String(slot.target).match(/(\d{1,3})%/)?.[1];

        let container = textNode?.parentElement?.closest("div");
        let matchedBar = null;

        while (container && container !== doc.body && !matchedBar) {
          const candidateBars = [...container.querySelectorAll("*")].filter((el) => {
            const st = el.getAttribute("style") || "";
            const width = st.match(/(?:^|;)\s*width\s*:\s*(\d{1,3})\s*%/i)?.[1];
            return width !== undefined && (width === selectedPercentage || (width !== "100" && selectedPercentage === undefined));
          });
          if (candidateBars.length > 0) {
            matchedBar = candidateBars.find((el) => !progressBarMap.has(el)) || candidateBars[0];
            break;
          }
          container = container.parentElement?.closest("div");
        }

        if (matchedBar) {
          progressBarMap.set(matchedBar, "$" + (slotIndex + 1) + "%");
        }
      }
    }
  });

  for (const [nodeIndex, replacements] of replacementsByNode) {
    const node = nodes[nodeIndex];
    if (!node) continue;
    for (const { slot, replacement } of replacements.sort((a, b) => b.slot.start - a.slot.start)) {
      node.nodeValue = `${node.nodeValue.slice(0, slot.start)}${replacement}${node.nodeValue.slice(slot.end)}`;
    }
  }

  const cssRules = [];
  const safeId = String(snippet.id ?? "card").replace(/[^a-z\d_-]/gi, "-").toLowerCase();
  for (const [index, element] of [...doc.body.querySelectorAll("*")].entries()) {
    const inlineStyle = element.getAttribute("style");
    if (!inlineStyle) continue;

    const dynamicSlot = progressBarMap.get(element);
    let styleForCss = inlineStyle.trim();
    if (dynamicSlot) {
      styleForCss = styleForCss.replace(/width:\s*[^;]+;?/gi, "").trim();
    }

    const className = `rubii-${safeId}-${String(index + 1).padStart(2, "0")}`;
    element.classList.add(className);
    if (styleForCss) {
      cssRules.push(`.${className}{${styleForCss}}`);
    }

    if (dynamicSlot) {
      element.setAttribute("style", `width:${dynamicSlot};max-width:100%;`);
    } else {
      element.removeAttribute("style");
    }
  }

  const template = applyFieldValues(snippet, doc.body.innerHTML.replace(/\n\s*/g, ""), { preserveMacros: true });
  const css = applyFieldValues(snippet, cssRules.join(""), { preserveMacros: true });
  return { template, css };
}

function buildRegexPattern(tagName, chosenSlots, format = "doublePipe") {
  const separators = {
    doublePipe: { delimiter: "\\|\\|", textCapture: "([\\s\\S]*?)" },
    pipe: { delimiter: "\\|(?!\\|)", textCapture: "([^|]*?)" },
    comma: { delimiter: "\\s*,\\s*", textCapture: "([^,]*?)" },
    newline: { delimiter: "\\r?\\n", textCapture: "([^\\r\\n]*?)" },
  };
  const { delimiter, textCapture } = separators[format] ?? separators.doublePipe;
  const captures = chosenSlots.map((slot) => (
    isRubiiPercentageSlot(slot)
      ? "(\\d{1,3}(?:\\.\\d+)?)\\s*%?"
      : textCapture
  )).join(delimiter);
  return `/<${tagName}>${captures}<\\/${tagName}>/g`;
}

function describeRubiiSlot(slot) {
  return String(slot?.target ?? "ข้อความที่เลือก")
    .replace(/^\((.*)\)$/s, "$1")
    .replace(/^\{\{(.*)\}\}$/s, "$1")
    .replace(/\{\{char\}\}/gi, "ชื่อตัวละคร")
    .replace(/\{\{user\}\}/gi, "ชื่อผู้ใช้")
    .replace(/\s+/g, " ")
    .trim();
}

function rubiiSlotLabel(slot, index, snippet) {
  const raw = describeRubiiSlot(slot);
  if (slot?.suggestionType === "prompt" || /^\[.*\]$/.test(raw)) return "สไตล์/รายละเอียด";
  if (slot?.suggestionType === "reference" || /ref|อ้างอิง|reference|เลขที่|รหัส/i.test(raw)) return "เลขอ้างอิง";
  if (slot?.suggested) return suggestedVariableLabel(slot.suggestionType);
  const text = `${slot?.target ?? ""} ${slot?.label ?? ""}`.toLocaleLowerCase("th");
  const title = String(snippet?.title ?? "").toLocaleLowerCase("th");
  if (/hh:mm|เวลา|time|\b\d{1,2}:\d{2}\b|\b\d{1,2}'\d{2}"\d{2}\b/.test(text)) return "เวลา";
  if (/วันที่|date/.test(text)) return "วันที่";
  if (/เดือน|month/.test(text)) return "เดือน/ปี";
  if (/วัน|weekday|day/.test(text)) return "วัน";
  if (/สถานที่|location/.test(text)) return "สถานที่";
  if (/ยอดโอน|จำนวนเงิน|ราคา|price|amount|ปลดล็อก/.test(text)) return "ราคา/ยอดเงิน";
  if (/เครดิต|credits/.test(text)) return "เครดิต";
  if (/likes|ไลก์/.test(text)) return "ยอดไลก์";
  if (/comments|คอมเมนต์/.test(text)) return "ยอดคอมเมนต์";
  if (/tier|ระดับสมาชิก/.test(text)) return "ระดับสมาชิก";
  if (/\{\{char\}\}|ชื่อตัวละคร/.test(text)) return "ชื่อตัวละคร";
  if (/\{\{user\}\}|ชื่อผู้ใช้/.test(text)) return "ชื่อผู้ใช้";
  if (/mood|อารมณ์/.test(text)) return "อารมณ์";
  if (/affection|ความสัมพันธ์/.test(text)) return "ค่าความสัมพันธ์";
  if (/caption|โพสต์|สถานการณ์|คำบรรยาย/.test(text) || (title.includes("post") && raw.length > 35)) return "เนื้อหาโพสต์";
  if (/ชื่อบัญชี|username|@|_[a-z\d]/i.test(raw)) return "ชื่อบัญชี";
  if (isRubiiPercentageTarget(raw)) {
    if (/ความรัก|love/i.test(text)) return "ความรัก (%)";
    if (/ความใคร่|lust|passion/i.test(text)) return "ความใคร่ (%)";
    if (/หึง|jealousy/i.test(text)) return "ความหึงหวง (%)";
    if (/ผูกพัน|bond|sync/i.test(text)) return "ผูกพันลึกซึ้ง (%)";
    if (/พลังงาน|energy/i.test(text)) return "พลังงาน (%)";
    if (/ความสุข|สุข|happy|happiness/i.test(text)) return "ระดับความสุข (%)";
    if (/hp|health|พลังชีวิต/i.test(text)) return "HP (%)";
    if (/mp|mana|พลังเวท/i.test(text)) return "MP (%)";
    if (/exp|level/i.test(text)) return "EXP (%)";
    return `ค่าสถานะ (${raw})`;
  }
  if (slot?.explicit) {
    const shortLabel = raw.split(/[:：]/, 1)[0].trim();
    if (shortLabel && shortLabel.length <= 24) return shortLabel;
  }
  if (raw.length <= 24) return raw || `ช่องที่ ${index + 1}`;
  if (/chat|แชต|ข้อความ/.test(title)) return "ข้อความแชต";
  return "ข้อความหลัก";
}

function rubiiSampleValue(slot) {
  const raw = String(slot?.target ?? "").trim();
  if (isRubiiPercentageSlot(slot)) return raw || "88%";
  if (!slot?.explicit) return raw || "ตัวอย่างทดสอบ";
  const text = `${raw} ${slot?.label ?? ""}`.toLocaleLowerCase("th");
  if (/\{\{char\}\}|ชื่อตัวละคร/.test(text)) return "Mira";
  if (/\{\{user\}\}|ชื่อผู้ใช้/.test(text)) return "คุณ";
  if (/hh:mm|เวลา|time|\b\d{1,2}:\d{2}\b|\b\d{1,2}'\d{2}"\d{2}\b/.test(text)) return raw && /\b\d{1,2}[:']\d{2}/.test(raw) ? raw : "21:45";
  if (/สไตล์|เสื้อผ้า|ชุด|อุปกรณ์|outfit|style/i.test(text)) return "เสื้อยืดโอเวอร์ไซส์และกางเกงคาร์โก้";
  if (/^(\(\s*วันที่\s*\)|\(\s*วัน\/เลขวันที่\s*\))$/i.test(raw)) return "7";
  if (/เดือน.*ปี|เดือน\/ปี|พ\.ศ\.|month.*year/.test(text)) return "ตุลาคม 2569";
  if (/วันที่|date/.test(text)) return "7 ตุลาคม 2569";
  if (/เดือน|month/.test(text)) return "ตุลาคม";
  if (/วัน|weekday|day/.test(text)) return "วันพุธ";
  if (/สถานที่|location/.test(text)) return "กรุงเทพฯ";
  if (/จำนวนเงิน|ยอดโอน|ราคา|price|amount|ปลดล็อก/.test(text)) return "฿1,250.00";
  if (/เครดิต|credits/.test(text)) return "350 Credits";
  if (/likes|ไลก์/.test(text)) return "2,840 Likes";
  if (/comments|คอมเมนต์/.test(text)) return "156 Comments";
  if (/mood|อารมณ์/.test(text)) return "อารมณ์ดี";
  if (/affection|ความสัมพันธ์/.test(text)) return "72";
  if (/status|สถานะ/.test(text)) return "ออนไลน์";
  if (/ref|อ้างอิง|reference|เลขที่|รหัส/i.test(text)) return "TX-20261009-8812";
  if (/ธนาคาร|bank|wallet|วอลเล็ท|บัญชี|account/i.test(text)) return "พร้อมเพย์ / วอลเล็ท";
  if (/เบอร์|โทร|phone/i.test(text)) return "081-234-5678";
  if (/แทร็ก|track|เพลง|song|music|title/i.test(text)) return "Midnight City Lights";
  if (/ศิลปิน|artist/i.test(text)) return "Cyber Wave Studio";
  if (/album|อัลบั้ม/i.test(text)) return "Retro Nostalgia Vol.1";
  if (/คำค้น|ค้นหา|search|query|keyword/i.test(text)) return "สถานที่เที่ยวพักผ่อนลับๆ";
  if (/แฮชแท็ก|hashtag|tag/i.test(text)) return "#Lifestyle #NightVibes";
  if (/ความคิด|memo|ความคิดในใจ|บันทึก/i.test(text)) return "ช่วงเวลาดีๆ ที่ได้อยู่ด้วยกัน";
  if (/งาน|ภารกิจ|task|todo/i.test(text)) return "ทำรายงานสรุปประจำสัปดาห์";
  if (/caption|โพสต์|สถานการณ์|คำบรรยาย|ข้อความ|content|message/.test(text)) return "วันนี้อากาศดีจนอยากบันทึกไว้ ☀️";
  return "ตัวอย่างข้อมูล";
}

function buildRubiiSections(snippet) {
  const source = htmlWithBackground(snippet, assembleRawHtml(snippet));
  const { slots } = rubiiTextSlots(source);
  const state = rubiiSettingsBySnippet.get(snippet.id) ?? {};
  const styleSlot = slots.find((item) => item.id === state.slotId) ?? null;
  const styleTemplate = buildRubiiTemplate(snippet, styleSlot ? [styleSlot] : []);
  const regexSlots = (state.regexSlotIds ?? []).map((id) => slots.find((slot) => slot.id === id)).filter(Boolean).slice(0, maxRegexCaptures);
  const regexTemplate = buildRubiiTemplate(snippet, regexSlots);
  const values = fieldValues(snippet);
  const customName = values.rubiiTagName;
  const tagName = /^[A-Za-z][A-Za-z0-9_-]*$/.test(customName ?? "") ? customName : defaultRubiiTagName(snippet);
  const styleExample = `<${tagName}>${rubiiSampleValue(styleSlot)}</${tagName}>`;
  const regexOutput = regexSlots.length
    ? `<${tagName}>${regexSlots.map((slot) => rubiiSampleValue(slot)).join("||")}</${tagName}>`
    : styleSlot ? styleExample : "ยังไม่ได้เลือกช่อง — เลือก Marker หรือข้อความที่ตรวจดูแล้วก่อน";
  const styleDescription = rubiiSlotLabel(styleSlot, 0, snippet) || "เนื้อหาหลัก";
  const regexDescriptions = regexSlots.map((slot, index) => `\`$${index + 1}\` = ${rubiiSlotLabel(slot, index, snippet)}`).join("; ");
  const extraRules = state.extraRegexRules ?? [];
  const regexLines = [];
  if (regexSlots.length) {
    regexLines.push(
      `Regex 1 · หลายช่อง · เนื้อหาต้นฉบับ`,
      `Pattern: ${buildRegexPattern(tagName, regexSlots)}`,
      `Replacement: ${regexTemplate.template}`,
    );
  }
  extraRules.forEach((rule, index) => {
    const generatedFallback = ["pipe", "comma", "newline"].includes(rule.generatedFormat);
    regexLines.push(
      `Regex ${regexSlots.length ? index + 2 : index + 1} · ${rule.name || `Regex เพิ่มเติม ${index + 1}`} · ${rule.stage === "displayed" ? "ข้อความที่แสดง" : "เนื้อหาต้นฉบับ"}`,
      `Pattern: ${generatedFallback ? buildRegexPattern(tagName, regexSlots, rule.generatedFormat) : rule.pattern || "(ยังไม่ได้กำหนด)"}`,
      `Replacement: ${generatedFallback ? regexTemplate.template : rule.replacement || "(ยังไม่ได้กำหนด)"}`,
    );
  });
  const systemPrompt = [
    `### ${snippet.title}`,
    "",
    `- เมื่อมีข้อมูลสำหรับการ์ดนี้ ให้ใช้แท็ก \`<${tagName}>…</${tagName}>\``,
    styleSlot ? `- **Style tag:** ใส่ \`${styleDescription}\` หนึ่งค่าในแท็ก` : null,
    regexSlots.length > 1
      ? `- **Regex:** เรียง ${regexDescriptions}; คั่นค่าด้วย \`||\``
      : regexSlots.length === 1
        ? `- **Regex:** ใส่ \`${rubiiSlotLabel(regexSlots[0], 0, snippet)}\` หนึ่งค่าในแท็ก`
        : null,
    regexSlots.length ? "- ใช้ Style tag หรือ Regex อย่างใดอย่างหนึ่งกับแท็กนี้" : null,
    regexSlots.length > 1 ? "- ห้ามใส่ `||` ในค่า และห้ามพิมพ์ HTML/CSS" : "- ห้ามพิมพ์ HTML/CSS",
    "",
    "### ตัวอย่างข้อความที่ส่ง",
    regexOutput,
  ].filter((line) => line !== null).join("\n");
  const sections = {
    template: styleTemplate.template,
    html: applyFieldValues(snippet, assembleRawHtml(snippet)),
    css: styleTemplate.css,
    regex: regexLines.length ? regexLines.join("\n\n") : "ยังไม่ได้เลือกช่องสำหรับ Regex — เลือกข้อความใน Quick Edit หรือเพิ่มกฎ Regex เพิ่มเติม",
    output: regexOutput,
    settings: systemPrompt,
  };
  return sections;
}

function availableCodeKeys(snippet) {
  if (isRubiiHtmlSnippet(snippet)) return ["template", "html", "css", "regex", "output", "settings"];
  return Object.keys(codeLabels).filter((key) => typeof snippet.code?.[key] === "string" && snippet.code[key].length > 0);
}

function codeLabelFor(snippet, key) {
  if (isRubiiHtmlSnippet(snippet)) {
    if (key === "template") return "HTML แม่แบบ (Style tag)";
    if (key === "html") return "HTML ต้นฉบับ";
    if (key === "css") return "CSS ส่วนกลาง";
    if (key === "output") return "ข้อความทดสอบ (Output)";
    if (key === "settings") return "ตั้งค่าตัวละคร · System Prompt";
  }
  return codeLabels[key] ?? "HTML";
}

function previewDocument(snippet) {
  let html = editedCode(snippet, "html");
  const sampleValues = ["ตัวอย่างข้อความ", "ตัวอย่างสถานที่", "21:29", "29°C · มีเมฆมาก"];
  html = html.replace(/\$(\d+)/g, (_match, index) => sampleValues[Number(index) - 1] ?? "ตัวอย่าง");
  html = htmlWithBackground(snippet, html);

  const css = editedCode(snippet, "css");
  const isDirectEdit = visualEditEnabled ? visualEditEnabled.checked : false;
  const directEditStyles = isDirectEdit ? `
    [contenteditable="true"]:hover { outline: 1.5px dashed rgba(135,230,228,.65) !important; border-radius: 4px; cursor: text; }
    [contenteditable="true"]:focus { outline: 2px solid rgba(135,230,228,.9) !important; border-radius: 4px; background: rgba(135,230,228,.1); cursor: text; }
  ` : "";

  const values = fieldValues(snippet);
  const fieldsMapping = currentFields.map((f) => ({
    id: f.id,
    token: f.token || f.original || f.value,
    value: values[f.id] ?? f.value,
  }));

  const directEditScript = isDirectEdit ? `
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const fieldsList = ${JSON.stringify(fieldsMapping)};
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (parent && !parent.closest('script,style,template,noscript')) {
          const text = node.nodeValue.trim();
          if (text) {
            parent.setAttribute('contenteditable', 'true');
            parent.setAttribute('spellcheck', 'false');
            parent.title = 'คลิกเพื่อพิมพ์แก้ข้อความนี้ได้โดยตรง (จะซิงค์กับ Quick Edit และโค้ดทันที)';
            
            const matched = fieldsList.find((f) => f.value === text || f.token === text || text.includes(f.value) || (f.token && text.includes(f.token)));
            if (matched && !parent.dataset.fieldId) {
              parent.dataset.fieldId = matched.id;
              parent.dataset.token = matched.token;
            }
          }
        }
      }

      document.body.addEventListener('input', (e) => {
        const target = e.target.closest('[contenteditable="true"]');
        const fieldId = target ? target.dataset.fieldId : null;
        const newText = target ? target.textContent.trim() : null;
        const token = target ? target.dataset.token : null;

        const root = document.body.firstElementChild;
        if (root) {
          const clone = root.cloneNode(true);
          clone.querySelectorAll('[contenteditable]').forEach((el) => {
            el.removeAttribute('contenteditable');
            el.removeAttribute('spellcheck');
            el.removeAttribute('title');
            el.removeAttribute('data-field-id');
            el.removeAttribute('data-token');
          });
          window.parent.postMessage({
            type: 'PREVIEW_DIRECT_TEXT_INPUT',
            fieldId: fieldId,
            newText: newText,
            token: token,
            html: clone.outerHTML
          }, '*');
        }
      });
    });
  </script>` : "";

  return `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>
    *{box-sizing:border-box}html,body{min-height:100%;margin:0}body{padding:12px;background:#191d27;color:#f2f4fa;font-family:Arial,"Noto Sans Thai",sans-serif;overflow-x:hidden}img{max-width:100%}pre{white-space:pre-wrap;overflow-wrap:anywhere}
    ${directEditStyles}
    ${css}
  </style></head><body>${html}${directEditScript}</body></html>`;
}

function renderCodeTabs(snippet) {
  const available = availableCodeKeys(snippet);
  if (!available.length) available.push("html");
  if (!available.includes(activeCodeKey)) activeCodeKey = available[0];
  codeTabs.replaceChildren();
  for (const key of available) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-tab";
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(activeCodeKey === key));
    button.textContent = codeLabelFor(snippet, key);
    button.addEventListener("click", () => {
      activeCodeKey = key;
      updateCodePanel(snippet);
    });
    codeTabs.append(button);
  }
  codeFormatCount.textContent = `${available.length} ${available.length === 1 ? "FORMAT" : "FORMATS"}`;
  return available;
}

function updateCodePanel(snippet) {
  const available = availableCodeKeys(snippet);
  if (!available.includes(activeCodeKey)) activeCodeKey = available[0] ?? "html";
  for (const button of codeTabs.querySelectorAll(".code-tab")) {
    button.setAttribute("aria-selected", String(button.textContent === codeLabelFor(snippet, activeCodeKey)));
  }
  activeCodeLabel.textContent = codeLabelFor(snippet, activeCodeKey);
  let output = editedCode(snippet, activeCodeKey);
  if (activeCodeKey === "html") output = htmlWithBackground(snippet, output);
  codeOutput.textContent = output;
  if (codeEditorInput && document.activeElement !== codeEditorInput) {
    codeEditorInput.value = output;
  }
  const background = backgroundState(snippet);
  if (background.enabled && !background.url.trim()) {
    codeNote.textContent = "เปิดพื้นหลังการ์ดแล้ว วาง URL รูปภาพเพื่อให้พรีวิวและ HTML ที่คัดลอกมีพื้นหลัง";
  } else if (isRubiiHtmlSnippet(snippet) && activeCodeKey === "settings") {
    codeNote.textContent = "คำสั่ง Markdown พร้อมตัวอย่าง Output จริง; เปลี่ยนตามแท็กและช่องข้อมูลที่เลือก";
  } else if (isRubiiHtmlSnippet(snippet) && activeCodeKey === "regex") {
    codeNote.textContent = "กฎแสดงตามลำดับที่ตั้งไว้; ช่อง $1–$33 มาจากรายการที่เลือก และ Regex เพิ่มเติมทำงานในจุดที่ระบุ";
  } else if (isRubiiHtmlSnippet(snippet) && activeCodeKey === "template") {
    codeNote.textContent = "HTML แม่แบบสำหรับ Style tag (ใช้คู่กับ CSS ส่วนกลางใน Rubii); $1 แทนข้อมูลช่องที่เลือก";
  } else if (isRubiiHtmlSnippet(snippet) && activeCodeKey === "output") {
    codeNote.textContent = "แสดงเฉพาะค่าที่โมเดลใส่ในแท็กก่อนแปลง ไม่ใช่การ์ดสำเร็จรูป; แทนค่าทดสอบด้วยข้อมูลจริงและคั่นหลายค่าด้วย ||";
  } else if (isRubiiHtmlSnippet(snippet) && activeCodeKey === "html") {
    codeNote.textContent = "HTML ต้นฉบับที่มี inline style ครบถ้วน; สามารถคัดลอกไปใช้เป็น Style tag เดี่ยว ๆ ใน Rubii ได้โดยไม่ต้องใส่ CSS ส่วนกลาง";
  } else if (activeCodeKey === "html" && !snippet.code.css && /\bstyle\s*=/.test(snippet.code.html ?? "")) {
    codeNote.textContent = "สไตล์ของตัวอย่างนี้อยู่ใน inline style ภายใน HTML ที่คัดลอกได้";
  } else if (isRubiiHtmlSnippet(snippet) && activeCodeKey === "css") {
    codeNote.textContent = "CSS สร้างจาก inline style; การแก้ช่องนี้เป็น override พรีวิวอาจเห็นพื้นหลังจาก inline style แต่ CSS ที่คัดลอกอาจไม่มี rule นั้น";
  } else {
    codeNote.textContent = "แก้ค่าด่วนหรือโค้ดในส่วนย่อยแล้ว โค้ดรวมที่คัดลอกจะอัปเดตตามทันที";
  }
}

function renderPreview(snippet) {
  previewFrame.srcdoc = previewDocument(snippet);
}

function renderDetail(items) {
  const snippet = snippets.find((item) => item.id === selectedSnippetId);
  if (!snippet || !items.some((item) => item.id === snippet.id)) {
    detailContent.hidden = true;
    loadingState.hidden = true;
    errorState.hidden = true;
    document.querySelector("#no-results-state").hidden = items.length > 0;
    return;
  }

  document.querySelector("#no-results-state").hidden = true;
  detailContent.hidden = false;
  loadingState.hidden = true;
  errorState.hidden = true;
  const category = categoryFor(snippet.categoryId);
  if (lastCodeSnippetId !== snippet.id) {
    activeCodeKey = isRubiiHtmlSnippet(snippet) ? "template" : "html";
    lastCodeSnippetId = snippet.id;
  }
  detailCategory.textContent = category?.title ?? "ตัวอย่าง";
  detailTitle.textContent = snippet.title;
  detailSummary.textContent = snippet.summary;
  const index = items.findIndex((item) => item.id === snippet.id);
  detailPosition.textContent = `${String(index + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
  previousButton.disabled = index <= 0;
  nextButton.disabled = index < 0 || index >= items.length - 1;

  buildFieldEditor(snippet);
  renderCodeTabs(snippet);
  updateCodePanel(snippet);
  renderPreview(snippet);
}

function render() {
  renderCategories();
  const items = visibleSnippets();
  if (!items.some((item) => item.id === selectedSnippetId)) selectedSnippetId = items[0]?.id ?? "";
  renderSnippetList(items);
  renderDetail(items);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 1800);
}

async function copyActiveCode() {
  const content = codeEditorInput ? codeEditorInput.value : (codeOutput.textContent ?? "");
  await copyText(content, "คัดลอกโค้ดแล้ว");
}

async function copyText(content, successMessage) {
  try {
    await navigator.clipboard.writeText(content);
    showToast(successMessage);
  } catch {
    const temporary = document.createElement("textarea");
    temporary.value = content;
    temporary.setAttribute("readonly", "");
    temporary.style.position = "fixed";
    temporary.style.opacity = "0";
    document.body.append(temporary);
    temporary.select();
    const copied = document.execCommand("copy");
    temporary.remove();
    showToast(copied ? successMessage : "คัดลอกไม่สำเร็จ ลองเลือกโค้ดแล้วคัดลอก");
  }
}

function moveSelection(direction) {
  const items = visibleSnippets();
  const currentIndex = items.findIndex((item) => item.id === selectedSnippetId);
  const nextIndex = currentIndex + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return;
  selectedSnippetId = items[nextIndex].id;
  render();
}

searchInput.addEventListener("input", render);
categorySelect.addEventListener("change", () => {
  selectedCategoryId = categorySelect.value;
  render();
});
fieldList.addEventListener("input", (event) => {
  const input = event.target.closest("input[data-field-id]");
  if (!input) return;
  const snippet = snippets.find((item) => item.id === selectedSnippetId);
  if (!snippet) return;
  const values = fieldValues(snippet);
  const fieldId = input.dataset.fieldId;
  const prevVal = values[fieldId];
  const nextVal = input.value;
  values[fieldId] = nextVal;

  if (customCodeBySnippet.has(snippet.id) && customCodeBySnippet.get(snippet.id)["html"]) {
    let customHtml = customCodeBySnippet.get(snippet.id)["html"];
    if (prevVal && customHtml.includes(prevVal)) {
      customHtml = customHtml.split(prevVal).join(nextVal);
      customCodeBySnippet.get(snippet.id)["html"] = customHtml;
    }
  }

  updateCodePanel(snippet);
  renderPreview(snippet);
});
backgroundEnabled.addEventListener("change", () => {
  const snippet = snippets.find((item) => item.id === selectedSnippetId);
  if (!snippet) return;
  const state = backgroundState(snippet);
  state.enabled = backgroundEnabled.checked;
  const urlField = document.querySelector(".background-url-field");
  if (urlField) urlField.hidden = !state.enabled;
  updateCodePanel(snippet);
  renderPreview(snippet);
});
backgroundUrl.addEventListener("input", () => {
  const snippet = snippets.find((item) => item.id === selectedSnippetId);
  if (!snippet) return;
  backgroundState(snippet).url = backgroundUrl.value;
  updateCodePanel(snippet);
  renderPreview(snippet);
});
rubiiSlotSelect.addEventListener("change", () => {
  const snippet = snippets.find((item) => item.id === selectedSnippetId);
  if (!snippet || !isRubiiHtmlSnippet(snippet)) return;
  const state = rubiiSettingsBySnippet.get(snippet.id) ?? {};
  state.slotId = rubiiSlotSelect.value;
  rubiiSettingsBySnippet.set(snippet.id, state);
  updateCodePanel(snippet);
});
rubiiSlotControls.addEventListener("change", (event) => {
  const snippet = snippets.find((item) => item.id === selectedSnippetId);
  if (!snippet || !isRubiiHtmlSnippet(snippet)) return;
  const checkbox = event.target.closest("input[data-regex-slot-id]");
  if (!checkbox) {
    const field = event.target.closest("[data-regex-rule-field]");
    if (!field) return;
    const state = rubiiSettingsBySnippet.get(snippet.id) ?? {};
    const ruleCard = field.closest("[data-regex-rule-id]");
    const rule = state.extraRegexRules?.find((item) => item.id === ruleCard?.dataset.regexRuleId);
    if (!rule) return;
    rule[field.dataset.regexRuleField] = field.value;
    rubiiSettingsBySnippet.set(snippet.id, state);
    updateCodePanel(snippet);
    return;
  }
  const state = rubiiSettingsBySnippet.get(snippet.id) ?? {};
  const { slots } = rubiiTextSlots(assembleRawHtml(snippet));
  const checked = new Set([...rubiiRegexCaptureList.querySelectorAll("input[data-regex-slot-id]:checked")].map((input) => input.dataset.regexSlotId));
  state.regexSlotIds = slots.filter((slot) => checked.has(slot.id)).slice(0, maxRegexCaptures).map((slot) => slot.id);
  rubiiSettingsBySnippet.set(snippet.id, state);
  renderRubiiSlotControls(snippet);
  updateCodePanel(snippet);
});
rubiiSlotControls.addEventListener("input", (event) => {
  const field = event.target.closest("[data-regex-rule-field]");
  if (!field) return;
  const snippet = snippets.find((item) => item.id === selectedSnippetId);
  if (!snippet || !isRubiiHtmlSnippet(snippet)) return;
  const state = rubiiSettingsBySnippet.get(snippet.id) ?? {};
  const ruleCard = field.closest("[data-regex-rule-id]");
  const rule = state.extraRegexRules?.find((item) => item.id === ruleCard?.dataset.regexRuleId);
  if (!rule) return;
  rule[field.dataset.regexRuleField] = field.value;
  rubiiSettingsBySnippet.set(snippet.id, state);
  updateCodePanel(snippet);
});
rubiiSlotControls.addEventListener("click", (event) => {
  const snippet = snippets.find((item) => item.id === selectedSnippetId);
  if (!snippet || !isRubiiHtmlSnippet(snippet)) return;
  const state = rubiiSettingsBySnippet.get(snippet.id) ?? {};
  if (event.target.closest("#add-regex-fallback-button")) {
    const source = htmlWithBackground(snippet, assembleRawHtml(snippet));
    const { slots } = rubiiTextSlots(source);
    const regexSlots = (state.regexSlotIds ?? []).map((id) => slots.find((slot) => slot.id === id)).filter(Boolean).slice(0, maxRegexCaptures);
    if (!regexSlots.length) return;
    const tagValue = fieldValues(snippet).rubiiTagName;
    const tagName = /^[A-Za-z][A-Za-z0-9_-]*$/.test(tagValue ?? "") ? tagValue : defaultRubiiTagName(snippet);
    const format = regexFallbackFormat?.value ?? "pipe";
    const formatLabels = { pipe: "คั่นด้วย |", comma: "คั่นด้วย ,", newline: "ขึ้นบรรทัดใหม่" };
    const baseName = `รูปแบบสำรอง: ${formatLabels[format] ?? formatLabels.pipe}`;
    const existingNames = new Set((state.extraRegexRules ?? []).map((rule) => rule.name));
    let name = baseName;
    let suffix = 2;
    while (existingNames.has(name)) name = `${baseName} ${suffix++}`;
    state.extraRegexRules ??= [];
    state.extraRegexRules.push({
      id: `regex-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      stage: "raw",
      generatedFormat: format,
    });
    rubiiSettingsBySnippet.set(snippet.id, state);
    renderRubiiSlotControls(snippet);
    updateCodePanel(snippet);
    return;
  }
  if (event.target.closest("#add-regex-rule-button")) {
    state.extraRegexRules ??= [];
    const existingNames = new Set(state.extraRegexRules.map((rule) => rule.name));
    let nextNameIndex = 1;
    while (existingNames.has(`Regex เพิ่มเติม ${nextNameIndex}`)) nextNameIndex += 1;
    state.extraRegexRules.push({
      id: `regex-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: `Regex เพิ่มเติม ${nextNameIndex}`,
      stage: "raw",
      pattern: "",
      replacement: "",
    });
    rubiiSettingsBySnippet.set(snippet.id, state);
    renderRubiiSlotControls(snippet);
    updateCodePanel(snippet);
    return;
  }
  const removeButton = event.target.closest("[data-remove-regex-rule]");
  const moveButton = event.target.closest("[data-move-regex-rule]");
  if (moveButton) {
    const rules = state.extraRegexRules ?? [];
    const index = rules.findIndex((rule) => rule.id === moveButton.dataset.moveRegexRule);
    const nextIndex = index + Number(moveButton.dataset.direction);
    if (index < 0 || nextIndex < 0 || nextIndex >= rules.length) return;
    [rules[index], rules[nextIndex]] = [rules[nextIndex], rules[index]];
    state.extraRegexRules = rules;
  } else if (removeButton) {
    state.extraRegexRules = (state.extraRegexRules ?? []).filter((rule) => rule.id !== removeButton.dataset.removeRegexRule);
  } else {
    return;
  }
  rubiiSettingsBySnippet.set(snippet.id, state);
  renderRubiiSlotControls(snippet);
  updateCodePanel(snippet);
});
if (quickEditTabs) {
  quickEditTabs.addEventListener("click", (event) => {
    const tabBtn = event.target.closest(".quick-edit-tab");
    if (!tabBtn || !tabBtn.dataset.quickTab) return;
    const targetTab = tabBtn.dataset.quickTab;
    applyQuickEditFilter(targetTab);
  });
}
if (visualEditEnabled) {
  visualEditEnabled.addEventListener("change", () => {
    const snippet = snippets.find((item) => item.id === selectedSnippetId);
    if (snippet) renderPreview(snippet);
  });
}
copyButton.addEventListener("click", copyActiveCode);
previousButton.addEventListener("click", () => moveSelection(-1));
nextButton.addEventListener("click", () => moveSelection(1));
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
    event.preventDefault();
    searchInput.focus();
  }
});

async function start() {
  try {
    const [categoriesRes, snippetsRes] = await Promise.all([
      fetch("./data/snippet-categories.json"),
      fetch("./data/snippets.json")
    ]);
    if (categoriesRes.ok && snippetsRes.ok) {
      const rawCategories = await categoriesRes.json();
      const rawSnippets = await snippetsRes.json();
      categories = rawCategories.sort((a, b) => a.order - b.order);
      const order = new Map(categories.map((category, index) => [category.id, index]));
      snippets = rawSnippets.sort((a, b) => (order.get(a.categoryId) ?? 99) - (order.get(b.categoryId) ?? 99));
    } else {
      const response = await fetch("/v1/snippets");
      if (!response.ok) throw new Error(`Snippet catalog request failed: ${response.status}`);
      const result = await response.json();
      categories = result.data.categories.sort((a, b) => a.order - b.order);
      const order = new Map(categories.map((category, index) => [category.id, index]));
      snippets = result.data.snippets.sort((a, b) => (order.get(a.categoryId) ?? 99) - (order.get(b.categoryId) ?? 99));
    }
    totalCount.textContent = snippets.length;
    selectedCategoryId = "all";
    loadingState.hidden = true;
    render();
  } catch (err) {
    console.error(err);
    loadingState.hidden = true;
    errorState.hidden = false;
  }
}

start();

if (codeEditorInput) {
  codeEditorInput.addEventListener("input", () => {
    const snippet = snippets.find((item) => item.id === selectedSnippetId);
    if (!snippet) return;
    const newCode = codeEditorInput.value;
    codeOutput.textContent = newCode;
    if (!customCodeBySnippet.has(snippet.id)) customCodeBySnippet.set(snippet.id, {});
    customCodeBySnippet.get(snippet.id)[activeCodeKey] = newCode;

    if (activeCodeKey === "html") {
      htmlPartsBySnippet.set(snippet.id, splitHtmlIntoParts(newCode));
      renderHtmlParts(snippet);
      renderPreview(snippet);
    } else if (activeCodeKey === "css") {
      renderPreview(snippet);
    }
  });
}

if (resetCodeButton) {
  resetCodeButton.addEventListener("click", () => {
    const snippet = snippets.find((item) => item.id === selectedSnippetId);
    if (!snippet) return;
    editValuesBySnippet.delete(snippet.id);
    backgroundBySnippet.delete(snippet.id);
    htmlPartsBySnippet.delete(snippet.id);
    rubiiSettingsBySnippet.delete(snippet.id);
    customCodeBySnippet.delete(snippet.id);

    buildFieldEditor(snippet);
    renderHtmlParts(snippet);
    renderBackgroundControls(snippet);
    renderRubiiSlotControls(snippet);
    renderCodeTabs(snippet);
    updateCodePanel(snippet);
    renderPreview(snippet);
    showToast("รีเซ็ตโค้ดและการตั้งค่าทั้งหมดกลับเป็นค่าเริ่มต้นแล้ว");
  });
}


// Two-way Direct Visual Edit synchronization and persistence
window.addEventListener("message", (event) => {
  if (event.data?.type === "PREVIEW_DIRECT_TEXT_INPUT" && event.data.html) {
    const snippet = snippets.find((item) => item.id === selectedSnippetId);
    if (!snippet) return;

    const { fieldId, newText, html } = event.data;
    const values = fieldValues(snippet);

    // 1. Update matching Quick Edit field value and input element
    if (fieldId && newText !== null) {
      values[fieldId] = newText;
      const input = document.querySelector(`#field-${fieldId}`);
      if (input && input.value !== newText) {
        input.value = newText;
      }

      const colorInfo = parseColorInfo(newText);
      if (colorInfo) {
        const row = input ? input.closest(".field-row") : null;
        if (row) {
          const picker = row.querySelector(".field-color-picker");
          if (picker) picker.value = colorInfo.hex;
          const badge = row.querySelector(".field-color-badge");
          if (badge) badge.textContent = `RGBA ${colorInfo.alphaPercent}%`;
          const opacitySlider = row.querySelector(".field-opacity-slider");
          if (opacitySlider) opacitySlider.value = String(colorInfo.alphaPercent);
          const opacityNumber = row.querySelector(".field-opacity-number");
          if (opacityNumber) opacityNumber.value = String(colorInfo.alphaPercent);
        }
      }
    }

    // 2. Clean temporary preview background overlay if present
    let cleanHtml = html;
    const bgState = backgroundState(snippet);
    if (bgState.enabled && bgState.url.trim()) {
      const cssUrl = bgState.url.trim().replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/[\r\n\f]/g, "");
      const additions = `background-image:url('${cssUrl}');background-size:cover;background-position:center;background-repeat:no-repeat;`;
      cleanHtml = cleanHtml.split(additions).join("");
    }

    if (!customCodeBySnippet.has(snippet.id)) customCodeBySnippet.set(snippet.id, {});
    customCodeBySnippet.get(snippet.id)["html"] = cleanHtml;

    // Update HTML parts and rubii settings
    htmlPartsBySnippet.set(snippet.id, splitHtmlIntoParts(cleanHtml));

    // Refresh UI parts without losing user focus
    const wasHtmlOpen = htmlPartsPanel ? htmlPartsPanel.open : false;
    renderHtmlParts(snippet);
    if (htmlPartsPanel) htmlPartsPanel.open = wasHtmlOpen;

    renderRubiiSlotControls(snippet);
    updateCodePanel(snippet);
  }
});
