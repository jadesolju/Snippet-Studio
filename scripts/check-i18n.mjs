import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (file) => JSON.parse(await fs.readFile(file, "utf8"));
const exists = async (file) => fs.access(file).then(() => true, () => false);
const thaiPattern = /[\u0E00-\u0E3E\u0E40-\u0E7E]/u;
const config = await readJson(path.join(root, "i18n", "config.json"));
const sourceSnippets = await readJson(path.join(root, "data", "th", "snippets.json"));
const sourceCategories = await readJson(path.join(root, "data", "th", "snippet-categories.json"));
const sourceUi = await readJson(path.join(root, "i18n", "ui", "th.json"));
const appSource = await fs.readFile(path.join(root, "app.js"), "utf8");
const templateNames = ["index.html", "guide.html"];
const templateSources = Object.fromEntries(await Promise.all(templateNames.map(async (name) => [
  name,
  await fs.readFile(path.join(root, "src", "templates", name), "utf8")
])));

function sha256(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

function structureHash(html = "") {
  const structure = html
    .replace(/>([^<>]*)</g, "><")
    .replace(/\s+/g, " ")
    .trim();
  return sha256(structure);
}

function textOnly(html = "") {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"');
}

function countMatches(value, pattern) {
  return [...String(value ?? "").matchAll(pattern)].length;
}

function markerNodeSignature(html = "") {
  return [...html.matchAll(/>([^<>]*)</g)]
    .map((match) => countMatches(match[1], /\([^()]*\)/g))
    .filter((count) => count > 0)
    .join(",");
}

function cardTranslationChecks(source, translated, expectedLocale, id) {
  const errors = [];
  if (!translated) return ["missing entry"];
  if (translated.locale !== expectedLocale) errors.push(`locale ${translated.locale ?? "(missing)"}, expected ${expectedLocale}`);
  if (!translated.title?.trim()) errors.push("missing title");
  if (!translated.summary?.trim()) errors.push("missing summary");
  if (!translated.code?.html?.trim()) errors.push("missing code.html");

  const sourceHtml = source.code?.html ?? "";
  const translatedHtml = translated.code?.html ?? "";
  if (translatedHtml && structureHash(sourceHtml) !== structureHash(translatedHtml)) errors.push("HTML structure/style hash differs");
  if (translatedHtml && countMatches(textOnly(sourceHtml), /\([^()]*\)/g) !== countMatches(textOnly(translatedHtml), /\([^()]*\)/g)) errors.push("marker count differs");
  if (translatedHtml && markerNodeSignature(sourceHtml) !== markerNodeSignature(translatedHtml)) errors.push("marker positions across HTML text nodes differ");
  for (const macro of ["user", "char"]) {
    if (countMatches(sourceHtml, new RegExp(`\\{\\{${macro}\\}\\}`, "gi")) !== countMatches(translatedHtml, new RegExp(`\\{\\{${macro}\\}\\}`, "gi"))) {
      errors.push(`{{${macro}}} count differs`);
    }
  }
  if (/(^|[^\\])\$\d+/.test(sourceHtml)) errors.push("Thai source HTML contains a literal $n capture reference");
  if (/(^|[^\\])\$\d+/.test(translatedHtml)) errors.push("translated HTML contains a literal $n capture reference");
  if (thaiPattern.test(`${translated.title ?? ""} ${translated.summary ?? ""} ${textOnly(translatedHtml)}`)) errors.push("Thai text remains");
  return errors;
}

function cardChecks(source, translated, expectedLocale, id) {
  const errors = cardTranslationChecks(source, translated, expectedLocale, id);
  if (translated && translated.status !== "published") errors.push(`status is ${translated.status ?? "missing"}; awaiting approval`);
  return errors;
}

function templateUnkeyedThai(html) {
  const output = [];
  const htmlWithoutCode = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "");
  const voidTags = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
  const stack = [];
  for (const match of htmlWithoutCode.matchAll(/<!--[\s\S]*?-->|<![^>]*>|<[^>]+>|[^<]+/g)) {
    const token = match[0];
    if (token.startsWith("<!--") || token.startsWith("<!")) continue;
    if (token.startsWith("</")) {
      const tagName = token.match(/^<\/\s*([\w:-]+)/)?.[1]?.toLowerCase();
      const index = stack.map((item) => item.tagName).lastIndexOf(tagName);
      if (index >= 0) stack.length = index;
      continue;
    }
    if (token.startsWith("<")) {
      const opening = token.match(/^<\s*([\w:-]+)([\s\S]*?)>$/);
      if (!opening) continue;
      const tagName = opening[1].toLowerCase();
      const attributes = opening[2] ?? "";
      if (!voidTags.has(tagName) && !/\/\s*>$/.test(token)) stack.push({ tagName, attributes });
      continue;
    }
    const text = token.trim();
    const insideTranslatedElement = stack.some((item) => /\bdata-i18n="/.test(item.attributes));
    if (thaiPattern.test(text) && text && !insideTranslatedElement) output.push(text);
  }
  const tagPattern = /<[^>]+>/g;
  for (const tag of html.matchAll(tagPattern)) {
    if (/\bdata-i18n-attr="/.test(tag[0])) continue;
    const attributePattern = /([\w:-]+)="([^"]+)"/g;
    for (const match of tag[0].matchAll(attributePattern)) {
      if (match[1].startsWith("data-i18n")) continue;
      if (thaiPattern.test(match[2])) output.push(`@${match[1]}=${match[2]}`);
    }
  }
  return [...new Set(output)];
}

function appUiTranslationCandidates(source) {
  const output = new Set();
  const literalPattern = /(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/gs;
  for (const match of source.matchAll(literalPattern)) {
    const value = match[0].slice(1, -1);
    if (!thaiPattern.test(value) || value.length > 180 || /[\\/{}]|(?:\\d|\?\:|\(\?)/.test(value)) continue;
    output.add(value);
  }
  return [...output];
}

function escapeMarkdownCell(value) {
  return String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
}

let overallFailure = false;
for (const language of config.languages.filter((item) => item.slug !== config.defaultLocale)) {
  const reportPath = path.join(root, "reports", `i18n-missing-${language.slug}.md`);
  const targetData = path.join(root, "data", language.slug);
  const snippetsPath = path.join(targetData, "snippets.json");
  const categoriesPath = path.join(targetData, "snippet-categories.json");
  const uiPath = path.join(root, "i18n", "ui", `${language.slug}.json`);
  const appStringsPath = path.join(root, "i18n", "app", `${language.slug}.json`);
  const templateStringsPath = path.join(root, "i18n", "template", `${language.slug}.json`);
  const guidePath = path.join(root, language.slug, "guide.html");
  const hasSnippets = await exists(snippetsPath);
  const hasCategories = await exists(categoriesPath);
  const hasUi = await exists(uiPath);
  const hasAppStrings = await exists(appStringsPath);
  const hasTemplateStrings = await exists(templateStringsPath);
  const targetSnippets = hasSnippets ? await readJson(snippetsPath) : [];
  const targetCategories = hasCategories ? await readJson(categoriesPath) : [];
  const targetUi = hasUi ? await readJson(uiPath) : {};
  const appStrings = hasAppStrings ? await readJson(appStringsPath) : { text: {} };
  const templateStrings = hasTemplateStrings ? await readJson(templateStringsPath) : { text: {}, attributes: {} };
  const snippetsById = new Map(targetSnippets.map((item) => [item.id, item]));
  const categoriesById = new Map(targetCategories.map((item) => [item.id, item]));
  const uiKeys = Object.keys(sourceUi);
  const intentionallySharedBrandKeys = new Set(["meta.title", "meta.ogTitle"]);
  const missingUiKeys = uiKeys.filter((key) => typeof targetUi[key] !== "string" || !targetUi[key].trim());
  const sameAsThaiUiKeys = uiKeys.filter((key) => !intentionallySharedBrandKeys.has(key) && targetUi[key] === sourceUi[key]);
  const missingCards = [];
  const cardFailures = [];
  const draftCards = [];

  for (const source of sourceSnippets) {
    const translated = snippetsById.get(source.id);
    const errors = cardTranslationChecks(source, translated, language.locale, source.id);
    if (!translated) missingCards.push(source);
    if (errors.length) cardFailures.push({ id: source.id, title: source.title, errors });
    else if (translated.status !== "published") draftCards.push(translated);
  }

  const missingCategories = sourceCategories.filter((source) => {
    const translated = categoriesById.get(source.id);
    return !translated || !translated.title?.trim() || !translated.summary?.trim() || thaiPattern.test(`${translated.title ?? ""} ${translated.summary ?? ""}`);
  });
  const unexpectedCardIds = targetSnippets.filter((item) => !sourceSnippets.some((source) => source.id === item.id)).map((item) => item.id);
  const unknownCategoryIds = targetCategories.filter((item) => !sourceCategories.some((source) => source.id === item.id)).map((item) => item.id);
  const unkeyedUi = [...new Set(templateNames.flatMap((name) => templateUnkeyedThai(templateSources[name])))];
  const untranslatedTemplateStrings = unkeyedUi.filter((item) => {
    const translated = item.startsWith("@")
      ? templateStrings.attributes?.[item]
      : templateStrings.text?.[item];
    return typeof translated !== "string" || !translated.trim() || translated === item;
  });
  const appUiStrings = [...new Set([
    ...appUiTranslationCandidates(appSource),
    "ข้อความ",
    "ตรวจดู",
    "เลือกข้อความเพื่อกำหนดเป็น $1",
    "ไม่มีข้อความให้แทน — ใช้โครง HTML ทั้งก้อน",
    "ระบบเดาว่าอาจเปลี่ยน แนะนำให้ตรวจสอบก่อนเลือก"
  ])];
  const untranslatedAppStrings = appUiStrings.filter((item) =>
    typeof appStrings.text?.[item] !== "string" || !appStrings.text[item].trim() || appStrings.text[item] === item
  );
  const appThaiLines = appSource.split(/\r?\n/).filter((line) => thaiPattern.test(line)).length;
  const approvedPath = path.join(root, "i18n", "approved", `${language.slug}.json`);
  const approved = await exists(approvedPath);
  const guideExists = await exists(guidePath);
  const guideTranslated = guideExists && !thaiPattern.test(textOnly(await fs.readFile(guidePath, "utf8")));

  const publishedCards = targetSnippets.filter((item) => item.status === "published" && item.locale === language.locale && !cardChecks(sourceSnippets.find((source) => source.id === item.id) ?? {}, item, language.locale, item.id).length).length;
  const completeCardTranslations = targetSnippets.filter((item) => {
    const source = sourceSnippets.find((candidate) => candidate.id === item.id);
    return source && !cardTranslationChecks(source, item, language.locale, item.id).length;
  }).length;
  const translatedCategories = sourceCategories.length - missingCategories.length;
  const translatableUiKeys = uiKeys.length - intentionallySharedBrandKeys.size;
  const translatedUiKeys = uiKeys.filter((key) =>
    !intentionallySharedBrandKeys.has(key) &&
    typeof targetUi[key] === "string" && targetUi[key].trim() &&
    targetUi[key] !== sourceUi[key]
  ).length;
  const denominator = sourceSnippets.length + sourceCategories.length + translatableUiKeys + unkeyedUi.length + appUiStrings.length + 1;
  const numerator = completeCardTranslations + translatedCategories + translatedUiKeys + (unkeyedUi.length - untranslatedTemplateStrings.length) + (appUiStrings.length - untranslatedAppStrings.length) + (guideTranslated ? 1 : 0);
  const percent = denominator ? Math.floor((numerator / denominator) * 100) : 0;
  const report = [
    `# Translation readiness report: ${language.name} (/${language.slug})`,
    "",
    `- Locale: \`${language.locale}\` / HTML lang: \`${language.htmlLang}\``,
    `- Completion: ${percent}% (${numerator}/${denominator} tracked items)`,
    `- Cards translated and structurally valid (drafts included): ${completeCardTranslations}/${sourceSnippets.length}`,
    `- Published cards: ${publishedCards}/${sourceSnippets.length}`,
    `- Categories translated: ${translatedCategories}/${sourceCategories.length}`,
    `- UI keys translated and distinct from Thai: ${translatedUiKeys}/${translatableUiKeys}`,
    `- Brand keys intentionally unchanged: ${[...intentionallySharedBrandKeys].join(", ")}`,
    `- Thai template strings still untranslated: ${untranslatedTemplateStrings.length}/${unkeyedUi.length}`,
    `- JavaScript UI text values still untranslated: ${untranslatedAppStrings.length}/${appUiStrings.length}`,
    `- JavaScript source lines containing Thai (includes Thai-source detection rules): ${appThaiLines}`,
    `- Guide translated with no Thai text remaining: ${guideTranslated ? "yes" : "no"}`,
    `- Approval file: ${approved ? "present" : "missing"}`,
    "",
    "## Missing or incomplete categories",
    "",
    ...(missingCategories.length ? missingCategories.map((item) => `- \`${item.id}\` — ${item.title}`) : ["- None"]),
    "",
    "## Missing cards",
    "",
    ...(missingCards.length ? missingCards.map((item) => `- \`${item.id}\` — ${item.title}`) : ["- None"]),
    "",
    "## Translation drafts pending review",
    "",
    ...(draftCards.length ? draftCards.map((item) => `- \`${item.id}\` — ${item.title}`) : ["- None"]),
    "",
    "## Card validation issues",
    "",
    ...(cardFailures.length ? cardFailures.map((item) => `- \`${item.id}\` (${item.title}): ${item.errors.join("; ")}`) : ["- None"]),
    "",
    "## Missing UI keys",
    "",
    ...(missingUiKeys.length ? missingUiKeys.map((key) => `- \`${key}\``) : ["- None"]),
    "",
    "## UI values still identical to Thai",
    "",
    ...(sameAsThaiUiKeys.length ? sameAsThaiUiKeys.map((key) => `- \`${key}\``) : ["- None"]),
    "",
    "## Untranslated Thai text in HTML templates",
    "",
    ...(untranslatedTemplateStrings.length ? untranslatedTemplateStrings.slice(0, 150).map((item) => `- ${escapeMarkdownCell(item)}`) : ["- None"]),
    ...(untranslatedTemplateStrings.length > 150 ? [`- … ${untranslatedTemplateStrings.length - 150} more`] : []),
    "",
    "## Untranslated JavaScript UI strings",
    "",
    ...(untranslatedAppStrings.length ? untranslatedAppStrings.slice(0, 150).map((item) => `- ${escapeMarkdownCell(item)}`) : ["- None"]),
    ...(untranslatedAppStrings.length > 150 ? [`- … ${untranslatedAppStrings.length - 150} more`] : []),
    "",
    "## Unexpected IDs",
    "",
    `- Extra card IDs: ${unexpectedCardIds.length ? unexpectedCardIds.map((id) => `\`${id}\``).join(", ") : "none"}`,
    `- Extra category IDs: ${unknownCategoryIds.length ? unknownCategoryIds.map((id) => `\`${id}\``).join(", ") : "none"}`,
    "",
    "## Release gate",
    "",
    approved && percent === 100
      ? "Approval file exists and all tracked items are complete. Human review and phone Preview are still required before enabling this locale."
      : "Do not enable or deploy this locale. Review translations and this report, then add an approval file only after the owner explicitly approves it.",
    ""
  ].join("\n");

  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, report, "utf8");
  console.log(`Wrote ${path.relative(root, reportPath)} (${percent}% complete).`);

  const structureHashes = sourceSnippets.every((source) => {
    const translated = snippetsById.get(source.id);
    return !translated || structureHash(source.code?.html ?? "") === structureHash(translated.code?.html ?? "");
  });
  let zhDistinct = true;
  if (language.slug === "zh" || language.slug === "zh-hant") {
    const otherSlug = language.slug === "zh" ? "zh-hant" : "zh";
    const otherSnippetsPath = path.join(root, "data", otherSlug, "snippets.json");
    if (targetSnippets.length && await exists(otherSnippetsPath)) {
      const otherSnippets = await readJson(otherSnippetsPath);
      const otherById = new Map(otherSnippets.map((item) => [item.id, item]));
      zhDistinct = targetSnippets.some((item) => {
        const other = otherById.get(item.id);
        return other && `${item.title}\n${item.summary}\n${textOnly(item.code?.html)}` !== `${other.title}\n${other.summary}\n${textOnly(other.code?.html)}`;
      });
      if (!zhDistinct) cardFailures.push({ id: "zh-vs-zh-hant", title: "Chinese locale comparison", errors: ["Simplified and Traditional Chinese content is identical"] });
    }
  }
  if (language.enabled || language.translationComplete) {
    if (!structureHashes || missingUiKeys.length || missingCards.length || missingCategories.length || untranslatedTemplateStrings.length || untranslatedAppStrings.length || unexpectedCardIds.length || unknownCategoryIds.length || !guideTranslated || publishedCards !== sourceSnippets.length || !approved || zhDistinct !== true) overallFailure = true;
  }
}

if (overallFailure) {
  console.error("i18n readiness check failed. Read reports/i18n-missing-*.md before enabling or deploying a locale.");
  process.exitCode = 1;
} else {
  console.log("i18n readiness check passed.");
}
