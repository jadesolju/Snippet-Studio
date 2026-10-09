# 🏛️ สถาปัตยกรรมและการทำงานของ Snippet Studio

**Snippet Studio** เป็นระบบคลังตัวอย่างและสร้างแม่แบบโค้ด (Code & Template Generator) สำหรับนำไปใช้กับ **Rubii Style Tags & Regex** บนแพลตฟอร์ม Rubii (รองรับทั้ง Web และ Mobile App บน iOS/Android)

---

## 1. ภาพรวมสถาปัตยกรรม (Architecture Overview)

ระบบถูกออกแบบเป็น **Client-Side Static Application** 100% ทำงานได้รวดเร็ว ปลอดภัย และ Deploy บน Vercel หรือ Static Host ได้ทันทีโดยไม่ต้องพึ่งพาเซิร์ฟเวอร์ Backend

```
┌─────────────────────────────────────────────────────────────┐
│                      Snippet Studio                         │
├─────────────────────────┬───────────────────────────────────┤
│    data/snippets.json   │  data/snippet-categories.json     │
│   (75 แม่แบบการ์ดพร้อมใช้) │  (9 หมวดหมู่หลักจัดกลุ่มตามการใช้งาน) │
└───────────┬─────────────┴─────────────────┬─────────────────┘
            │                               │
            ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Core Engine (app.js)                   │
├─────────────────────────────────────────────────────────────┤
│ 1. Catalog & Filter Engine   (Search / Categories / Order)  │
│ 2. Modular HTML Parts Engine (แยกชิ้นส่วนการ์ด / แก้ข้อความ) │
│ 3. Rubii Regex & Slot Engine (จับตัวแปร $1-$33 / Fallback)  │
│ 4. Two-Way Preview & Visual Edit (Iframe / PostMessage)    │
│ 5. Code & Config Generator   (สร้าง Output 6 รูปแบบพร้อมคัดลอก)│
└─────────────────────────────────────────────────────────────┘
```

---

## 2. โครงสร้างไฟล์และหน้าที่ (Project Structure)

| ไฟล์ / ไดเรกทอรี | หน้าที่การทำงาน |
| :--- | :--- |
| `index.html` | โครงสร้างหน้าเว็บหลัก แผงควบคุม คลังโค้ด และพื้นที่แสดงผลโค้ด/พรีวิว |
| `app.js` | สมองหลักของระบบ จัดการ State, แปลง Regex, ซิงค์สี, แยกชิ้นส่วน และพรีวิว |
| `styles.css` | ธีมดีไซน์ Jellyfish Cosmic (Dark Mode, Glassmorphism, Responsive) |
| `guide.html` | หน้าคู่มือการนำโค้ดไปติดตั้งและตั้งค่าบนแอป Rubii |
| `RUBII_CARD_GUIDELINES.md` | กฎและแนวทางการออกแบบ HTML/CSS ที่ปลอดภัยต่อการแสดงผลบน Rubii |
| `ARCHITECTURE.md` | เอกสารอธิบายการทำงานและสถาปัตยกรรมของระบบ (เอกสารนี้) |
| `data/snippets.json` | ฐานข้อมูลโค้ดการ์ดทั้งหมด (75 Snippets พร้อมโค้ด HTML มาตรฐาน) |
| `data/snippet-categories.json` | โครงสร้างหมวดหมู่ 9 หมวด พร้อมลำดับการแสดงผล |

---

## 3. กลไกการทำงานหลัก (Core Mechanisms)

### 3.1 ระบบแยกชิ้นส่วนโค้ดย่อย (Modular HTML Parts Engine)
- ฟังก์ชัน `splitHtmlIntoParts` จะสแกนแท็ก HTML ในการ์ด แล้วแยกกล่องย่อยภายใน (Direct Child Components) ออกมาเป็นการ์ดแยกชิ้น
- ให้ผู้ใช้สามารถดู, แก้ไขข้อความ/สีเฉพาะส่วน, หรือกด **"คัดลอกชิ้นนี้"** เพื่อนำเฉพาะส่วนที่ต้องการไปประกอบใหม่ได้
- ฟังก์ชัน `assembleRawHtml` จะประกอบชิ้นส่วนย่อยกลับมาเป็น HTML ก้อนเดียวที่มีความแม่นยำ 100%

### 3.2 ระบบตรวจจับตัวแปรและสร้าง Regex (Regex & Style Tag Engine)
- **Automatic Text Slot Detection (`rubiiTextSlots`):** สแกนข้อความไดนามิก เช่น `(วันที่)`, `(สถานที่)`, `{{char}}` และค่าเปอร์เซ็นต์
- **Percentage Variable Binding (`isRubiiPercentageSlot`):** เมื่อตรวจพบข้อความเปอร์เซ็นต์ (เช่น `85%`) ระบบจะแปลงเป็นตัวแปร `$N%` ใน Regex Replacement และผูกเข้ากับ Style ความกว้างของ Progress Bar (`style="width:$N%;max-width:100%;"`) อัตโนมัติ
- **On-Demand Fallback Delimiter Generator:** ผู้สร้างสามารถกดเลือกตัวคั่น (เช่น `|`, `,`, หรือขึ้นบรรทัดใหม่ `\n`) แล้วกด **"เพิ่มรูปแบบสำรอง"** เพื่อสร้างกฎ Regex ที่แชร์ Replacement เดียวกันได้ทันที

### 3.3 ระบบพรีวิวและแก้ไขแบบสองทาง (Two-Way Interactive Preview)
- พรีวิวถูกเรนเดอร์ผ่าน `<iframe>` พร้อม Isolated Sandbox ป้องกัน CSS ชนกับแอปหลัก
- เมื่อเปิด **Visual Edit Mode** ระบบจะเปิด `contenteditable` บนองค์ประกอบข้อความในพรีวิว
- การพิมพ์แก้ในพรีวิวจะส่งสัญญาณผ่าน `window.postMessage` กลับมาอัปเดต State, แผงโค้ด และการแยกชิ้นส่วนแบบ Realtime

---

## 4. มาตรฐานความเข้ากันได้ของการ์ด Rubii (Compatibility Standards)

จากการทดสอบจริงบนแอปมือถือและหน้าเว็บ Rubii ระบบได้กำหนดมาตรฐานดังนี้:

### 1. การแสดงผลรูปภาพและ GIF (Images & GIFs)
> [!IMPORTANT]
> **ใช้แท็ก `<img>` เสมอสำหรับรูปภาพและ GIF:**
> ```html
> <img src="https://media.giphy.com/.../giphy.gif" alt="คำอธิบาย" style="display:block;width:100%;object-fit:contain;">
> ```
> **เหตุผล:** ในแอปมือถือ Rubii การใช้แท็ก `<img>` มีความเสถียร 100% ทั้งบน iOS, Android และ Web ในขณะที่การใช้ CSS `background-image: url(...)` อาจถูก WebView ของแอปตัดทิ้งหรือไม่แสดงผล

### 2. เลย์เอาต์ Flexbox หลายคอลัมน์ (Multi-Column Flexbox Safety)
> [!TIP]
> เพื่อป้องกันปัญหา **Flex Column Collapse** (คอลัมน์ขวาโดนบีบเป็นเส้นแนวตั้งบนมือถือ):
> - **คอลัมน์ซ้าย (Fixed Basis):** กำหนดขนาดชัดเจน เช่น `width:100px; flex:0 0 100px; box-sizing:border-box;`
> - **คอลัมน์ขวา (Flexible with Zero Min-Width):** กำหนด `flex:1; min-width:0; box-sizing:border-box;`
> - **กล่องแม่:** กำหนด `display:flex; width:100%; box-sizing:border-box;`

### 3. ไอคอนและสัญลักษณ์ (Unicode Standard)
> [!NOTE]
> ใช้ **Universal UTF-8 Emojis** (เช่น `⏱️`, `📍`, `💬`, `✔`, `🔋`, `🚨`) แทน Apple SF Symbols (`PUA Glyphs`) เพื่อป้องกันการแสดงผลเป็นกล่องสี่เหลี่ยม `□` บน Android และ Windows

---

## 5. รูปแบบโค้ดผลลัพธ์ทั้ง 6 แบบ (6 Export Formats)

1. **HTML แม่แบบ (Style tag):** โค้ด HTML พร้อมแทรกตัวแปร `$1` สำหรับใส่ในแท็กสไตล์ของ Rubii
2. **HTML ต้นฉบับ:** โค้ด HTML สมบูรณ์แบบ Inline Style สำหรับนำไปปรับแต่งต่อ
3. **CSS ส่วนกลาง:** สไตล์ชีตที่แยกออกมาสำหรับใส่ใน Custom CSS
4. **Regex:** กฎ Pattern และ Replacement สำหรับแทนที่ข้อความอัตโนมัติ
5. **ข้อความทดสอบ (Output):** ตัวอย่างผลลัพธ์ข้อความสำหรับทดสอบการทำงาน
6. **ตั้งค่าตัวละคร · System Prompt:** คำสั่ง Prompt สำหรับสอนให้ AI ตอบกลับด้วยโครงสร้างแท็กที่ถูกต้อง

---

## 6. แนวทางการ Deploy

- **Production URL:** [https://snippet-studio-swart.vercel.app](https://snippet-studio-swart.vercel.app)
- **Deployment Platform:** Vercel (Static Web Application)
- **คำสั่ง Deploy:**
  ```bash
  git add .
  git commit -m "feat/fix: ..."
  git push origin main
  npx vercel --prod --yes
  ```
