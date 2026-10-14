# โครงสร้าง Layout ซ้าย–ขวาสำหรับการ์ดแชต Rubii

วันที่ปรับ: 2026-10-12  
ขอบเขต: การ์ดแชตใน `data/snippets.json` และแนวทางทำ Preview บนโทรศัพท์

## ผลที่ยืนยันจาก Preview

ผู้ใช้ยืนยันว่า Preview บนโทรศัพท์ผ่าน เมื่อแต่ละ bubble อยู่ในแถวเต็มความกว้างที่ระบุ `flex-direction:row` และใช้ `justify-content:flex-start` หรือ `flex-end` แยกตำแหน่งซ้าย/ขวา รูปตัวอย่างแสดงข้อความแรกทางซ้ายและข้อความตอบกลับทางขวา

## โครงสร้างที่ใช้

```html
<div style="display:flex;flex-direction:row;justify-content:flex-end;align-items:flex-start;width:100%;box-sizing:border-box">
  <div style="max-width:82%;box-sizing:border-box;padding:12px;border-radius:18px">
    ข้อความใน bubble
  </div>
</div>
```

- เปลี่ยนเป็น `justify-content:flex-start` สำหรับ bubble ฝั่งซ้าย
- แถวครอบต้องเต็มความกว้างและกำหนด `flex-direction:row` อย่างชัดเจน
- คงขนาด bubble ด้วย `max-width` และ `box-sizing:border-box`
- ถ้ามี avatar กับ bubble ในแถวเดียวกัน ให้กำหนดแถวด้านในเป็น `display:flex;flex-direction:row` ด้วย
- หลีกเลี่ยงการใช้ `align-self` บน bubble เพื่อกำหนดซ้าย/ขวา

## การ์ดที่ปรับโครงสร้าง

| ID | ชื่อ | จำนวน bubble rows | รายละเอียด |
| --- | --- | ---: | --- |
| `snippet-09` | LINE Chat | 2 | ข้อความแรกซ้าย ข้อความล่าสุดขวา |
| `snippet-10` | Instagram Direct Message | 2 | ข้อความรับซ้าย ข้อความส่งขวา |
| `snippet-11` | Messenger Chat | 2 | แถวรับพร้อม avatar ซ้าย; ข้อความตอบขวา |
| `snippet-23` | ChatGPT Conversation | 3 | คำถามขวา คำแนะนำซ้าย ข้อความตอบขวา |
| `snippet-24` | Gemini Conversation | 3 | คำถามขวา คำแนะนำซ้าย ข้อความตอบขวา |
| `snippet-25` | Grok Conversation | 3 | คำถามขวา คำแนะนำซ้าย ข้อความตอบขวา |

## การตรวจหลังปรับ

- เพิ่มแถวครอบให้ครบ 15 bubble rows ใน 6 การ์ด
- ตรวจโครงสร้าง `<div>` เปิด/ปิดครบทุกใบ
- ตรวจข้อความ มาร์กเกอร์ในวงเล็บ และ `{{user}}` / `{{char}}` ก่อนและหลัง: ไม่มีการเปลี่ยนแปลง
- เอา `align-self` ที่เคยใช้จัดตำแหน่งแนวนอนออกจาก bubble โดยใช้ `justify-content` ของแถวครอบแทน
- Messenger ระบุ `flex-direction:row` ให้แถว avatar กับข้อความอย่างชัดเจน
- การตรวจ source ยืนยันโครงสร้างและเนื้อหา ไม่ได้เรนเดอร์การ์ดทั้ง 6 ใบใน Rubii ทีละใบ; รูปจากผู้ใช้ยืนยัน Preview ของรูปแบบแถวครอบตัวอย่าง

## แยกชั้น Layout

การ์ดแชตจำลองสร้าง bubble ภายใน HTML หนึ่งการ์ด จึงเปลี่ยนได้เฉพาะตำแหน่ง bubble ภายในนั้น ส่วนตำแหน่งข้อความ Rubii ชั้นนอกยังขึ้นกับผู้ส่งและหน้าจอแชต ใช้ Global CSS role selectors ตามเอกสาร Rubii เมื่อปรับข้อความจริง ไม่ใช้ `{{user}}`, `{{char}}` หรือ CSS ภายใน snippet ไปกำหนดด้านของข้อความชั้นนอก

## อ้างอิง

- [Rubii: Styles & Regex](https://rubii.ai/blog/styles-and-regex) — Global CSS role selectors และข้อควรตรวจระหว่าง Web กับ APP
