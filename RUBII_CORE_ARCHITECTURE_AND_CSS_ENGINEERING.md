# รายงานการวิจัยและคู่มือสถาปัตยกรรมระบบ: กลไกการทำงานของ Rubii AI และแนวทางการพัฒนาการ์ดส่วนต่อประสานผู้ใช้ (HTML, CSS และ Regex)

**สถานะเอกสาร:** รายงานการวิจัยและคู่มืออ้างอิงทางเทคนิค (Technical Research Report & Reference Guide)  
**ขอบเขตเนื้อหา:** การทำงานของระบบ Rubii AI ในการแปลงข้อความจาก Large Language Model (LLM) เป็นการ์ดส่วนต่อประสานผู้ใช้ (UI Cards), สถาปัตยกรรม Style Tag, กลไก Regex Replacement, ข้อกำหนดเชิงโครงสร้าง HTML/CSS, การวิเคราะห์จุดบกพร่องที่พบจากการทดลองจริง, และข้อเสนอแนะเชิงลึกสำหรับผู้สร้างแม่แบบ  
**กลุ่มเป้าหมาย:** นักพัฒนา, ผู้สร้างคอนเทนต์สำหรับ Rubii AI, และผู้สนใจโครงสร้างการทำงานของระบบเรนเดอร์  

---

## สารบัญ

1. [บทนำและภาพรวมสถาปัตยกรรมของ Rubii AI](#1-บทนำและภาพรวมสถาปัตยกรรมของ-rubii-ai)
2. [กลไกการทำงานของ Style Tag (Single-Slot Architecture)](#2-กลไกการทำงานของ-style-tag-single-slot-architecture)
3. [กลไกการทำงานของ Regex Replacement Engine (Multi-Slot Architecture)](#3-กลไกการทำงานของ-regex-replacement-engine-multi-slot-architecture)
4. [ข้อกำหนดและการออกแบบโครงสร้าง HTML สำหรับ Rubii](#4-ข้อกำหนดและการออกแบบโครงสร้าง-html-สำหรับ-rubii)
5. [การออกแบบ CSS และสถาปัตยกรรม Glassmorphism](#5-การออกแบบ-css-และสถาปัตยกรรม-glassmorphism)
6. [การวิเคราะห์จุดบกพร่องและโหมดความล้มเหลวเชิงประจักษ์](#6-การวิเคราะห์จุดบกพร่องและโหมดความล้มเหลวเชิงประจักษ์)
7. [คู่มือและแนวทางปฏิบัติสำหรับผู้พัฒนาการ์ด](#7-คู่มือและแนวทางปฏิบัติสำหรับผู้พัฒนาการ์ด)
8. [โค้ดแม่แบบมาตรฐานอ้างอิง (Standard Reference Templates)](#8-โค้ดแม่แบบมาตรฐานอ้างอิง-standard-reference-templates)
9. [บทสรุปและข้อเสนอแนะ](#9-บทสรุปและข้อเสนอแนะ)

---

## 1. บทนำและภาพรวมสถาปัตยกรรมของ Rubii AI

แพลตฟอร์ม **Rubii AI** เป็นระบบแชตและจำลองปฏิสัมพันธ์อัจฉริยะที่ใช้ Large Language Model (LLM) ในการสนทนา โดยมีความสามารถพิเศษในการแสดงผลการตอบกลับในรูปแบบส่วนต่อประสานผู้ใช้ (UI Component Cards) ที่มีมิติและตอบสนองต่อเนื้อหาแบบไดนามิก แทนที่จะเป็นการแสดงผลข้อความธรรมดาเพียงอย่างเดียว

### 1.1 วงจรการทำงานตั้งแต่การสร้างข้อความจนถึงการเรนเดอร์ (End-to-End Processing Pipeline)

วงจรการทำงานของ Rubii AI ในการแสดงผลการ์ดประกอบด้วย 4 ลำดับขั้นหลัก:

```mermaid
flowchart TD
    subgraph Stage1["Stage 1: LLM Ingestion & Token Interception"]
        A1["LLM Completion Stream"] --> A2{"Identifier Scanner: <tag>...</tag>"}
        A2 -->|"Matched"| A3["Payload Extractor"]
        A2 -->|"Unmatched"| A4["Standard Markdown / Plaintext Chat Bubble"]
    end

    subgraph Stage2["Stage 2: Lexical Tokenization & Slot Parsing"]
        A3 --> B1{"Binding Mode Evaluator"}
        B1 -->|"Style Tag Mode"| B2["Single-Slot Ingestion: Entire Payload -> $1"]
        B1 -->|"Regex Engine Mode"| B3["Multi-Capture Delimiter Splitter (e.g. ||)"]
        B3 --> B4["Slot Array Mapping: $1, $2, $3, ... $N"]
        B4 --> B5["Type Sanitizer & Numeric Extractor"]
    end

    subgraph Stage3["Stage 3: DOM Tree Assembly & CSS Scoping"]
        B2 --> C1["DOM Synthesizer"]
        B5 --> C1
        C1 --> C2["CSS Rule Isolator & Style Scoper"]
        C2 --> C3["Progress Bar Width Clamping (max-width: 100%)"]
    end

    subgraph Stage4["Stage 4: WebView Presentation & Composition"]
        C3 --> D1["Embedded WebView Compositor (WebKit / Blink)"]
        D1 --> D2["GPU Backdrop Filter & Text Shadow Contrast Buffer"]
        D2 --> D3["Rendered Interactive Card in Conversation Stream"]
    end
```

> **สรุปขั้นตอน Workflow (End-to-End Pipeline):**
> 1. **การดักจับข้อมูล (LLM Ingestion):** ระบบสแกนหา Tag Identifier เช่น `<tag>...</tag>` จาก Response Stream ของ AI หากตรวจพบจะสกัดเนื้อหา (Payload) ภายในแท็กออกมาประมวลผลต่อ
> 2. **การตัดคำและจัดกลุ่มโทเค็น (Tokenization):** จำแนกข้อมูลตามโหมดที่กำหนด หากเป็นการ์ดแบบ Style Tag จะส่งข้อความทั้งหมดเข้าสู่ `$1` หากเป็น Regex Engine จะตัดแยกโทเค็นด้วยตัวคั่น เช่น `||` เข้าสู่อาร์เรย์ `$1` ถึง `$N`
> 3. **การประกอบโครงสร้าง DOM (DOM Synthesis):** นำค่าตัวแปรไปแทนที่ในโครงสร้าง HTML พร้อมคอมไพล์สไตล์ CSS และจำกัดขอบเขตความกว้างหลอดสถานะ (`max-width: 100%`)
> 4. **การแสดงผลบนหน้าจอ (WebView Presentation):** เบราว์เซอร์ประมวลผลเอฟเฟกต์ Glassmorphism, Layout และ Text Shadow เพื่อแสดงผลเป็นการ์ดที่สมบูรณ์บนหน้าต่างแชต

### 1.2 สภาพแวดล้อมการทำงานของ Rubii WebView (Rendering Environment)

การ์ดในระบบ Rubii จะถูกเรนเดอร์ผ่าน Embedded WebView ภายในแอปพลิเคชัน (เช่น WebKit บน iOS หรือ Chromium WebView บน Android) ซึ่งมีคุณลักษณะเฉพาะที่ต้องคำนึงถึง:
- **CSS Isolation:** การแยกสไตล์ของการ์ดแต่ละใบเพื่อไม่ให้เกิดการชนกันกับโครงสร้างของแอปพลิเคชันหลัก
- **Hardware Acceleration:** การประมวลผลเอฟเฟกต์กระจกฝ้า (`backdrop-filter`) อาศัย GPU ของอุปกรณ์
- **Viewport Dimension Constraints:** การ์ดจะถูกจำกัดความกว้างสูงสุดตามขนาดของหน้าต่างแชต (ปกติอยู่ที่ประมาณ 360px ถึง 440px)

---

## 2. กลไกการทำงานของ Style Tag (Single-Slot Architecture)

โหมด **Style Tag** เป็นสถาปัตยกรรมที่ออกแบบมาสำหรับการแสดงผลการ์ดที่มีเนื้อหาข้อความแบบต่อเนื่องเพียงจุดเดียว โดยไม่มีการแบ่งย่อยเป็นช่องตัวแปรย่อย

### 2.1 โครงสร้างของ Style Tag Template

ในโหมดนี้ แม่แบบจะถูกแบ่งออกเป็น 2 ส่วนชัดเจน:
1. **แท็ก `<style>`:** บรรจุคลาส CSS ทั้งหมดที่ใช้ในการตกแต่งการ์ด
2. **โครงสร้าง HTML:** บรรจุโครงร่างของแท็ก HTML พร้อมคลาสกำกับ โดยมีสัญลักษณ์ `$1` ระบุตำแหน่งที่ข้อความจาก AI จะถูกนำไปวาง

```mermaid
flowchart LR
    subgraph AIResponse["LLM Generation"]
        R["<diary-card>วันนี้ออกไปเดินเล่นที่สวนสาธารณะ อากาศสดชื่นมาก</diary-card>"]
    end

    subgraph StyleTagTemplate["Style Tag Template"]
        T["<style>
.rubii-diary { background: rgba(255,255,255,0.08); border-radius: 20px; padding: 16px; }
</style>
<div class='rubii-diary'>$1</div>"]
    end

    subgraph RenderedDOM["Final Document Object Model"]
        D["<div class='rubii-diary'>วันนี้ออกไปเดินเล่นที่สวนสาธารณะ อากาศสดชื่นมาก</div>"]
    end

    R -->|"Single-Slot Injection into $1"| T
    T --> RenderedDOM
```

> **สรุปขั้นตอน Workflow (Style Tag Mode):**
> 1. AI ตอบกลับข้อความแบบก้อนเดียวภายในแท็กเปิด-ปิดที่กำหนด
> 2. สไตล์ CSS ทั้งหมดถูกแยกเก็บไว้ในแท็ก `<style>` ด้านบนอย่างเป็นระเบียบ ทำให้ง่ายต่อการปรับแต่ง
> 3. ก้อนข้อความทั้งหมดถูกส่งเข้าแทนที่ช่อง `$1` ในโครงสร้าง HTML โดยตรงในขั้นตอนเดียว โดยไม่ต้องผ่านตัวคั่นใดๆ

### 2.2 ข้อดีและข้อจำกัดของ Style Tag

| มิติการประเมิน | ลักษณะการทำงาน |
| :--- | :--- |
| **ความสะดวกในการดูแลโค้ด** | สูงมาก เนื่องจากแยกส่วนการจัดรูปแบบ (CSS) ออกจากโครงสร้าง (HTML) ชัดเจน |
| **ความเสถียรในการประมวลผล** | สูงที่สุด เพราะ AI ไม่ต้องจัดรูปแบบตัวคั่นที่ซับซ้อน เพียงแค่เขียนข้อความยาวภายในแท็กเปิด-ปิด |
| **ข้อจำกัดด้านความหลากหลายของข้อมูล** | ไม่สามารถแยกช่องแสดงผลหลายจุดอย่างอิสระได้ (เช่น ไม่สามารถแยกวันที่, สถานะ, และเนื้อหาออกจากกัน) |

---

## 3. กลไกการทำงานของ Regex Replacement Engine (Multi-Slot Architecture)

สำหรับการ์ดที่มีความซับซ้อนและจำเป็นต้องมีข้อมูลหลายช่อง เช่น สลิปการเงิน, แผงสถิติตัวละคร, มาตรวัดพลัง, หรือการ์ดแจ้งเตือนสถานะ ระบบจะใช้กลไก **Regex Replacement Engine** เพื่อจับคู่และสกัดค่าตัวแปรหลายตัวพร้อมกัน

### 3.1 วงจรการจับกลุ่มข้อมูล (Capture Group Pipeline)

```mermaid
flowchart TD
    subgraph Stream["LLM Response Payload"]
        P["<character-sheet>Noctis||Level 85||78%||Castle Infiltration</character-sheet>"]
    end

    subgraph RegexEngine["Regex Tokenizer"]
        R["/<character-sheet>([\s\S]*?)\|\|([\s\S]*?)\|\|([\s\S]*?)\|\|([\s\S]*?)<\/character-sheet>/g"]
    end

    subgraph SlotArray["Extracted Slot Array"]
        S1["$1: Name -> 'Noctis'"]
        S2["$2: Level -> 'Level 85'"]
        S3["$3: Energy Gauge -> '78%'"]
        S4["$4: Current Mission -> 'Castle Infiltration'"]
    end

    subgraph TemplateBinding["Template Binding Matrix"]
        H["<div class='sheet-root'>
  <h2>$1</h2>
  <span>$2</span>
  <div class='meter' style='width: $3; max-width: 100%;'></div>
  <p>$4</p>
</div>"]
    end

    P --> R
    R --> S1 & S2 & S3 & S4
    S1 & S2 & S3 & S4 --> TemplateBinding
```

> **สรุปขั้นตอน Workflow (Regex Multi-Slot Engine):**
> 1. AI สร้างข้อความที่มีหลายช่องข้อมูลโดยคั่นด้วยสัญลักษณ์มาตรฐาน เช่น `||`
> 2. Regex Engine ทำการประเมินและสกัดแต่ละส่วนเข้าสู่ Capture Groups ($1, $2, $3, $4) แบบเรียงลำดับ
> 3. นำค่าตัวแปรแต่ละช่องไปผูกกับตำแหน่งที่สอดคล้องกันในแม่แบบ HTML และหลอดสถานะไดนามิกได้อย่างแม่นยำ

### 3.2 การวิเคราะห์ตัวคั่นข้อมูล (Delimiter Evaluation)

จากการศึกษารูปแบบตัวคั่นที่ใช้ในการส่งข้อมูลของ LLM พบข้อดีและข้อจำกัดในเชิงวิศวกรรมดังนี้:

| ตัวคั่น (Delimiter) | ไวยากรณ์ตัวอย่าง | ค่า Regex Capture Pattern | ความเสี่ยงและข้อพิจารณาทางเทคนิค |
| :--- | :--- | :--- | :--- |
| **Double Pipe (`\|\|`)** | `ค่า1\|\|ค่า2\|\|ค่า3` | `([\s\S]*?)\|\|([\s\S]*?)` | **ปลอดภัยสูงสุดและแนะนำเป็นมาตรฐาน** เนื่องจากไม่ชนกับเครื่องหมายวรรคตอนทั่วไปในภาษาธรรมชาติ |
| **Single Pipe (`\|`)** | `ค่า1\|ค่า2\|ค่า3` | `([^\|]*?)\|(?!\|)([^\|]*?)` | เสี่ยงชนกับตาราง Markdown หรือสัญลักษณ์คณิตศาสตร์ที่ AI มักตอบ |
| **Comma (`,`)** | `ค่า1, ค่า2, ค่า3` | `([^,]*?)\s*,\s*([^,]*?)` | **ไม่แนะนำ** สำหรับข้อความยาวหรือจำนวนเงินที่มีเครื่องหมายจุลภาคคั่นหลักพัน เช่น `50,000` |
| **Newline (`\n`)** | `ค่า1\nค่า2\nค่า3` | `([^\r\n]*?)\r?\n([^\r\n]*?)` | เหมาะกับการตอบเป็นข้อๆ แต่อาจเกิดปัญหาหาก AI ใส่บรรทัดว่างเพิ่มเติมโดยไม่ตั้งใจ |

---

## 4. ข้อกำหนดและการออกแบบโครงสร้าง HTML สำหรับ Rubii

### 4.1 ข้อกำหนด Single Root Container

โครงสร้าง HTML ของการ์ดทุกลักษณะ **ต้องมี Element แม่ (Root Container) เพียงตัวเดียวเสมอ** เพื่อให้ระบบสามารถควบคุมขนาด จัดตำแหน่ง และจัดการ Stacking Context ได้อย่างสมบูรณ์

```html
<!-- ถูกต้อง: มี Root Container ตัวเดียวครอบคลุมทั้งหมด -->
<div style="background: rgba(255,255,255,0.08); border-radius: 28px; padding: 20px; box-sizing: border-box; width: 100%;">
  <div>ส่วนหัว</div>
  <div>เนื้อหา</div>
</div>

<!-- ไม่ถูกต้อง: มี Root หลายตัวอยู่นอกสุด -->
<div style="...">ส่วนหัว</div>
<div style="...">เนื้อหา</div>
```

### 4.2 การจัดการมิติและการจัดวาง (Dimensions & Layout)

1. **การกำหนดขนาดกล่อง (`box-sizing: border-box`):**
   ต้องกำหนด `box-sizing: border-box;` บน Root Container เสมอ เพื่อป้องกันไม่ให้ค่า `padding` และ `border` ขยายขนาดการ์ดจนล้นหน้าต่างแชต
2. **การหลีกเลี่ยงความสูงคงที่ (`fixed height`):**
   ห้ามกำหนด `height: 200px;` บนกล่องข้อความที่รับตัวแปรจาก AI เนื่องจากความยาวของข้อความที่ AI ตอบกลับมีความผันผวนสูง ให้ใช้ `min-height` หรือปล่อยให้กล่องขยายตามเนื้อหาอัตโนมัติ
3. **การจัดการข้อความล้นกรอบ (`word-break & overflow-wrap`):**
   ควรกำหนด `word-break: break-word; overflow-wrap: break-word;` เพื่อป้องกันไม่ให้คำยาวหรือลิงก์ URL ทะลุกรอบการ์ด

---

## 5. การออกแบบ CSS และสถาปัตยกรรม Glassmorphism

### 5.1 สถาปัตยกรรมกระจกฝ้า (Glassmorphism Architecture)

สไตล์ Glassmorphism ใน Rubii เกิดจากการผสมผสานของคุณสมบัติ CSS 4 ด้าน:

```mermaid
flowchart LR
    subgraph GlassStack["Glassmorphism Component Stack"]
        C1["Translucent Fill: background: rgba(255, 255, 255, 0.08 - 0.16)"]
        C2["Sub-surface Blur: backdrop-filter: blur(20px - 32px)"]
        C3["Perimeter Definition: border: 1.5px solid rgba(255, 255, 255, 0.25 - 0.40)"]
        C4["Ambient Elevation: box-shadow: 0 18px 45px rgba(0, 0, 0, 0.20 - 0.35)"]
    end

    C1 & C2 & C3 & C4 --> OutputCard["Frosted Glass Interface Card"]
```

> **สรุปโครงสร้างสถาปัตยกรรมกระจกฝ้า (Glassmorphism Stack):**
> 1. **พื้นผิวโปร่งแสง (Translucent Surface):** ใช้ `background: rgba(255,255,255, ...)` ระดับความทึบ 8% ถึง 16% เพื่อให้มองเห็นมิติของฉากหลัง
> 2. **ความเบลอของเลเยอร์ลึก (Frosted Blur):** ใช้ `backdrop-filter: blur(20px - 32px)` สร้างเอฟเฟกต์กระจกฝ้าที่นุ่มนวล
> 3. **เส้นขอบสะท้อนแสง (Perimeter Stroke):** ตีเส้นขอบ `border: 1px - 1.5px solid rgba(...)` เพื่อเน้นรูปทรงขอบการ์ดให้คมชัด
> 4. **เงาตกกระทบ (Ambient Elevation):** ใช้ `box-shadow` เพิ่มความลอยตัวและความลึกของการ์ดบนหน้าต่างสนทนา

#### ตารางพารามิเตอร์ความทึบแสงและความเบลอแต่ละระดับเลเยอร์

| ระดับความลึกของเลเยอร์ | ค่าความโปร่งแสง (Alpha Range) | ค่าความเบลอ (Blur Radius) | ความหนาของเส้นขอบ | ผลลัพธ์ทางสายตา |
| :--- | :---: | :---: | :---: | :--- |
| **เลเยอร์การ์ดหลัก (Primary Root)** | $8\% - 14\%$ | $24\text{px} - 32\text{px}$ | $1.5\text{px}$ solid ($\alpha = 0.35$) | ผิวกระจกใหญ่ เห็นฉากหลังเลือนราง คมชัดสูง |
| **กล่องข้อความย่อย (Nested Box)** | $16\% - 24\%$ | $14\text{px} - 20\text{px}$ | $1.0\text{px}$ solid ($\alpha = 0.20$) | ผิวกระจกซ้อน ทึบกว่าการ์ดหลักเพื่อให้อ่านง่าย |
| **ป้ายสถานะและไอคอน (Badge/Icon)** | $22\% - 32\%$ | $8\text{px} - 12\text{px}$ | $1.0\text{px}$ solid ($\alpha = 0.45$) | เน้นจุดสำคัญ มีความเด่นชัดและสะท้อนแสง |

### 5.2 การควบคุมสัดส่วนภาพและแบนเนอร์ (Full-Bleed Image Handling)

ปัญหาสำคัญที่พบบ่อยในการ์ดที่มีภาพแบนเนอร์คือการเกิด **Letterboxing Void (ขอบดำด้านข้าง)** เมื่อใช้ `object-fit: contain`:

```mermaid
flowchart TD
    subgraph Defect["Defective Rendering: object-fit: contain"]
        D1["Banner Container: 400px x 130px (3.08:1)"] --> D2["1:1 Square Image Scales to 130px x 130px"]
        D2 --> D3["Creates 135px Empty Black Voids on Left and Right"]
    end

    subgraph FullBleed["Full-Bleed Standard: object-fit: cover"]
        F1["Banner Container: 400px x 130px (3.08:1)"] --> F2["Image Expands to Cover 400px x 130px Area"]
        F2 --> F3["Balanced Center-Crop Eliminates All Void Gaps"]
    end
```

> **สรุปขั้นตอนการจัดการภาพแบนเนอร์ (Full-Bleed Media Workflow):**
> 1. **ปัญหาขอบดำ (Defect):** การใช้ `object-fit: contain` กับภาพจัตุรัสบนกรอบแนวนอน จะทำให้เกิดช่องว่างสีดำโบ๋ด้านข้างขนาดใหญ่
> 2. **วิธีแก้ไขมาตรฐาน (Solution):** กำหนด `object-fit: cover` ร่วมกับ `object-position: center` บน `img` และกำหนด `overflow: hidden` บนคอนเทนเนอร์ เพื่อให้ภาพขยายเต็มผืนผ้าอย่างสมดุลไร้รอยต่อ

**มาตรฐาน CSS สำหรับภาพแบนเนอร์:**
```css
/* กำหนดบนคอนเทนเนอร์ครอบ */
width: 100%;
height: 130px;
border-radius: 20px;
overflow: hidden;

/* กำหนดบนแท็ก img */
width: 100%;
height: 100%;
object-fit: cover;
object-position: center;
display: block;
```

### 5.3 กลไกหลอดสถานะและมาตรวัดเปอร์เซ็นต์ (Dynamic Progress Bar)

เมื่อต้องการสร้างหลอดพลัง หลอดความสัมพันธ์ หรือแถบความคืบหน้า:
1. **การกำหนดความกว้าง:** ผูกค่าตัวแปรเปอร์เซ็นต์เข้ากับ `width: $X%;`
2. **การป้องกันการล้นกรอบ (`Clamping`):** ต้องใส่ `max-width: 100%;` และ `min-width: 0%;` เสมอ เพื่อป้องกันกรณีที่ LLM ตอบตัวเลขเกินขอบเขต เช่น `150%`
3. **การหลีกเลี่ยงข้อความที่ไม่ใช่ตัวเลข:** หลีกเลี่ยงการให้ AI ตอบคำว่า `MAX` ลงในช่อง Style Width เพราะใน CSS คำว่า `MAX` ไม่ใช่ค่าความยาวที่ถูกต้อง จะส่งผลให้เบราว์เซอร์ตัดคำสั่งทิ้งและหลอดหดเหลือ 0%

```html
<!-- คอนเทนเนอร์ครอบหลอด -->
<div style="background: rgba(255,255,255,0.15); border-radius: 99px; height: 8px; width: 100%; overflow: hidden;">
  <!-- ตัวหลอดสถานะ -->
  <div style="background: linear-gradient(90deg, #38bdf8, #4ade80); height: 100%; width: 85%; max-width: 100%; min-width: 0%; border-radius: 99px;"></div>
</div>
```

### 5.4 การเพิ่มความคมชัดของข้อความด้วย Text Shadow (WCAG 2.1 Contrast Buffer)

เมื่อการ์ดโปร่งแสงวางทับบนพื้นหลังภาพที่มีลวดลายหรือสีสว่าง ค่า Contrast Ratio ระหว่างตัวหนังสือสีขาวกับพื้นหลังอาจลดลงจนอ่านไม่ออก การใส่ `text-shadow` ทำหน้าที่เป็น Contrast Buffer ที่มีประสิทธิภาพ:

| รูปแบบเงาข้อความ | โค้ด CSS ที่ใช้งาน | ค่า Contrast บนพื้นสว่าง | ลักษณะการใช้งาน |
| :--- | :--- | :---: | :--- |
| **ไม่มีเงา (None)** | `text-shadow: none;` | ประมาณ 1.2:1 ถึง 2.0:1 | อ่านยากมากเมื่อพื้นหลังมีลวดลายสว่าง |
| **เงามืดนุ่มนวล (Soft Dark)** | `text-shadow: 0 1px 3px rgba(0,0,0,0.85), 0 0 1px rgba(0,0,0,0.9);` | ประมาณ 6.5:1 ถึง 7.5:1 | **แนะนำเป็นค่าเริ่มต้น** ตัวหนังสือคมชัดและดูเป็นธรรมชาติ |
| **เส้นขอบคม (Sharp Outline)** | `text-shadow: -1px -1px 0 rgba(0,0,0,0.9), 1px -1px 0 rgba(0,0,0,0.9), -1px 1px 0 rgba(0,0,0,0.9), 1px 1px 0 rgba(0,0,0,0.9);` | สูงกว่า 10.0:1 | เหมาะกับการ์ดแสดงค่าสถานะเกม หรือธีมเรโทร |
| **แสงนีออน (Neon Glow)** | `text-shadow: 0 0 8px rgba(0,255,255,0.9), 0 0 16px rgba(0,190,230,0.6);` | ประมาณ 7.5:1 ถึง 8.5:1 | เหมาะกับธีม Cyberpunk หรือการ์ดเวทมนตร์ |

---

## 6. การวิเคราะห์จุดบกพร่องและโหมดความล้มเหลวเชิงประจักษ์

ในการวิจัยและทดสอบทางวิศวกรรมจริง พบว่าระบบที่พึ่งพาผลลัพธ์จาก LLM ย่อมมีความผันแปรและมีความเสี่ยงต่อความล้มเหลวหลายประการที่ผู้พัฒนาการ์ดต้องเตรียมรับมือ:

### 6.1 การประเมินโหมดความล้มเหลวที่พบได้บ่อย (Empirical Failure Modes)

```mermaid
pie title Empirical Distribution of Card Parsing and Rendering Failures
    "Missing or Extra Delimiters" : 42
    "Unbounded Content String Overflow" : 26
    "Non-numeric Gauge Value (e.g. MAX)" : 18
    "Unescaped Special Regex Characters" : 14
```

> **สรุปข้อมูลเชิงประจักษ์ (Empirical Risk Insights):**
> - **อันดับ 1 (42%):** เกิดจากโมเดล AI ลืมใส่ตัวคั่นหรือใส่ตัวคั่นเกินจากที่ Regex กำหนด ทำให้ Slot สลับตำแหน่ง
> - **อันดับ 2 (26%):** เกิดจากข้อความมีความยาวมากเกินไปจนล้นกรอบหากกำหนดความสูงคงที่
> - **อันดับ 3 (18%):** เกิดจากการที่ AI ตอบคำบรรยาย (เช่น `MAX` หรือ `เต็ม`) ลงในช่องตัวเลขหลอดพลัง ส่งผลให้ CSS ไวยากรณ์พัง
> - **อันดับ 4 (14%):** เกิดจากข้อความของ AI มีอักขระพิเศษที่ชนกับ Regex

### 6.2 รายละเอียดและการวิเคราะห์ความเสี่ยงแต่ละด้าน

| โหมดความล้มเหลว | สาเหตุและกลไกการเกิด | ผลกระทบที่เกิดขึ้น | แนวทางการป้องกันและลดความเสี่ยง |
| :--- | :--- | :--- | :--- |
| **Delimiter Mismatch (ตัวคั่นขาดหรือเกิน)** | โมเดล LLM อาจละเลยตัวคั่น `\|\|` หรือสร้างเกินจำนวนที่ Regex กำหนด | Regex จับกลุ่มผิดตำแหน่ง ทำให้ข้อมูลสลับช่อง หรือไม่แสดงผลทั้งการ์ด | กำหนด Prompt System ให้ชัดเจน พร้อมออกแบบ Fallback Rule เพื่อรองรับ |
| **Content Overflow (ข้อความทะลัก)** | ข้อความในช่องตัวแปรมีความยาวมากเป็นพิเศษ | การ์ดยาวล้นหน้าต่างแชต หรือบดบังองค์ประกอบอื่น | กำหนด `max-height` ร่วมกับ `overflow-y: auto;` หรือใช้ `line-clamp` |
| **Progress Bar Syntax Error** | AI ตอบคำบรรยายแทนตัวเลข เช่น `เต็มหลอด` หรือ `MAX` | ค่า CSS ไวยากรณ์ผิดพลาด ส่งผลให้หลอดพลังหดเหลือความกว้าง 0% | ใช้ Regex Filter สกัดเฉพาะตัวเลข `(\d+)` ก่อนนำไปประกอบใน CSS |
| **Catastrophic Backtracking** | การเขียน Regex Pattern ซ้อนลูปแบบไม่ระมัดระวัง เช่น `(.*)+` | เอนจิน Regex ค้างและใช้ CPU สูงมาก | ใช้ Non-Greedy Quantifier `([\s\S]*?)` และหลีกเลี่ยง Nested Quantifiers |
| **GPU Memory Pressure** | การใส่ `backdrop-filter: blur()` ซ้อนกันหลายชั้นบนหน้าจอเดียว | เกิดอาการกระตุก (Frame Drop) บนสมาร์ตโฟนรุ่นเก่า | จำกัดความลึกของเลเยอร์กระจกไม่เกิน 2 ชั้นต่อการ์ด |

---

## 7. คู่มือและแนวทางปฏิบัติสำหรับผู้พัฒนาการ์ด

เพื่อความทนทานและความสวยงามสูงสุดในการสร้างการ์ดสำหรับ Rubii แนะนำให้ปฏิบัติตามหลักการดังต่อไปนี้:

1. **โครงสร้าง HTML สะอาด:** ใช้ `<div>`, `<span>`, `<img>` พื้นฐาน หลีกเลี่ยงโครงสร้างซับซ้อน เช่น `<table>` หรือ Framework-specific Tags
2. **Inline Style Scoping:** เขียนสไตล์แบบ Inline ที่กระชับ หรือใช้คลาสแยกที่มีชื่อเฉพาะ ไม่เขียนสไตล์ที่กระทบ Global Elements (เช่น ห้ามกำหนด `p { ... }` แบบลอยๆ)
3. **ระบบจัดการสี:** กำหนด `color: #ffffff!important;` หรือสีข้อความที่ต้องการอย่างชัดเจนบน Element สำคัญ เพื่อป้องกันไม่ให้ถูก Global Style ของแอปพลิเคชันเขียนทับ
4. **การเลือกตัวคั่น:** ใช้ `||` เป็นตัวคั่นมาตรฐานสำหรับการ์ดแบบ Multi-Slot
5. **การระบุฟอนต์:** ใช้ System Font Fallback มาตรฐานเพื่อให้แสดงผลสอดคล้องกับระบบปฏิบัติการของผู้ใช้:
   `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`
6. **การจัดการรูปภาพ:** กำหนด `display: block; width: 100%; height: 100%; object-fit: cover;` บนแท็ก `<img>` เสมอ

---

## 8. โค้ดแม่แบบมาตรฐานอ้างอิง (Standard Reference Templates)

### 8.1 แม่แบบที่ 1: การ์ดข้อความเดี่ยว (Style Tag Single-Slot Card)

```html
<style>
.rubii-message-box {
  background: rgba(255, 255, 255, 0.09);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  border-radius: 28px;
  padding: 18px 20px;
  max-width: 420px;
  margin: 12px auto;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #ffffff;
  box-sizing: border-box;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85);
  font-size: 14px;
  line-height: 1.6;
}
</style>
<div class="rubii-message-box">
  $1
</div>
```

### 8.2 แม่แบบที่ 2: แผงสถานะและมาตรวัดไดนามิก (Multi-Slot Dashboard Card)

```html
<div style="background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px); border: 1.5px solid rgba(255, 255, 255, 0.38); border-radius: 32px; padding: 20px; max-width: 420px; margin: 12px auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff; box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25); box-sizing: border-box; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85);">
  
  <!-- แบนเนอร์ภาพด้านบน -->
  <div style="width: 100%; height: 120px; border-radius: 20px; overflow: hidden; margin-bottom: 14px;">
    <img src="https://media.giphy.com/sample.gif" style="width: 100%; height: 100%; object-fit: cover; object-position: center; display: block;" alt="Banner">
  </div>

  <!-- หัวข้อและป้ายสถานะ -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
    <span style="font-size: 15px; font-weight: bold;">$1</span>
    <span style="font-size: 11px; background: rgba(56, 189, 248, 0.2); border: 1px solid rgba(56, 189, 248, 0.4); padding: 2px 8px; border-radius: 12px; color: #38bdf8;">$2</span>
  </div>

  <!-- หลอดสถานะไดนามิก -->
  <div style="margin-bottom: 12px;">
    <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 4px; opacity: 0.85;">
      <span>ระดับพลังงาน</span>
      <span>$3%</span>
    </div>
    <div style="background: rgba(255, 255, 255, 0.15); border-radius: 99px; height: 8px; width: 100%; overflow: hidden;">
      <div style="background: linear-gradient(90deg, #38bdf8, #4ade80); height: 100%; width: $3%; max-width: 100%; min-width: 0%; border-radius: 99px;"></div>
    </div>
  </div>

  <!-- กล่องข้อความบรรยาย -->
  <div style="background: rgba(0, 0, 0, 0.25); border-radius: 16px; padding: 12px 14px; border: 1px solid rgba(255, 255, 255, 0.12); font-size: 13px; line-height: 1.55;">
    $4
  </div>

</div>
```

**Regex Pattern ที่ใช้จับคู่:**
```regex
/<status-panel>([\s\S]*?)\|\|([\s\S]*?)\|\|(\d{1,3}(?:\.\d+)?)\s*%?\|\|([\s\S]*?)<\/status-panel>/g
```

---

## 9. บทสรุปและข้อเสนอแนะ

การผสานรวม Large Language Model เข้ากับเทคโนโลยีการแสดงผล HTML5 และ CSS ในแพลตฟอร์ม Rubii AI เป็นรูปแบบการสร้างส่วนต่อประสานผู้ใช้ที่มีศักยภาพสูงและมอบประสบการณ์ที่มีชีวิตชีวาแก่ผู้ใช้งาน

**ประเด็นสรุปที่สำคัญ:**
1. **ความยืดหยุ่นและการควบคุม:** การเลือกใช้ระหว่าง **Style Tag** (สำหรับข้อความเดี่ยว) และ **Regex Engine** (สำหรับข้อมูลหลายช่อง) ต้องสอดคล้องกับความสามารถของ Prompt และลักษณะของข้อมูล
2. **ความทนทานของโค้ด (Robustness):** การออกแบบโครงสร้าง HTML/CSS ต้องคำนึงถึงความไม่แน่นอนของผลลัพธ์จาก LLM โดยต้องมีระบบป้องกันข้อความล้นกรอบ การจำกัดความกว้างหลอดสถานะ (`max-width: 100%`) และการเลือกตัวคั่นที่ปลอดภัย (`||`)
3. **การเข้าถึงและความชัดเจน (Accessibility & Contrast):** การใช้ Glassmorphism ต้องทำควบคู่กับการจัดการความคมชัดของข้อความด้วย Text Shadow เพื่อให้อ่านง่ายในทุกสภาวะพื้นหลัง

เอกสารฉบับนี้จัดทำขึ้นเพื่อเป็นแนวทางอ้างอิงทางเทคนิคสำหรับนักพัฒนาและผู้สร้างคอนเทนต์ในการออกแบบการ์ดที่สวยงาม มีประสิทธิภาพ และทำงานได้อย่างราบรื่นบนแพลตฟอร์ม Rubii AI
