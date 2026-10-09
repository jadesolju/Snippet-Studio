# คู่มือสถาปัตยกรรมและการทำงานฉบับสมบูรณ์ (Master Project & Engineering Study Guide)

**เอกสารสำหรับ:** ผู้พัฒนาและเจ้าของโครงการ (Internal Developer & Master Study Manual)  
**วัตถุประสงค์:** อธิบายกลไกการทำงานของโค้ดทุกส่วนในโปรเจกต์ Snippet Studio และสถาปัตยกรรมการเรนเดอร์การ์ดบน Rubii AI อย่างละเอียดทุกมิติ ตั้งแต่ระดับโครงสร้างไฟล์ไปจนถึงกลไกการประมวลผลภายใน  

---

## สารบัญภาพรวมระบบ

1. [แผนผังโครงสร้างโปรเจกต์และความรับผิดชอบของแต่ละไฟล์](#1-แผนผังโครงสร้างโปรเจกต์และความรับผิดชอบของแต่ละไฟล์)
2. [สถาปัตยกรรมระบบและวงจรการประมวลผลข้อมูล (System Architecture & Lifecycle)](#2-สถาปัตยกรรมระบบและวงจรการประมวลผลข้อมูล)
3. [กลไกที่ 1: ระบบวิเคราะห์ตัวแปรและตัดคำ (Field Collection & Slot Parser Engine)](#3-กลไกที่-1-ระบบวิเคราะห์ตัวแปรและตัดคำ)
4. [กลไกที่ 2: ระบบสร้าง Style Tag และ Regex Replacement Engine](#4-กลไกที่-2-ระบบสร้าง-style-tag-และ-regex-replacement-engine)
5. [กลไกที่ 3: ระบบคำนวณและผูกหลอดสถานะไดนามิก (Dynamic Progress Bar Engine)](#5-กลไกที่-3-ระบบคำนวณและผูกหลอดสถานะไดนามิก)
6. [กลไกที่ 4: สถาปัตยกรรม CSS พื้นหลังและการจัดวางภาพเต็มผืนผ้า (Clean CSS & Layout Engine)](#6-กลไกที่-4-สถาปัตยกรรม-css-พื้นหลังและการจัดวางภาพเต็มผืนผ้า)
7. [กลไกที่ 5: วิศวกรรมความคมชัดของข้อความด้วย Text Shadow (WCAG Contrast Engine)](#7-กลไกที่-5-วิศวกรรมความคมชัดของข้อความด้วย-text-shadow)
8. [กลไกที่ 6: ระบบจำแนกชนิดฟิลด์และสัญลักษณ์ไอคอน SVG (Semantic Icon Classifier)](#8-กลไกที่-6-ระบบจำแนกชนิดฟิลด์และสัญลักษณ์ไอคอน-svg)
9. [กลไกที่ 7: ระบบซิงก์ข้อมูลสองทางแบบเรียลไทม์ (Two-Way Visual Edit Sync via postMessage)](#9-กลไกที่-7-ระบบซิงก์ข้อมูลสองทางแบบเรียลไทม์)
10. [คู่มือการสร้างการ์ดใหม่ตั้งแต่เริ่มต้น (Step-by-Step Card Creation Playbook)](#10-คู่มือการสร้างการ์ดใหม่ตั้งแต่เริ่มต้น)
11. [แนวทางการเขียน System Prompt ให้ AI สร้าง Output ที่ถูกต้อง](#11-แนวทางการเขียน-system-prompt-ให้-ai-สร้าง-output-ที่ถูกต้อง)
12. [แผนผังการตรวจแก้จุดบกพร่อง (Troubleshooting & Debugging Flowchart)](#12-แผนผังการตรวจแก้จุดบกพร่อง)

---

## 1. แผนผังโครงสร้างโปรเจกต์และความรับผิดชอบของแต่ละไฟล์

```
Snippet Studio/
├── index.html                   (โครงสร้าง UI หลัก, แผงควบคุม, Device Frame, แท็บ Quick Edit)
├── styles.css                   (ธีม Dark Mode, ระบบ Glassmorphism, ระบบจัดวาง Responsive)
├── app.js                       (หัวใจหลักของแอป: ตัวประมวลผล Regex, ตัวตัดคำ, ตัวคำนวณสี, ตัวเชื่อมโยง DOM)
├── guide.html                   (คู่มือการใช้งานสำหรับผู้ใช้ทั่วไป)
├── data/
│   ├── snippets.json            (ฐานข้อมูลการ์ดทั้งหมด 75 รายการ พร้อมโค้ด HTML/CSS และ Slot ตัวอย่าง)
│   └── snippet-categories.json  (โครงสร้างหมวดหมู่การ์ด 7 หมวด)
└── RUBII_CODE_STUDY_AND_ARCHITECTURE_RESEARCH.md (คู่มือศึกษาการทำงานฉบับนี้)
```

### หน้าที่ของไฟล์หลักในระบบ
- **`app.js` (Engine Core):** ทำหน้าที่สแกนโค้ด HTML/CSS สกัดตัวแปร จัดหมวดหมู่ฟิลด์ คำนวณความโปร่งใสของสี (RGBA/Hex) ประกอบ Regex สร้าง Output ที่ตรงตามมาตรฐาน Rubii และควบคุม Iframe Preview
- **`data/snippets.json` (Single Source of Truth):** บรรจุแม่แบบการ์ดทั้งหมด โดยโครงสร้าง HTML แต่ละตัวจะถูกออกแบบให้อยู่ใน Root `<div>` ตัวเดียว และใช้ Inline Styles เพื่อให้ง่ายต่อการ Compile เป็น Style Tag หรือ Regex
- **`index.html` & `styles.css` (Presentation Layer):** แสดงผล Workspace 2 ฝั่ง (ฝั่งซ้าย: Preview & Quick Edit, ฝั่งขวา: Code Output Panel) รองรับการแสดงผลทุกขนาดหน้าจอ

---

## 2. สถาปัตยกรรมระบบและวงจรการประมวลผลข้อมูล

```mermaid
flowchart TD
    subgraph Data["1. Data Ingestion & State Init"]
        D1["data/snippets.json"] --> D2["fetch & sort ตาม categoryId"]
        D2 --> D3["State Stores: editValuesBySnippet, backgroundBySnippet, rubiiSettingsBySnippet"]
    end

    subgraph ParserEngine["2. Parsing & Field Extraction"]
        D3 --> P1["collectFields(): ดึง {{token}}, CSS Colors, (Markers), URLs"]
        P1 --> P2["rubiiTextSlots(): ตัด Slot ตัวแปร $1 ถึง $33 พร้อมให้คะแนนความสำคัญ"]
        P2 --> P3["isRubiiPercentageSlot(): ค้นหาและจับคู่หลอดสถานะเปอร์เซ็นต์"]
    end

    subgraph Compiler["3. Output Generation Layer"]
        P3 --> C1["buildRubiiSections(): สร้าง Style Tag Code และ Regex Pattern"]
        P3 --> C2["htmlWithBackground(): ฉีด CSS พื้นหลัง + Text Shadow"]
    end

    subgraph Render["4. Live View & Synchronization"]
        C1 --> R1["Code Panel Display: Template, HTML, CSS, Regex, Markdown"]
        C2 --> R2["Preview Frame (Iframe): เรนเดอร์การ์ดจำลองบนหน้าจอมือถือ"]
        R2 <-->|"postMessage (Two-Way Sync)"| R3["Direct Visual Edit Mode"]
    end
```

---

## 3. กลไกที่ 1: ระบบวิเคราะห์ตัวแปรและตัดคำ

ฟังก์ชัน `collectFields(snippet)` และ `rubiiTextSlots(source)` ใน `app.js` ทำหน้าที่สแกนโค้ด HTML/CSS เพื่อค้นหาว่าจุดใดคือค่าที่ผู้ใช้หรือ AI สามารถปรับเปลี่ยนได้

### ลำดับขั้นตอนการทำงานของ Parser
1. **ตรวจหา System Macros:** ค้นหา `{{char}}`, `{{user}}`, `{{color}}`, `{{location}}`
2. **ตรวจหา CSS Properties:** ค้นหาค่าสีใน `style="..."` เช่น `rgba(...)`, `rgb(...)`, `#hex` และจำแนกประเภท (Main BG, Box BG, Card Border, Divider, Shadow, Text Color)
3. **ตรวจหา Text Markers:** สแกนข้อความในวงเล็บ `(...)` เช่น `(50,000.00)`, `(06 ต.ค. 2569)`
   - **ระบบ Static Blacklist:** กรองคำคงที่ออกอัตโนมัติ ได้แก่ `THB`, `TH`, `USD`, `GBP`, `EUR`, `ผู้โอน`, `ผู้รับ`, `Wallet`, `PromptPay`
4. **ตรวจหา Suggested Variables:** สแกนหาคำที่น่าจะเปลี่ยน เช่น เวลา (`21:45`), ยอดเงิน, ข้อความยาว เพื่อติดป้าย "ตรวจดู" ให้ผู้ใช้เลือกเอง

### อัลกอริทึมการให้คะแนนความสำคัญของ Slot (Slot Scoring Algorithm)
ใน `rubiiTextSlots` ระบบจะคำนวณคะแนน (`score`) เพื่อเลือกค่าที่ดีที่สุดเป็น `$1` ของ Style Tag:
- มีคำว่า `สถานการณ์`, `ข้อความ`, `โพสต์`, `caption`, `message` $\rightarrow$ $+12$ คะแนน
- มีคำว่า `จำนวนเงิน`, `ยอดโอน`, `ยอดเงิน`, `ราคา` $\rightarrow$ $+8$ คะแนน
- เป็นช่องเปอร์เซ็นต์ `(\d+%)` $\rightarrow$ $+8$ คะแนน
- เป็น Marker ที่ระบุชัด $\rightarrow$ $+5$ คะแนน
- มีคำว่า `สถานที่`, `วันที่`, `เวลา`, `{{char}}` $\rightarrow$ $-3$ คะแนน (เพราะมักเป็นข้อมูลรอง)

---

## 4. กลไกที่ 2: ระบบสร้าง Style Tag และ Regex Replacement Engine

```mermaid
flowchart LR
    subgraph InputPayload["AI Response Payload"]
        IP["&lt;kbank-slip&gt;50,000.00||xxx-x-x8841-x||202610068841KB||06 ต.ค. 2569 • 20:39 น.&lt;/kbank-slip&gt;"]
    end

    subgraph RegexEngine["Regex Pattern Matching"]
        RP["/&lt;kbank-slip&gt;([\\s\\S]*?)\\|\\|([\\s\\S]*?)\\|\\|([\\s\\S]*?)\\|\\|([\\s\\S]*?)&lt;\\/kbank-slip&gt;/g"]
    end

    subgraph Slots["Capture Group Mapping"]
        S1["$1 = 50,000.00 (ยอดเงิน)"]
        S2["$2 = xxx-x-x8841-x (เลขบัญชี)"]
        S3["$3 = 202610068841KB (เลขอ้างอิง)"]
        S4["$4 = 06 ต.ค. 2569 • 20:39 น. (เวลา)"]
    end

    subgraph RenderedCard["Final HTML Card in Chat"]
        RC["&lt;div class='rubii-kbank-01'&gt;ยอดเงิน: 50,000.00 บาท ...&lt;/div&gt;"]
    end

    IP --> RP
    RP --> S1 & S2 & S3 & S4
    S1 & S2 & S3 & S4 --> RenderedCard
```

### การสร้าง Output สำหรับ 2 โหมด
1. **โหมด Style Tag:**
   - รวม CSS ทั้งหมดไว้ในแท็ก `<style>`
   - แทนที่ข้อความหลักเพียงจุดเดียวด้วย `$1`
   - ผลลัพธ์: AI ส่งเพียง `<tag>ข้อความ</tag>` ก็เปลี่ยนการ์ดได้ทันที
2. **โหมด Regex Replacement:**
   - ใช้ฟังก์ชัน `buildRegexPattern(tagName, chosenSlots, format)` สร้าง Regex
   - รองรับตัวคั่นหลายรูปแบบ:
     - `doublePipe` (ค่าเริ่มต้น): `\|\|`
     - `pipe`: `\|(?!\球)`
     - `comma`: `\s*,\s*`
     - `newline`: `\r?\n`
   - แทนค่า `$1` ถึง `$33` ลงในตำแหน่งที่ถูกต้องใน HTML Template

---

## 5. กลไกที่ 3: ระบบคำนวณและผูกหลอดสถานะไดนามิก

ฟังก์ชัน `buildRubiiTemplate(snippet, chosenSlots)` มีกลไกพิเศษในการตรวจจับและผูกหลอดสถานะเข้ากับค่าเปอร์เซ็นต์:

```mermaid
flowchart TD
    A["สแกนพบ Slot เปอร์เซ็นต์ เช่น 85%"] --> B["ค้นหา Container แม่ที่ใกล้ที่สุด textNode.closest('div')"]
    B --> C["ค้นหา Element ภายในที่มี style='width: ...%'"]
    C --> D{"ตรวจสอบค่าความกว้าง"}
    D -->|"พบค่าความกว้างที่ตรงกัน หรือไม่ใช่ 100%"| E["ผูก Bar Element เข้ากับตัวแปร $X%"]
    E --> F["ลบ width เดิมออกจาก CSS Rules ของคลาส"]
    F --> G["ใส่ style='width: $X%; max-width: 100%;' กลับเข้าไปใน HTML Element"]
```

### กฎสำคัญของการสร้างหลอดสถานะ
- **ห้ามใส่ `width: MAX%;`:** ให้ใช้ `width: 100%;` แทน เพราะคำว่า `MAX` ทำให้เบราว์เซอร์เกิด Syntax Error และหลอดจะหดเหลือ 0%
- **ใส่ `max-width: 100%;` เสมอ:** ป้องกันไม่ให้หลอดล้นทะลุการ์ดเมื่อ AI ส่งค่าเกิน 100%
- **ใส่ `overflow: hidden;` และ `border-radius: 99px;`:** ที่กล่องด้านนอก เพื่อให้ปลายหลอดโค้งมนสวยงามตามกรอบ

---

## 6. กลไกที่ 4: สถาปัตยกรรม CSS พื้นหลังและการจัดวางภาพเต็มผืนผ้า

### 6.1 Clean CSS Standard สำหรับพื้นหลัง
เพื่อป้องกันปัญหา Shorthand Reset และเลเยอร์ Gradient บดบังภาพบน Mobile WebView ให้ใช้คุณสมบัติแยกเฉพาะ:

```css
background-image: url('https://media.giphy.com/sample.gif');
background-size: cover;
background-position: center;
background-repeat: no-repeat;
```

### 6.2 มาตรฐาน Full-Bleed Landscape สำหรับแบนเนอร์ภาพ
ภาพแบนเนอร์ด้านบนของการ์ดต้องแผ่เต็มผืนผ้า 100% ไม่ให้เกิดขอบดำด้านข้าง (Letterbox Void):

```css
/* ถูกต้อง: ภาพแผ่เต็มกรอบ Edge-to-Edge */
width: 100%;
height: 100%;
object-fit: cover;
object-position: center;
display: block;
```

---

## 7. กลไกที่ 5: วิศวกรรมความคมชัดของข้อความด้วย Text Shadow

เมื่อเปิดใช้งานรูปพื้นหลัง ฟังก์ชัน `htmlWithBackground(snippet, html)` จะฉีด CSS Text Shadow เข้าไปที่ Root Tag เพื่อยกระดับความคมชัดของตัวหนังสือสีขาว:

```mermaid
flowchart TD
    subgraph StackingContext["CSS Stacking Context"]
        L1["เลเยอร์ 1: Background Image / GIF"]
        L2["เลเยอร์ 2: Glass Backdrop Filter (blur 20px - 32px)"]
        L3["เลเยอร์ 3: Card Container (rgba background + border)"]
        L4["เลเยอร์ 4: Text Shadow Offset Buffer"]
        L5["เลเยอร์ 5: Foreground Text (color: #ffffff)"]
    end

    L1 --> L2 --> L3 --> L4 --> L5
    L4 -.->|"เพิ่ม Contrast Ratio จาก 1.2:1 เป็น 6.8:1 (WCAG AAA)"| L5
```

### พรีเซ็ตเงาข้อความ 4 รูปแบบ
1. **None:** `text-shadow: none;` (Contrast 1.2:1) - เหมาะกับพื้นหลังมืดสนิท
2. **Soft Dark (แนะนำ):** `text-shadow: 0 1px 3px rgba(0,0,0,0.85), 0 0 1px rgba(0,0,0,0.9);` (Contrast 6.8:1) - เงามืดนุ่มนวลเป็นธรรมชาติ
3. **Sharp Outline:** `text-shadow: -1px -1px 0 rgba(0,0,0,0.9), 1px -1px 0 rgba(0,0,0,0.9), -1px 1px 0 rgba(0,0,0,0.9), 1px 1px 0 rgba(0,0,0,0.9);` (Contrast 11.5:1) - เส้นขอบคมชัดสไตล์การ์ตูน/HUD
4. **Neon Glow:** `text-shadow: 0 0 8px rgba(0,255,255,0.9), 0 0 16px rgba(0,190,230,0.6), 0 1px 2px rgba(0,0,0,0.9);` (Contrast 8.2:1) - เรืองแสงนีออนสไตล์ Cyberpunk

---

## 8. กลไกที่ 6: ระบบจำแนกชนิดฟิลด์และสัญลักษณ์ไอคอน SVG

ในแผง Quick Edit ฟังก์ชัน `getFieldSvgIcon(type)` จะกำหนดสัญลักษณ์ไอคอนและสี Accent เพื่อให้ผู้ใช้แยกแยะประเภทฟิลด์ได้ทันที:

```mermaid
flowchart LR
    CSS["CSS Declaration ใน style=''"] --> Prop{"ตรวจสอบชื่อ Property"}
    Prop -->|"color"| T["Icon: Typography 'T' (ม่วง #cc5de8)"]
    Prop -->|"background*"| BG["Icon: Card Fill (เขียว #51cf66)"]
    Prop -->|"border*"| BD["Icon: Frame Stroke (ฟ้า #339af0)"]
    Prop -->|"border-top / border-left"| LN["Icon: Divider Line (ฟ้าสว่าง #22b8cf)"]
    Prop -->|"*shadow*"| SH["Icon: Drop Shadow (ส้ม #ff922b)"]
    Prop -->|"url() / src=''"| MD["Icon: Photo Frame (ชมพู #ff6b6b)"]
```

---

## 9. กลไกที่ 7: ระบบซิงก์ข้อมูลสองทางแบบเรียลไทม์

ระบบ Direct Visual Edit รองรับการพิมพ์แก้ไขข้อความบนการ์ดใน Iframe พรีวิวโดยตรง และซิงก์กลับมายังแผง Quick Edit และโค้ด Output ทันที:

```mermaid
sequenceDiagram
    autonumber
    actor User as ผู้ใช้งาน (User)
    participant Preview as Iframe Preview (contenteditable)
    participant App as app.js (Main Window)
    participant QuickEdit as แผง Quick Edit UI
    participant CodePanel as แผง Code Output

    User->>Preview: พิมพ์แก้ไขข้อความบนตัวการ์ดโดยตรง
    Preview->>App: window.parent.postMessage({ type: 'PREVIEW_DIRECT_TEXT_INPUT', newText, html })
    App->>App: ปรับปรุงค่าใน editValuesBySnippet Map
    App->>QuickEdit: อัปเดตค่าใน input value และ color badge
    App->>CodePanel: สร้างและอัปเดตโค้ด Template/Regex ใหม่ทันที
    App->>App: บันทึกสถานะเพื่อคงอยู่แม้สลับไปดูการ์ดอื่น
```

---

## 10. คู่มือการสร้างการ์ดใหม่ตั้งแต่เริ่มต้น

### ขั้นตอนที่ 1: โครงสร้าง HTML เริ่มต้น
สร้าง Root Tag `<div>` เพียงตัวเดียว และใส่ Inline Styles:

```html
<div style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); border: 1.5px solid rgba(255, 255, 255, 0.35); border-radius: 28px; padding: 20px; max-width: 420px; margin: 12px auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff; box-sizing: border-box;">
  <!-- ส่วนหัวการ์ด -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
    <span style="font-size: 14px; font-weight: bold;">(หัวข้อการ์ด)</span>
    <span style="font-size: 12px; opacity: 0.7;">(วันที่ • เวลา)</span>
  </div>

  <!-- ข้อความเนื้อหาหลัก -->
  <div style="background: rgba(0, 0, 0, 0.25); border-radius: 16px; padding: 14px; border: 1px solid rgba(255, 255, 255, 0.15); margin-bottom: 12px; font-size: 13.5px; line-height: 1.6;">
    (ข้อความหลักที่ต้องการให้ AI ตอบกลับ)
  </div>

  <!-- หลอดสถานะไดนามิก -->
  <div style="background: rgba(255, 255, 255, 0.15); border-radius: 99px; height: 8px; width: 100%; overflow: hidden;">
    <div style="background: linear-gradient(90deg, #339af0, #51cf66); height: 100%; width: (85%); max-width: 100%; border-radius: 99px;"></div>
  </div>
</div>
```

### ขั้นตอนที่ 2: กฎการตั้งชื่อ Slot
- ใช้วงเล็บ `(...)` ครอบเฉพาะข้อความที่ต้องการให้เปลี่ยนค่า เช่น `(ยอดเงิน: 50,000.00)`
- คำคงที่ห้ามใส่วงเล็บ เช่น เขียน `บาท (THB)` ให้แก้เป็น `บาท THB`
- ตัวละครให้เขียน `{{char}} (ข้อความ)` เพื่อไม่ให้ Macro ถูกกลืน

---

## 11. แนวทางการเขียน System Prompt ให้ AI สร้าง Output ที่ถูกต้อง

เพื่อให้โมเดล AI ตอบกลับข้อมูลในรูปแบบ Tag หรือ Regex ที่การ์ดรองรับ ให้ระบุคำสั่งใน System Prompt ของตัวละครดังนี้:

### ตัวอย่าง Prompt สำหรับโหมด Style Tag
```
เมื่อต้องการแสดงสเตตัส ให้ส่งข้อความในรูปแบบแท็กต่อไปนี้เสมอ:
<my-status>[ข้อความสเตตัสของคุณ]</my-status>
ตัวอย่าง: <my-status>วันนี้ไปเดินเล่นที่สวนสาธารณะมา อากาศดีมากๆ เลย</my-status>
```

### ตัวอย่าง Prompt สำหรับโหมด Regex (สลิปธนาคาร)
```
เมื่อมีการโอนเงินหรือทำธุรกรรม ให้ส่งข้อมูลในรูปแบบแท็กต่อไปนี้เสมอ (คั่นข้อมูลแต่ละช่องด้วย ||):
<kbank-slip>[ยอดเงิน]||[เลขบัญชี]||[เลขอ้างอิง]||[วันและเวลา]</kbank-slip>
ตัวอย่าง: <kbank-slip>50,000.00||xxx-x-x8841-x||202610068841KB||06 ต.ค. 2569 • 20:39 น.</kbank-slip>
ข้อกำหนด: ห้ามเว้นช่องว่าง ห้ามใส่สกุลเงินคำว่าบาท และห้ามใส่เครื่องหมายอื่นนอกเหนือจากตัวคั่น ||
```

---

## 12. แผนผังการตรวจแก้จุดบกพร่อง

```mermaid
flowchart TD
    Start["เกิดปัญหาในการแสดงผลการ์ด"] --> Q1{"ปัญหาที่พบคืออะไร?"}

    Q1 -->|"1. ข้อความใน AI Output ไม่ลงในช่องการ์ด"| D1["ตรวจสอบตัวคั่น || ว่าตรงกับที่ Regex กำหนดหรือไม่ และตรวจว่าแท็กเปิด-ปิด <tag>...</tag> สะกดตรงกันหรือไม่"]
    Q1 -->|"2. หลอดสถานะหดเหลือ 0% หรือไม่ขยับ"| D2["ตรวจดูโค้ดว่ามีคำว่า width: MAX% หรือไม่ ให้เปลี่ยนเป็น width: 100% และตรวจว่าค่าที่ AI ส่งมามีเฉพาะตัวเลขหรือไม่"]
    Q1 -->|"3. รูปภาพแบนเนอร์มีขอบดำสองข้าง"| D3["เปลี่ยน CSS ของแท็ก img จาก object-fit: contain เป็น object-fit: cover; width: 100%; height: 100%;"]
    Q1 -->|"4. ตัวหนังสือกลืนกับรูปพื้นหลัง อ่านไม่ออก"| D4["เปิดใช้งานตัวเลือก Text Shadow ในโหมด Soft Dark หรือ Sharp Outline เพื่อเพิ่ม Contrast Ratio เป็น 6.8:1"]
    Q1 -->|"5. ตัวแปร {{char}} กลายเป็นคำว่า Mira ในเลขบัญชี"| D5["ตรวจดูเทมเพลตว่ามีวงเล็บครอบ {{char}} หรือไม่ ให้แยก {{char}} ออกมาอยู่นอกวงเล็บ เช่น {{char}} (เลขบัญชี: xxx)"]
```

---
*เอกสารฉบับนี้เป็นคู่มืออ้างอิงเชิงวิศวกรรมระดับสมบูรณ์สำหรับสถาปัตยกรรม Snippet Studio และแพลตฟอร์ม Rubii AI*
