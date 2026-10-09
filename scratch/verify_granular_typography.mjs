import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

console.log('=== RUNNING FULL TYPOGRAPHY & STREAMLINED BACKGROUND TEST BENCH ===\n');

let failedTests = 0;
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failedTests++;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// 1. Check index.html elements
const htmlContent = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');

assert(htmlContent.includes('id="background-url"'), 'index.html contains background-url');
assert(!htmlContent.includes('id="background-shadow-color-picker"'), 'index.html background options row is streamlined (no background shadow picker)');
assert(!htmlContent.includes('id="background-text-shadow"'), 'index.html background options row is streamlined (no background shadow dropdown)');

// Quick Edit Typography Suite
assert(htmlContent.includes('id="quick-text-color-picker"'), 'index.html contains quick-text-color-picker');
assert(htmlContent.includes('id="quick-text-color"'), 'index.html contains quick-text-color dropdown');
assert(htmlContent.includes('id="quick-font-weight"'), 'index.html contains quick-font-weight dropdown');
assert(htmlContent.includes('id="quick-font-style"'), 'index.html contains quick-font-style dropdown');
assert(htmlContent.includes('id="quick-text-transform"'), 'index.html contains quick-text-transform dropdown');
assert(htmlContent.includes('id="quick-letter-spacing"'), 'index.html contains quick-letter-spacing dropdown');
assert(htmlContent.includes('id="quick-font-family"'), 'index.html contains quick-font-family dropdown');
assert(htmlContent.includes('id="quick-text-shadow"'), 'index.html contains quick-text-shadow dropdown');
assert(htmlContent.includes('value="heavy"'), 'index.html contains heavy multi-layer shadow option');
assert(htmlContent.includes('id="quick-shadow-color-picker"'), 'index.html contains quick-shadow-color-picker');
assert(htmlContent.includes('id="quick-shadow-color"'), 'index.html contains quick-shadow-color dropdown');
assert(htmlContent.includes('id="quick-shadow-blur"'), 'index.html contains quick-shadow-blur range slider');
assert(htmlContent.includes('id="quick-shadow-blur-badge"'), 'index.html contains quick-shadow-blur-badge');
assert(htmlContent.includes('id="quick-shadow-offset"'), 'index.html contains quick-shadow-offset range slider');
assert(htmlContent.includes('id="quick-shadow-offset-badge"'), 'index.html contains quick-shadow-offset-badge');

// 2. Check styles.css definitions
const cssContent = fs.readFileSync(path.join(projectRoot, 'styles.css'), 'utf8');

assert(cssContent.includes('.selection-mini-toolbar'), 'styles.css contains .selection-mini-toolbar styles');
assert(cssContent.includes('.mini-color-btn'), 'styles.css contains .mini-color-btn styles');
assert(cssContent.includes('.mini-icon-btn'), 'styles.css contains .mini-icon-btn styles');
assert(cssContent.includes('.field-blur-badge'), 'styles.css contains .field-blur-badge styles');
assert(cssContent.includes('.field-range-wrap'), 'styles.css contains .field-range-wrap styles');

// 3. Test app.js typography, variable styling & shadow logic
const appJsContent = fs.readFileSync(path.join(projectRoot, 'app.js'), 'utf8');

assert(appJsContent.includes('updateFontWeight'), 'app.js contains updateFontWeight');
assert(appJsContent.includes('updateFontStyle'), 'app.js contains updateFontStyle');
assert(appJsContent.includes('updateTextTransform'), 'app.js contains updateTextTransform');
assert(appJsContent.includes('updateLetterSpacing'), 'app.js contains updateLetterSpacing');
assert(appJsContent.includes('updateFontFamily'), 'app.js contains updateFontFamily');
assert(appJsContent.includes('updateShadowOffset'), 'app.js contains updateShadowOffset');
assert(appJsContent.includes('quickShadowOffset'), 'app.js contains quickShadowOffset');
assert(appJsContent.includes('mini-toggle-bold'), 'app.js previewDocument contains mini-toggle-bold');
assert(appJsContent.includes('mini-toggle-italic'), 'app.js previewDocument contains mini-toggle-italic');
assert(appJsContent.includes('mini-toggle-underline'), 'app.js previewDocument contains mini-toggle-underline');
assert(appJsContent.includes('mini-toggle-upper'), 'app.js previewDocument contains mini-toggle-upper');

// Variable Granular Styling Suite (Clean Minimal Pickers with Opacity Slider)
assert(appJsContent.includes('fieldStylesBySnippet'), 'app.js contains fieldStylesBySnippet state');
assert(appJsContent.includes('getFieldStyle'), 'app.js contains getFieldStyle helper');
assert(appJsContent.includes('setFieldStyle'), 'app.js contains setFieldStyle helper');
assert(appJsContent.includes('field-text-style-bar'), 'app.js renders .field-text-style-bar');
assert(appJsContent.includes('var-color-picker'), 'app.js renders .var-color-picker');
assert(appJsContent.includes('var-bg-picker'), 'app.js renders .var-bg-picker');
assert(appJsContent.includes('var-opacity-slider'), 'app.js renders .var-opacity-slider');
assert(appJsContent.includes('var-opacity-badge'), 'app.js renders .var-opacity-badge');
assert(appJsContent.includes('var-bold-btn'), 'app.js renders .var-bold-btn');
assert(appJsContent.includes('var-reset-btn'), 'app.js renders .var-reset-btn');

assert(cssContent.includes('.field-text-style-bar'), 'styles.css contains .field-text-style-bar');
assert(cssContent.includes('.var-color-picker'), 'styles.css contains .var-color-picker');
assert(cssContent.includes('.var-bg-picker'), 'styles.css contains .var-bg-picker');
assert(cssContent.includes('.var-opacity-slider'), 'styles.css contains .var-opacity-slider');
assert(cssContent.includes('.var-opacity-badge'), 'styles.css contains .var-opacity-badge');
assert(cssContent.includes('.var-bold-btn'), 'styles.css contains .var-bold-btn');
assert(cssContent.includes('.var-reset-btn'), 'styles.css contains .var-reset-btn');

// Verify neon swatches have been removed
assert(!appJsContent.includes('textColorPresets'), 'app.js neon text color swatches removed');
assert(!appJsContent.includes('textBgPresets'), 'app.js neon background swatches removed');

// 4. Test Zero Emojis in UI / code strings
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

const htmlEmojiMatches = [...htmlContent.matchAll(new RegExp(emojiRegex.source, 'gu'))];
assert(htmlEmojiMatches.length === 0, `index.html contains 0 emojis (found ${htmlEmojiMatches.length})`);

const cssEmojiMatches = [...cssContent.matchAll(new RegExp(emojiRegex.source, 'gu'))];
assert(cssEmojiMatches.length === 0, `styles.css contains 0 emojis (found ${cssEmojiMatches.length})`);

const appJsLines = appJsContent.split('\n');
let appJsEmojiCount = 0;
appJsLines.forEach((line, idx) => {
  if (line.includes('title') || line.includes('label') || line.includes('button') || line.includes('option')) {
    if (emojiRegex.test(line)) {
      console.warn(`Line ${idx + 1} has emoji: ${line.trim()}`);
      appJsEmojiCount++;
    }
  }
});
assert(appJsEmojiCount === 0, `app.js UI labels contain 0 emojis (found ${appJsEmojiCount})`);

// 5. Test JSON data validity
const snippets = JSON.parse(fs.readFileSync(path.join(projectRoot, 'data', 'snippets.json'), 'utf8'));
const categories = JSON.parse(fs.readFileSync(path.join(projectRoot, 'data', 'snippet-categories.json'), 'utf8'));

assert(snippets.length === 75, `snippets.json has exactly 75 snippets (found ${snippets.length})`);
assert(categories.length >= 8, `snippet-categories.json has valid categories (found ${categories.length})`);

console.log('\n========================================');
if (failedTests === 0) {
  console.log('🎉 ALL TESTS PASSED! Ready for deployment.');
} else {
  console.error(`💥 ${failedTests} test(s) failed.`);
  process.exit(1);
}
