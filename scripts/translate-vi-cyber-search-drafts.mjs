import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (file) => JSON.parse(await fs.readFile(file, "utf8"));
const source = await readJson(path.join(root, "data", "en", "snippets.json"));
const targetPath = path.join(root, "data", "vi", "snippets.json");
const existing = await readJson(targetPath);

const titles = {
  "snippet-48": "Tìm kiếm và lịch sử Google",
  "snippet-49": "Google Trends theo thời gian thực",
  "snippet-50": "Trang bắt đầu Safari",
  "snippet-60": "Lưu bài viết vào Pocket",
  "snippet-71": "Cảnh cyber Y2K (kính hồng)",
  "snippet-72": "Lái xe đêm trên cao tốc",
  "snippet-73": "Thiên đường kỹ thuật số (kính cyan)",
  "snippet-74": "Trình khám phá cửa sổ cổ điển",
  "snippet-75": "Nhật ký hệ thống HUD khoa học viễn tưởng",
  "snippet-76": "Chế độ ẩn danh Chrome"
};
const summaries = {
  "A mock Google search page with the character's recent search history.": "Trang tìm kiếm Google mô phỏng với lịch sử tìm kiếm gần đây của nhân vật.",
  "A Google Trends card showing daily popular searches.": "Thẻ Google Trends hiển thị các nội dung tìm kiếm phổ biến trong ngày.",
  "A Safari start page with Favorites and search history.": "Trang bắt đầu Safari với mục Yêu thích và lịch sử tìm kiếm.",
  "A compact Pocket article-saving card (300px).": "Thẻ nhỏ gọn để lưu bài viết vào Pocket (300px).",
  "A Chrome Incognito tab for search and private browsing.": "Tab ẩn danh Chrome để tìm kiếm và duyệt web riêng tư.",
  "A pink glass cyber-scene banner with neon lights, relationship status, and an inner thought.": "Banner cảnh cyber bằng kính hồng với đèn neon, trạng thái quan hệ và suy nghĩ bên trong.",
  "A Y2K midnight-drive log on the expressway.": "Nhật ký lái xe lúc nửa đêm trên đường cao tốc theo phong cách Y2K.",
  "A cyan digital scene log with a lo-fi pop remix soundtrack.": "Nhật ký cảnh kỹ thuật số màu cyan với nhạc remix pop lo-fi.",
  "A retro Windows 98 window with _ □ X controls and server status.": "Cửa sổ Windows 98 cổ điển với các nút _, □, X và trạng thái máy chủ.",
  "A chamfered cyberpunk HUD with a CAM_FEED and memo.": "HUD cyberpunk vát góc với CAM_FEED và ghi chú."
};
const text = {
  "_": "_", "□": "□", "X": "X",
  "☁️ (weather)": "☁️ (thời tiết)",
  "★ AESTHETIC ★": "★ THẨM MỸ ★",
  "★ Y2K CYBER SCENE ★": "★ CẢNH CYBER Y2K ★",
  "⚡ 2000s VIBE": "⚡ PHONG CÁCH NHỮNG NĂM 2000",
  "🎧 Together status: ({{char}} 𐙚 {{user}})": "🎧 Trạng thái bên nhau: ({{char}} 𐙚 {{user}})",
  "[👗 Signature style: leather jacket and Y2K-style goggles]": "[👗 Phong cách đặc trưng: áo khoác da và kính kiểu Y2K]",
  "💭 Inner thought: (analysis of the situation or feelings stored in the system)": "💭 Suy nghĩ bên trong: (phân tích tình huống hoặc cảm xúc được lưu trong hệ thống)",
  "💭 Inner thought: (current focus or thought)": "💭 Suy nghĩ bên trong: (điều đang tập trung hoặc suy nghĩ hiện tại)",
  "💭 Inner thought: (feelings on a night surrounded by neon lights)": "💭 Suy nghĩ bên trong: (cảm xúc trong đêm giữa ánh đèn neon)",
  "💭 Inner thought: (short message or command being processed)": "💭 Suy nghĩ bên trong: (tin nhắn ngắn hoặc lệnh đang được xử lý)",
  "💿 SCENE SOUNDTRACK: (scene soundtrack title)": "💿 NHẠC NỀN CẢNH: (tên nhạc nền của cảnh)",
  "📍 (location)": "📍 (địa điểm)",
  "📍 (location: living room or private lounge)": "📍 (địa điểm: phòng khách hoặc phòng chờ riêng)",
  "📍 (location: neon-lit Bangkok at night)": "📍 (địa điểm: Bangkok rực đèn neon về đêm)",
  "📍 (location: on the main expressway, heading to the destination)": "📍 (địa điểm: trên đường cao tốc chính, đang hướng đến điểm đến)",
  "🚗 (traveling with: {{user}})": "🚗 (đang đi cùng: {{user}})",
  "ACTORS: [{{char}}] & [{{user}}]": "NHÂN VẬT: [{{char}}] & [{{user}}]",
  "CAM_FEED // LIVE": "CAM_FEED // TRỰC TIẾP",
  "{{char}} ➔ {{user}}": "{{char}} ➔ {{user}}",
  "COORDINATES": "TỌA ĐỘ",
  "DIGITAL PARADISE": "THIÊN ĐƯỜNG KỸ THUẬT SỐ",
  "INTERNAL_MEMO:": "GHI_CHÚ_NỘI_BỘ:",
  "Logged at: (recorded date in numeric format) // (recording time)": "Ghi nhận lúc: (ngày ghi nhận dạng số) // (giờ ghi nhận)",
  "MIDNIGHT DRIVE": "LÁI XE LÚC NỬA ĐÊM",
  "NODE: (system time)": "NÚT: (giờ hệ thống)",
  "ONLINE": "TRỰC TUYẾN",
  "(scene date)": "(ngày của cảnh)",
  "(scene date in English format)": "(ngày của cảnh theo định dạng tiếng Anh)",
  "(scene time)": "(giờ của cảnh)",
  "SPEEDWAY CHRONICLE": "BIÊN NIÊN SỬ ĐƯỜNG CAO TỐC",
  "STATUS: ACTIVE CONNECTION // SECURE": "TRẠNG THÁI: ĐANG KẾT NỐI // AN TOÀN",
  "SYS_LOG // (system date)": "SYS_LOG // (ngày hệ thống)",
  "(system time)": "(giờ hệ thống)",
  "TARGET_ACTOR": "TARGET_ACTOR",
  "TIMESTAMP: (system date)": "MỐC THỜI GIAN: (ngày hệ thống)",
  "WINDOW_EXPLORER.EXE": "WINDOW_EXPLORER.EXE",
  "+(search count for rank 1)K": "+(lượt tìm kiếm ở hạng 1)K",
  "+(search count for rank 2)K": "+(lượt tìm kiếm ở hạng 2)K",
  "+(search count for rank 3)K": "+(lượt tìm kiếm ở hạng 3)K",
  "✕": "✕",
  "⭐ Favorite sites (Favorites)": "⭐ Trang web yêu thích (Yêu thích)",
  "🌅 Situation: (hot topic people are searching for)": "🌅 Tình hình: (chủ đề nóng mọi người đang tìm kiếm)",
  "🎙️": "🎙️",
  "💭 Inner thought: (private search query they do not want anyone to see)": "💭 Suy nghĩ bên trong: (cụm tìm kiếm riêng tư không muốn ai nhìn thấy)",
  "📈 Today's top searches": "📈 Tìm kiếm nổi bật hôm nay",
  "📑": "📑",
  "📢 The latest buzz: (insider rumor being shared)": "📢 Tin nóng mới nhất: (tin đồn nội bộ đang được chia sẻ)",
  "🔄": "🔄",
  "🔍": "🔍",
  "🕒": "🕒",
  "🕒 {{char}}'s recent search history": "🕒 Lịch sử tìm kiếm gần đây của {{char}}",
  "🕒 Recent search history": "🕒 Lịch sử tìm kiếm gần đây",
  "1": "1", "2": "2", "3": "3", "aA": "aA",
  "Chrome won't save:": "Chrome sẽ không lưu:",
  "Clear history": "Xóa lịch sử",
  "• cookies and site data": "• cookie và dữ liệu trang web",
  "Edit": "Chỉnh sửa",
  "(embarrassed search phrase before the user's name) {{user}}": "(cụm tìm kiếm về sự ngượng ngùng đứng trước tên người dùng) {{user}}",
  "(emoji 1)": "(emoji 1)",
  "(emoji 2)": "(emoji 2)",
  "(emoji 3)": "(emoji 3)",
  "(emoji 4)": "(emoji 4)",
  "(full restaurant search query)": "(câu tìm kiếm nhà hàng đầy đủ)",
  "• (gift idea search phrase before the user's name) {{user}} (gift idea search phrase after the user's name)": "• (cụm tìm ý tưởng quà tặng đứng trước tên người dùng) {{user}} (cụm tìm ý tưởng quà tặng đứng sau tên người dùng)",
  "Google Trends": "Google Trends",
  "• information entered in forms": "• thông tin đã nhập vào biểu mẫu",
  "pocket.co/saved": "pocket.co/saved",
  "Pocket Save": "Lưu vào Pocket",
  "(reading time) read": "(thời gian đọc) phút đọc",
  "Real-time updates": "Cập nhật theo thời gian thực",
  "safari-search.internal": "safari-search.internal",
  "Safari Start": "Trang bắt đầu Safari",
  "#SavedToRead": "#SavedToRead",
  "Search a topic or keyword...": "Tìm chủ đề hoặc từ khóa...",
  "Search or enter a URL in private mode...": "Tìm kiếm hoặc nhập URL ở chế độ riêng tư...",
  "(search phrase before the user's name) {{user}} (search phrase after the user's name)": "(cụm tìm kiếm đứng trước tên người dùng) {{user}} (cụm tìm kiếm đứng sau tên người dùng)",
  "• (search query about covering one's tracks)": "• (cụm tìm kiếm về cách che giấu dấu vết)",
  "(short caption about the article or saved item)": "(chú thích ngắn về bài viết hoặc mục đã lưu)",
  "• (travel destination search query)": "• (cụm tìm kiếm địa điểm du lịch)",
  "(trending topic before the other person's name) {{char}} and {{user}}": "(chủ đề thịnh hành đứng trước tên người kia) {{char}} và {{user}}",
  "(website name 1)": "(tên trang web 1)",
  "(website name 2)": "(tên trang web 2)",
  "(website name 3)": "(tên trang web 3)",
  "(website name 4)": "(tên trang web 4)",
  "(what they are secretly searching for and do not want anyone to know)": "(điều họ đang bí mật tìm kiếm và không muốn ai biết)",
  "You can browse privately. Other people using this device won't see your activity.": "Bạn có thể duyệt web riêng tư. Những người khác dùng thiết bị này sẽ không thấy hoạt động của bạn.",
  "• your browsing history": "• lịch sử duyệt web của bạn",
  "You've gone incognito": "Bạn đang ở chế độ ẩn danh"
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

const categories = new Set(["cyber-y2k", "search-interfaces"]);
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
console.log(`Translated ${translated.length} /vi/ cyber and search drafts from English.`);
