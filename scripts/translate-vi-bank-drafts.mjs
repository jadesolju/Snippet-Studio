import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (file) => JSON.parse(await fs.readFile(file, "utf8"));
const source = await readJson(path.join(root, "data", "en", "snippets.json"));
const targetPath = path.join(root, "data", "vi", "snippets.json");
const existing = await readJson(targetPath);

const titles = {
  "snippet-26": "Chuyển tiền K PLUS",
  "snippet-27": "Chuyển tiền SCB EASY",
  "snippet-28": "Chuyển tiền Krungthai NEXT",
  "snippet-29": "Chuyển tiền Krungsri KMA",
  "snippet-30": "Chuyển tiền UOB TMRW",
  "snippet-31": "Chuyển tiền qua ví TrueMoney",
  "snippet-32": "Biên nhận chuyển khoản thành công",
  "snippet-33": "Biên nhận đã gửi tiền",
  "snippet-34": "Biên nhận chuyển tiền của nhân vật",
  "snippet-35": "Lệnh thanh toán quốc tế",
  "snippet-36": "Biên nhận chuyển khoản tại Thái Lan",
  "snippet-38": "E-Slip dọc KBANK",
  "snippet-39": "E-Slip dọc SCB",
  "snippet-40": "E-Slip dọc Krungthai",
  "snippet-41": "E-Slip dọc Krungsri",
  "snippet-42": "Biên nhận TrueMoney dọc",
  "snippet-51": "Hóa đơn quán cà phê Maison Glass"
};
const summaries = {
  "A transfer or payment summary screen.": "Màn hình tóm tắt chuyển khoản hoặc thanh toán.",
  "A tall receipt or transaction confirmation.": "Biên nhận dạng dọc hoặc xác nhận giao dịch.",
  "A modern cafe or restaurant receipt with items and a total.": "Hóa đơn quán cà phê hoặc nhà hàng hiện đại, có danh sách món và tổng tiền."
};
const text = {
  "✓ Successful": "✓ Thành công",
  "✔": "✔",
  "✔ Money sent successfully": "✔ Đã gửi tiền thành công",
  "✔ Transfer complete": "✔ Chuyển khoản hoàn tất",
  "➔": "➔",
  "⭐": "⭐",
  "👤": "👤",
  "💰 {{char}}'s remaining balance: (remaining balance) THB": "💰 Số dư còn lại của {{char}}: (số dư còn lại) THB",
  "📍 (location: date venue)": "📍 (địa điểm: nơi hẹn hò)",
  "🧾": "🧾",
  "£(transferred amount) GBP": "£(số tiền đã chuyển) GBP",
  "฿(latte price)": "฿(giá latte)",
  "฿(pasta price)": "฿(giá mì Ý)",
  "฿(service charge)": "฿(phí dịch vụ)",
  "฿(total)": "฿(tổng tiền)",
  "฿(transfer amount)": "฿(số tiền chuyển)",
  "฿(wine pairing price)": "฿(giá set rượu vang)",
  "Amount": "Số tiền",
  "(amount in words)": "(số tiền viết bằng chữ)",
  "Bank of Ayudhya": "Bank of Ayudhya",
  "{{char}}": "{{char}}",
  "Charged to: {{char}}": "Trừ từ: {{char}}",
  "{{char}} sent money to {{user}}": "{{char}} đã gửi tiền cho {{user}}",
  "Credited to": "Ghi có cho",
  "Debited from": "Ghi nợ từ",
  "Effective date: (transaction date)": "Ngày hiệu lực: (ngày giao dịch)",
  "e-Slip Authenticated": "e-Slip đã được xác thực",
  "Fee": "Phí",
  "Fee: (fee) THB": "Phí: (phí) THB",
  "(fee) THB": "(phí) THB",
  "From": "Từ",
  "From {{char}}": "Từ {{char}}",
  "From sender": "Từ người gửi",
  "Grand total": "Tổng cộng",
  "Iced Vanilla Latte x(number of lattes)": "Latte vani đá x(số ly latte)",
  "Kasikornbank": "Kasikornbank",
  "Kasikornbank • (masked source account)": "Kasikornbank • (tài khoản nguồn đã che)",
  "KMA Krungsri App": "Ứng dụng KMA Krungsri",
  "K PLUS • Transfer successful": "K PLUS • Chuyển khoản thành công",
  "Krungsri • (masked source account)": "Krungsri • (tài khoản nguồn đã che)",
  "Krungthai Bank": "Krungthai Bank",
  "Krungthai • (masked source account)": "Krungthai • (tài khoản nguồn đã che)",
  "Krungthai NEXT": "Krungthai NEXT",
  "Krungthai NEXT • Transfer successful": "Krungthai NEXT • Chuyển khoản thành công",
  "Maison Glass Cafe": "Maison Glass Cafe",
  "(masked destination account)": "(tài khoản nhận đã che)",
  "(masked source account)": "(tài khoản nguồn đã che)",
  "Memo: (payment note)": "Ghi chú: (nội dung thanh toán)",
  "Message:": "Lời nhắn:",
  "Net amount": "Số tiền thực nhận",
  "(net amount)": "(số tiền thực nhận)",
  "No transaction fee": "Không mất phí giao dịch",
  "Payment complete": "Thanh toán hoàn tất",
  "PAYMENT DISPATCH": "GỬI THANH TOÁN",
  "(payment note)": "(nội dung thanh toán)",
  "PromptPay / destination account": "PromptPay / tài khoản nhận",
  "PromptPay / destination account (masked destination account)": "PromptPay / tài khoản nhận (tài khoản nhận đã che)",
  "Recipient": "Người nhận",
  "Recipient: {{user}}": "Người nhận: {{user}}",
  "Reference number": "Mã tham chiếu",
  "Ref: (transaction reference number)": "Mã: (mã tham chiếu giao dịch)",
  "Scan to verify receipt": "Quét để xác minh biên nhận",
  "SCB EASY": "SCB EASY",
  "SCB EASY • Transaction successful": "SCB EASY • Giao dịch thành công",
  "SCB • (masked source account)": "SCB • (tài khoản nguồn đã che)",
  "SCB: (masked source account)": "SCB: (tài khoản nguồn đã che)",
  "Sender": "Người gửi",
  "Sender: {{char}}": "Người gửi: {{char}}",
  "Sent to": "Đã gửi đến",
  "Sent to {{user}}": "Đã gửi đến {{user}}",
  "Service Charge (service charge rate)%": "Phí dịch vụ (tỷ lệ phí dịch vụ)%",
  "Siam Commercial Bank": "Siam Commercial Bank",
  "Source account: (masked source account)": "Tài khoản nguồn: (tài khoản nguồn đã che)",
  "Special Wine Pairing x(number of wine pairings)": "Set rượu vang đặc biệt x(số set rượu vang)",
  "Status: Complete & Cleared": "Trạng thái: Hoàn tất và đã xử lý",
  "Successful": "Thành công",
  "Successful transfer amount": "Số tiền chuyển thành công",
  "Table (table number) • (service date) (service time)": "Bàn (số bàn) • (ngày sử dụng) (giờ sử dụng)",
  "THB": "THB",
  "To": "Đến",
  "To recipient": "Đến người nhận",
  "(transaction date and time)": "(ngày giờ giao dịch)",
  "(transaction date) Time (transaction time)": "(ngày giao dịch) Giờ (giờ giao dịch)",
  "(transaction reference number)": "(mã tham chiếu giao dịch)",
  "Transaction reference: (transaction reference number)": "Mã tham chiếu giao dịch: (mã tham chiếu giao dịch)",
  "(transaction time)": "(giờ giao dịch)",
  "Transfer amount": "Số tiền chuyển",
  "(transfer amount)": "(số tiền chuyển)",
  "(transfer amount) THB": "(số tiền chuyển) THB",
  "Transfer complete": "Chuyển khoản hoàn tất",
  "Transferred amount": "Số tiền đã chuyển",
  "(transferred amount)": "(số tiền đã chuyển)",
  "(transferred amount) THB": "(số tiền đã chuyển) THB",
  "Transfer successful": "Chuyển khoản thành công",
  "Transfer to": "Chuyển đến",
  "TrueMoney": "TrueMoney",
  "TrueMoney • (sender's phone number)": "TrueMoney • (số điện thoại người gửi)",
  "TrueMoney • Transfer successful": "TrueMoney • Chuyển khoản thành công",
  "TrueMoney Wallet": "Ví TrueMoney",
  "Truffle Pasta x(number of pasta dishes)": "Mì Ý nấm truffle x(số phần mì Ý)",
  "UOB": "UOB",
  "UOB ONE Account": "Tài khoản UOB ONE",
  "UOB TMRW": "UOB TMRW",
  "{{user}}": "{{user}}",
  "Verifiable e-slip": "e-Slip có thể xác minh",
  "Verified on (transaction date) (transaction time)": "Đã xác minh lúc (ngày giao dịch) (giờ giao dịch)",
  "Verify receipt with QR": "Xác minh biên nhận bằng QR",
  "Wallet / PromptPay destination": "Ví / tài khoản PromptPay nhận tiền"
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

const batch = source.filter((item) => item.categoryId === "bank-transfers");
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
console.log(`Translated ${translated.length} /vi/ bank-transfer drafts from English.`);
