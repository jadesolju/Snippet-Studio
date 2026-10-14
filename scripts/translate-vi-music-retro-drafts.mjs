import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (file) => JSON.parse(await fs.readFile(file, "utf8"));
const source = await readJson(path.join(root, "data", "en", "snippets.json"));
const targetPath = path.join(root, "data", "vi", "snippets.json");
const existing = await readJson(targetPath);

const titles = {
  "snippet-64": "Kết quả đua Grand Prix kiểu pixel",
  "snippet-65": "Máy chơi game bỏ túi pixel",
  "snippet-66": "Game Boy cổ điển DMG-01",
  "snippet-67": "Máy nghe nhạc mini gọn nhẹ",
  "snippet-68": "Máy phát đĩa than",
  "snippet-69": "Viên nang nghe nhạc cùng nhau",
  "snippet-70": "Trích lời bài hát Apple Music"
};
const summaries = {
  "A pixel racing results screen with 150cc standings, times, and medals.": "Màn hình kết quả đua pixel với thứ hạng 150cc, thời gian và huy chương.",
  "A dark handheld console with battery, Mario Kart, and D-pad and A/B buttons.": "Máy chơi game cầm tay màu tối với pin, Mario Kart, D-pad và các nút A/B.",
  "A classic DMG-01 Game Boy with a red battery indicator.": "Game Boy DMG-01 cổ điển với đèn báo pin màu đỏ.",
  "A horizontal mini music player with SVG sound waves, a timeline, and controls.": "Trình phát nhạc mini nằm ngang với sóng âm SVG, dòng thời gian và nút điều khiển.",
  "A vertical vinyl player with a spinning record and track progress bar.": "Trình phát đĩa than theo chiều dọc với đĩa xoay và thanh tiến trình bài hát.",
  "A Dynamic Island-style capsule showing two people listening together on headphones.": "Viên nang kiểu Dynamic Island hiển thị hai người cùng nghe nhạc qua tai nghe.",
  "An Apple Music lyrics screen with three key chorus lines that express feelings directly.": "Màn hình lời bài hát Apple Music với ba câu điệp khúc thể hiện trực tiếp cảm xúc."
};
const text = {
  "== GRAND PRIX RESULTS ==": "== KẾT QUẢ GRAND PRIX ==",
  "▲◄▼►": "▲◄▼►",
  "➕": "➕",
  "150CC SPECIAL CUP": "CÚP ĐẶC BIỆT 150CC",
  "1ST: {{char}}": "HẠNG 1: {{char}}",
  "2ND: {{user}}": "HẠNG 2: {{user}}",
  "A": "A",
  "B": "B",
  "BATTERY": "PIN",
  "BATTERY:(battery level)": "PIN:(mức pin)",
  "(character finish time)": "(thời gian về đích của nhân vật)",
  "DMG-01 CLASSIC": "DMG-01 CỔ ĐIỂN",
  "DUO RACE: ({{char}} & {{user}})": "ĐUA ĐÔI: ({{char}} & {{user}})",
  "ITEM: TRIPLE RED SHELL": "VẬT PHẨM: BA VỎ ĐỎ",
  "LAP (race lap)": "VÒNG (vòng đua)",
  "MATCH: ({{char}} VS {{user}})": "TRẬN ĐẤU: ({{char}} VS {{user}})",
  "[PIXEL POCKET]": "[MÁY CHƠI GAME BỎ TÚI PIXEL]",
  "POS: (current position)": "HẠNG: (vị trí hiện tại)",
  "STAGE: BOWSER CASTLE": "MÀN: LÂU ĐÀI BOWSER",
  "STAGE: RAINBOW ROAD": "MÀN: ĐƯỜNG CẦU VỒNG",
  "TIME: (finish time) [NEW RECORD]": "THỜI GIAN: (thời gian về đích) [KỶ LỤC MỚI]",
  "(user finish time)": "(thời gian về đích của người dùng)",
  "WINNER BONUS: +(winner bonus) COINS [PRESS START]": "THƯỞNG NGƯỜI THẮNG: +(tiền thưởng) XU [NHẤN START]",
  "APPLE MUSIC LYRICS": "LỜI BÀI HÁT APPLE MUSIC",
  "(artist / original performer)": "(nghệ sĩ / nghệ sĩ trình bày gốc)",
  "{{char}} 🎧 {{user}}": "{{char}} 🎧 {{user}}",
  "({{char}} feat. {{user}})": "({{char}} feat. {{user}})",
  "{{char}}'s memories": "Kỷ niệm của {{char}}",
  "{{char}} & {{user}}": "{{char}} & {{user}}",
  "(elapsed time)": "(thời gian đã trôi qua)",
  "(lyric timestamp)": "(mốc thời gian lời bài hát)",
  "\"(main lyric line)\" — from {{char}}'s heart to {{user}}": "\"(câu lời bài hát chính)\" — từ trái tim {{char}} gửi đến {{user}}",
  "\"(next lyric line)\"": "\"(câu lời bài hát tiếp theo)\"",
  "PLAYING FROM PLAYLIST": "ĐANG PHÁT TỪ DANH SÁCH PHÁT",
  "\"(previous lyric line)\"": "\"(câu lời bài hát trước đó)\"",
  "(song duration)": "(thời lượng bài hát)",
  "(song playing in the scene)": "(bài hát đang phát trong cảnh)",
  "(song they are listening to together)": "(bài hát cả hai đang cùng nghe)",
  "(song title)": "(tên bài hát)",
  "(special song title)": "(tên bài hát đặc biệt)",
  "(time remaining)": "(thời gian còn lại)",
  "VINYL RECORD": "ĐĨA THAN"
};

function translateHtml(html, id) {
  return html.replace(/>([^<>]*)</g, (whole, rawText) => {
    const leading = rawText.match(/^\s*/u)?.[0] ?? "";
    const trailing = rawText.match(/\s*$/u)?.[0] ?? "";
    const value = rawText.slice(leading.length, rawText.length - trailing.length || undefined);
    if (!value) return whole;
    if (!(value in text)) throw new Error(`${id}: missing Vietnamese text for: ${value}`);
    return `>${leading}${text[value]}${trailing}<`;
  });
}

const categories = new Set(["music-players", "retro-gaming"]);
const batch = source.filter((item) => categories.has(item.categoryId));
const translated = batch.map((item) => {
  if (!titles[item.id]) throw new Error(`Missing Vietnamese title for ${item.id}`);
  if (!summaries[item.summary]) throw new Error(`Missing Vietnamese summary for ${item.id}: ${item.summary}`);
  return {
    ...item,
    title: titles[item.id],
    summary: summaries[item.summary],
    status: "draft",
    locale: "vi-VN",
    code: { ...item.code, html: translateHtml(item.code.html, item.id) }
  };
});

const merged = new Map(existing.map((item) => [item.id, item]));
for (const item of translated) merged.set(item.id, item);
await fs.writeFile(targetPath, `${JSON.stringify([...merged.values()], null, 2)}\n`, "utf8");
console.log(`Translated ${translated.length} /vi/ music and retro drafts from English.`);
