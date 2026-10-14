import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (file) => JSON.parse(await fs.readFile(file, "utf8"));
const source = await readJson(path.join(root, "data", "en", "snippets.json"));
const targetPath = path.join(root, "data", "vi", "snippets.json");
const existing = await readJson(targetPath);

const titles = {
  "snippet-56": "Chỉ số cảm xúc 4 ô",
  "snippet-57": "Bộ theo dõi mục tiêu",
  "snippet-58": "Bảng ma trận tình cảm",
  "snippet-59": "Đồng bộ chỉ số cảm xúc",
  "snippet-77": "🎀 CẢM XÚC HELLO KITTY",
  "snippet-78": "✨ KITTY THIÊN THẦN",
  "snippet-79": "🌈 TRÍ TƯỞNG TƯỢNG SPONGEBOB",
  "snippet-80": "🐾 TÂM TRẠNG MÈO CAM",
  "snippet-81": "🍓 MÈO DÂU TÂY",
  "snippet-82": "🫧 CẢM XÚC ĐẠI DƯƠNG",
  "snippet-83": "🦆 VỊT BƠ",
  "snippet-84": "❄️ NHẬT KÝ CHIM CÁNH CỤT BĂNG",
  "snippet-85": "🦖 ĐỒNG CỎ KHỦNG LONG CON",
  "snippet-86": "🦈 VỊNH CÁ MẬP DỄ THƯƠNG",
  "snippet-87": "🍊 CAPYBARA TẮM ONSEN",
  "snippet-88": "🐰 THỎ KẸO NGỌT"
};
const summaries = {
  "An emotion, love, and inner-thought card.": "Thẻ về cảm xúc, tình yêu và suy nghĩ bên trong.",
  "Fluster stats and relationship status.": "Thống kê độ rung động và trạng thái mối quan hệ.",
  "Mood, love, and imagination indicators.": "Các chỉ số tâm trạng, tình yêu và trí tưởng tượng.",
  "Mood, feelings, and a warning.": "Tâm trạng, cảm xúc và cảnh báo.",
  "Sync status, love, and an inner message.": "Trạng thái đồng bộ, tình yêu và lời nhắn bên trong.",
  "Mood levels, feelings, and current state.": "Mức độ tâm trạng, cảm xúc và trạng thái hiện tại.",
  "Warmth and affection stats.": "Thống kê sự ấm áp và tình cảm.",
  "Love, jealousy, and attachment index.": "Chỉ số tình yêu, ghen tuông và gắn bó.",
  "Emotional energy, love, and a warning.": "Năng lượng cảm xúc, tình yêu và cảnh báo.",
  "Love, desire, and possessiveness stats.": "Thống kê tình yêu, ham muốn và tính chiếm hữu.",
  "Comfort and affection status.": "Trạng thái an tâm và tình cảm.",
  "Infatuation level and current mood.": "Mức độ si mê và tâm trạng hiện tại.",
  "A four-part emotion index for love, desire, jealousy, and deep attachment.": "Chỉ số cảm xúc gồm tình yêu, ham muốn, ghen tuông và gắn bó sâu sắc.",
  "A target monitor with tracking status and three emotion meters.": "Màn hình theo dõi mục tiêu với trạng thái giám sát và ba thước đo cảm xúc.",
  "Accumulated affection with a PiP overlay and love/jealousy meters.": "Tình cảm tích lũy với lớp phủ PiP và thước đo tình yêu/ghen tuông.",
  "Three long emotion bars for love, desire, and jealousy.": "Ba thanh cảm xúc dài biểu thị tình yêu, ham muốn và ghen tuông."
};
const text = {
  "✨ ANGEL KITTY": "✨ KITTY THIÊN THẦN",
  "✨ Deep bond": "✨ Gắn kết sâu sắc",
  "❄️ ICE PENGUIN DIARY": "❄️ NHẬT KÝ CHIM CÁNH CỤT BĂNG",
  "❤️ Love": "❤️ Tình yêu",
  "🌈 SPONGEBOB IMAGINATION": "🌈 TRÍ TƯỞNG TƯỢNG SPONGEBOB",
  "🍊 CAPYBARA ONSEN": "🍊 CAPYBARA ONSEN",
  "🍓 STRAWBERRY CAT": "🍓 MÈO DÂU TÂY",
  "🎀 HELLO KITTY EMOTION": "🎀 CẢM XÚC HELLO KITTY",
  "🐰 SWEET CANDY BUNNY": "🐰 THỎ KẸO NGỌT",
  "🐱 Warning: ({{char}} is waiting for {{user}} to pat their head and give them a hug)": "🐱 Cảnh báo: ({{char}} đang chờ {{user}} xoa đầu và ôm mình)",
  "🐾 ORANGE CAT MOOD": "🐾 TÂM TRẠNG MÈO CAM",
  "💋 Desire": "💋 Ham muốn",
  "💖 Love": "💖 Tình yêu",
  "💭 (amid the cold, {{char}} seeks warmth and affection from {{user}})": "💭 (giữa giá lạnh, {{char}} tìm kiếm hơi ấm và tình cảm từ {{user}})",
  "💭 (anyone who gets close to {{user}} might get bitten by the little shark!)": "💭 (ai đến gần {{user}} có thể bị cá mập nhỏ cắn đấy!)",
  "💭 (imagining a night alone with {{user}})": "💭 (tưởng tượng về một đêm riêng tư bên {{user}})",
  "💭 Inner thought: (wants {{user}} to look only at them, always)": "💭 Suy nghĩ bên trong: (luôn muốn {{user}} chỉ nhìn mình)",
  "💭 (strawberry scent fills the air when {{char}} is near {{user}})": "💭 (hương dâu lan tỏa khi {{char}} ở gần {{user}})",
  "💭 (wants to jump in and hug {{user}} as tightly as possible)": "💭 (muốn lao đến ôm {{user}} thật chặt)",
  "📍 (location)": "📍 (địa điểm)",
  "🔒 Jealousy": "🔒 Ghen tuông",
  "🔥 Desire": "🔥 Ham muốn",
  "🦆 BUTTER DUCK": "🦆 VỊT BƠ",
  "🦈 CUTE SHARK BAY": "🦈 VỊNH CÁ MẬP DỄ THƯƠNG",
  "🦖 BABY DINO MEADOW": "🦖 ĐỒNG CỎ KHỦNG LONG CON",
  "🫧 OCEAN EMOTION": "🫧 CẢM XÚC ĐẠI DƯƠNG",
  "(100%)": "(100%)",
  "(75%)": "(75%)",
  "(77%)": "(77%)",
  "(78%)": "(78%)",
  "(80%)": "(80%)",
  "(82%)": "(82%)",
  "(84%)": "(84%)",
  "(85%)": "(85%)",
  "(86%)": "(86%)",
  "(87%)": "(87%)",
  "(88%)": "(88%)",
  "(89%)": "(89%)",
  "(90%)": "(90%)",
  "(91%)": "(91%)",
  "(92%)": "(92%)",
  "(93%)": "(93%)",
  "(94%)": "(94%)",
  "(95%)": "(95%)",
  "(96%)": "(96%)",
  "(97%)": "(97%)",
  "(98%)": "(98%)",
  "(99%)": "(99%)",
  "Accumulated Affection (Affection Matrix)": "Tình cảm tích lũy (Ma trận tình cảm)",
  "Affection": "Tình cảm",
  "Attachment": "Sự gắn bó",
  "Attraction": "Sức hấp dẫn",
  "(bond percentage)": "(phần trăm gắn kết)",
  "{{char}}": "{{char}}",
  "Comfort": "Sự an tâm",
  "(cuddle mode)": "(chế độ âu yếm)",
  "Current mood: (secretly flustered by {{user}})": "Tâm trạng hiện tại: (thầm rung động vì {{user}})",
  "(deeply relaxed)": "(thư giãn sâu)",
  "[Desire]": "[Ham muốn]",
  "Desire": "Ham muốn",
  "Desire / lust: (desire percentage)": "Ham muốn / khao khát: (phần trăm ham muốn)",
  "(desire percentage)": "(phần trăm ham muốn)",
  "EMOTIONAL STATS // {{char}}": "CHỈ SỐ CẢM XÚC // {{char}}",
  "Emotion index: ({{char}} ➔ {{user}})": "Chỉ số cảm xúc: ({{char}} ➔ {{user}})",
  "(emotions soaring)": "(cảm xúc dâng trào)",
  "(extra sweet)": "(ngọt ngào hơn bao giờ hết)",
  "Feeling: (soft and comforting, like freshly baked treats)": "Cảm giác: (dịu dàng và ấm áp như bánh mới ra lò)",
  "Fierce possessiveness": "Tính chiếm hữu mãnh liệt",
  "(floating)": "(bồng bềnh)",
  "(fluster level)": "(mức độ rung động)",
  "(fully charged)": "(đầy năng lượng)",
  "(heart's axis)": "(trục trái tim)",
  "Infatuation": "Si mê",
  "Jealous when ignored": "Ghen khi bị phớt lờ",
  "[Jealousy]": "[Ghen tuông]",
  "Jealousy": "Ghen tuông",
  "Jealousy (Jealousy)": "Ghen tuông (Ghen tuông)",
  "(jealousy percentage)": "(phần trăm ghen tuông)",
  "Level: moderate (under control)": "Mức độ: vừa phải (trong tầm kiểm soát)",
  "LIVE READOUT": "CHỈ SỐ TRỰC TIẾP",
  "Longing": "Nhung nhớ",
  "Love": "Tình yêu",
  "[Love]": "[Tình yêu]",
  "Love for {{user}}": "Tình yêu dành cho {{user}}",
  "Love intensity": "Cường độ tình yêu",
  "(love percentage)": "(phần trăm tình yêu)",
  "[MONITOR]": "[GIÁM SÁT]",
  "Passion": "Đam mê",
  "Possessiveness": "Tính chiếm hữu",
  "Protective jealousy": "Ghen tuông muốn bảo vệ",
  "Pure love": "Tình yêu thuần khiết",
  "Quietly possessive": "Âm thầm muốn chiếm hữu",
  "State: (heart swelling as if floating in a warm sea)": "Trạng thái: (trái tim rộn ràng như đang trôi giữa biển ấm)",
  "(stats recorded at)": "(thời điểm ghi nhận chỉ số)",
  "Status: ({{char}} is lost in love with {{user}})": "Trạng thái: ({{char}} đang chìm đắm trong tình yêu dành cho {{user}})",
  "Status: monitoring": "Trạng thái: đang theo dõi",
  "Status: (soaking in warm water and happily gazing at {{user}})": "Trạng thái: (ngâm mình trong nước ấm và vui vẻ ngắm nhìn {{user}})",
  "Strong jealousy": "Ghen tuông mãnh liệt",
  "SYNC: (99%)": "ĐỒNG BỘ: (99%)",
  "SYNC: (sync percentage)": "ĐỒNG BỘ: (phần trăm đồng bộ)",
  "Target: {{user}}": "Mục tiêu: {{user}}",
  "Tenderness": "Dịu dàng",
  "Thrill": "Rung động",
  "Wants to touch": "Muốn chạm vào",
  "Warmth (100%)": "Ấm áp (100%)",
  "Warning: (the tiny dino is ready to charge in with love)": "Cảnh báo: (khủng long nhỏ đã sẵn sàng lao đến với tình yêu)"
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

const batch = source.filter((item) => item.categoryId === "emotion-stats");
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
console.log(`Translated ${translated.length} /vi/ emotion-stat drafts from English.`);
