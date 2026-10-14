
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

function escapeHtml(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

let uiStrings = {};
let appStrings = {};
const pageLanguage = (document.documentElement.lang || "th").toLowerCase();
const pageLanguageSlug = ({
  en: "en",
  vi: "vi",
  "zh-hans": "zh",
  "zh-hant": "zh-hant",
})[pageLanguage] ?? "th";
// Thai bank-branded examples are only relevant in the Thai-language library.
// Keep generic transfer receipts and international payment examples available in other locales.
const THAILAND_ONLY_BANK_SNIPPET_IDS = new Set([
  "snippet-26", // K PLUS
  "snippet-27", // SCB Easy
  "snippet-28", // Krungthai NEXT
  "snippet-29", // Krungsri KMA
  "snippet-36", // Thai Transfer Receipt
  "snippet-38", // KBANK Vertical E-Slip
  "snippet-39", // SCB Vertical E-Slip
  "snippet-40", // Krungthai Vertical E-Slip
  "snippet-41", // Krungsri Vertical E-Slip
]);
function pageLanguageSlugLocale() {
  return ({
    th: "th-TH",
    en: "en-US",
    vi: "vi-VN",
    zh: "zh-CN",
    "zh-hant": "zh-TW",
  })[pageLanguageSlug] ?? "th-TH";
}

function t(key, params = {}) {
  const value = uiStrings[key];
  if (typeof value !== "string") {
    console.error(`Missing UI translation: ${key} (${pageLanguageSlug})`);
    return `⟦${key}⟧`;
  }
  return value.replace(/\{([a-zA-Z][\w]*)\}/g, (match, name) =>
    Object.hasOwn(params, name) ? String(params[name]) : match
  );
}

function translateAppValue(value) {
  if ((pageLanguageSlug !== "en" && pageLanguageSlug !== "vi") || typeof value !== "string") return value;
  const leading = value.match(/^\s*/u)?.[0] ?? "";
  const trailing = value.match(/\s*$/u)?.[0] ?? "";
  const content = value.slice(leading.length, value.length - trailing.length || undefined);
  let translated = appStrings.text?.[content];
  if (translated === undefined) {
    const rules = pageLanguageSlug === "vi" ? [
      [/^ตรวจดู · (.+)$/u, (_match, label) => `Cần xem lại · ${translateAppValue(label)}`],
      [/^ค่าสถานะ \((.+)\)$/u, (_match, label) => `Trạng thái (${translateAppValue(label)})`],
      [/^ค่า (.+)$/u, (_match, label) => `Giá trị ${translateAppValue(label)}`],
      [/^สีพื้นหลัง(.+)$/u, (_match, label) => `Màu nền · ${translateAppValue(label)}`],
      [/^สีเส้นขอบ(.+)$/u, (_match, label) => `Màu viền · ${translateAppValue(label)}`],
      [/^Regex เพิ่มเติม (\d+)$/u, (_match, number) => `Regex bổ sung ${number}`],
      [/^ชื่อ Regex เพิ่มเติม (\d+)$/u, (_match, number) => `Tên Regex bổ sung ${number}`],
      [/^จุดทำงานของ Regex (\d+)$/u, (_match, number) => `Vị trí chạy Regex ${number}`],
      [/^ตัวคั่นของ Regex สำรอง (\d+)$/u, (_match, number) => `Dấu phân tách Regex dự phòng ${number}`],
      [/^เลื่อนกฎขึ้น: (.+)$/u, (_match, label) => `Chuyển quy tắc lên: ${translateAppValue(label)}`],
      [/^เลื่อนกฎลง: (.+)$/u, (_match, label) => `Chuyển quy tắc xuống: ${translateAppValue(label)}`],
      [/^ช่องที่ (\d+)$/u, (_match, number) => `Trường ${number}`],
      [/^URL รูปไอคอน\/รูปภาพ (\d+)$/u, (_match, number) => `URL biểu tượng/hình ảnh ${number}`],
      [/^โครงสร้าง <([a-z\d-]+)>$/iu, (_match, tag) => `Cấu trúc <${tag}>`],
      [/^ส่วนที่ (\d+)$/u, (_match, number) => `Phần ${number}`],
      [/^ค่า (\d+)$/u, (_match, number) => `Giá trị ${number}`]
    ] : [
      [/^ตรวจดู · (.+)$/u, (_match, label) => `Review · ${translateAppValue(label)}`],
      [/^ค่าสถานะ \((.+)\)$/u, (_match, label) => `Status (${translateAppValue(label)})`],
      [/^ค่า (.+)$/u, (_match, label) => `Value ${translateAppValue(label)}`],
      [/^สีพื้นหลัง(.+)$/u, (_match, label) => `Background color · ${translateAppValue(label)}`],
      [/^สีเส้นขอบ(.+)$/u, (_match, label) => `Border color · ${translateAppValue(label)}`],
      [/^Regex เพิ่มเติม (\d+)$/u, (_match, number) => `Additional Regex ${number}`],
      [/^ชื่อ Regex เพิ่มเติม (\d+)$/u, (_match, number) => `Additional Regex name ${number}`],
      [/^จุดทำงานของ Regex (\d+)$/u, (_match, number) => `Regex stage ${number}`],
      [/^ตัวคั่นของ Regex สำรอง (\d+)$/u, (_match, number) => `Fallback Regex delimiter ${number}`],
      [/^เลื่อนกฎขึ้น: (.+)$/u, (_match, label) => `Move rule up: ${translateAppValue(label)}`],
      [/^เลื่อนกฎลง: (.+)$/u, (_match, label) => `Move rule down: ${translateAppValue(label)}`],
      [/^ช่องที่ (\d+)$/u, (_match, number) => `Field ${number}`],
      [/^URL รูปไอคอน\/รูปภาพ (\d+)$/u, (_match, number) => `Icon/image URL ${number}`],
      [/^โครงสร้าง <([a-z\d-]+)>$/iu, (_match, tag) => `<${tag}> structure`],
      [/^ส่วนที่ (\d+)$/u, (_match, number) => `Section ${number}`],
      [/^ค่า (\d+)$/u, (_match, number) => `Value ${number}`]
    ];
    for (const [pattern, replace] of rules) {
      const match = content.match(pattern);
      if (match) {
        translated = replace(...match);
        break;
      }
    }
  }
  return typeof translated === "string" ? `${leading}${translated}${trailing}` : value;
}

function localizeAppTextNode(node) {
  const parent = node.parentElement;
  if (!parent || parent.closest("script,style,textarea,input,[contenteditable='true']")) return;
  const original = node.nodeValue;
  const translated = translateAppValue(original);
  if (translated !== original) node.nodeValue = translated;
}

function localizeAppElement(element) {
  if (!(element instanceof Element)) return;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) localizeAppTextNode(node);
  for (const current of [element, ...element.querySelectorAll("*")]) {
    for (const attribute of ["title", "aria-label", "placeholder"]) {
      if (!current.hasAttribute(attribute)) continue;
      const value = current.getAttribute(attribute);
      const translated = translateAppValue(value);
      if (translated !== value) current.setAttribute(attribute, translated);
    }
  }
}

function enableAppLocalization() {
  if ((pageLanguageSlug !== "en" && pageLanguageSlug !== "vi") || !document.body) return;
  localizeAppElement(document.body);
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "characterData") localizeAppTextNode(record.target);
      else if (record.type === "attributes") localizeAppElement(record.target);
      else for (const node of record.addedNodes) {
        if (node.nodeType === Node.TEXT_NODE) localizeAppTextNode(node);
        else if (node.nodeType === Node.ELEMENT_NODE) localizeAppElement(node);
      }
    }
  });
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["title", "aria-label", "placeholder"]
  });
}

function highlightSnippetCode(code, activeTab = "template") {
  if (!code || typeof code !== "string") return "";

  const TOKEN_REGEX = /(<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/)|(\{\{(?:user|char)\}\})|(\$\d+)|(\|\|)|(!important\b)|(https?:\/\/[^\s"'<>]+)|(<\/?[a-zA-Z0-9:-]+|\/?>)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b[a-zA-Z0-9_-]+(?=\s*=))|(\b[a-zA-Z-]+(?=\s*:))|(#(?:[0-9a-fA-F]{3,8})\b|rgba?\([^)]*\))|(\b\d+(?:\.\d+)?(?:px|%|em|rem|deg|s|ms)\b)/gi;

  let lastIndex = 0;
  let result = "";
  let match;

  while ((match = TOKEN_REGEX.exec(code)) !== null) {
    const textBefore = code.slice(lastIndex, match.index);
    if (textBefore) {
      result += escapeHtml(textBefore);
    }
    lastIndex = TOKEN_REGEX.lastIndex;

    const [
      fullMatch,
      comment,
      macro,
      variable,
      delimiter,
      important,
      url,
      tag,
      str,
      attr,
      cssProp,
      color,
      numberUnit
    ] = match;

    if (comment) {
      result += `<span class="tok-comment">${escapeHtml(comment)}</span>`;
    } else if (macro) {
      const isUser = /user/i.test(macro);
      result += `<span class="tok-macro ${isUser ? "tok-macro-user" : "tok-macro-char"}">${escapeHtml(macro)}</span>`;
    } else if (variable) {
      const num = parseInt(variable.slice(1), 10);
      const idx = ((num - 1) % 8) + 1;
      result += `<span class="tok-var tok-var-${idx}">${escapeHtml(variable)}</span>`;
    } else if (delimiter) {
      result += `<span class="tok-delimiter">||</span>`;
    } else if (important) {
      result += `<span class="tok-important">!important</span>`;
    } else if (url) {
      result += `<span class="tok-url">${escapeHtml(url)}</span>`;
    } else if (tag) {
      result += `<span class="tok-tag">${escapeHtml(tag)}</span>`;
    } else if (str) {
      const innerContent = str.slice(1, -1);
      const quote = str[0];
      const innerHighlighted = highlightSnippetCode(innerContent, activeTab);
      result += `<span class="tok-string-quote">${quote}</span><span class="tok-string">${innerHighlighted}</span><span class="tok-string-quote">${quote}</span>`;
    } else if (attr) {
      result += `<span class="tok-attr">${escapeHtml(attr)}</span>`;
    } else if (cssProp) {
      result += `<span class="tok-property">${escapeHtml(cssProp)}</span>`;
    } else if (color) {
      result += `<span class="tok-color">${escapeHtml(color)}</span>`;
    } else if (numberUnit) {
      result += `<span class="tok-number">${escapeHtml(numberUnit)}</span>`;
    } else {
      result += escapeHtml(fullMatch);
    }
  }

  const remaining = code.slice(lastIndex);
  if (remaining) {
    result += escapeHtml(remaining);
  }

  return result;
}

function renderHighlightedCode(code, activeTab) {
  if (codeHighlightLayer) {
    codeHighlightLayer.innerHTML = highlightSnippetCode(code, activeTab);
  }
}

function splitGradientArgs(content) {
  const args = [];
  let depth = 0;
  let current = "";
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === "(") depth++;
    else if (char === ")") depth = Math.max(0, depth - 1);
    
    if (char === "," && depth === 0) {
      args.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    args.push(current.trim());
  }
  return args;
}

function parseGradientInfo(value) {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  const hasImportant = /!important\s*$/i.test(trimmed);
  const cleanVal = trimmed.replace(/!important/gi, "").trim();

  const match = cleanVal.match(/^linear-gradient\(\s*([\s\S]+)\s*\)$/i);
  if (!match) return null;

  const rawArgs = splitGradientArgs(match[1]);
  if (rawArgs.length < 2) return null;

  let angle = "135deg";
  let stop1Raw = "";
  let stop2Raw = "";

  const isAngle = /^(to\s+|\d+(\.\d+)?(deg|grad|rad|turn)$)/i.test(rawArgs[0]);
  if (isAngle) {
    angle = rawArgs[0];
    stop1Raw = rawArgs[1] || "";
    stop2Raw = rawArgs[2] || rawArgs[1] || "";
  } else {
    stop1Raw = rawArgs[0] || "";
    stop2Raw = rawArgs[1] || rawArgs[0] || "";
  }

  const cleanStop1 = stop1Raw.replace(/\s+\d+(\.\d+)?(%|px|em|rem)$/i, "").trim();
  const cleanStop2 = stop2Raw.replace(/\s+\d+(\.\d+)?(%|px|em|rem)$/i, "").trim();

  const info1 = parseColorInfo(cleanStop1) || { hex: "#ffffff", alphaPercent: 20, alpha: 0.2 };
  const info2 = parseColorInfo(cleanStop2) || { hex: "#ffffff", alphaPercent: 5, alpha: 0.05 };

  return {
    type: "linear-gradient",
    hasImportant,
    angle,
    stop1: info1,
    stop2: info2,
    format: (angleVal, hex1, alphaPercent1, hex2, alphaPercent2) => {
      const a1 = (Math.max(0, Math.min(100, Number(alphaPercent1))) / 100).toFixed(2);
      const a2 = (Math.max(0, Math.min(100, Number(alphaPercent2))) / 100).toFixed(2);
      const rgba1 = hexToRgbaString(hex1, a1);
      const rgba2 = hexToRgbaString(hex2, a2);
      const core = `linear-gradient(${angleVal}, ${rgba1}, ${rgba2})`;
      return hasImportant ? `${core}!important` : core;
    }
  };
}

function parseColorInfo(value) {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.toLowerCase().startsWith("linear-gradient(")) {
    return parseGradientInfo(trimmed);
  }
  const hasImportant = /!important\s*$/i.test(trimmed);
  const cleanVal = trimmed.replace(/!important/gi, "").trim();
  
  // 1. Tuple like (255, 255, 255, 0.08) or (255,255,255)
  const tupleMatch = cleanVal.match(/^\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([\d.]+)\s*)?\)$/);
  if (tupleMatch) {
    const r = Math.min(255, parseInt(tupleMatch[1], 10));
    const g = Math.min(255, parseInt(tupleMatch[2], 10));
    const b = Math.min(255, parseInt(tupleMatch[3], 10));
    const alpha = tupleMatch[4] !== undefined ? tupleMatch[4] : null;
    const hex = "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
    return {
      type: "tuple",
      hasImportant,
      r, g, b, alpha,
      alphaPercent: alpha !== null ? Math.round(Number(alpha) * 100) : 100,
      hex,
      format: (newHex, newAlpha) => {
        const nr = parseInt(newHex.slice(1, 3), 16);
        const ng = parseInt(newHex.slice(3, 5), 16);
        const nb = parseInt(newHex.slice(5, 7), 16);
        const a = newAlpha !== undefined ? newAlpha : (alpha !== null ? alpha : null);
        const core = a !== null ? `(${nr},${ng},${nb},${a})` : `(${nr},${ng},${nb})`;
        return hasImportant ? `${core}!important` : core;
      },
      withAlphaPercent: (percent) => {
        const a = Number((Math.max(0, Math.min(100, Number(percent))) / 100).toFixed(2));
        const core = `(${r},${g},${b},${a})`;
        return hasImportant ? `${core}!important` : core;
      }
    };
  }

  // 2. rgba(...) or rgb(...)
  const rgbMatch = cleanVal.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([\d.]+)\s*)?\)$/i);
  if (rgbMatch) {
    const r = Math.min(255, parseInt(rgbMatch[1], 10));
    const g = Math.min(255, parseInt(rgbMatch[2], 10));
    const b = Math.min(255, parseInt(rgbMatch[3], 10));
    const isRgba = cleanVal.toLowerCase().startsWith("rgba") || rgbMatch[4] !== undefined;
    const alpha = rgbMatch[4] !== undefined ? rgbMatch[4] : (isRgba ? "1" : null);
    const hex = "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
    return {
      type: isRgba ? "rgba" : "rgb",
      hasImportant,
      r, g, b, alpha,
      alphaPercent: alpha !== null ? Math.round(Number(alpha) * 100) : 100,
      hex,
      format: (newHex, newAlpha) => {
        const nr = parseInt(newHex.slice(1, 3), 16);
        const ng = parseInt(newHex.slice(3, 5), 16);
        const nb = parseInt(newHex.slice(5, 7), 16);
        const a = newAlpha !== undefined ? newAlpha : alpha;
        const core = a !== null ? `rgba(${nr}, ${ng}, ${nb}, ${a})` : `rgb(${nr}, ${ng}, ${nb})`;
        return hasImportant ? `${core}!important` : core;
      },
      withAlphaPercent: (percent) => {
        const a = Number((Math.max(0, Math.min(100, Number(percent))) / 100).toFixed(2));
        const core = `rgba(${r}, ${g}, ${b}, ${a})`;
        return hasImportant ? `${core}!important` : core;
      }
    };
  }

  // 3. Hex code #rgb, #rgba, #rrggbb, #rrggbbaa
  const hexMatch = cleanVal.match(/^#([0-9a-f]{3,8})$/i);
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
      hasImportant,
      hex: "#" + hex.toLowerCase(),
      alpha,
      alphaPercent: alpha !== null ? Math.round(Number(alpha) * 100) : 100,
      format: (newHex, newAlpha) => {
        if (newAlpha !== undefined && Number(newAlpha) < 1) {
          const nr = parseInt(newHex.slice(1, 3), 16);
          const ng = parseInt(newHex.slice(3, 5), 16);
          const nb = parseInt(newHex.slice(5, 7), 16);
          const core = `rgba(${nr}, ${ng}, ${nb}, ${newAlpha})`;
          return hasImportant ? `${core}!important` : core;
        }
        return hasImportant ? `${newHex}!important` : newHex;
      },
      withAlphaPercent: (percent) => {
        const a = Number((Math.max(0, Math.min(100, Number(percent))) / 100).toFixed(2));
        if (a < 1) {
          const core = `rgba(${r}, ${g}, ${b}, ${a})`;
          return hasImportant ? `${core}!important` : core;
        }
        return hasImportant ? `#${hex}!important` : `#${hex}`;
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
const codeHighlightLayer = document.querySelector("#code-highlight-layer");
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
const tabCountTypography = document.querySelector("#tab-count-typography");
const tabCountStyle = document.querySelector("#tab-count-style");
const tabCountMedia = document.querySelector("#tab-count-media");
const quickTabMedia = document.querySelector("#quick-tab-media");
const quickTypographyControls = document.querySelector("#quick-typography-controls");
const quickTextColor = document.querySelector("#quick-text-color");
const quickTextColorPicker = document.querySelector("#quick-text-color-picker");
const quickFontWeight = document.querySelector("#quick-font-weight");
const quickFontStyle = document.querySelector("#quick-font-style");
const quickTextTransform = document.querySelector("#quick-text-transform");
const quickLetterSpacing = document.querySelector("#quick-letter-spacing");
const quickFontFamily = document.querySelector("#quick-font-family");
const quickTextShadow = document.querySelector("#quick-text-shadow");
const quickShadowColor = document.querySelector("#quick-shadow-color");
const quickShadowColorPicker = document.querySelector("#quick-shadow-color-picker");
const quickShadowBlur = document.querySelector("#quick-shadow-blur");
const quickShadowBlurBadge = document.querySelector("#quick-shadow-blur-badge");
const quickShadowOffset = document.querySelector("#quick-shadow-offset");
const quickShadowOffsetBadge = document.querySelector("#quick-shadow-offset-badge");
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
const fieldStylesBySnippet = new Map();
let lastCodeSnippetId = "";
window.snippetStudioHasUnsavedChanges = () =>
  customCodeBySnippet.size > 0 || editValuesBySnippet.size > 0 || backgroundBySnippet.size > 0 || rubiiSettingsBySnippet.size > 0 || fieldStylesBySnippet.size > 0;

function fieldStyles(snippet) {
  if (!snippet) return {};
  if (!fieldStylesBySnippet.has(snippet.id)) fieldStylesBySnippet.set(snippet.id, {});
  return fieldStylesBySnippet.get(snippet.id);
}

function getFieldStyle(snippet, fieldId) {
  const styles = fieldStyles(snippet);
  return styles[fieldId] || null;
}

function setFieldStyle(snippet, fieldId, newStyle) {
  const styles = fieldStyles(snippet);
  const current = styles[fieldId] || {};
  const merged = { ...current, ...newStyle };
  if (!merged.color && !merged.bgColor && !merged.bold) {
    delete styles[fieldId];
  } else {
    styles[fieldId] = merged;
  }
}

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
  const entries = [{ id: "all", title: t("library.allCategories"), count: snippets.filter((item) => matchesSearch(item, query)).length }];
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
    empty.textContent = t("library.noResults");
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
    subtitle.textContent = category?.title ?? t("library.snippet");
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

function getFieldSvgIcon(type) {
  switch (type) {
    case "text":
    case "color-text":
      return `<svg class="type-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>`;
    case "bg":
      return `<svg class="type-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" fill-opacity="0.38"/><rect x="3" y="3" width="18" height="18" rx="4"/></svg>`;
    case "border":
      return `<svg class="type-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" stroke-dasharray="3 3"/><path d="M3 9h18"/></svg>`;
    case "divider":
      return `<svg class="type-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="13" y2="6" stroke-dasharray="2 2"/></svg>`;
    case "shadow":
      return `<svg class="type-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="15" height="15" rx="3"/><path d="M7 19h12a2 2 0 0 0 2-2V7"/></svg>`;
    case "media":
      return `<svg class="type-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`;
    default:
      return `<svg class="type-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/></svg>`;
  }
}

function collectFields(snippet) {
  const fields = [];
  const codeText = Object.values(snippet.code ?? {}).filter(Boolean).join("\n");

  if (snippet.editable?.tagName) {
    fields.push({
      id: "tagName",
      kind: "tagName",
      label: "ชื่อแท็ก",
      propertyType: "text",
      value: snippet.editable.tagName,
      inputType: "text",
    });
  } else if (isRubiiHtmlSnippet(snippet)) {
    fields.push({
      id: "rubiiTagName",
      kind: "rubiiTagName",
      label: "ชื่อ Style tag ใน Rubii",
      propertyType: "text",
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

      // Direct text color property
      if (prop === "color") {
        const colorInfo = parseColorInfo(val);
        if (colorInfo && !seenPlaceholders.has(val)) {
          seenPlaceholders.add(val);
          let label = "สีข้อความหลัก (Text Color)";
          if (val.toLowerCase().includes("86868b") || val.toLowerCase().includes("secondary") || contextHint.includes("ป้าย") || contextHint.includes("โปรไฟล์")) {
            label = "สีข้อความรอง (Secondary Text Color)";
          }
          fields.push({
            id: `color-text-${fields.length}`,
            kind: "literal",
            token: val,
            label,
            propertyType: "color-text",
            value: val,
            inputType: "text",
          });
        }
        continue;
      }

      const colorRegex = /(?:linear-gradient\([^)]+\)|rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}|\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*[\d.]+\s*)?\))/gi;
      const colorMatches = val.matchAll(colorRegex);
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
        let propertyType = "bg";
        if (prop.startsWith("background")) {
          propertyType = "bg";
          label = isRoot ? "สีพื้นหลังการ์ดหลัก (Main BG)" : (contextHint ? `สีพื้นหลัง${contextHint}` : "สีพื้นหลังกล่อง (Box BG)");
        } else if (prop.startsWith("border-left") || prop.startsWith("border-right")) {
          propertyType = "divider";
          label = "สีเส้นคั่นข้าง / เส้นเน้น (Accent Line)";
        } else if (prop.startsWith("border-top") || prop.startsWith("border-bottom")) {
          propertyType = "divider";
          label = "สีเส้นคั่นแถบ / เส้นแบ่ง (Divider)";
        } else if (prop.startsWith("border")) {
          propertyType = "border";
          label = isRoot ? "สีเส้นขอบการ์ด (Card Border)" : (contextHint ? `สีเส้นขอบ${contextHint}` : "สีเส้นขอบกล่อง (Border)");
        } else if (prop.includes("shadow")) {
          propertyType = "shadow";
          label = "สีเงาตกกระทบ (Card Shadow)";
        } else if (prop === "color") {
          propertyType = "color-text";
          label = "สีข้อความ (Text Color)";
        }

        fields.push({
          id: `placeholder-${fields.length}`,
          kind: "literal",
          token,
          label,
          propertyType,
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
  const staticBlacklist = new Set(["THB", "TH", "USD", "GBP", "EUR", "ผู้โอน", "ผู้รับ", "Wallet", "PromptPay"]);
  for (const match of htmlWithoutStyles.matchAll(literalPattern)) {
    const token = match[0];
    if (seenPlaceholders.has(token)) continue;
    const content = token.slice(1, -1).trim();
    if (staticBlacklist.has(content)) continue;
    seenPlaceholders.add(token);

    let label = "ข้อความตัวอย่าง";
    if (content === "HH:MM" || content.startsWith("เวลา")) label = "เวลา (Time)";
    else if (content === "วัน") label = "วัน (Day)";
    else if (content === "วันที่") label = "วันที่ (Date)";
    else if (content.startsWith("เดือน/ปี")) label = "เดือน / ปี (Month/Year)";
    else if (content.startsWith("สถานที่")) label = "สถานที่ (Location)";
    else if (content.startsWith("สถานการณ์")) label = "สถานการณ์ / แจ้งเตือน (Status)";
    else if (content.startsWith("ข้อความ")) label = "ข้อความหลัก (Message)";
    else if (content.startsWith("ความคิด") || content.startsWith("มุมมอง")) label = "ความคิดเห็นเสริม (Comment)";
    else if (content.startsWith("จำนวนเงิน") || content.startsWith("ราคา") || /^[฿$£€¥]?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?$/.test(content)) label = "จำนวนเงิน (Amount)";
    else if (content.length <= 25) label = content;

    fields.push({
      id: `placeholder-${fields.length}`,
      kind: "literal",
      token,
      label,
      propertyType: "text",
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
        propertyType: "text",
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
      propertyType: "media",
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

  if (quickTypographyControls) {
    quickTypographyControls.hidden = !(tabKey === "all" || tabKey === "typography");
  }

  const rows = fieldList.querySelectorAll(".field-row");
  let visibleCount = 0;
  rows.forEach((row) => {
    const isMatch = tabKey === "all" || row.dataset.fieldCategory === tabKey;
    row.hidden = !isMatch;
    if (isMatch) visibleCount++;
  });

  const isSpecialVisible = (tabKey === "all" || tabKey === "typography");
  noFields.hidden = visibleCount > 0 || isSpecialVisible;
  if (visibleCount === 0 && !isSpecialVisible && currentFields.length > 0) {
    noFields.textContent = "ไม่มีรายการในหมวดหมู่นี้";
  } else if (currentFields.length === 0 && !isSpecialVisible) {
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
  let countTypography = 0;
  let countStyle = 0;
  let countMedia = 0;

  for (const field of currentFields) {
    const row = document.createElement("div");
    row.className = "field-row";
    
    const labelRow = document.createElement("div");
    labelRow.className = "field-label-row";
    
    const labelWrap = document.createElement("div");
    labelWrap.className = "field-label-wrap";

    const icon = document.createElement("span");
    icon.className = `field-type-icon icon-${field.propertyType || "text"}`;
    icon.innerHTML = getFieldSvgIcon(field.propertyType || "text");

    const label = document.createElement("label");
    label.htmlFor = `field-${field.id}`;
    label.textContent = field.label;

    labelWrap.append(icon, label);
    labelRow.append(labelWrap);
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
    } else if (field.propertyType === "color-text") {
      fieldCategory = "typography";
      countTypography++;
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
      labelRow.append(badge);

      const gradToggleBtn = document.createElement("button");
      gradToggleBtn.type = "button";
      gradToggleBtn.className = "field-gradient-toggle-btn";
      gradToggleBtn.title = "สลับระหว่างสีพื้นและสีไล่ระดับ (Linear Gradient)";
      gradToggleBtn.setAttribute("aria-label", "สลับโหมดสีไล่ระดับ");
      gradToggleBtn.innerHTML = `<svg class="ui-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg><span>Gradient</span>`;
      labelRow.append(gradToggleBtn);

      let currentControlsContainer = null;
      let solidPicker = null;

      const updateColorValue = (formattedValue) => {
        const prevVal = values[field.id];
        input.value = formattedValue;
        values[field.id] = formattedValue;

        if (customCodeBySnippet.has(snippet.id) && customCodeBySnippet.get(snippet.id)["html"]) {
          let customHtml = customCodeBySnippet.get(snippet.id)["html"];
          if (prevVal) {
            if (prevVal.startsWith("(") && (formattedValue.startsWith("linear-gradient") || formattedValue.startsWith("rgba") || formattedValue.startsWith("#"))) {
              customHtml = customHtml.split(`rgba${prevVal}`).join(formattedValue);
              customHtml = customHtml.split(`rgb${prevVal}`).join(formattedValue);
            }
            if (customHtml.includes(prevVal)) {
              customHtml = customHtml.split(prevVal).join(formattedValue);
            }
            customCodeBySnippet.get(snippet.id)["html"] = customHtml;
          }
        }

        updateCodePanel(snippet);
        renderPreview(snippet);
      };

      const renderColorControls = () => {
        const currentVal = input.value || values[field.id] || field.value;
        const curInfo = parseColorInfo(currentVal);
        const isGrad = curInfo && curInfo.type === "linear-gradient";

        if (currentControlsContainer) {
          currentControlsContainer.remove();
          currentControlsContainer = null;
        }
        if (solidPicker) {
          solidPicker.remove();
          solidPicker = null;
        }

        if (isGrad) {
          gradToggleBtn.classList.add("active");
          gradToggleBtn.setAttribute("aria-pressed", "true");
          badge.textContent = "Gradient";

          const gradPanel = document.createElement("div");
          gradPanel.className = "field-gradient-panel";

          const stopsGrid = document.createElement("div");
          stopsGrid.className = "field-gradient-stops";

          // Stop 1
          const stop1El = document.createElement("div");
          stop1El.className = "field-gradient-stop";
          const h1 = document.createElement("div");
          h1.className = "field-gradient-stop-header";
          const l1 = document.createElement("span");
          l1.className = "field-gradient-stop-label";
          l1.textContent = "จุดเริ่ม (Stop 1)";
          const b1 = document.createElement("span");
          b1.className = "field-gradient-stop-badge";
          b1.textContent = `${curInfo.stop1.alphaPercent}%`;
          h1.append(l1, b1);

          const main1 = document.createElement("div");
          main1.className = "field-gradient-stop-main";
          const p1 = document.createElement("input");
          p1.type = "color";
          p1.className = "field-gradient-stop-picker";
          p1.value = curInfo.stop1.hex;
          p1.title = "เลือกสีจุดเริ่ม (Stop 1)";
          p1.setAttribute("aria-label", "เลือกสีจุดเริ่ม");

          const s1 = document.createElement("input");
          s1.type = "range";
          s1.className = "field-gradient-stop-slider";
          s1.min = "0";
          s1.max = "100";
          s1.step = "1";
          s1.value = String(curInfo.stop1.alphaPercent);
          s1.setAttribute("aria-label", "ปรับความโปร่งใสจุดเริ่ม");

          main1.append(p1, s1);
          stop1El.append(h1, main1);

          // Stop 2
          const stop2El = document.createElement("div");
          stop2El.className = "field-gradient-stop";
          const h2 = document.createElement("div");
          h2.className = "field-gradient-stop-header";
          const l2 = document.createElement("span");
          l2.className = "field-gradient-stop-label";
          l2.textContent = "จุดจบ (Stop 2)";
          const b2 = document.createElement("span");
          b2.className = "field-gradient-stop-badge";
          b2.textContent = `${curInfo.stop2.alphaPercent}%`;
          h2.append(l2, b2);

          const main2 = document.createElement("div");
          main2.className = "field-gradient-stop-main";
          const p2 = document.createElement("input");
          p2.type = "color";
          p2.className = "field-gradient-stop-picker";
          p2.value = curInfo.stop2.hex;
          p2.title = "เลือกสีจุดจบ (Stop 2)";
          p2.setAttribute("aria-label", "เลือกสีจุดจบ");

          const s2 = document.createElement("input");
          s2.type = "range";
          s2.className = "field-gradient-stop-slider";
          s2.min = "0";
          s2.max = "100";
          s2.step = "1";
          s2.value = String(curInfo.stop2.alphaPercent);
          s2.setAttribute("aria-label", "ปรับความโปร่งใสจุดจบ");

          main2.append(p2, s2);
          stop2El.append(h2, main2);

          stopsGrid.append(stop1El, stop2El);

          // Angle row
          const angleRow = document.createElement("div");
          angleRow.className = "field-gradient-angle-row";
          const angleLabel = document.createElement("label");
          angleLabel.className = "field-gradient-angle-label";
          angleLabel.innerHTML = `<svg class="ui-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>ทิศทางการไล่สี (Angle)</span>`;

          const angleSelect = document.createElement("select");
          angleSelect.className = "field-gradient-angle-select";
          angleSelect.setAttribute("aria-label", "เลือกทิศทางการไล่สี");

          const angleOptions = [
            { val: "135deg", label: "135deg ทแยงลงขวา" },
            { val: "90deg", label: "90deg แนวนอน (ซ้าย-ขวา)" },
            { val: "180deg", label: "180deg แนวตั้ง (บน-ล่าง)" },
            { val: "45deg", label: "45deg ทแยงขึ้นขวา" },
            { val: "0deg", label: "0deg แนวตั้ง (ล่าง-บน)" },
            { val: "225deg", label: "225deg ทแยงลงซ้าย" },
            { val: "270deg", label: "270deg แนวนอน (ขวา-ซ้าย)" },
            { val: "315deg", label: "315deg ทแยงขึ้นซ้าย" },
            { val: "to right", label: "to right (ไปขวา)" },
            { val: "to bottom", label: "to bottom (ลงล่าง)" },
            { val: "to bottom right", label: "to bottom right (ทแยงลงขวา)" }
          ];

          let matchedAngle = false;
          angleOptions.forEach((opt) => {
            const opEl = document.createElement("option");
            opEl.value = opt.val;
            opEl.textContent = opt.label;
            if (curInfo.angle && curInfo.angle.toLowerCase() === opt.val.toLowerCase()) {
              opEl.selected = true;
              matchedAngle = true;
            }
            angleSelect.append(opEl);
          });
          if (!matchedAngle && curInfo.angle) {
            const customOp = document.createElement("option");
            customOp.value = curInfo.angle;
            customOp.textContent = curInfo.angle;
            customOp.selected = true;
            angleSelect.prepend(customOp);
          }

          angleRow.append(angleLabel, angleSelect);
          gradPanel.append(stopsGrid, angleRow);

          const syncGrad = () => {
            b1.textContent = `${s1.value}%`;
            b2.textContent = `${s2.value}%`;
            const formatted = curInfo.format(angleSelect.value, p1.value, s1.value, p2.value, s2.value);
            updateColorValue(formatted);
          };

          p1.addEventListener("input", syncGrad);
          s1.addEventListener("input", syncGrad);
          p2.addEventListener("input", syncGrad);
          s2.addEventListener("input", syncGrad);
          angleSelect.addEventListener("change", syncGrad);

          currentControlsContainer = gradPanel;
          row.append(gradPanel);

        } else {
          gradToggleBtn.classList.remove("active");
          gradToggleBtn.setAttribute("aria-pressed", "false");
          const solidInfo = curInfo || { hex: "#ffffff", alphaPercent: 100, hasImportant: false, format: (h, a) => h, withAlphaPercent: (p) => `#ffffff` };
          badge.textContent = `RGBA ${solidInfo.alphaPercent}%`;

          solidPicker = document.createElement("input");
          solidPicker.type = "color";
          solidPicker.className = "field-color-picker";
          solidPicker.value = solidInfo.hex;
          solidPicker.title = "คลิกเพื่อเลือกสี (มี EyeDropper ดูดสีได้)";
          solidPicker.setAttribute("aria-label", `เลือกสีสำหรับ ${field.label}`);
          inputGroup.prepend(solidPicker);

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
          opacitySlider.value = String(solidInfo.alphaPercent);
          opacitySlider.setAttribute("aria-label", `ปรับความโปร่งใส ${field.label}`);

          const opacityNumber = document.createElement("input");
          opacityNumber.type = "number";
          opacityNumber.className = "field-opacity-number";
          opacityNumber.min = "0";
          opacityNumber.max = "100";
          opacityNumber.step = "1";
          opacityNumber.value = String(solidInfo.alphaPercent);
          opacityNumber.setAttribute("aria-label", `เปอร์เซ็นต์ความโปร่งใส ${field.label}`);

          const percentUnit = document.createElement("span");
          percentUnit.className = "field-opacity-unit";
          percentUnit.textContent = "%";

          solidPicker.addEventListener("input", () => {
            const curVal = input.value;
            const info = parseColorInfo(curVal) || solidInfo;
            const curAlpha = (Number(opacitySlider.value) / 100).toFixed(2);
            const formatted = info.format(solidPicker.value, curAlpha);
            badge.textContent = `RGBA ${opacitySlider.value}%`;
            updateColorValue(formatted);
          });

          const onOpacityChange = (val) => {
            if (val === "") return;
            const percent = Math.max(0, Math.min(100, Number(val)));
            opacitySlider.value = String(percent);
            opacityNumber.value = String(percent);
            badge.textContent = `RGBA ${percent}%`;
            const curVal = input.value;
            const info = parseColorInfo(curVal) || solidInfo;
            const formatted = info.withAlphaPercent(percent);
            updateColorValue(formatted);
          };

          opacitySlider.addEventListener("input", () => onOpacityChange(opacitySlider.value));
          opacityNumber.addEventListener("input", () => onOpacityChange(opacityNumber.value));

          opacityRow.append(opacityLabel, opacitySlider, opacityNumber, percentUnit);
          currentControlsContainer = opacityRow;
          row.append(opacityRow);
        }
      };

      gradToggleBtn.addEventListener("click", () => {
        const currentVal = input.value || values[field.id] || field.value;
        const curInfo = parseColorInfo(currentVal);
        const isGrad = curInfo && curInfo.type === "linear-gradient";

        if (isGrad) {
          // Switch Gradient -> Solid
          const hex = curInfo.stop1.hex;
          const alphaPercent = curInfo.stop1.alphaPercent;
          const hasImp = curInfo.hasImportant;
          const nr = parseInt(hex.slice(1, 3), 16);
          const ng = parseInt(hex.slice(3, 5), 16);
          const nb = parseInt(hex.slice(5, 7), 16);
          const a = (alphaPercent / 100).toFixed(2);
          const solidVal = alphaPercent < 100 ? `rgba(${nr}, ${ng}, ${nb}, ${a})` : hex;
          const formatted = hasImp ? `${solidVal}!important` : solidVal;
          updateColorValue(formatted);
          renderColorControls();
        } else {
          // Switch Solid -> Gradient
          const solid = curInfo || { hex: "#ffffff", alphaPercent: 100, hasImportant: false };
          const hex1 = solid.hex || "#ffffff";
          const a1Percent = solid.alphaPercent !== undefined ? solid.alphaPercent : 100;
          const a2Percent = Math.max(2, Math.round(a1Percent * 0.25));
          const hasImp = solid.hasImportant;
          const a1 = (a1Percent / 100).toFixed(2);
          const a2 = (a2Percent / 100).toFixed(2);
          const rgba1 = hexToRgbaString(hex1, a1);
          const rgba2 = hexToRgbaString(hex1, a2);
          const gradCore = `linear-gradient(135deg, ${rgba1}, ${rgba2})`;
          const formatted = hasImp ? `${gradCore}!important` : gradCore;
          updateColorValue(formatted);
          renderColorControls();
        }
      });

      input.addEventListener("input", () => {
        const latest = parseColorInfo(input.value);
        if (latest) {
          values[field.id] = input.value;
          renderColorControls();
        }
      });

      inputGroup.append(input);
      row.append(labelRow, inputGroup);
      renderColorControls();
    } else {
      inputGroup.append(input);
      row.append(labelRow, inputGroup);

      if (field.kind !== "tagName" && field.kind !== "rubiiTagName" && field.kind !== "url") {
        const styleBar = document.createElement("div");
        styleBar.className = "field-text-style-bar";

        const currentStyle = getFieldStyle(snippet, field.id) || {};

        if (currentStyle.color) input.style.color = currentStyle.color;
        if (currentStyle.bgColor) input.style.backgroundColor = currentStyle.bgColor;
        if (currentStyle.bold) input.style.fontWeight = "bold";

        // Text Color Item
        const colorItem = document.createElement("label");
        colorItem.className = "style-bar-item";
        colorItem.title = "เลือกสีข้อความตัวแปร (มี EyeDropper)";

        const colorLabel = document.createElement("span");
        colorLabel.className = "style-bar-label";
        colorLabel.innerHTML = `<svg class="ui-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg><span>สีอักษร</span>`;

        const colorWrap = document.createElement("div");
        colorWrap.className = "var-color-wrap";
        if (currentStyle.color) colorWrap.style.backgroundColor = currentStyle.color;

        const colorPicker = document.createElement("input");
        colorPicker.type = "color";
        colorPicker.className = "var-color-picker";
        colorPicker.value = currentStyle.color && currentStyle.color.startsWith("#") ? currentStyle.color : "#ffffff";
        colorPicker.setAttribute("aria-label", `เลือกสีข้อความสำหรับ ${field.label}`);
        colorWrap.append(colorPicker);
        colorItem.append(colorLabel, colorWrap);

        // Highlight Item with Opacity Control
        const bgItem = document.createElement("div");
        bgItem.className = "style-bar-item style-bar-bg-item";

        const bgLabelWrap = document.createElement("label");
        bgLabelWrap.className = "style-bar-label-wrap";
        bgLabelWrap.title = "เลือกสีไฮไลต์พื้นหลังตัวแปร (มี EyeDropper)";

        const bgLabel = document.createElement("span");
        bgLabel.className = "style-bar-label";
        bgLabel.innerHTML = `<svg class="ui-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/></svg><span>ไฮไลต์</span>`;

        const bgWrap = document.createElement("div");
        bgWrap.className = "var-color-wrap var-bg-wrap";
        if (currentStyle.bgColor) bgWrap.style.backgroundColor = currentStyle.bgColor;

        const bgPicker = document.createElement("input");
        bgPicker.type = "color";
        bgPicker.className = "var-bg-picker";

        let initialBgHex = currentStyle.bgHex || "#38bdf8";
        let initialBgAlpha = currentStyle.bgAlpha !== undefined ? currentStyle.bgAlpha : 35;
        if (currentStyle.bgColor) {
          const parsed = parseColorInfo(currentStyle.bgColor);
          if (parsed) {
            initialBgHex = parsed.hex;
            initialBgAlpha = parsed.alphaPercent;
          }
        }
        bgPicker.value = initialBgHex;
        bgPicker.setAttribute("aria-label", `เลือกสีไฮไลต์สำหรับ ${field.label}`);
        bgWrap.append(bgPicker);
        bgLabelWrap.append(bgLabel, bgWrap);

        // Opacity Slider & Badge
        const opacityWrap = document.createElement("div");
        opacityWrap.className = "var-opacity-wrap";
        opacityWrap.title = "ปรับความเข้ม/ความโปร่งใสของสีไฮไลต์ (5% - 100%)";

        const opacitySlider = document.createElement("input");
        opacitySlider.type = "range";
        opacitySlider.className = "var-opacity-slider";
        opacitySlider.min = "5";
        opacitySlider.max = "100";
        opacitySlider.step = "5";
        opacitySlider.value = String(initialBgAlpha);
        opacitySlider.setAttribute("aria-label", `ปรับความเข้มสีไฮไลต์ ${field.label}`);

        const opacityBadge = document.createElement("span");
        opacityBadge.className = "var-opacity-badge";
        opacityBadge.textContent = `${initialBgAlpha}%`;

        opacityWrap.append(opacitySlider, opacityBadge);
        bgItem.append(bgLabelWrap, opacityWrap);

        // Actions: Bold & Reset
        const actionsGroup = document.createElement("div");
        actionsGroup.className = "style-bar-actions";

        const boldBtn = document.createElement("button");
        boldBtn.type = "button";
        boldBtn.className = `var-action-btn var-bold-btn ${currentStyle.bold ? "active" : ""}`;
        boldBtn.title = "ตัวหนา (Bold)";
        boldBtn.innerHTML = "<strong>B</strong>";

        const resetBtn = document.createElement("button");
        resetBtn.type = "button";
        resetBtn.className = "var-action-btn var-reset-btn";
        resetBtn.title = "ล้างการตกแต่งตัวแปรนี้กลับเป็นค่าเริ่มต้น";
        resetBtn.textContent = "รีเซ็ต";

        actionsGroup.append(boldBtn, resetBtn);

        styleBar.append(colorItem, bgItem, actionsGroup);
        row.append(styleBar);

        const applyStyleUpdate = (diff) => {
          setFieldStyle(snippet, field.id, diff);
          const updated = getFieldStyle(snippet, field.id) || {};

          input.style.color = updated.color || "";
          input.style.backgroundColor = updated.bgColor || "";
          input.style.fontWeight = updated.bold ? "bold" : "";

          colorWrap.style.backgroundColor = updated.color || "";
          if (updated.color && updated.color.startsWith("#")) colorPicker.value = updated.color;

          bgWrap.style.backgroundColor = updated.bgColor || "";
          if (updated.bgHex) bgPicker.value = updated.bgHex;
          if (updated.bgAlpha !== undefined) {
            opacitySlider.value = String(updated.bgAlpha);
            opacityBadge.textContent = `${updated.bgAlpha}%`;
          }

          boldBtn.classList.toggle("active", Boolean(updated.bold));

          updateCodePanel(snippet);
          renderPreview(snippet);
        };

        const onBgUpdate = (hexVal, alphaPercent) => {
          const alpha = (Math.max(5, Math.min(100, Number(alphaPercent))) / 100).toFixed(2);
          const rgba = hexToRgbaString(hexVal, alpha);
          applyStyleUpdate({
            bgColor: rgba,
            bgHex: hexVal,
            bgAlpha: Number(alphaPercent)
          });
        };

        colorPicker.addEventListener("input", () => {
          applyStyleUpdate({ color: colorPicker.value });
        });

        bgPicker.addEventListener("input", () => {
          onBgUpdate(bgPicker.value, opacitySlider.value);
        });

        opacitySlider.addEventListener("input", () => {
          opacityBadge.textContent = `${opacitySlider.value}%`;
          onBgUpdate(bgPicker.value, opacitySlider.value);
        });

        boldBtn.addEventListener("click", () => {
          const cur = getFieldStyle(snippet, field.id) || {};
          applyStyleUpdate({ bold: !cur.bold });
        });

        resetBtn.addEventListener("click", () => {
          applyStyleUpdate({ color: "", bgColor: "", bgHex: "#38bdf8", bgAlpha: 35, bold: false });
        });
      }
    }

    fieldList.append(row);
  }

  // Update tab counts
  if (tabCountAll) tabCountAll.textContent = String(currentFields.length);
  if (tabCountText) tabCountText.textContent = String(countText);
  if (tabCountTypography) tabCountTypography.textContent = String(countTypography);
  if (tabCountStyle) tabCountStyle.textContent = String(countStyle);
  if (tabCountMedia) tabCountMedia.textContent = String(countMedia);
  if (quickTabMedia) quickTabMedia.hidden = countMedia === 0;

  // Validate active tab
  if (
    (activeQuickEditTab === "text" && countText === 0) ||
    (activeQuickEditTab === "typography" && countTypography === 0 && !quickTypographyControls) ||
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
  if (!backgroundBySnippet.has(snippet.id)) {
    backgroundBySnippet.set(snippet.id, {
      enabled: false,
      url: defaultBackgroundUrl,
      textShadow: "soft",
      shadowColor: "#000000",
      shadowBlur: 4,
      textColor: "auto",
      customTextColor: "#ffffff",
      fontWeight: "auto",
      fontStyle: "auto",
      textTransform: "auto",
      letterSpacing: "auto",
      fontFamily: "auto"
    });
  }
  const st = backgroundBySnippet.get(snippet.id);
  if (!st.textShadow) st.textShadow = "soft";
  if (!st.shadowColor) st.shadowColor = "#000000";
  if (st.shadowBlur === undefined) st.shadowBlur = 4;
  if (!st.textColor) st.textColor = "auto";
  if (!st.customTextColor) st.customTextColor = "#ffffff";
  if (!st.fontWeight) st.fontWeight = "auto";
  if (!st.fontStyle) st.fontStyle = "auto";
  if (!st.textTransform) st.textTransform = "auto";
  if (!st.letterSpacing) st.letterSpacing = "auto";
  if (!st.fontFamily) st.fontFamily = "auto";
  return st;
}

function renderBackgroundControls(snippet) {
  const state = backgroundState(snippet);
  backgroundEnabled.checked = state.enabled;
  backgroundUrl.value = state.url;
  
  // Quick Edit Typography sync
  if (quickTextShadow) quickTextShadow.value = state.textShadow || "soft";

  const effectiveShadowColor = state.shadowColor || "#000000";
  const standardShadows = ["#000000", "#38bdf8", "#c084fc", "#fef08a", "#4ade80", "#f87171", "#ffffff"];
  if (quickShadowColor) {
    quickShadowColor.value = standardShadows.includes(effectiveShadowColor) ? effectiveShadowColor : "custom";
  }
  if (quickShadowColorPicker) quickShadowColorPicker.value = effectiveShadowColor;

  const effectiveBlur = state.shadowBlur !== undefined ? state.shadowBlur : 4;
  if (quickShadowBlur) quickShadowBlur.value = effectiveBlur;
  if (quickShadowBlurBadge) quickShadowBlurBadge.textContent = `${effectiveBlur}px`;

  const effectiveOffset = state.shadowOffset !== undefined ? state.shadowOffset : 2;
  if (quickShadowOffset) quickShadowOffset.value = effectiveOffset;
  if (quickShadowOffsetBadge) quickShadowOffsetBadge.textContent = `${effectiveOffset}px`;

  if (quickTextColor) quickTextColor.value = state.textColor || "auto";
  const effectiveCustomColor = (state.textColor && state.textColor !== "auto" && state.textColor !== "custom") ? state.textColor : (state.customTextColor || "#ffffff");
  if (quickTextColorPicker) quickTextColorPicker.value = effectiveCustomColor;

  if (quickFontWeight) quickFontWeight.value = state.fontWeight || "auto";
  if (quickFontStyle) quickFontStyle.value = state.fontStyle || "auto";
  if (quickTextTransform) quickTextTransform.value = state.textTransform || "auto";
  if (quickLetterSpacing) quickLetterSpacing.value = state.letterSpacing || "auto";
  if (quickFontFamily) quickFontFamily.value = state.fontFamily || "auto";
  
  const optRow = document.querySelector(".background-options-row");
  if (optRow) optRow.hidden = !state.enabled;
  const urlField = document.querySelector(".background-url-field");
  if (urlField && !optRow) urlField.hidden = !state.enabled;
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
    const rawValue = values[field.id] ?? field.value;
    let value = rawValue;

    if (field.kind !== "tagName" && field.kind !== "rubiiTagName" && field.kind !== "url") {
      const styles = getFieldStyle(snippet, field.id);
      if (styles && (styles.color || styles.bgColor || styles.bold)) {
        const styleParts = [];
        if (styles.color) styleParts.push(`color:${styles.color}!important`);
        if (styles.bgColor) {
          styleParts.push(`background-color:${styles.bgColor}!important`);
          styleParts.push(`padding:2px 6px`);
          styleParts.push(`border-radius:4px`);
          styleParts.push(`display:inline-block`);
        }
        if (styles.bold) styleParts.push(`font-weight:bold!important`);
        if (styleParts.length > 0) {
          value = `<span style="${styleParts.join(";")}">${rawValue}</span>`;
        }
      }
    }

    if (field.kind === "tagName") {
      if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(value)) continue;
      const original = snippet.editable.tagName;
      text = text.split("{{tagName}}").join(value);
      text = text.split(`<${original}`).join(`<${value}`).split(`</${original}`).join(`</${value}`);
    } else if (field.kind === "token" || field.kind === "literal") {
      if (field.token.startsWith("(") && (value.startsWith("linear-gradient") || value.startsWith("rgba") || value.startsWith("#"))) {
        text = text.split(`rgba${field.token}`).join(value);
        text = text.split(`rgb${field.token}`).join(value);
      }
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

function hexToRgbaString(hex, alpha = 1) {
  if (!hex || typeof hex !== "string") return `rgba(0,0,0,${alpha})`;
  let clean = hex.trim().replace("#", "");
  if (clean.length === 3) clean = clean.split("").map((c) => c + c).join("");
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  return `rgba(${r},${g},${b},${alpha})`;
}

function htmlWithBackground(snippet, html) {
  const state = backgroundState(snippet);
  const url = (state.url || "").trim();
  const hasBg = state.enabled && Boolean(url);
  
  let shadowCss = "";
  const sColor = state.shadowColor || "#000000";
  const blur = Number(state.shadowBlur !== undefined ? state.shadowBlur : 4);
  const offset = Number(state.shadowOffset !== undefined ? state.shadowOffset : 2);

  if (state.textShadow === "soft") {
    shadowCss = `text-shadow:0 ${offset}px ${blur}px ${hexToRgbaString(sColor, 0.88)}, 0 0 1px ${hexToRgbaString(sColor, 0.9)};`;
  } else if (state.textShadow === "heavy") {
    const d1 = Math.max(1, offset);
    const d2 = Math.round(d1 * 2);
    const d3 = Math.round(d1 * 3);
    shadowCss = `text-shadow:0 ${d1}px ${Math.max(1, Math.round(blur * 0.5))}px ${hexToRgbaString(sColor, 0.95)}, 0 ${d2}px ${blur}px ${hexToRgbaString(sColor, 0.8)}, 0 ${d3}px ${Math.round(blur * 1.8)}px ${hexToRgbaString(sColor, 0.55)};`;
  } else if (state.textShadow === "outline") {
    const o = Math.max(1, offset);
    shadowCss = `text-shadow:-${o}px -${o}px ${blur}px ${hexToRgbaString(sColor, 0.98)}, ${o}px -${o}px ${blur}px ${hexToRgbaString(sColor, 0.98)}, -${o}px ${o}px ${blur}px ${hexToRgbaString(sColor, 0.98)}, ${o}px ${o}px ${blur}px ${hexToRgbaString(sColor, 0.98)};`;
  } else if (state.textShadow === "neon") {
    const neonBlur = Math.max(2, blur);
    const neonSpread = Math.max(4, neonBlur * 2 + offset);
    const glowColor = sColor || "#38bdf8";
    shadowCss = `text-shadow:0 0 ${neonBlur}px ${hexToRgbaString(glowColor, 0.95)}, 0 0 ${neonSpread}px ${hexToRgbaString(glowColor, 0.7)}, 0 1px ${Math.max(2, offset)}px rgba(0,0,0,0.85);`;
  } else if (state.textShadow === "custom") {
    shadowCss = `text-shadow:0 ${offset}px ${blur}px ${hexToRgbaString(sColor, 0.92)}, 0 0 2px ${hexToRgbaString(sColor, 0.85)};`;
  }

  let textOverrideCss = "";
  let effectiveColor = "";
  if (state.textColor && state.textColor !== "auto") {
    effectiveColor = state.textColor === "custom" ? (state.customTextColor || "#ffffff") : state.textColor;
    textOverrideCss = `color:${effectiveColor}!important;`;
  }

  let typographyCss = "";
  if (state.fontWeight && state.fontWeight !== "auto") {
    typographyCss += `font-weight:${state.fontWeight}!important;`;
  }
  if (state.fontStyle && state.fontStyle !== "auto") {
    if (state.fontStyle === "italic") typographyCss += `font-style:italic!important;`;
    else if (state.fontStyle === "underline") typographyCss += `text-decoration:underline!important;`;
    else if (state.fontStyle === "italic-underline") typographyCss += `font-style:italic!important;text-decoration:underline!important;`;
    else if (state.fontStyle === "normal") typographyCss += `font-style:normal!important;text-decoration:none!important;`;
  }
  if (state.textTransform && state.textTransform !== "auto") {
    typographyCss += `text-transform:${state.textTransform}!important;`;
  }
  if (state.letterSpacing && state.letterSpacing !== "auto") {
    typographyCss += `letter-spacing:${state.letterSpacing}!important;`;
  }
  if (state.fontFamily && state.fontFamily !== "auto") {
    typographyCss += `font-family:${state.fontFamily}!important;`;
  }

  let bgCss = "";
  if (hasBg) {
    const cssUrl = url.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/[\r\n\f]/g, "");
    bgCss = `background-image:url('${cssUrl}');background-size:cover;background-position:center;background-repeat:no-repeat;`;
  }

  const additions = `${bgCss}${shadowCss}${textOverrideCss}${typographyCss}`;
  if (!additions && !effectiveColor) return html;

  const root = scanHtmlTags(html).find((tag) => tag.kind === "open");
  if (!root) return html;

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

  let finalHtml = `${html.slice(0, root.start)}${updatedRoot}${html.slice(root.end)}`;

  if (effectiveColor) {
    finalHtml = finalHtml.replace(/(\bstyle\s*=\s*["'][^"']*\bcolor\s*:\s*)([^;!"']+)(!important)?/gi, (match, p1) => {
      return `${p1}${effectiveColor}!important`;
    });
  }

  return finalHtml;
}

function isBuiltInRubiiMacro(target) {
  return /^\{\{\s*(?:char|user)\s*\}\}%?$/i.test(String(target ?? "").trim());
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
  const staticSlotBlacklist = new Set(["(THB)", "(TH)", "(USD)", "(GBP)", "(EUR)", "(ผู้โอน)", "(ผู้รับ)", "(Wallet)", "(PromptPay)"]);
  for (const [nodeIndex, textNode] of nodes.entries()) {
    const text = textNode.nodeValue;
    const matches = [...text.matchAll(dynamicPattern)].filter((m) => (
      !staticSlotBlacklist.has(m[0].trim()) && !isBuiltInRubiiMacro(m[0])
    ));
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
    const containsBuiltInMacro = /\{\{\s*(?:char|user)\s*\}\}/i.test(text);
    if (!candidates.length && text.trim().length >= 3 && !containsBuiltInMacro) {
      const start = text.indexOf(text.trim());
      candidates.push({ target: text.trim(), start, end: start + text.trim().length, example: true });
    }

    for (const candidate of candidates) {
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
      const contextLabel = context === target ? translateAppValue("ข้อความ") : context;
      const label = candidate.suggested
        ? `${translateAppValue(suggestedVariableLabel(candidate.suggestionType))} · ${target}`
        : `${target} · ${contextLabel}`;
      slots.push({
        id: `target:${target}`,
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

function uniqueRubiiSlots(slots) {
  const seenTargets = new Set();
  return slots.filter((slot) => {
    if (seenTargets.has(slot.target)) return false;
    seenTargets.add(slot.target);
    return true;
  });
}

function groupRubiiSlotsByTarget(slots) {
  const groups = new Map();
  for (const slot of slots) {
    const group = groups.get(slot.target);
    if (group) group.count += 1;
    else groups.set(slot.target, { slot, count: 1 });
  }
  return [...groups.values()];
}

function rubiiSharedSlotLabel(label, count) {
  if (count <= 1) return label;
  if (pageLanguageSlug === "en") return `${label} · used in ${count} places`;
  if (pageLanguageSlug === "vi") return `${label} · dùng ở ${count} vị trí`;
  return `${label} · ใช้ร่วมกัน ${count} จุด`;
}

function renderRubiiSlotControls(snippet) {
  rubiiSlotControls.hidden = !isRubiiHtmlSnippet(snippet);
  rubiiSlotSelect.replaceChildren();
  if (!isRubiiHtmlSnippet(snippet)) return;

  const { slots } = rubiiTextSlots(assembleRawHtml(snippet));
  const slotGroups = groupRubiiSlotsByTarget(slots);
  const uniqueSlots = slotGroups.map(({ slot }) => slot);
  const state = rubiiSettingsBySnippet.get(snippet.id) ?? {};
  if (Array.isArray(state.regexSlotIds)) {
    const selectedTargets = new Set(state.regexSlotIds
      .map((id) => slots.find((slot) => slot.id === id)?.target)
      .filter(Boolean));
    state.regexSlotIds = uniqueRubiiSlots(slots.filter((slot) => selectedTargets.has(slot.target)))
      .slice(0, maxRegexCaptures)
      .map((slot) => slot.id);
  }
  const preferred = typeof state.slotId === "string" && state.slotId
    ? (slots.some((slot) => slot.id === state.slotId)
        ? uniqueSlots.find((slot) => slot.target === slots.find((candidate) => candidate.id === state.slotId)?.target)?.id ?? ""
        : "")
    : (
        [...uniqueSlots]
          .filter((slot) => !/^\{\{.*\}\}$/.test(slot.target))
          .sort((a, b) => b.score - a.score)[0]?.id
        ?? uniqueSlots.find((slot) => slot.explicit)?.id
        ?? ""
      );
  state.slotId = preferred ?? "";
  if (!Array.isArray(state.regexSlotIds)) {
    const explicitSlots = [];
    const seenTargets = new Set();
    const validCandidateSlots = uniqueSlots.filter((slot) => !/^\{\{.*\}\}$/.test(slot.target));
    const pool = validCandidateSlots.length ? validCandidateSlots : uniqueSlots;
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
    option.textContent = translateAppValue("ไม่มีข้อความให้แทน — ใช้โครง HTML ทั้งก้อน");
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
  placeholder.textContent = translateAppValue("เลือกข้อความเพื่อกำหนดเป็น $1");
  rubiiSlotSelect.append(placeholder);
  for (const { slot, count } of slotGroups) {
    const option = document.createElement("option");
    option.value = slot.id;
    const label = rubiiSharedSlotLabel(slot.label, count);
    option.textContent = label.length > 110 ? `${label.slice(0, 107)}…` : label;
    rubiiSlotSelect.append(option);
  }
  rubiiSlotSelect.value = preferred;

  const selectedIds = new Set(state.regexSlotIds);
  rubiiRegexCaptureList.replaceChildren();
  for (const { slot, count } of slotGroups) {
    const label = document.createElement("label");
    label.className = "rubii-regex-capture-option";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.regexSlotId = slot.id;
    checkbox.checked = selectedIds.has(slot.id);
    checkbox.disabled = !checkbox.checked && selectedIds.size >= maxRegexCaptures;
    const varIndex = checkbox.checked ? state.regexSlotIds.indexOf(slot.id) + 1 : 0;
    const marker = document.createElement("span");
    marker.className = `rubii-regex-capture-kind${slot.suggested ? " is-suggestion" : ""}`;
    marker.textContent = slot.explicit ? "marker" : slot.suggested ? translateAppValue("ตรวจดู") : translateAppValue("ตัวอย่าง");
    if (slot.suggested) marker.title = translateAppValue("ระบบเดาว่าอาจเปลี่ยน แนะนำให้ตรวจสอบก่อนเลือก");
    const text = document.createElement("span");
    text.className = "rubii-regex-capture-text";
    text.textContent = rubiiSharedSlotLabel(slot.label, count);
    if (varIndex > 0) {
      const colorIdx = ((varIndex - 1) % 8) + 1;
      const varBadge = document.createElement("span");
      varBadge.className = `tok-var tok-var-${colorIdx} rubii-slot-badge`;
      varBadge.textContent = `$${varIndex}`;
      label.append(checkbox, varBadge, text, marker);
    } else {
      label.append(checkbox, text, marker);
    }
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
    name.value = pageLanguageSlug === "en"
      ? translateAppValue(rule.name ?? `Regex เพิ่มเติม ${index + 1}`)
      : rule.name ?? `Regex เพิ่มเติม ${index + 1}`;
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
  const selectedSlots = uniqueRubiiSlots(chosenSlots.map((selected) => slots.find((slot) => slot.id === selected.id)).filter(Boolean));
  const replacementsByNode = new Map();
  const progressBarMap = new Map();

  const selectedByTarget = new Map();
  selectedSlots.forEach((slot, index) => {
    const varName = isRubiiPercentageSlot(slot) ? "$" + (index + 1) + "%" : "$" + (index + 1);
    selectedByTarget.set(slot.target, { varName, slotIndex: index, slot });
  });

  slots.forEach((slot) => {
    if (selectedByTarget.has(slot.target)) {
      const { varName, slotIndex } = selectedByTarget.get(slot.target);
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
  if (/ต\.ค\.|พ\.ย\.|ธ\.ค\.|ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|พ\.ค\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\./.test(raw) && /•|:/.test(raw)) return "วันที่ • เวลา";
  if (/hh:mm|เวลา|time|\b\d{1,2}:\d{2}\b|\b\d{1,2}'\d{2}"\d{2}\b/.test(text)) return "เวลา";
  if (/วันที่|date|\d{1,2}\s+(?:ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|พ\.ค\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\.|ต\.ค\.|พ\.ย\.|ธ\.ค\.)/.test(text)) return "วันที่";
  if (/เดือน|month/.test(text)) return "เดือน/ปี";
  if (/วัน|weekday|day/.test(text)) return "วัน";
  if (/สถานที่|location/.test(text)) return "สถานที่";
  if (/xxx|บัญชี|wallet|วอลเล็ท|เบอร์/i.test(raw)) return "เลขบัญชี/วอลเล็ท";
  if (/^\(?[฿$£€¥]?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?\)?$/.test(raw) || /ยอดโอน|จำนวนเงิน|ราคา|price|amount|ปลดล็อก/.test(text)) return "จำนวนเงิน";
  if (/ref|อ้างอิง|reference|เลขที่|รหัส/i.test(text)) return "เลขอ้างอิง";
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
  const clean = raw.replace(/^\((.*)\)$/s, "$1").trim();
  if (pageLanguageSlug === "en") {
    const target = String(translateAppValue(clean) ?? clean).toLowerCase();
    if (/\b(percent|percentage|love|desire|jealousy|bond|energy|happiness|battery|hp|mp|exp)\b|เปอร์เซ็นต์|ความรัก|ความใคร่|หึง|ผูกพัน|พลังงาน|ความสุข/.test(target)) return "88%";
    if (/weekday|day of week|วันในสัปดาห์/.test(target)) return "Wednesday";
    if (/date and time|วันที่และเวลา/.test(target)) return "Oct 6, 2026 · 20:39";
    if (/\b(date|recorded|scene date)\b|วันที่|วันเดือนปี/.test(target)) return "Oct 6, 2026";
    if (/\b(month|year)\b|เดือน|ปี/.test(target)) return "October 2026";
    if (/\b(time|duration|elapsed|remaining|timestamp)\b|เวลา|ระยะเวลา/.test(target)) return "20:39";
    if (/\b(location|place|venue|address)\b|สถานที่|พิกัด/.test(target)) return "Bangkok";
    if (/\b(amount|price|fee|total|balance|money|cost|credit)\b|จำนวนเงิน|ยอดเงิน|ราคา|ค่าธรรมเนียม|เครดิต/.test(target)) return "50,000.00";
    if (/\b(account|wallet|phone|telephone)\b|บัญชี|วอลเล็ท|เบอร์โทร/.test(target)) return "xxx-x-x8841-x";
    if (/\b(reference|transaction id|ref)\b|อ้างอิง|เลขอ้างอิง|รหัส/.test(target)) return "REF-20261006-8821";
    if (/\b(weather|temperature)\b|สภาพอากาศ|อุณหภูมิ/.test(target)) return "29°C · Mostly cloudy";
    if (/\b(network|mobile network)\b|เครือข่าย/.test(target)) return "5G";
    if (/\b(status|online|update)\b|สถานะ/.test(target)) return "Active now";
    if (/\b(name|character|user|account name)\b|ชื่อ/.test(target)) return /user|ผู้ใช้/.test(target) ? "Alex" : "Ray";
    if (/\b(song|track|artist|music|soundtrack|title)\b|เพลง|ศิลปิน/.test(target)) return "Midnight City Lights";
    if (/\b(website|site|url)\b|เว็บไซต์|เว็บ/.test(target)) return "Example.com";
    if (/\b(emoji|icon)\b|อีโมจิ|ไอคอน/.test(target)) return "✨";
    if (/\b(message|reply|caption|comment|content|description|prompt|query|thought|activity|situation|post)\b|ข้อความ|คำบรรยาย|เนื้อหา|กิจกรรม|สถานการณ์|คำถาม|คำแนะนำ/.test(target)) return "A sample message for this card.";
    if (/\b(count|number|likes|comments|followers|views|rank|level|quantity)\b|จำนวน|ยอด|อันดับ|ระดับ/.test(target)) return "24";
    return "Example value";
  }
  const semanticSamples = {
    "เครือข่ายมือถือ": "5G",
    "เวลาที่ผ่านมา": "5 นาทีที่แล้ว",
    "จำนวนผู้ถูกใจเพิ่มเติม": "18",
    "จำนวนโพสต์": "24",
    "จำนวนผู้ติดตาม": "12.8K",
    "จำนวนกำลังติดตาม": "380",
    "จำนวนภาพพิเศษ": "1",
    "ราคาปลดล็อก": "15.00",
    "ยอดไลก์": "1,428",
    "ยอดไลก์โพสต์": "1,428",
    "ยอดความคิดเห็น": "89",
    "ยอดความคิดเห็นโพสต์": "89",
    "จำนวนความคิดเห็น": "3",
    "เวลาที่โพสต์แบบนาฬิกา": "21:45",
    "จำนวนเครดิต": "350",
    "เดือนและปีของชุด": "Oct 2026",
    "ยอดผู้ติดตามเป้าหมาย": "10K",
    "ราคาระดับสมาชิก": "25",
    "ความละเอียดภาพ": "4K",
    "ระดับสมาชิก": "3",
    "เป้าหมายยอดรี": "500",
    "ยอดรีโพสต์": "512",
    "ยอดบันทึก": "640",
    "เวลาเปิดอัลบั้ม": "21:49",
    "จำนวนรายการ": "1",
    "วันและเวลาถ่ายภาพ": "วันนี้ 21:30",
    "จำนวนเงินที่โอน": "75,000.00",
    "ยอดเงินที่โอน": "15,500.00",
    "จำนวนเงินสุทธิ": "50,000.00",
    "ยอดเงินคงเหลือ": "35,000.00",
    "ค่าธรรมเนียม": "0.00",
    "เลขอ้างอิงธุรกรรม": "SCB202610068821",
    "บัญชีต้นทางที่ปิดบัง": "xxx-x-x8841-x",
    "บัญชีปลายทางที่ปิดบัง": "xxx-xxx-8821",
    "เบอร์โทรศัพท์ผู้ส่ง": "081-xxx-5678",
    "ข้อความบันทึกช่วยจำ": "ค่าอาหารและค่าเดินทาง",
    "รายละเอียดบันทึกช่วยจำ": "ไว้ใช้จ่าย",
    "เวลาทำรายการ": "20:34 น.",
    "วันที่ทำรายการ": "06 ต.ค. 2569",
    "วันที่และเวลาทำรายการ": "06 ต.ค. 2569 • 20:19 น.",
    "ยอดปฏิกิริยา": "128",
    "ยอดถูกใจความคิดเห็น 1": "14",
    "ยอดถูกใจความคิดเห็น 2": "6",
    "ยอดถูกใจความคิดเห็น 3": "2",
    "ยอดแชร์": "7",
    "เวลาโพสต์": "15 นาทีที่แล้ว",
    "เวลาคอมเมนต์ 1": "10 นาที",
    "เวลาคอมเมนต์ 2": "5 นาที",
    "เวลาคอมเมนต์": "2 นาที",
    "ยอดรับชมหลักพัน": "2.4",
    "ยอดค้นหาอันดับ 1": "500",
    "ยอดค้นหาอันดับ 2": "200",
    "ยอดค้นหาอันดับ 3": "100",
    "หมายเลขโต๊ะ": "04",
    "วันที่ใช้บริการ": "วันนี้",
    "เวลาใช้บริการ": "20:30 น.",
    "จำนวนลาเต้": "1",
    "ราคาลาเต้": "180.00",
    "จำนวนพาสต้า": "2",
    "ราคาพาสต้า": "780.00",
    "จำนวนชุดไวน์": "2",
    "ราคาชุดไวน์": "1,600.00",
    "อัตราค่าบริการ": "10",
    "ค่าบริการ": "256.00",
    "ยอดรวม": "2,816.00",
    "คะแนนความสบายใจ": "95",
    "อุณหภูมิ": "24",
    "วันที่บันทึก": "08 ต.ค. 2569",
    "เวลาอ่าน": "3 min",
    "เวลานัดหมาย": "10:00 น.",
    "เวลากิจกรรม": "14:30 น.",
    "เวลามื้อค่ำ": "19:00 น.",
    "โบนัสผู้ชนะ": "15",
    "เวลาเข้าเส้นชัยของตัวละคร": "01'38\"24",
    "เวลาเข้าเส้นชัยของผู้ใช้": "01'39\"88",
    "เวลาเข้าเส้นชัย": "01'44\"20",
    "รอบการแข่งขัน": "2/3",
    "อันดับปัจจุบัน": "1ST",
    "เวลาที่เล่นแล้ว": "1:42",
    "เวลาที่เหลือ": "-2:18",
    "ความยาวเพลง": "3:45",
    "เวลาท่อนเพลง": "01:24",
    "วันที่ของฉาก": "8 ต.ค. 2569",
    "วันที่ของฉากแบบอังกฤษ": "THURSDAY, 08 OCT 2026",
    "เวลาของฉาก": "01:11 น.",
    "วันที่บันทึกแบบตัวเลข": "08.10.2026",
    "เวลาบันทึก": "01:11",
    "วันที่ระบบ": "08.10.2026",
    "เวลาระบบ": "01:17",
    "เปอร์เซ็นต์แบตเตอรี่": "84%",
    "สถานะอัปเดต": "Realtime",
    "สถานะออนไลน์": "Active now",
    "ขนาดไฟล์": "4.8 MB",
    "จำนวนเงินตัวอักษร": "เจ็ดหมื่นห้าพันบาทถ้วน",
    "ท่อนเนื้อเพลงก่อนหน้า": "คืนนี้ลมหนาวพัดผ่านหน้าต่าง",
    "ท่อนเนื้อเพลงหลัก": "ฉันยังเลือกเดินข้างเธอ",
    "ท่อนเนื้อเพลงถัดไป": "ปลายทางค่อย ๆ สว่างขึ้น",
    "ชื่อเพลงประกอบฉาก": "Lo-fi 2000s Pop Remix",
    "เปอร์เซ็นต์พลังงาน": "85%",
    "เปอร์เซ็นต์ความสุข": "92%",
    "เวลาบันทึกสถิติ": "21:30 น.",
    "เปอร์เซ็นต์ความรัก": "88%",
    "เปอร์เซ็นต์ความใคร่": "64%",
    "เปอร์เซ็นต์ความหึงหวง": "76%",
    "เปอร์เซ็นต์ความผูกพัน": "92%",
    "เปอร์เซ็นต์การซิงก์": "99%",
    "ข้อความโพสต์": "คืนนี้มีภาพใหม่มาแชร์ เก็บบรรยากาศดี ๆ ไว้ในช่วงเวลานี้ 🌙",
    "ชื่อชุดหรือแคมเปญ": "เซตพิเศษฉลองยอดผู้ติดตาม",
    "ข้อความโปรโมตโพสต์": "ขอบคุณทุกคนที่คอยสนับสนุนกันนะคะ เซตนี้เก็บภาพช่วงเวลาพิเศษไว้ค่ะ! ❤️",
    "ข้อความโพสต์ก่อนตั้งเป้าหมาย": "ดึกแล้วลงรูปนี้ได้ยัง... ถ้ายอดรีถึง",
    "ข้อความโพสต์หลังตั้งเป้าหมาย": "เดี๋ยวมีคลิปต่อให้อีกนะ 🫣🖤",
    "พฤติกรรมหรือคำพูดที่เกิดขึ้น": "จับมือฉันต่อหน้าทุกคน",
    "ทางเลือกที่กำลังลังเล": "แกล้งทำเป็นไม่สนใจดีไหม หรือควรเป็นฝ่ายรุกก่อนดี",
    "คำแนะนำจาก ChatGPT": "ค่อย ๆ ถามถึงความรู้สึกของเขา แล้วสังเกตคำตอบก่อนตัดสินใจครับ",
    "คำตอบหลังรับคำแนะนำจาก ChatGPT": "เข้าใจแล้ว...คืนนี้จะลองชวนคุยดูก่อนนะ ขอบใจมาก",
    "คำตอบหลังรับคำแนะนำจาก Gemini": "งั้นจะรอจังหวะเหมาะ ๆ แล้วค่อยพูดดีกว่า",
    "คำตอบหลังรับคำแนะนำจาก Grok": "ร้ายกาจมากกก แต่น่าลองดีแฮะ...เดี๋ยวรู้เลย! 😏",
    "ระดับความเชื่อใจ": "ค่อนข้างมั่นคง",
    "คำถามเกี่ยวกับการเปิดใจ": "เปิดเรื่องในอดีตดีไหม",
    "แนวทางที่ Gemini แนะนำ": "เปิดใจทีละนิดโดยไม่เร่งรัด",
    "พฤติกรรมหรือคำพูดที่ทำให้สงสัย": "ทำเป็นไม่สนใจทั้งที่แอบหึง",
    "คำถามที่อยากถาม Grok": "ทำยังไงให้ยอมรับว่าหึง",
    "คำแนะนำจาก Grok": "ชวนคุยตรง ๆ แล้วสังเกตสีหน้าก่อน อย่าเพิ่งเดาไปเอง",
    "ข้อความความคิดเห็น 1": "GIF นี้ตรงกับชีวิตจริงมาก 55555",
    "ข้อความแซวในความคิดเห็น 2": "เห็นหรือยังเนี่ย?!",
    "คำค้นหาก่อนชื่อผู้ใช้": "วิธีทำให้",
    "คำค้นหาหลังชื่อผู้ใช้": "ประทับใจในเดตแรก",
    "คำค้นหาไอเดียของขวัญก่อนชื่อผู้ใช้": "ซื้อของขวัญอะไรให้",
    "คำค้นหาส่วนท้ายไอเดียของขวัญ": "ดี",
    "คำค้นหาอาการเขินก่อนชื่อผู้ใช้": "วิธีแก้เขินเวลาอยู่ใกล้",
    "คำค้นหาร้านอาหารทั้งประโยค": "ร้านอาหารบรรยากาศดีแถวสยาม",
    "หัวข้อเทรนด์ก่อนชื่อคู่สนทนา": "ข่าวลือล่าสุด",
    "คำค้นหาวิธีปกปิดร่องรอย": "วิธีปกปิดร่องรอยบนร่างกาย",
    "คำค้นหาสถานที่เที่ยว": "สถานที่เที่ยวลับ ๆ ในกรุงเทพฯ",
    "กิจวัตรประจำวัน": "เดินเล่นเรื่อยเปื่อย",
    "กิจกรรมที่กำลังทำ": "เปิดเพลงคลอเบา ๆ แล้วพักผ่อน",
    "อารมณ์ของฉาก": "สงบ",
    "สถานะความรู้สึกของตัวละคร": "รู้สึกผ่อนคลายและสบายใจ",
    "{{char}} ตกอยู่ในภวังค์ความรักของ {{user}}": "เรย์กำลังตกอยู่ในภวังค์ความรักของคุณ",
    "จินตนาการถึงคืนที่จะได้อยู่ตามลำพังกับ {{user}}": "จินตนาการถึงคืนที่ได้ใช้เวลาส่วนตัวกับคุณ",
    "{{char}} กำลังรอให้ {{user}} มาลูบหัวและกอด": "เรย์กำลังรอให้คุณมาลูบหัวและกอด",
    "กลิ่นสตรอว์เบอร์รีฟุ้งกระจายเวลา {{char}} อยู่ใกล้ {{user}}": "กลิ่นสตรอว์เบอร์รีอ่อน ๆ ลอยมาเมื่อเรย์อยู่ใกล้คุณ",
    "หัวใจพองโตเหมือนลอยอยู่ในน้ำทะเลอุ่นๆ": "ใจเบาสบายเหมือนลอยอยู่ท่ามกลางคลื่นอุ่น ๆ",
    "นุ่มฟู ละมุนใจ เหมือนได้ทานขนมอบสดใหม่": "ละมุนอบอุ่นเหมือนนั่งพักในคาเฟ่",
    "ท่ามกลางความหนาวเย็น {{char}} ขออุ่นไอรักจาก {{user}}": "ท่ามกลางหิมะ เรย์ขอแบ่งปันไออุ่นกับคุณ",
    "เจ้าไดโนตัวจิ๋วพร้อมพุ่งชนด้วยความรักแล้ว": "เจ้าตัวจิ๋วกำลังวิ่งเข้ามาหาคุณอย่างร่าเริง",
    "ใครเข้าใกล้ {{user}} มีหวังโดนฉลามน้อยงับแน่!": "ใครเข้าใกล้คุณ ฉลามน้อยก็รีบว่ายมาหวงทันที!",
    "นั่งแช่น้ำอุ่นมองหน้า {{user}} อย่างมีความสุข": "นั่งแช่น้ำอุ่นคุยกับคุณอย่างสบายใจ",
    "อยากกระโดดเข้าไปกอด {{user}} ให้แน่นที่สุด": "อยากวิ่งเข้าไปกอดคุณให้แน่น ๆ",
    "{{char}} ได้เพิ่มรูปภาพใหม่ใน Story": "เรย์เพิ่มภาพบรรยากาศร้านกาแฟลง Story",
    "พักผ่อน": "พักผ่อนหลังเลิกงาน",
    "กิจวัตรประจำวัน กับ {{user}}": "เดินเล่นในสวนกับคุณ",
    "กิจกรรมที่กำลังทำ กับ {{user}}": "อ่านหนังสือกับคุณ",
    "{{char}} ➔ {{user}}": "เรย์ ➔ คุณ",
    "กิจกรรมตามนัดหมายกับ {{user}} ที่จุดนัดหมาย": "ดื่มกาแฟกับคุณที่คาเฟ่ริมแม่น้ำ",
    "ไปกับ {{user}}": "ไปดูหนังกับคุณ",
    "{{char}} VS {{user}}": "เรย์ VS คุณ",
    "{{char}} & {{user}}": "เรย์ & คุณ",
    "{{char}} feat. {{user}}": "เรย์ feat. คุณ",
    "{{char}} 𐙚 {{user}}": "เรย์ 𐙚 คุณ",
    "สถานที่: พิกัดเมืองนีออนยามค่ำคืน • กรุงเทพฯ": "สถานที่: ย่านสยามยามค่ำคืน • กรุงเทพฯ",
    "กำลังเดินทางร่วมกับ: {{user}}": "กำลังเดินทางไปด้วยกันกับคุณ",
    "สถานที่และบรรยากาศของฉาก": "ริมหน้าต่างห้องในค่ำคืนที่เงียบสงบ",
    "กิจกรรมตามนัดหมาย": "ดื่มกาแฟ",
    "กิจกรรมช่วงบ่าย": "เลือกซื้อของและทำธุระส่วนตัว",
    "กิจกรรมมื้อค่ำ": "รับประทานอาหารและคุยเรื่องแผนต่อไป",
    "งานสำคัญประจำสัปดาห์": "จองตั๋วสำหรับทริปกับเพื่อน",
    "ระดับความเร่งด่วนของงาน 1": "ด่วนที่สุด",
    "กำหนดส่งงาน 1": "ภายในวันนี้",
    "กิจกรรมของงาน 2": "เลือกชุดสำหรับเดตสุดสัปดาห์",
    "ระดับความสำคัญของงาน 2": "ปานกลาง",
    "กิจกรรมของงาน 3": "จัดการยอดหนี้สินคงค้าง",
    "ระดับความสำคัญของงาน 3": "ทั่วไป",
    "งานเตือนความจำ 1": "ซื้อของใช้จำเป็นเข้าห้อง",
    "รายละเอียดงานเตือนความจำ 1": "แบ่งหน้าที่กันซื้อ",
    "กำหนดเวลางาน 1": "วันนี้",
    "หัวข้อข้อความที่ต้องตอบ": "แผนคืนนี้",
    "รายละเอียดงานเตือนความจำ 2": "อย่าปล่อยให้รอนาน",
    "ระดับความเร่งด่วนงาน 2": "ด่วน",
    "งานเตือนความจำ 3": "ตรวจเช็กกุญแจก่อนออกจากบ้าน",
    "ความถี่งาน 3": "ทุกวัน",
    "ระดับแบตเตอรี่": "■■■",
    "สภาพอากาศ": "ฝนตกปรอย ๆ",
    "ชื่อเพลง": "คืนที่ดาวเต็มฟ้า",
    "ชื่อศิลปิน / ศิลปินเจ้าของผลงาน": "Mira",
    "เพลงที่กำลังฟังด้วยกัน": "คืนที่ดาวเต็มฟ้า",
    "ชื่อเพลงที่เปิดคลอในฉาก": "Lo-fi 2000s Pop Remix",
    "อีโมจิ 1": "📷",
    "ชื่อเว็บไซต์ 1": "Instagram",
    "อีโมจิ 2": "🔒",
    "ชื่อเว็บไซต์ 2": "เว็บส่วนตัว",
    "อีโมจิ 3": "🛍️",
    "ชื่อเว็บไซต์ 3": "Shopee",
    "อีโมจิ 4": "💬",
    "ชื่อเว็บไซต์ 4": "LINE",
  };
  if (Object.hasOwn(semanticSamples, clean)) return semanticSamples[clean];
  if (isRubiiPercentageSlot(slot)) return clean || "88%";
  if (!slot?.explicit) return raw || "ตัวอย่างทดสอบ";
  const text = `${raw} ${slot?.label ?? ""}`.toLocaleLowerCase("th");

  if (/ต\.ค\.|พ\.ย\.|ธ\.ค\.|ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|พ\.ค\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\./.test(raw) && /•|:/.test(raw)) return clean;
  if (/^\(?[฿$£€¥]?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?\)?$/.test(raw)) return clean;
  if (/^[A-Z\d-]{6,}$/i.test(clean) || /ref|อ้างอิง|reference|เลขที่|รหัส/i.test(text)) return clean || "202610068841KB";
  if (/xxx|บัญชี|wallet|วอลเล็ท|เบอร์/i.test(raw)) return clean || "xxx-x-x8841-x";
  if (/\{\{char\}\}|ชื่อตัวละคร/.test(text)) return "Mira";
  if (/\{\{user\}\}|ชื่อผู้ใช้/.test(text)) return "คุณ";
  if (/hh:mm|เวลา|time|\b\d{1,2}:\d{2}\b|\b\d{1,2}'\d{2}"\d{2}\b/.test(text)) return raw && /\b\d{1,2}[:']\d{2}/.test(raw) ? clean : "20:39 น.";
  if (/สไตล์|เสื้อผ้า|ชุด|อุปกรณ์|outfit|style/i.test(text)) return "เสื้อยืดโอเวอร์ไซส์และกางเกงคาร์โก้";
  if (/^(\(\s*วันที่\s*\)|\(\s*วัน\/เลขวันที่\s*\))$/i.test(raw)) return "7";
  if (/เดือน.*ปี|เดือน\/ปี|พ\.ศ\.|month.*year/.test(text)) return "ตุลาคม 2569";
  if (/วันที่|date/.test(text)) return "06 ต.ค. 2569";
  if (/เดือน|month/.test(text)) return "ตุลาคม";
  if (/วัน|weekday|day/.test(text)) return "วันพุธ";
  if (/สถานที่|location/.test(text)) return "กรุงเทพฯ";
  if (/จำนวนเงิน|ยอดโอน|ราคา|price|amount|ปลดล็อก/.test(text)) return "50,000.00";
  if (/เครดิต|credits/.test(text)) return "350 Credits";
  if (/likes|ไลก์/.test(text)) return "2,840 Likes";
  if (/comments|คอมเมนต์/.test(text)) return "156 Comments";
  if (/mood|อารมณ์/.test(text)) return "อารมณ์ดี";
  if (/affection|ความสัมพันธ์/.test(text)) return "72";
  if (/status|สถานะ/.test(text)) return "ออนไลน์";
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
  return clean || "ตัวอย่างข้อมูล";
}

function buildRubiiSections(snippet) {
  const englishMode = pageLanguageSlug === "en";
  const vietnameseMode = pageLanguageSlug === "vi";
  const localizedMode = englishMode || vietnameseMode;
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
  const styleValue = translateAppValue(rubiiSampleValue(styleSlot));
  const styleExample = `<${tagName}>${styleValue}</${tagName}>`;
  const regexOutput = regexSlots.length
    ? `<${tagName}>${regexSlots.map((slot) => translateAppValue(rubiiSampleValue(slot))).join("||")}</${tagName}>`
    : styleSlot ? styleExample : localizedMode
      ? translateAppValue("ยังไม่ได้เลือกช่อง — เลือก Marker หรือข้อความที่ตรวจดูแล้วก่อน")
      : "ยังไม่ได้เลือกช่อง — เลือก Marker หรือข้อความที่ตรวจดูแล้วก่อน";
  const styleDescription = translateAppValue(rubiiSlotLabel(styleSlot, 0, snippet)) || (localizedMode ? translateAppValue("เนื้อหาหลัก") : "เนื้อหาหลัก");
  const regexDescriptions = regexSlots.map((slot, index) => `\`$${index + 1}\` = ${translateAppValue(rubiiSlotLabel(slot, index, snippet))}`).join("; ");
  const extraRules = state.extraRegexRules ?? [];
  const regexLines = [];
  const patternLabel = vietnameseMode ? "Mẫu Regex:" : "Pattern:";
  const replacementLabel = vietnameseMode ? "Chuỗi thay thế:" : "Replacement:";
  if (regexSlots.length) {
    regexLines.push(
      localizedMode ? translateAppValue("Regex 1 · หลายช่อง · เนื้อหาต้นฉบับ") : "Regex 1 · หลายช่อง · เนื้อหาต้นฉบับ",
      `${patternLabel} ${buildRegexPattern(tagName, regexSlots)}`,
      `${replacementLabel} ${regexTemplate.template}`,
    );
  }
  extraRules.forEach((rule, index) => {
    const generatedFallback = ["pipe", "comma", "newline"].includes(rule.generatedFormat);
    regexLines.push(
      localizedMode
        ? `Regex ${regexSlots.length ? index + 2 : index + 1} · ${translateAppValue(rule.name || `Regex เพิ่มเติม ${index + 1}`)} · ${translateAppValue(rule.stage === "displayed" ? "ข้อความที่แสดง" : "เนื้อหาต้นฉบับ")}`
        : `Regex ${regexSlots.length ? index + 2 : index + 1} · ${rule.name || `Regex เพิ่มเติม ${index + 1}`} · ${rule.stage === "displayed" ? "ข้อความที่แสดง" : "เนื้อหาต้นฉบับ"}`,
      `${patternLabel} ${generatedFallback ? buildRegexPattern(tagName, regexSlots, rule.generatedFormat) : rule.pattern || (localizedMode ? translateAppValue("(ยังไม่ได้กำหนด)") : "(ยังไม่ได้กำหนด)")}`,
      `${replacementLabel} ${generatedFallback ? regexTemplate.template : rule.replacement || (localizedMode ? translateAppValue("(ยังไม่ได้กำหนด)") : "(ยังไม่ได้กำหนด)")}`,
    );
  });
  const systemPrompt = englishMode ? [
    `### ${snippet.title}`,
    "",
    `- When there is data for this card, use the tag \`<${tagName}>…</${tagName}>\``,
    styleSlot ? `- **Style tag:** Put one value for \`${styleDescription}\` in the tag` : null,
    regexSlots.length > 1
      ? `- **Regex:** Keep this order: ${regexDescriptions}; separate values with \`||\``
      : regexSlots.length === 1
        ? `- **Regex:** Put one value for \`${translateAppValue(rubiiSlotLabel(regexSlots[0], 0, snippet))}\` in the tag`
        : null,
    regexSlots.length ? "- Use either a Style tag or Regex for this tag" : null,
    regexSlots.length > 1 ? "- Do not include `||` in a value or write HTML/CSS" : "- Do not write HTML/CSS",
    "",
    "### Example message to send",
    regexOutput,
  ].filter((line) => line !== null).join("\n") : vietnameseMode ? [
    `### ${snippet.title}`,
    "",
    `- Khi có dữ liệu cho thẻ này, hãy dùng tag \`<${tagName}>…</${tagName}>\``,
    styleSlot ? `- **Style tag:** Đưa một giá trị cho \`${styleDescription}\` vào tag` : null,
    regexSlots.length > 1
      ? `- **Regex:** Giữ thứ tự này: ${regexDescriptions}; phân tách các giá trị bằng \`||\``
      : regexSlots.length === 1
        ? `- **Regex:** Đưa một giá trị cho \`${translateAppValue(rubiiSlotLabel(regexSlots[0], 0, snippet))}\` vào tag`
        : null,
    regexSlots.length ? "- Chỉ dùng Style tag hoặc Regex cho tag này" : null,
    regexSlots.length > 1 ? "- Không đưa `||` vào giá trị và không viết HTML/CSS" : "- Không viết HTML/CSS",
    "",
    "### Tin nhắn mẫu cần gửi",
    regexOutput,
  ].filter((line) => line !== null).join("\n") : [
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
    regex: regexLines.length ? regexLines.join("\n\n") : localizedMode
      ? translateAppValue("ยังไม่ได้เลือกช่องสำหรับ Regex — เลือกข้อความใน Quick Edit หรือเพิ่มกฎ Regex เพิ่มเติม")
      : "ยังไม่ได้เลือกช่องสำหรับ Regex — เลือกข้อความใน Quick Edit หรือเพิ่มกฎ Regex เพิ่มเติม",
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
    if (pageLanguageSlug === "en") {
      return ({
        template: "HTML template (Style tag)",
        html: "Raw HTML",
        css: "Global CSS",
        output: "Test text (Output)",
        settings: "Character setup · System Prompt",
      })[key] ?? "HTML";
    }
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
  const sampleValues = pageLanguageSlug === "en"
    ? ["Sample text", "Bangkok", "21:29", "29°C · Mostly cloudy"]
    : ["ตัวอย่างข้อความ", "ตัวอย่างสถานที่", "21:29", "29°C · มีเมฆมาก"];
  html = html.replace(/\$(\d+)/g, (_match, index) => sampleValues[Number(index) - 1] ?? "ตัวอย่าง");
  html = htmlWithBackground(snippet, html);

  const css = editedCode(snippet, "css");
  const isDirectEdit = visualEditEnabled ? visualEditEnabled.checked : false;
  const directEditStyles = isDirectEdit ? `
    [contenteditable="true"]:hover { outline: 1.5px dashed rgba(135,230,228,.65) !important; border-radius: 4px; cursor: text; }
    [contenteditable="true"]:focus { outline: 2px solid rgba(135,230,228,.9) !important; border-radius: 4px; background: rgba(135,230,228,.1); cursor: text; }
    .selection-mini-toolbar {
      position: absolute;
      z-index: 999999;
      display: none;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      background: rgba(13, 16, 25, 0.96);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(135, 230, 228, 0.4);
      border-radius: 10px;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08);
      user-select: none;
      animation: toolbarFadeIn 0.15s ease-out;
      transform: translateY(-8px);
      transition: opacity 0.15s ease, transform 0.15s ease;
    }
    @keyframes toolbarFadeIn {
      from { opacity: 0; transform: translateY(-2px); }
      to { opacity: 1; transform: translateY(-8px); }
    }
    .mini-toolbar-colors { display: flex; align-items: center; gap: 5px; }
    .mini-color-btn { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.25); cursor: pointer; padding: 0; transition: transform 0.12s ease, box-shadow 0.12s ease; }
    .mini-color-btn:hover { transform: scale(1.22); box-shadow: 0 0 8px rgba(255, 255, 255, 0.5); }
    .mini-toolbar-picker-btn { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 6px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer; color: #87e6e4; }
    .mini-toolbar-picker-btn input[type="color"] { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
    .mini-toolbar-divider { width: 1px; height: 18px; background: rgba(255, 255, 255, 0.15); margin: 0 2px; }
    .mini-toolbar-actions { display: flex; align-items: center; gap: 4px; }
    .mini-btn { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #e2e8f0; font-size: 10.5px; font-weight: 600; padding: 3px 8px; border-radius: 6px; cursor: pointer; transition: all 0.12s ease; font-family: inherit; }
    .mini-btn:hover { background: rgba(135, 230, 228, 0.2); border-color: rgba(135, 230, 228, 0.5); color: #ffffff; }
  ` : "";

  const values = fieldValues(snippet);
  const fieldsMapping = currentFields.map((f) => ({
    id: f.id,
    token: f.token || f.original || f.value,
    value: values[f.id] ?? f.value,
  }));

  const directEditToolbarHtml = isDirectEdit ? `
    <div id="selection-mini-toolbar" class="selection-mini-toolbar" style="display:none;">
      <div class="mini-toolbar-colors">
        <button type="button" class="mini-color-btn" data-color="#ffffff" title="White" style="background:#ffffff;"></button>
        <button type="button" class="mini-color-btn" data-color="#fef08a" title="Light Gold" style="background:#fef08a;"></button>
        <button type="button" class="mini-color-btn" data-color="#38bdf8" title="Cyan Glow" style="background:#38bdf8;"></button>
        <button type="button" class="mini-color-btn" data-color="#c084fc" title="Purple Neon" style="background:#c084fc;"></button>
        <button type="button" class="mini-color-btn" data-color="#4ade80" title="Mint Green" style="background:#4ade80;"></button>
        <button type="button" class="mini-color-btn" data-color="#f87171" title="Coral Red" style="background:#f87171;"></button>
        <button type="button" class="mini-color-btn" data-color="#18181b" title="Dark" style="background:#18181b; border:1px solid #555;"></button>
        <label class="mini-toolbar-picker-btn" title="เลือกสีข้อความเฉพาะจุด">
          <input type="color" id="mini-custom-color" value="#38bdf8" aria-label="เลือกสีข้อความ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/></svg>
        </label>
      </div>
      <div class="mini-toolbar-divider"></div>
      <div class="mini-toolbar-actions">
        <button type="button" id="mini-toggle-bold" title="ตัวหนา" class="mini-icon-btn">B</button>
        <button type="button" id="mini-toggle-italic" title="ตัวเอียง" class="mini-icon-btn" style="font-style:italic;">I</button>
        <button type="button" id="mini-toggle-underline" title="ขีดเส้นใต้" class="mini-icon-btn" style="text-decoration:underline;">U</button>
        <button type="button" id="mini-toggle-upper" title="พิมพ์ใหญ่ทั้งหมด" class="mini-icon-btn" style="font-size:9.5px;">AA</button>
      </div>
      <div class="mini-toolbar-divider"></div>
      <div class="mini-toolbar-actions">
        <button type="button" id="mini-toggle-glow" title="เพิ่มแสงนีออน" class="mini-btn">Glow</button>
        <button type="button" id="mini-toggle-shadow" title="เพิ่มเงามืดคมชัด" class="mini-btn">Shadow</button>
        <button type="button" id="mini-clear-format" title="ล้างการจัดรูปแบบ" class="mini-btn">Clear</button>
      </div>
    </div>
  ` : "";

  const directEditScript = isDirectEdit ? `
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const fieldsList = ${JSON.stringify(fieldsMapping)};
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (parent && !parent.closest('script,style,template,noscript,#selection-mini-toolbar')) {
          const text = node.nodeValue.trim();
          if (text) {
            parent.setAttribute('contenteditable', 'true');
            parent.setAttribute('spellcheck', 'false');
            parent.title = 'คลิกเพื่อพิมพ์แก้ข้อความนี้ได้โดยตรง (หรือไฮไลต์เพื่อเปลี่ยนสี/ใส่เงา/ทำตัวหนา)';
            
            const matched = fieldsList.find((f) => f.value === text || f.token === text || text.includes(f.value) || (f.token && text.includes(f.token)));
            if (matched && !parent.dataset.fieldId) {
              parent.dataset.fieldId = matched.id;
              parent.dataset.token = matched.token;
            }
          }
        }
      }

      function triggerSync(targetEl) {
        const target = targetEl || document.querySelector('[contenteditable="true"]');
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
          const tb = clone.querySelector('#selection-mini-toolbar');
          if (tb) tb.remove();
          window.parent.postMessage({
            type: 'PREVIEW_DIRECT_TEXT_INPUT',
            fieldId: fieldId,
            newText: newText,
            token: token,
            html: clone.outerHTML
          }, '*');
        }
      }

      document.body.addEventListener('input', (e) => {
        const target = e.target.closest('[contenteditable="true"]');
        triggerSync(target);
      });

      // Floating Selection Toolbar Logic
      const toolbar = document.getElementById('selection-mini-toolbar');
      let lastRange = null;

      function updateToolbarPosition() {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.rangeCount) {
          if (toolbar) toolbar.style.display = 'none';
          return;
        }

        const range = sel.getRangeAt(0);
        const commonAncestor = range.commonAncestorContainer;
        const editable = (commonAncestor.nodeType === 1 ? commonAncestor : commonAncestor.parentElement)?.closest('[contenteditable="true"]');
        if (!editable) {
          if (toolbar) toolbar.style.display = 'none';
          return;
        }

        lastRange = range.cloneRange();
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
          if (toolbar) toolbar.style.display = 'none';
          return;
        }

        toolbar.style.display = 'flex';
        const tbWidth = toolbar.offsetWidth || 340;
        const top = Math.max(8, rect.top - 46 + window.scrollY);
        const left = Math.max(8, Math.min(window.innerWidth - tbWidth - 8, rect.left + (rect.width / 2) - (tbWidth / 2) + window.scrollX));
        toolbar.style.top = top + 'px';
        toolbar.style.left = left + 'px';
      }

      document.addEventListener('selectionchange', updateToolbarPosition);
      window.addEventListener('resize', updateToolbarPosition);
      window.addEventListener('scroll', updateToolbarPosition);

      function applyStyleToSelection(styles) {
        const sel = window.getSelection();
        let range = (sel && sel.rangeCount && !sel.isCollapsed) ? sel.getRangeAt(0) : lastRange;
        if (!range || range.collapsed) return;

        const span = document.createElement('span');
        if (styles.color) span.style.setProperty('color', styles.color, 'important');
        if (styles.textShadow) span.style.setProperty('text-shadow', styles.textShadow, 'important');
        if (styles.fontWeight) span.style.setProperty('font-weight', styles.fontWeight, 'important');
        if (styles.fontStyle) span.style.setProperty('font-style', styles.fontStyle, 'important');
        if (styles.textDecoration) span.style.setProperty('text-decoration', styles.textDecoration, 'important');
        if (styles.textTransform) span.style.setProperty('text-transform', styles.textTransform, 'important');

        try {
          const contents = range.extractContents();
          span.appendChild(contents);
          range.insertNode(span);
          sel.removeAllRanges();
          const newRange = document.createRange();
          newRange.selectNodeContents(span);
          sel.addRange(newRange);
        } catch (err) {
          console.error(err);
        }

        const editable = span.closest('[contenteditable="true"]');
        triggerSync(editable);
        updateToolbarPosition();
      }

      if (toolbar) {
        toolbar.addEventListener('mousedown', (e) => {
          if (e.target.tagName !== 'INPUT') e.preventDefault();
        });

        toolbar.querySelectorAll('[data-color]').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            applyStyleToSelection({ color: btn.dataset.color });
          });
        });

        const customColorInput = toolbar.querySelector('#mini-custom-color');
        if (customColorInput) {
          customColorInput.addEventListener('input', () => {
            applyStyleToSelection({ color: customColorInput.value });
          });
        }

        const boldBtn = toolbar.querySelector('#mini-toggle-bold');
        if (boldBtn) {
          boldBtn.addEventListener('click', (e) => {
            e.preventDefault();
            applyStyleToSelection({ fontWeight: 'bold' });
          });
        }

        const italicBtn = toolbar.querySelector('#mini-toggle-italic');
        if (italicBtn) {
          italicBtn.addEventListener('click', (e) => {
            e.preventDefault();
            applyStyleToSelection({ fontStyle: 'italic' });
          });
        }

        const underlineBtn = toolbar.querySelector('#mini-toggle-underline');
        if (underlineBtn) {
          underlineBtn.addEventListener('click', (e) => {
            e.preventDefault();
            applyStyleToSelection({ textDecoration: 'underline' });
          });
        }

        const upperBtn = toolbar.querySelector('#mini-toggle-upper');
        if (upperBtn) {
          upperBtn.addEventListener('click', (e) => {
            e.preventDefault();
            applyStyleToSelection({ textTransform: 'uppercase' });
          });
        }

        const glowBtn = toolbar.querySelector('#mini-toggle-glow');
        if (glowBtn) {
          glowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetColor = (customColorInput ? customColorInput.value : null) || '#38bdf8';
            applyStyleToSelection({
              textShadow: '0 0 8px ' + targetColor + ', 0 0 16px ' + targetColor
            });
          });
        }

        const shadowBtn = toolbar.querySelector('#mini-toggle-shadow');
        if (shadowBtn) {
          shadowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            applyStyleToSelection({
              textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 1px rgba(0,0,0,0.95)'
            });
          });
        }

        const clearBtn = toolbar.querySelector('#mini-clear-format');
        if (clearBtn) {
          clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const sel = window.getSelection();
            let range = (sel && sel.rangeCount && !sel.isCollapsed) ? sel.getRangeAt(0) : lastRange;
            if (!range) return;
            try {
              const contents = range.extractContents();
              const text = contents.textContent;
              const textNode = document.createTextNode(text);
              range.insertNode(textNode);
              sel.removeAllRanges();
              const newRange = document.createRange();
              newRange.selectNode(textNode);
              sel.addRange(newRange);
              triggerSync(textNode.parentElement?.closest('[contenteditable="true"]'));
            } catch (err) {
              console.error(err);
            }
            updateToolbarPosition();
          });
        }
      }
    });
  </script>` : "";

  return `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>
    *{box-sizing:border-box}html,body{min-height:100%;margin:0}body{padding:12px;background:#191d27;color:#f2f4fa;font-family:Arial,"Noto Sans Thai",sans-serif;overflow-x:hidden}img{max-width:100%}pre{white-space:pre-wrap;overflow-wrap:anywhere}
    ${directEditStyles}
    ${css}
  </style></head><body>${html}${directEditToolbarHtml}${directEditScript}</body></html>`;
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
  renderHighlightedCode(output, activeCodeKey);
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
  const optRow = document.querySelector(".background-options-row");
  if (optRow) optRow.hidden = !state.enabled;
  const urlField = document.querySelector(".background-url-field");
  if (urlField && !optRow) urlField.hidden = !state.enabled;
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
function updateTextShadow(snippet, value) {
  backgroundState(snippet).textShadow = value;
  if (quickTextShadow) quickTextShadow.value = value;
  updateCodePanel(snippet);
  renderPreview(snippet);
}

function updateShadowColorSelect(snippet, value) {
  const state = backgroundState(snippet);
  state.shadowColor = value === "custom" ? (state.shadowColor || "#000000") : value;
  if (quickShadowColor) quickShadowColor.value = value;
  if (value !== "custom") {
    if (quickShadowColorPicker) quickShadowColorPicker.value = value;
  }
  updateCodePanel(snippet);
  renderPreview(snippet);
}

function updateShadowColorPicker(snippet, hexValue) {
  const state = backgroundState(snippet);
  state.shadowColor = hexValue;
  const standardShadows = ["#000000", "#38bdf8", "#c084fc", "#fef08a", "#4ade80", "#f87171", "#ffffff"];
  const matchingValue = standardShadows.includes(hexValue) ? hexValue : "custom";
  if (quickShadowColor) quickShadowColor.value = matchingValue;
  if (quickShadowColorPicker) quickShadowColorPicker.value = hexValue;
  updateCodePanel(snippet);
  renderPreview(snippet);
}

function updateShadowBlur(snippet, blurValue) {
  const state = backgroundState(snippet);
  state.shadowBlur = Number(blurValue);
  if (quickShadowBlur) quickShadowBlur.value = blurValue;
  if (quickShadowBlurBadge) quickShadowBlurBadge.textContent = `${blurValue}px`;
  updateCodePanel(snippet);
  renderPreview(snippet);
}

function updateShadowOffset(snippet, offsetValue) {
  const state = backgroundState(snippet);
  state.shadowOffset = Number(offsetValue);
  if (quickShadowOffset) quickShadowOffset.value = offsetValue;
  if (quickShadowOffsetBadge) quickShadowOffsetBadge.textContent = `${offsetValue}px`;
  updateCodePanel(snippet);
  renderPreview(snippet);
}

function updateTextColorSelect(snippet, value) {
  const state = backgroundState(snippet);
  state.textColor = value;
  if (quickTextColor) quickTextColor.value = value;
  if (state.textColor !== "auto" && state.textColor !== "custom") {
    if (quickTextColorPicker) quickTextColorPicker.value = state.textColor;
  }
  updateCodePanel(snippet);
  renderPreview(snippet);
}

function updateTextColorPicker(snippet, hexValue) {
  const state = backgroundState(snippet);
  state.customTextColor = hexValue;
  state.textColor = "custom";
  if (quickTextColor) quickTextColor.value = "custom";
  if (quickTextColorPicker) quickTextColorPicker.value = hexValue;
  updateCodePanel(snippet);
  renderPreview(snippet);
}

function updateFontWeight(snippet, value) {
  backgroundState(snippet).fontWeight = value;
  if (quickFontWeight) quickFontWeight.value = value;
  updateCodePanel(snippet);
  renderPreview(snippet);
}

function updateFontStyle(snippet, value) {
  backgroundState(snippet).fontStyle = value;
  if (quickFontStyle) quickFontStyle.value = value;
  updateCodePanel(snippet);
  renderPreview(snippet);
}

function updateTextTransform(snippet, value) {
  backgroundState(snippet).textTransform = value;
  if (quickTextTransform) quickTextTransform.value = value;
  updateCodePanel(snippet);
  renderPreview(snippet);
}

function updateLetterSpacing(snippet, value) {
  backgroundState(snippet).letterSpacing = value;
  if (quickLetterSpacing) quickLetterSpacing.value = value;
  updateCodePanel(snippet);
  renderPreview(snippet);
}

function updateFontFamily(snippet, value) {
  backgroundState(snippet).fontFamily = value;
  if (quickFontFamily) quickFontFamily.value = value;
  updateCodePanel(snippet);
  renderPreview(snippet);
}

if (quickTextShadow) {
  quickTextShadow.addEventListener("change", () => {
    const snippet = snippets.find((item) => item.id === selectedSnippetId);
    if (snippet) updateTextShadow(snippet, quickTextShadow.value);
  });
}

if (quickShadowColor) {
  quickShadowColor.addEventListener("change", () => {
    const snippet = snippets.find((item) => item.id === selectedSnippetId);
    if (snippet) updateShadowColorSelect(snippet, quickShadowColor.value);
  });
}

if (quickShadowColorPicker) {
  quickShadowColorPicker.addEventListener("input", () => {
    const snippet = snippets.find((item) => item.id === selectedSnippetId);
    if (snippet) updateShadowColorPicker(snippet, quickShadowColorPicker.value);
  });
}

if (quickShadowBlur) {
  quickShadowBlur.addEventListener("input", () => {
    const snippet = snippets.find((item) => item.id === selectedSnippetId);
    if (snippet) updateShadowBlur(snippet, quickShadowBlur.value);
  });
}

if (quickShadowOffset) {
  quickShadowOffset.addEventListener("input", () => {
    const snippet = snippets.find((item) => item.id === selectedSnippetId);
    if (snippet) updateShadowOffset(snippet, quickShadowOffset.value);
  });
}

if (quickTextColor) {
  quickTextColor.addEventListener("change", () => {
    const snippet = snippets.find((item) => item.id === selectedSnippetId);
    if (snippet) updateTextColorSelect(snippet, quickTextColor.value);
  });
}

if (quickTextColorPicker) {
  quickTextColorPicker.addEventListener("input", () => {
    const snippet = snippets.find((item) => item.id === selectedSnippetId);
    if (snippet) updateTextColorPicker(snippet, quickTextColorPicker.value);
  });
}

if (quickFontWeight) {
  quickFontWeight.addEventListener("change", () => {
    const snippet = snippets.find((item) => item.id === selectedSnippetId);
    if (snippet) updateFontWeight(snippet, quickFontWeight.value);
  });
}

if (quickFontStyle) {
  quickFontStyle.addEventListener("change", () => {
    const snippet = snippets.find((item) => item.id === selectedSnippetId);
    if (snippet) updateFontStyle(snippet, quickFontStyle.value);
  });
}

if (quickTextTransform) {
  quickTextTransform.addEventListener("change", () => {
    const snippet = snippets.find((item) => item.id === selectedSnippetId);
    if (snippet) updateTextTransform(snippet, quickTextTransform.value);
  });
}

if (quickLetterSpacing) {
  quickLetterSpacing.addEventListener("change", () => {
    const snippet = snippets.find((item) => item.id === selectedSnippetId);
    if (snippet) updateLetterSpacing(snippet, quickLetterSpacing.value);
  });
}

if (quickFontFamily) {
  quickFontFamily.addEventListener("change", () => {
    const snippet = snippets.find((item) => item.id === selectedSnippetId);
    if (snippet) updateFontFamily(snippet, quickFontFamily.value);
  });
}
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
    const uiResponse = await fetch(`/i18n/ui/${pageLanguageSlug}.json`);
    if (!uiResponse.ok) throw new Error(`UI dictionary request failed: ${uiResponse.status}`);
    uiStrings = await uiResponse.json();
    if (pageLanguageSlug === "en" || pageLanguageSlug === "vi") {
      const appResponse = await fetch(`/i18n/app/${pageLanguageSlug}.json`);
      if (!appResponse.ok) throw new Error(`App dictionary request failed: ${appResponse.status}`);
      appStrings = await appResponse.json();
      try {
        enableAppLocalization();
      } catch (localizationError) {
        console.error("Live app localization failed; continuing catalog load", localizationError);
      }
    }

    const [categoriesResponse, snippetsResponse] = await Promise.all([
      fetch(`/data/${pageLanguageSlug}/snippet-categories.json`),
      fetch(`/data/${pageLanguageSlug}/snippets.json`)
    ]);
    let categoriesResponseToRead = categoriesResponse;
    let rawSnippets = [];
    let catalogIncomplete = false;

    if (!categoriesResponseToRead.ok && pageLanguageSlug !== "th") {
      categoriesResponseToRead = await fetch("/data/th/snippet-categories.json");
      catalogIncomplete = true;
    }
    if (!categoriesResponseToRead.ok) throw new Error(`Category catalog request failed: ${categoriesResponseToRead.status}`);

    if (snippetsResponse.ok) {
      rawSnippets = await snippetsResponse.json();
    } else if (pageLanguageSlug !== "th") {
      catalogIncomplete = true;
    } else {
      throw new Error(`Snippet catalog request failed: ${snippetsResponse.status}`);
    }

    const rawCategories = await categoriesResponseToRead.json();
    if (!Array.isArray(rawCategories) || !Array.isArray(rawSnippets)) {
      throw new Error(`Invalid catalog format for ${pageLanguageSlug}`);
    }

    categories = rawCategories.sort((a, b) => a.order - b.order);
    const order = new Map(categories.map((category, index) => [category.id, index]));
    const isLocalPreview = document.body.dataset.localPreview === "true";
    const showDraftPreview = isLocalPreview && new URLSearchParams(window.location.search).get("preview-drafts") === "1";
    snippets = rawSnippets
      .filter((item) => item.status === "published" || (showDraftPreview && item.status === "draft" && item.locale === pageLanguageSlugLocale()))
      .filter((item) => pageLanguageSlug === "th" || !THAILAND_ONLY_BANK_SNIPPET_IDS.has(item.id))
      .sort((a, b) => (order.get(a.categoryId) ?? 99) - (order.get(b.categoryId) ?? 99));
    const fallbackNotice = document.getElementById("language-fallback-notice");
    if (fallbackNotice && showDraftPreview) {
      const draftCount = snippets.filter((item) => item.status === "draft").length;
      fallbackNotice.textContent = t("language.draftPreview.notice", { count: draftCount });
      fallbackNotice.hidden = false;
    } else if (fallbackNotice && (catalogIncomplete || document.body.dataset.languageEnabled !== "true")) {
      const previewingDisabledLanguage = isLocalPreview && document.body.dataset.languageEnabled !== "true";
      fallbackNotice.textContent = t(previewingDisabledLanguage ? "language.preview.notice" : "language.fallback.notice");
      fallbackNotice.hidden = false;
    }
    totalCount.textContent = snippets.length;
    selectedCategoryId = "all";
    loadingState.hidden = true;
    render();
  } catch (err) {
    console.error(err);
    loadingState.hidden = true;
    errorState.hidden = false;
    const fallbackNotice = document.getElementById("language-fallback-notice");
    if (fallbackNotice && document.body.dataset.localPreview === "true") {
      const reason = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      fallbackNotice.textContent = `Preview load error: ${reason}`;
      fallbackNotice.hidden = false;
    }
  }
}

start();

if (codeEditorInput) {
  codeEditorInput.addEventListener("input", () => {
    const snippet = snippets.find((item) => item.id === selectedSnippetId);
    if (!snippet) return;
    const newCode = codeEditorInput.value;
    codeOutput.textContent = newCode;
    renderHighlightedCode(newCode, activeCodeKey);
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

  codeEditorInput.addEventListener("scroll", () => {
    if (codeHighlightLayer) {
      codeHighlightLayer.scrollTop = codeEditorInput.scrollTop;
      codeHighlightLayer.scrollLeft = codeEditorInput.scrollLeft;
    }
  });

  if (window.ResizeObserver && codeHighlightLayer) {
    const ro = new ResizeObserver(() => {
      codeHighlightLayer.style.height = `${codeEditorInput.offsetHeight}px`;
    });
    ro.observe(codeEditorInput);
  }
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
    fieldStylesBySnippet.delete(snippet.id);

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
