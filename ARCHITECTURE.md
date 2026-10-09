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

ข้อแนะนำต่อไปนี้แยกสิ่งที่ตรวจจากโค้ด Studio ออกจากสิ่งที่เอกสาร Rubii ยืนยัน การพรีวิวใน Studio เป็น browser iframe จึงไม่ใช้ยืนยันผลบนแอปมือถือ

### 1. การแสดงผลรูปภาพและ GIF (Images & GIFs)
> [!TIP]
> ใช้แท็ก `<img>` สำหรับรูปภาพหรือ GIF ที่เป็นเนื้อหาของการ์ด:
> ```html
> <img src="https://media.giphy.com/.../giphy.gif" alt="คำอธิบาย" class="card-image">
> ```
> กำหนดขนาดผ่าน inline style หรือ Global CSS เช่น `.card-image{display:block;width:100%;height:auto}` ส่วน `background-image` เหมาะกับภาพตกแต่งพื้นหลังเมื่อ selector ตรงกับ element ที่แสดงผล

เอกสาร Rubii ระบุว่า Style Tags และ Global CSS ทำงานบนเว็บและแอป Rubii รุ่น 2.4.2 ขึ้นไป และแอปรองรับ HTML/CSS มากขึ้น แต่ยังแนะนำให้ตรวจบนเว็บและแอป จึงไม่มีหลักฐานให้รับรองว่า `<img>` หรือ CSS property ทุกตัวเสถียร 100%: [Rubii: Styles & regex](https://rubii.ai/blog/styles-and-regex)

การทดลองกับ `Cozy Room Shot` (`snippet-54`) ตรวจจากโค้ดสร้างจริงพบว่าแท็ก `<img>` คงอยู่ใน HTML template; ส่วนช่องพื้นหลังเพิ่ม `background-image` บน element รากและย้าย style ไปเป็น class rule `.rubii-snippet-54-01{…}` ในแท็บ CSS ส่วนกลาง พรีวิวใน Studio ใช้ browser iframe ผลนี้ยืนยันว่าตัวสร้างส่ง CSS ออกมา แต่ยังไม่ยืนยันว่า Rubii app รับหรือแสดงกฎดังกล่าวบนอุปกรณ์

ตัวดึง CSS ของ Studio อ่านเฉพาะ inline `style="…"` จาก HTML ที่สร้าง ไม่ได้ดาวน์โหลด stylesheet ภายนอก, `<link rel="stylesheet">`, `<style>` block หรือ computed style ของเว็บต้นทาง ถ้าการ์ดอาศัย class จากเว็บ ต้องเพิ่มกฎนั้นใน CSS เองและคง class ไว้ใน HTML template

ถ้า CSS ไม่ขึ้น ให้ตรวจว่าได้วาง CSS ใน Global CSS ของ Moment, class ใน selector ตรงกับ class บน root ของ HTML template, ใช้แอปรุ่นที่รองรับ และ URL รูปเปิดได้จากอุปกรณ์ CSS จากเว็บทั้งหน้า เช่น `body`, `:root` หรือ class เฉพาะเว็บไซต์ อาจไม่มี element เป้าหมายในหน้าข้อความของ Rubii จึงไม่ควรคัดลอกทั้ง stylesheet มาใช้โดยไม่ปรับ selector การแก้ CSS ในช่องโค้ดของ Studio จะเก็บเป็น manual override; พรีวิวอาจยังเห็นพื้นหลังที่แทรกใน HTML แต่ CSS ที่คัดลอกอาจไม่มี rule พื้นหลังนั้น

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

### บันทึกการตรวจ Marker และ Output

สำหรับ `Cozy Room Shot` ระบบตรวจ `{{user}}` เป็น Marker และสร้างตัวอย่าง `<cozy-room>คุณ</cozy-room>` ค่า Output นี้คือข้อความที่โมเดลส่งก่อน Rubii แทน HTML/CSS ไม่ใช่การ์ดผลลัพธ์เต็ม ข้อมูลอื่นจะปรากฏในการ์ดตามที่อยู่ในแม่แบบ หากต้องการให้วันที่หรือกิจกรรมเปลี่ยนทุกครั้ง ควรกำหนดเป็น Marker แยกและเลือก capture ให้ชัด แทนการปล่อยเป็นข้อความตัวอย่างคงที่

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
