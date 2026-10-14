import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (file) => JSON.parse(await fs.readFile(file, "utf8"));
const source = await readJson(path.join(root, "data", "en", "snippets.json"));
const targetPath = path.join(root, "data", "vi", "snippets.json");
const existing = await readJson(targetPath);

const titles = {
  "snippet-09": "Trò chuyện LINE",
  "snippet-10": "Tin nhắn trực tiếp Instagram",
  "snippet-11": "Trò chuyện Messenger",
  "snippet-23": "Cuộc trò chuyện ChatGPT",
  "snippet-24": "Cuộc trò chuyện Gemini",
  "snippet-25": "Cuộc trò chuyện Grok"
};
const summaries = {
  "A mock chat and private messaging interface.": "Giao diện mô phỏng cuộc trò chuyện và tin nhắn riêng tư.",
  "A mock conversation with an AI assistant.": "Cuộc trò chuyện mô phỏng với trợ lý AI."
};
const text = {
  "❮": "❮",
  "•••": "•••",
  "≡": "≡",
  "⚡": "⚡",
  "⚡ Send": "⚡ Gửi",
  "✦ Live": "✦ Trực tiếp",
  "✦ Send": "✦ Gửi",
  "🎙️ ➔": "🎙️ ➔",
  "🎙️ 🖼️": "🎙️ 🖼️",
  "👤": "👤",
  "💬 {{char}}: (latest message in the conversation)": "💬 {{char}}: (tin nhắn mới nhất trong cuộc trò chuyện)",
  "💬 {{char}}: (most recent chat exchange or a message sent between them)": "💬 {{char}}: (đoạn chat mới nhất hoặc tin nhắn họ gửi cho nhau)",
  "💬 (latest chat exchange)": "💬 (đoạn chat mới nhất)",
  "💬 Latest message: (latest reply)": "💬 Tin nhắn mới nhất: (câu trả lời mới nhất)",
  "💬 (message sent to)": "💬 (tin nhắn gửi tới)",
  "💬 {{user}}: (reply)": "💬 {{user}}: (câu trả lời)",
  "📝 Note by {{char}}: (short note about an event or an assessment)": "📝 Ghi chú của {{char}}: (ghi chú ngắn về một sự kiện hoặc nhận định)",
  "📞": "📞",
  "📱 View more chat history and notifications": "📱 Xem thêm lịch sử trò chuyện và thông báo",
  "📹": "📹",
  "🔔 Notification: (brief notification)": "🔔 Thông báo: (thông báo ngắn)",
  "🔔 Notification: (latest message or phone notification; if there is none, write No new messages)": "🔔 Thông báo: (tin nhắn hoặc thông báo điện thoại mới nhất; nếu không có thì ghi Không có tin nhắn mới)",
  "Advice from ChatGPT": "Lời khuyên từ ChatGPT",
  "(advice from Grok)": "(lời khuyên từ Grok)",
  "Ask ChatGPT another question...": "Hỏi ChatGPT câu khác...",
  "Based on the signals {{user}} is giving: (advice from ChatGPT)": "Dựa trên những tín hiệu {{user}} đang thể hiện: (lời khuyên từ ChatGPT)",
  "{{char}}": "{{char}}",
  "{{char}}_official": "{{char}}_official",
  "{{char}} replies": "{{char}} trả lời",
  "ChatGPT": "ChatGPT",
  "Enter a question for Gemini...": "Nhập câu hỏi cho Gemini...",
  "Gemini Advanced • Thoughts and decisions": "Gemini Advanced • Suy nghĩ và quyết định",
  "Gemini's assessment": "Nhận định của Gemini",
  "Google Gemini": "Google Gemini",
  "GPT • Private conversation": "GPT • Cuộc trò chuyện riêng tư",
  "Grok": "Grok",
  "Grok, if {{user}} (behavior or words that raise suspicion) should I (question to ask Grok)?": "Grok, nếu {{user}} (hành động hoặc lời nói khiến tôi nghi ngờ) thì tôi có nên (câu hỏi muốn hỏi Grok) không?",
  "Grok's perspective": "Góc nhìn của Grok",
  "Help me think this through. {{user}}'s trust level is currently (trust level) should I (question about opening up)?": "Giúp tôi suy nghĩ về chuyện này. Mức độ tin tưởng của {{user}} hiện là (mức độ tin tưởng), tôi có nên (câu hỏi về việc mở lòng) không?",
  "(HH:MM)": "(HH:MM)",
  "If {{user}} suddenly (behavior or words in question) should I (the choice they are unsure about)?": "Nếu {{user}} đột nhiên (hành động hoặc lời nói đang được nhắc đến), tôi có nên (lựa chọn khiến tôi phân vân) không?",
  "Keep the conversation spicy with Grok...": "Giữ cuộc trò chuyện thật táo bạo với Grok...",
  "LINE Online": "LINE Trực tuyến",
  "Messenger • {{char}}": "Messenger • {{char}}",
  "(online status)": "(trạng thái trực tuyến)",
  "Read": "Đã đọc",
  "(reply after receiving ChatGPT's advice)": "(câu trả lời sau khi nhận lời khuyên từ ChatGPT)",
  "(reply after receiving Gemini's advice)": "(câu trả lời sau khi nhận lời khuyên từ Gemini)",
  "(reply after receiving Grok's advice)": "(câu trả lời sau khi nhận lời khuyên từ Grok)",
  "Send a message...": "Gửi tin nhắn...",
  "Talking about the past may feel stressful right now. First, create a relaxed atmosphere at 📍 (location) first, then (approach suggested by Gemini) so they can talk comfortably.": "Nhắc đến chuyện quá khứ lúc này có thể khiến đối phương căng thẳng. Trước tiên hãy tạo không khí thoải mái tại 📍 (địa điểm), rồi (cách Gemini gợi ý) để hai người có thể trò chuyện dễ dàng hơn.",
  "xAI • Fun Mode (No Filter)": "xAI • Chế độ vui nhộn (không giới hạn)"
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

const batch = source.filter((item) => item.categoryId === "chat-interfaces");
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
console.log(`Translated ${translated.length} /vi/ chat-interface drafts from English.`);
