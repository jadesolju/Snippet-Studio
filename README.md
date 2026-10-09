# Snippet Studio — คลังตัวอย่างและแม่แบบโค้ด HTML/CSS สำหรับ Rubii

เว็บแอปพลิเคชันสำหรับค้นหา ดูตัวอย่าง (Preview), ปรับแต่ง และคัดลอกโค้ดแม่แบบ HTML, CSS และ Style Tags สำหรับ Rubii

## เอกสารในโปรเจกต์

| เอกสาร | ใช้เมื่อ | ขอบเขตหลักฐาน |
| --- | --- | --- |
| [แนวทางสร้างการ์ด](./RUBII_CARD_GUIDELINES.md) | ต้องการลงมือสร้างหรือแก้การ์ด | เช็กลิสต์และแนวทางที่ตรวจผลในเว็บ/แอปต่อได้ |
| [สถาปัตยกรรม Snippet Studio](./ARCHITECTURE.md) | ต้องการเข้าใจภาพรวมแอปและไฟล์ | อ้างอิงโค้ดและข้อมูลใน repository นี้ |
| [คู่มือศึกษาโค้ดและระบบ](./RUBII_CODE_STUDY_AND_ARCHITECTURE_RESEARCH.md) | ต้องการตามลำดับการทำงานของ `app.js` | อ้างอิง implementation ปัจจุบันของโปรเจกต์ |
| [Style Tag และ Regex audit](./RUBII_STYLETAG_AND_REGEX_AUDIT.md) | ต้องการดูปัญหาเรื่องการเลือกช่องตัวแปร | เก็บรายการกรณีที่เคยตรวจ; โปรดเทียบกับโค้ด/ข้อมูลปัจจุบันก่อนใช้เป็นผล audit ล่าสุด |
| [พื้นหลัง ภาพ และ Progress Bar](./RUBII_BACKGROUND_AND_BARS_ANALYSIS.md) | ต้องการแนวทางด้านภาพและหลอดสถานะ | แยกข้อเท็จจริงใน repository ออกจากสิ่งที่ต้องทดสอบบน Rubii |
| [คู่มือสถาปัตยกรรม CSS (ภาษาไทย)](./RUBII_CORE_ARCHITECTURE_AND_CSS_ENGINEERING.md) | ต้องการตัวอย่างและแนวทาง HTML/CSS | ข้อเสนอแนะเชิงออกแบบ; ไม่ใช่เอกสารภายในของ Rubii |
| [System Architecture Specification (English)](./RUBII_SYSTEM_ARCHITECTURE_AND_ENGINEERING_SPECIFICATION.md) | ต้องการอ่านฉบับภาษาอังกฤษ | เนื้อหาอ้างอิงเดียวกับคู่มือภาษาไทยด้านบน |

> **วิธีอ่าน:** แผนภาพที่อธิบาย `Snippet Studio` อ้างอิงโค้ดใน repository; แผนภาพการทำงานภายใน Rubii เป็นแบบจำลองจากข้อมูลสาธารณะ ไม่ใช่การยืนยัน implementation ภายใน ส่วนผลการแสดงผลข้ามอุปกรณ์ต้องทดสอบบน Rubii จริง

แนวทางออกแบบและตรวจสอบการ์ดอยู่ที่ [RUBII_CARD_GUIDELINES.md](./RUBII_CARD_GUIDELINES.md)

## การเริ่มต้นใช้งาน (Local)

เปิดไฟล์ `index.html` ในเว็บเบราว์เซอร์ได้ทันที หรือรัน Local Server:

```bash
npx serve .
```

## การ Deploy บน Vercel

สามารถเชื่อมต่อ Repository นี้กับ Vercel แล้วกด **Deploy** ได้ทันทีโดยไม่ต้องตั้งค่าใดๆ เพิ่มเติม (เป็น Static Web App 100%)
