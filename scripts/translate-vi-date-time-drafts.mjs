import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (file) => JSON.parse(await fs.readFile(file, "utf8"));
const source = await readJson(path.join(root, "data", "en", "snippets.json"));
const targetPath = path.join(root, "data", "vi", "snippets.json");
const existing = await readJson(targetPath);

const titles = {
  "snippet-01": "Thẻ trạng thái kính mờ",
  "snippet-02": "Thẻ sự kiện căn giữa",
  "snippet-03": "Tiện ích chờ",
  "snippet-04": "Thẻ thông báo phong cách biên tập",
  "snippet-05": "Cảnh báo tập trung",
  "snippet-06": "Thẻ sự cố lịch",
  "snippet-07": "Nhật ký cảnh báo bảng điều khiển",
  "snippet-08": "Thông báo ngày tháng gọn",
  "snippet-52": "Quán cà phê đời thường và thước đo năng lượng",
  "snippet-53": "Terminal trạng thái hằng ngày",
  "snippet-54": "Góc phòng ấm cúng",
  "snippet-55": "Khoảnh khắc đời thường",
  "snippet-61": "Lịch hoạt động hằng ngày",
  "snippet-62": "Kế hoạch nhiệm vụ nước rút trong tuần",
  "snippet-63": "Viên nang ghi chú hành động",
  "snippet-89": "🍓 MỞ ĐẦU CHƯƠNG",
  "snippet-90": "🪼 THỜI GIAN ĐẠI DƯƠNG",
  "snippet-91": "🌼 CẢNH BUỔI SÁNG",
  "snippet-92": "🐧 NHẬT KÝ VÙNG CỰC",
  "snippet-93": "🍊 THƯ GIÃN ONSEN",
  "snippet-94": "🐰 KẸO NGỌT",
  "snippet-95": "🦖 CÔNG VIÊN KHỦNG LONG",
  "snippet-96": "🦈 VỊNH CÁ MẬP",
  "snippet-97": "🐱 MÈO ẤM ÁP",
  "snippet-98": "✨ BANNER CẢNH · GIF",
  "snippet-99": "🎀 THỜI GIAN KITTY",
  "snippet-100": "😇 ĐÔI CÁNH THIÊN THẦN",
  "snippet-101": "🧽 TRÍ TƯỞNG TƯỢNG · SPONGEBOB",
  "snippet-102": "🐈 NHẬT KÝ XOA ĐẦU"
};

const summaries = {
  "A card showing the date, time, location, and status.": "Thẻ hiển thị ngày, giờ, địa điểm và trạng thái.",
  "A cafe mood card with energy, happiness, and location.": "Thẻ không khí quán cà phê với năng lượng, niềm vui và địa điểm.",
  "A terminal-style card for daily routine, comfort, and inner thoughts.": "Thẻ phong cách terminal về thói quen hằng ngày, sự an tâm và suy nghĩ bên trong.",
  "A cozy living-room snapshot with temperature, relaxation, and activity.": "Ảnh chụp phòng khách ấm cúng với nhiệt độ, trạng thái thư giãn và hoạt động.",
  "A daily-life moment with mood and a close emotional bond.": "Khoảnh khắc đời thường với tâm trạng và sự gắn kết tình cảm sâu sắc.",
  "A card showing the time, date, and location.": "Thẻ hiển thị giờ, ngày và địa điểm.",
  "A card showing the time, date, and location with an animated image.": "Thẻ hiển thị giờ, ngày, địa điểm cùng hình ảnh động.",
  "A daily schedule with morning, afternoon, and evening activities.": "Lịch hằng ngày gồm các hoạt động buổi sáng, buổi chiều và buổi tối.",
  "A weekly plan with three tasks, color bars, and urgency levels.": "Kế hoạch tuần gồm ba nhiệm vụ, thanh màu và mức độ khẩn cấp.",
  "A rounded capsule-style reminder with three action items.": "Lời nhắc dạng viên nang bo tròn với ba việc cần thực hiện."
};

// Exact text-node translations keep every tag, attribute, style, macro, and
// parenthesized capture boundary from the already translated English draft.
const text = {
  "|": "|",
  "⏱️ TIME & REGION": "⏱️ GIỜ & KHU VỰC",
  "☕ CAFE": "☕ QUÁN CÀ PHÊ",
  "⚠️ DON'T FORGET": "⚠️ ĐỪNG QUÊN",
  "⚠️ PRIORITY ALERT": "⚠️ CẢNH BÁO ƯU TIÊN",
  "⚡ ALERT LOG": "⚡ NHẬT KÝ CẢNH BÁO",
  "⚡ WEEKLY PLAN": "⚡ KẾ HOẠCH TUẦN",
  "🌅 (situation: brief description)": "🌅 (tình huống: mô tả ngắn gọn)",
  "🌙 Focus Active": "🌙 Đang tập trung",
  "👗 Signature style": "👗 Phong cách đặc trưng",
  "[👗 Signature style: outfit/accessories]": "[👗 Phong cách đặc trưng: trang phục/phụ kiện]",
  "💬": "💬",
  "💭 Inner thought: (peace of mind when spending time together)": "💭 Suy nghĩ bên trong: (sự an yên khi ở bên nhau)",
  "💳 FINANCIAL STATUS & DEBT ACCOUNT": "💳 TÌNH HÌNH TÀI CHÍNH VÀ KHOẢN NỢ",
  "📅 (weekday) (date) (month/year)": "📅 (thứ trong tuần) (ngày) (tháng/năm)",
  "📌": "📌",
  "📍 (location: amusement park / gift shop)": "📍 (địa điểm: công viên giải trí / cửa hàng quà tặng)",
  "📍 (location: aquarium / late-morning beach)": "📍 (địa điểm: thủy cung / bãi biển cuối buổi sáng)",
  "📍 (location) • A relaxing moment spent chatting together": "📍 (địa điểm) • Khoảnh khắc thư thái cùng trò chuyện",
  "📍 (location: bakery / kitchen corner)": "📍 (địa điểm: tiệm bánh / góc bếp)",
  "📍 (location: bay marina / shoreline)": "📍 (địa điểm: bến du thuyền ven vịnh / bờ biển)",
  "📍 (location: Bikini Bottom / beach)": "📍 (địa điểm: Bikini Bottom / bãi biển)",
  "📍 (location: botanical garden / meadow)": "📍 (địa điểm: vườn bách thảo / đồng cỏ)",
  "📍 (location: brief description)": "📍 (địa điểm: mô tả ngắn gọn)",
  "📍 (location: cafe or station)": "📍 (địa điểm: quán cà phê hoặc nhà ga)",
  "📍 (location: city center / meeting point)": "📍 (địa điểm: trung tâm thành phố / điểm hẹn)",
  "📍 (location: dessert cafe / tea table)": "📍 (địa điểm: quán tráng miệng / bàn trà)",
  "📍 (location: hillside flower garden)": "📍 (địa điểm: vườn hoa trên sườn đồi)",
  "📍 (location: hot spring / relaxation garden)": "📍 (địa điểm: suối nước nóng / khu vườn thư giãn)",
  "📍 (location: ice rink / snowy lookout)": "📍 (địa điểm: sân trượt băng / điểm ngắm tuyết)",
  "📍 (location: Kitty's house / apple garden)": "📍 (địa điểm: nhà Kitty / vườn táo)",
  "📍 (location: living room / sofa cushion)": "📍 (địa điểm: phòng khách / đệm sofa)",
  "📍 (location: sunny balcony nook / bedroom)": "📍 (địa điểm: góc ban công đầy nắng / phòng ngủ)",
  "📍 (scene location and atmosphere)": "📍 (địa điểm và không khí của cảnh)",
  "🔋 (battery percentage)": "🔋 (phần trăm pin)",
  "🔑": "🔑",
  "🔔": "🔔",
  "🔔 NOTICE": "🔔 THÔNG BÁO",
  "🕒": "🕒",
  "🕒 (HH:MM)": "🕒 (HH:MM)",
  "🚨 CURRENT INCIDENT": "🚨 SỰ CỐ HIỆN TẠI",
  "🚨 INCIDENT BANNER": "🚨 BẢNG THÔNG BÁO SỰ CỐ",
  "🛍️": "🛍️",
  "ACTIVITY": "HOẠT ĐỘNG",
  "Activity: (activity with {{user}})": "Hoạt động: (hoạt động cùng {{user}})",
  "(activity time)": "(thời gian hoạt động)",
  "(afternoon activity)": "(hoạt động buổi chiều)",
  "ANGEL WINGS": "ĐÔI CÁNH THIÊN THẦN",
  "Appetite": "Khẩu vị",
  "Appointment: (scheduled activity with {{user}} at the meeting place)": "Cuộc hẹn: (hoạt động đã hẹn với {{user}} tại điểm hẹn)",
  "(appointment time)": "(thời gian hẹn)",
  "Balance: (remaining balance) THB": "Số dư: (số dư còn lại) THB",
  "CALENDAR": "LỊCH",
  "CHAPTER ENTRY": "MỞ ĐẦU CHƯƠNG",
  "{{char}} and {{user}} • (character's emotional status)": "{{char}} và {{user}} • (trạng thái cảm xúc của nhân vật)",
  "{{char}} • (relaxing)": "{{char}} • (đang thư giãn)",
  "{{char}} & {{user}}": "{{char}} & {{user}}",
  "CHILL DAY": "NGÀY THƯ THÁI",
  "Comfort: (comfort score)/100 • Nothing to worry about": "Sự an tâm: (điểm an tâm)/100 • Không có gì phải lo",
  "CONTROL PANEL": "BẢNG ĐIỀU KHIỂN",
  "COZY CAT": "MÈO ẤM ÁP",
  "DAILY MOMENT": "KHOẢNH KHẮC HẰNG NGÀY",
  "DAILY SCHEDULE": "LỊCH TRÌNH HẰNG NGÀY",
  "[DAILY STATUS]": "[TRẠNG THÁI HẰNG NGÀY]",
  "(date)": "(ngày)",
  "DATE": "NGÀY",
  "(date) | 🕒 (HH:MM)": "(ngày) | 🕒 (HH:MM)",
  "(date) (month/year)": "(ngày) (tháng/năm)",
  "(date recorded)": "(ngày ghi nhận)",
  "(date) (weekday)": "(ngày) (thứ trong tuần)",
  "(day/month/year)": "(ngày/tháng/năm)",
  "(dinner activity)": "(hoạt động buổi tối)",
  "(dinner time)": "(giờ ăn tối)",
  "DINO PARK": "CÔNG VIÊN KHỦNG LONG",
  "Emotional bond: close (intimacy level)": "Gắn kết tình cảm: thân thiết (mức độ thân mật)",
  "Energy (Energy)": "Năng lượng (năng lượng)",
  "(energy percentage)": "(phần trăm năng lượng)",
  "Fully relaxed 🛋️": "Thư giãn hoàn toàn 🛋️",
  "(going with {{user}}) • Due: (task 1 deadline)": "(đi cùng {{user}}) • Hạn chót: (hạn hoàn thành nhiệm vụ 1)",
  "(happiness percentage)": "(phần trăm niềm vui)",
  "Happiness with {{user}}": "Niềm vui khi ở bên {{user}}",
  "HEADPAT LOG": "NHẬT KÝ XOA ĐẦU",
  "(HH:MM)": "(HH:MM)",
  "(HH:MM) 🔋": "(HH:MM) 🔋",
  "IMAGINATION": "TRÍ TƯỞNG TƯỢNG",
  "Just right 🍵": "Vừa đủ 🍵",
  "(key task of the week)": "(nhiệm vụ quan trọng trong tuần)",
  "KITTY TIME": "THỜI GIAN CÙNG KITTY",
  "LOCATION": "ĐỊA ĐIỂM",
  "LOCATION & TIME": "ĐỊA ĐIỂM VÀ THỜI GIAN",
  "(mobile network) 🔋": "(mạng di động) 🔋",
  "MOMENT // SLICE_OF_LIFE": "KHOẢNH KHẮC // ĐỜI THƯỜNG",
  "(month/year)": "(tháng/năm)",
  "(mood of the scene)": "(tâm trạng của cảnh)",
  "MORNING SCENE": "CẢNH BUỔI SÁNG",
  "NOTICE": "THÔNG BÁO",
  "NOTIFICATION": "THÔNG BÁO",
  "OCEAN TIME": "THỜI GIAN ĐẠI DƯƠNG",
  "ONSEN RELAX": "THƯ GIÃN Ở ONSEN",
  "Peaceful living room": "Phòng khách yên bình",
  "POLAR LOG": "NHẬT KÝ VÙNG CỰC",
  "Relaxation": "Thư giãn",
  "REMINDER": "LỜI NHẮC",
  "(reminder task 1)": "(nhiệm vụ nhắc nhở 1)",
  "(reminder task 1 details)": "(chi tiết nhiệm vụ nhắc nhở 1)",
  "(reminder task 2 details)": "(chi tiết nhiệm vụ nhắc nhở 2)",
  "(reminder task 3)": "(nhiệm vụ nhắc nhở 3)",
  "Reply to {{user}} about (message topic to reply to)": "Trả lời {{user}} về (chủ đề tin nhắn cần trả lời)",
  "Routine: (daily routine with {{user}})": "Thói quen: (thói quen hằng ngày cùng {{user}})",
  "SCENE BANNER": "BANNER CẢNH",
  "SHARK BAY": "VỊNH CÁ MẬP",
  "STANDBY WIDGET": "TIỆN ÍCH CHỜ",
  "SWEET POP": "KẸO NGỌT",
  "SYSTEM EVENT": "SỰ KIỆN HỆ THỐNG",
  "(task 1 due time)": "(thời hạn nhiệm vụ 1)",
  "(task 1 urgency level)": "(mức độ khẩn cấp của nhiệm vụ 1)",
  "(task 2 activity)": "(hoạt động của nhiệm vụ 2)",
  "(task 2 priority level)": "(mức độ ưu tiên của nhiệm vụ 2)",
  "(task 2 urgency level)": "(mức độ khẩn cấp của nhiệm vụ 2)",
  "(task 3 activity)": "(hoạt động của nhiệm vụ 3)",
  "(task 3 frequency)": "(tần suất của nhiệm vụ 3)",
  "(task 3 priority level)": "(mức độ ưu tiên của nhiệm vụ 3)",
  "(temperature)°C 🍃": "(nhiệt độ)°C 🍃",
  "(time elapsed)": "(thời gian đã trôi qua)",
  "TIME & PLACE": "THỜI GIAN VÀ ĐỊA ĐIỂM",
  "• (update status)": "• (trạng thái cập nhật)",
  "Warm and cozy ☀️": "Ấm áp và dễ chịu ☀️",
  "(weekday)": "(thứ trong tuần)",
  "(weekday) at (date)": "(thứ trong tuần), ngày (ngày)",
  "(weekday) (date)": "(thứ trong tuần) (ngày)",
  "(weekday) • (date) (month/year)": "(thứ trong tuần) • (ngày) (tháng/năm)",
  "(weekday) • (month/year)": "(thứ trong tuần) • (tháng/năm)",
  "Weekly Sprint": "NƯỚC RÚT TRONG TUẦN"
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

const batch = source.filter((item) => item.categoryId === "date-time");
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
console.log(`Translated ${translated.length} /vi/ date-time drafts from English.`);
