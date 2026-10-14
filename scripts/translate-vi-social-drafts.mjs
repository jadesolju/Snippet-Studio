import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (file) => JSON.parse(await fs.readFile(file, "utf8"));
const source = await readJson(path.join(root, "data", "en", "snippets.json"));
const targetPath = path.join(root, "data", "vi", "snippets.json");
const existing = await readJson(targetPath);

const titles = {
  "snippet-12": "Bài đăng trên bảng tin Instagram",
  "snippet-13": "Instagram Story",
  "snippet-14": "Trạng thái Facebook",
  "snippet-15": "Trung tâm thông báo LINE",
  "snippet-16": "Hồ sơ Instagram",
  "snippet-17": "Nhật ký hoạt động mạng xã hội",
  "snippet-18": "Bài đăng của nhà sáng tạo OnlyFans",
  "snippet-19": "Bài đăng VIP Fansly",
  "snippet-20": "Bài đăng của nhà sáng tạo Patreon",
  "snippet-21": "Bài đăng riêng tư trên X",
  "snippet-22": "Album ẩn",
  "snippet-43": "Bài đăng ảnh Instagram",
  "snippet-44": "Bài đăng ảnh Facebook",
  "snippet-45": "Bài đăng ảnh X",
  "snippet-46": "Bài đăng trên bảng tin Facebook",
  "snippet-47": "Bài đăng trên bảng tin X"
};
const summaries = {
  "An Instagram Story card with an image, GIF, location, and reply.": "Thẻ Instagram Story có hình ảnh, GIF, địa điểm và phần trả lời.",
  "A sample social profile, post, or activity.": "Ví dụ về hồ sơ, bài đăng hoặc hoạt động trên mạng xã hội.",
  "A sample social post or card.": "Ví dụ về bài đăng hoặc thẻ trên mạng xã hội."
};
const text = {
  "•••": "•••", "↗️": "↗️", "↗️ Share": "↗️ Chia sẻ", "≡": "≡", "★": "★", "⚠️": "⚠️", "✈️": "✈️", "✓": "✓", "✕": "✕", "✨": "✨", "❤️": "❤️", "🎁": "🎁", "👤": "👤", "💬": "💬", "📸": "📸", "🔒": "🔒", "🔖": "🔖", "🤍": "🤍", "📞": "📞", "🔔": "🔔", "ST": "ST",
  "⚡ Random current event: (random interruption, such as a burst of message alerts or an urgent incoming call)": "⚡ Sự kiện bất ngờ: (tình huống gián đoạn ngẫu nhiên như nhiều thông báo tin nhắn cùng lúc hoặc cuộc gọi khẩn cấp)",
  "✨ Photo unlocked • Enjoy your evening!": "✨ Đã mở khóa ảnh • Chúc bạn buổi tối vui vẻ!",
  "✨ (text or image in the Story, such as a selfie, a hint, or what they are doing)": "✨ (văn bản hoặc ảnh trong Story, chẳng hạn ảnh selfie, lời gợi ý hoặc việc họ đang làm)",
  "✨ (update status)": "✨ (trạng thái cập nhật)",
  "❤️ (like count)": "❤️ (số lượt thích)",
  "⭐ Add to favorites": "⭐ Thêm vào mục yêu thích",
  "👁️ (view count in thousands)k": "👁️ (lượt xem tính theo nghìn)k",
  "👍❤️😆 (reaction count) others": "👍❤️😆 (số lượt bày tỏ cảm xúc) người khác",
  "👍❤️ (reaction count) others": "👍❤️ (số lượt bày tỏ cảm xúc) người khác",
  "👍 Like": "👍 Thích",
  "[👗 Signature style: (describe a favorite fashion style or outfit)]": "[👗 Phong cách đặc trưng: (mô tả phong cách thời trang hoặc trang phục yêu thích)]",
  "👥 Other characters' thoughts: (comment from a supporting character in the scene)": "👥 Suy nghĩ của nhân vật khác: (bình luận từ nhân vật phụ trong cảnh)",
  "👥 Other characters' thoughts: (thoughts or perspective of a supporting character mentioned in the teasing)": "👥 Suy nghĩ của nhân vật khác: (suy nghĩ hoặc góc nhìn của nhân vật phụ được nhắc đến trong lời trêu chọc)",
  "💎 VIP ONLY": "💎 CHỈ DÀNH CHO VIP",
  "💙 (like count) Likes": "💙 (số lượt thích) lượt thích",
  "💬 Comment": "💬 Bình luận",
  "💬 (comment count)": "💬 (số bình luận)",
  "💬 (comment count) Comments": "💬 (số bình luận) bình luận",
  "💬 (latest message)": "💬 (tin nhắn mới nhất)",
  "💬 LINE • {{char}}": "💬 LINE • {{char}}",
  "💬 (post comment count)": "💬 (số bình luận bài đăng)",
  "💭 Inner thought: (inner thought while posting this Story)": "💭 Suy nghĩ bên trong: (suy nghĩ khi đăng Story này)",
  "💭 Inner thought: (short self-description in the bio)": "💭 Suy nghĩ bên trong: (lời tự giới thiệu ngắn trong tiểu sử)",
  "💸 Send Tip": "💸 Gửi tiền boa",
  "📁 File: Exclusive_NoCensor_01.png (file size)": "📁 Tệp: Exclusive_NoCensor_01.png (kích thước tệp)",
  "📍 (location: check-in location)": "📍 (địa điểm: nơi check-in)",
  "📍 (location: current address or check-in)": "📍 (địa điểm: địa chỉ hiện tại hoặc nơi check-in)",
  "📍 (location: story location)": "📍 (địa điểm: địa điểm trong Story)",
  "📢 The latest buzz: (trending reactions or a rumor being shared)": "📢 Tin nóng mới nhất: (các phản ứng đang lan truyền hoặc tin đồn được chia sẻ)",
  "📢 The latest buzz: (trending rumor or reactions from people around them about this event)": "📢 Tin nóng mới nhất: (tin đồn thịnh hành hoặc phản ứng của những người xung quanh về sự kiện này)",
  "📸 INSTAGRAM": "📸 INSTAGRAM",
  "🔁 (repost count)": "🔁 (số lượt đăng lại)",
  "🔑 Tap to unlock (credit count) Credits": "🔑 Nhấn để mở khóa (số điểm) điểm",
  "🔒 HIDDEN": "🔒 ĐÃ ẨN",
  "🔓 Unlocked • Thanks for the tip!": "🔓 Đã mở khóa • Cảm ơn vì đã boa!",
  "🔔 FACEBOOK": "🔔 FACEBOOK",
  "🔖 (save count)": "🔖 (số lượt lưu)",
  "🔖 Viewing access: Patrons Tier (membership tier) and above": "🔖 Quyền xem: hạng Patrons (hạng thành viên) trở lên",
  "🤍 (comment 1 like count)": "🤍 (số lượt thích bình luận 1)",
  "🤍 (comment 2 like count)": "🤍 (số lượt thích bình luận 2)",
  "🤍 (comment 3 like count)": "🤍 (số lượt thích bình luận 3)",
  "🤍 (post like count)": "🤍 (số lượt thích bài đăng)",
  "5G 🔋": "5G 🔋",
  "(album open time)": "(thời gian mở album)",
  "Aommy_Official": "Aommy_Official",
  "(caption or feeling while posting this GIF)": "(chú thích hoặc cảm xúc khi đăng GIF này)",
  "(caption reflecting the current mood or situation)": "(chú thích thể hiện tâm trạng hoặc tình huống hiện tại)",
  "{{char}}": "{{char}}",
  "({{char}} added a new photo to their Story)": "({{char}} đã thêm ảnh mới vào Story)",
  "@{{char}}_official": "@{{char}}_official",
  "{{char}}_official": "{{char}}_official",
  "[{{char}}'s Instagram post image]": "[ảnh bài đăng Instagram của {{char}}]",
  "(comment 1 text)": "(nội dung bình luận 1)",
  "(comment 1 time) • Like • Reply": "(thời gian bình luận 1) • Thích • Trả lời",
  "(comment 2 time) • Like • Reply": "(thời gian bình luận 2) • Thích • Trả lời",
  "(comment count) Comments • (share count) Shares": "(số bình luận) bình luận • (số lượt chia sẻ) lượt chia sẻ",
  "Comments (number of comments) items": "Bình luận (số lượng bình luận) mục",
  "• (comment time)": "• (thời gian bình luận)",
  "(describe the image, appearance, outfit, or style)": "(mô tả hình ảnh, ngoại hình, trang phục hoặc phong cách)",
  "(exclusive photo count) EXCLUSIVE PHOTO": "(số ảnh độc quyền) ẢNH ĐỘC QUYỀN",
  "(Facebook status describing a situation or expressing feelings)": "(trạng thái Facebook kể về tình huống hoặc bày tỏ cảm xúc)",
  "Fansly Diamond Tier": "Hạng Diamond của Fansly",
  "(follower count)": "(số người theo dõi)",
  "Followers": "Người theo dõi",
  "Following": "Đang theo dõi",
  "(following count)": "(số tài khoản đang theo dõi)",
  "Full HD": "Full HD",
  "(HH:MM)": "(HH:MM)",
  "(HH:MM) 🔋": "(HH:MM) 🔋",
  "Hidden album (Hidden)": "Album ẩn (Đã ẩn)",
  "IG & FB STATUS": "TRẠNG THÁI IG & FB",
  "(item count)": "(số mục)",
  "@Kenta_X": "@Kenta_X",
  "Kitten_Meow 🐾": "Kitten_Meow 🐾",
  "@kitten_private": "@kitten_private",
  "kitty_glam:": "kitty_glam:",
  "Liked by {{user}} and (additional likes) others": "{{user}} và (số lượt thích bổ sung) người khác đã thích",
  "LINE MESSAGE": "TIN NHẮN LINE",
  "Luna Studio": "Luna Studio",
  "Memories": "Kỷ niệm",
  "@mistylove • (online status)": "@mistylove • (trạng thái trực tuyến)",
  "Misty_Lover": "Misty_Lover",
  "(notification about a friend's post or activity)": "(thông báo về bài đăng hoặc hoạt động của bạn bè)",
  "NOTIFICATION CENTER": "TRUNG TÂM THÔNG BÁO",
  "Or free for Diamond-tier members and above": "Hoặc miễn phí cho thành viên hạng Diamond trở lên",
  "Patreon Creator": "Nhà sáng tạo Patreon",
  "PATRONS TIER $(membership tier price)+ REWARD": "HẠNG PATRONS $(giá gói thành viên)+ PHẦN THƯỞNG",
  "(post count)": "(số bài đăng)",
  "Posts": "Bài đăng",
  "(post text)": "(nội dung bài đăng)",
  "(post text before the goal) (repost goal) (post text after the goal) #Private #NSFW": "(nội dung bài đăng trước mục tiêu) (mục tiêu đăng lại) (nội dung bài đăng sau mục tiêu) #Private #NSFW",
  "(post time) • 🌐 Public": "(thời gian đăng) • 🌐 Công khai",
  "(post time in clock format)": "(thời gian đăng theo định dạng đồng hồ)",
  "random_guy99:": "random_guy99:",
  "Reply to this Story...": "Trả lời Story này...",
  "Scarlett_VIP": "Scarlett_VIP",
  "@SecretTracker": "@SecretTracker",
  "Send message": "Gửi tin nhắn",
  "[(set month and year) Set] (set or campaign name) (target follower count) (promotional post text)": "[(tháng và năm của bộ ảnh) Bộ ảnh] (tên bộ ảnh hoặc chiến dịch) (mục tiêu số người theo dõi) (nội dung bài đăng quảng bá)",
  "(short LINE message)": "(tin nhắn LINE ngắn)",
  "(short trending post or a personal vent)": "(bài đăng ngắn đang thịnh hành hoặc lời tâm sự cá nhân)",
  "SOCIAL ACTIVITY LOG": "NHẬT KÝ HOẠT ĐỘNG MẠNG XÃ HỘI",
  "Somchai_Studio": "Somchai_Studio",
  "(status describing, venting about, or recounting what just happened)": "(trạng thái kể lại, than phiền hoặc chia sẻ chuyện vừa xảy ra)",
  "Taken on (photo date and time) • Bangkok": "Chụp lúc (ngày và giờ chụp) • Bangkok",
  "Tap to show media (Show Content)": "Nhấn để hiển thị nội dung (Xem nội dung)",
  "Tap to unlock $(unlock price)": "Nhấn để mở khóa $(giá mở khóa)",
  "Tap to unlock with Face ID": "Nhấn để mở khóa bằng Face ID",
  "[ Tap to view the high-resolution image (image resolution) ]": "[ Nhấn để xem ảnh độ phân giải cao (độ phân giải ảnh) ]",
  "That face is so meme-worthy, {{user}} (teasing text in comment 2)": "Biểu cảm đó đúng là làm meme được luôn, {{user}} (lời trêu chọc trong bình luận 2)",
  "This album is locked": "Album này đã bị khóa",
  "This media may contain adult content": "Phương tiện này có thể chứa nội dung người lớn",
  "(time elapsed)": "(thời gian đã trôi qua)",
  "• (time elapsed)": "• (thời gian đã trôi qua)",
  "Trips": "Chuyến đi",
  "{{user}}": "{{user}}",
  "user_anon88:": "user_anon88:",
  "(weekday) • (HH:MM)": "(thứ trong tuần) • (HH:MM)",
  "(weekday) • (HH:MM) • 🌐 Public": "(thứ trong tuần) • (HH:MM) • 🌐 Công khai",
  "𝕏": "𝕏"
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

const batch = source.filter((item) => item.categoryId === "social-interfaces");
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
console.log(`Translated ${translated.length} /vi/ social-interface drafts from English.`);
