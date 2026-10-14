import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configPath = path.join(root, "i18n", "config.json");
const config = JSON.parse(await fs.readFile(configPath, "utf8"));
const templates = ["index.html", "guide.html"];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function unescapeHtml(value) {
  return String(value)
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&");
}

function setAttribute(tag, name, value) {
  const escaped = escapeHtml(value);
  const pattern = new RegExp(`(\\s${name}\\s*=\\s*)(["'])[^"']*\\2`, "i");
  if (!pattern.test(tag)) throw new Error(`Template tag is missing ${name}: ${tag}`);
  return tag.replace(pattern, (_match, prefix) => `${prefix}"${escaped}"`);
}

function translateTemplate(source, dictionary, templateStrings, language, previewAll, templateName) {
  let html = source.replace(/<html\b[^>]*>/i, (tag) => setAttribute(tag, "lang", language.htmlLang));
  html = html.replace(/<body\b/i, `<body data-language-enabled="${language.enabled}" data-local-preview="${previewAll}"`);

  html = html.replace(
    /<([a-z][\w:-]*)([^>]*\bdata-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, tagName, attributes, key, oldContent) => {
      const value = dictionary[key];
      if (typeof value !== "string" || !value.trim()) {
        throw new Error(`Missing UI translation "${key}" for ${language.slug}`);
      }
      return `<${tagName}${attributes}>${escapeHtml(value)}</${tagName}>`;
    }
  );

  html = html.replace(/<[^>]+\bdata-i18n-attr="([^"]+)"[^>]*>/gi, (tag) => {
    const instruction = tag.match(/\bdata-i18n-attr="([^"]+)"/i)?.[1] ?? "";
    for (const entry of instruction.split(",")) {
      const [attribute, key] = entry.split(":").map((part) => part.trim());
      const value = dictionary[key];
      if (!attribute || !key || typeof value !== "string" || !value.trim()) {
        throw new Error(`Missing UI attribute translation "${key}" for ${language.slug}`);
      }
      tag = setAttribute(tag, attribute, value);
    }
    return tag;
  });

  // Keep the next tag's opening `<` out of the match. Consuming it here makes
  // RegExp skip the first text node after every other sibling element.
  html = html.replace(/>([^<>]*)(?=<)/g, (whole, rawText) => {
    const leading = rawText.match(/^\s*/u)?.[0] ?? "";
    const trailing = rawText.match(/\s*$/u)?.[0] ?? "";
    const text = rawText.slice(leading.length, rawText.length - trailing.length || undefined);
    const value = templateStrings.text?.[text];
    if (typeof value !== "string" || !value.trim()) return whole;
    return `>${leading}${escapeHtml(unescapeHtml(value))}${trailing}`;
  });

  html = html.replace(/<[^>]+>/g, (tag) => tag.replace(/([\w:-]+)="([^"]+)"/g, (whole, name, value) => {
    if (name.startsWith("data-i18n") || name.startsWith("data-language")) return whole;
    const translated = templateStrings.attributes?.[`@${name}=${value}`];
    return typeof translated === "string" && translated.trim()
      ? `${name}="${escapeHtml(translated)}"`
      : whole;
  }));

  html = html
    .replace(/\sdata-i18n="[^"]+"/g, "")
    .replace(/\sdata-i18n-attr="[^"]+"/g, "")
    .replaceAll('href="/th/guide"', `href="/${language.slug}/guide"`)
    .replaceAll('href="/th"', `href="/${language.slug}"`);

  const offeredLanguages = config.languages.filter((item) =>
    item.translationComplete && (previewAll || item.enabled)
  );
  const englishLanguageNames = {
    th: "Thai",
    en: "English",
    vi: "Vietnamese",
    zh: "Chinese (Simplified)",
    "zh-hant": "Chinese (Traditional)"
  };
  const vietnameseLanguageNames = {
    th: "Tiếng Thái",
    en: "Tiếng Anh",
    vi: "Tiếng Việt",
    zh: "Tiếng Trung giản thể",
    "zh-hant": "Tiếng Trung phồn thể"
  };
  const options = offeredLanguages.map((item) => {
    const selected = item.slug === language.slug ? " selected" : "";
    const disabled = !previewAll && !item.enabled ? " disabled" : "";
    const name = language.slug === "en"
      ? englishLanguageNames[item.slug]
      : language.slug === "vi"
        ? vietnameseLanguageNames[item.slug]
        : item.name;
    return `<option value="/${item.slug}"${selected}${disabled}>${escapeHtml(name)}</option>`;
  }).join("");
  html = html.replace("<!-- LANGUAGE OPTIONS -->", options);
  if (offeredLanguages.length < 2 || !offeredLanguages.some((item) => item.slug === language.slug)) {
    html = html.replace(/\sdata-language-switcher(?=\s|>)/g, " hidden");
  }
  html = html.replaceAll(" data-language-switcher", "");

  const pageSuffix = templateName === "guide.html" ? "/guide" : "";
  const pageUrl = `https://snippet-studio-swart.vercel.app/${language.slug}${pageSuffix}`;
  const alternates = config.languages
    .filter((item) => item.enabled)
    .map((item) => `<link rel="alternate" hreflang="${escapeHtml(item.htmlLang)}" href="https://snippet-studio-swart.vercel.app/${item.slug}${pageSuffix}">`)
    .concat(`<link rel="alternate" hreflang="x-default" href="https://snippet-studio-swart.vercel.app/th${pageSuffix}">`)
    .join("\n    ");
  html = html
    .replace(/(<meta property="og:url" content=")[^"]*(">)/i, `$1${pageUrl}$2`)
    .replace(/(<meta name="twitter:url" content=")[^"]*(">)/i, `$1${pageUrl}$2`)
    .replace("</head>", `    <link rel="canonical" href="${pageUrl}">\n    ${alternates}\n    ${previewAll && !language.enabled ? '<meta name="robots" content="noindex,nofollow">\n    ' : ""}</head>`);

  return html;
}

const previewAll = process.argv.includes("--preview-all");
const buildLanguages = previewAll ? config.languages : config.languages.filter((language) => language.enabled);
if (!buildLanguages.length) throw new Error("At least one language must be enabled for the static build.");

for (const language of buildLanguages) {
  const dictionaryPath = path.join(root, "i18n", "ui", `${language.slug}.json`);
  const dictionary = JSON.parse(await fs.readFile(dictionaryPath, "utf8"));
  const templateStringsPath = path.join(root, "i18n", "template", `${language.slug}.json`);
  const templateStrings = await fs.access(templateStringsPath).then(
    () => fs.readFile(templateStringsPath, "utf8").then(JSON.parse),
    () => ({ text: {}, attributes: {} })
  );
  const outputDirectory = path.join(root, language.slug);
  await fs.mkdir(outputDirectory, { recursive: true });

  for (const name of templates) {
    const templatePath = path.join(root, "src", "templates", name);
    const source = await fs.readFile(templatePath, "utf8");
    const built = translateTemplate(source, dictionary, templateStrings, language, previewAll, name);
    await fs.writeFile(path.join(outputDirectory, name), built, "utf8");
  }

  console.log(`Built /${language.slug}/ from src/templates${previewAll && !language.enabled ? " (local preview only)" : ""}.`);
}
