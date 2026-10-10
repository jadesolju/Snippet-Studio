# Snippet Studio agent guidance

## Rubii variables and Regex markers

- Treat the automatic variable scan as a first pass. Read the full HTML text in context before deciding what should become a Regex capture.
- In source HTML, parentheses mark a capture candidate. The Regex builder turns a selected candidate into `$1`, `$2`, and so on in generated output. Do not put a literal `$` in the source HTML when the intended action is to mark a value.
- Keep fixed headings, labels, brand names, metric names, and decorative text outside the marker. Mark only the changing value or phrase.
- Keep `{{user}}` and `{{char}}` unchanged when they appear alone as a name, sender, recipient, handle, or other fixed macro value. Do not create a separate `$` capture for either macro.
- When a macro is part of a changing contextual value, mark the whole value as one capture instead of capturing each macro separately. Preserve the fixed field label. For example:
  - `🎧 สถานะคู่: {{char}} 𐙚 {{user}}` → `🎧 สถานะคู่: ({{char}} 𐙚 {{user}})`; generated output should use the `$n` assigned to that capture, for example `🎧 สถานะคู่: $4` if it is the fourth selected value.
  - `📍 (สถานที่: พิกัดเมืองนีออนยามค่ำคืน) • กรุงเทพฯ` → `📍 (สถานที่: พิกัดเมืองนีออนยามค่ำคืน • กรุงเทพฯ)` when the full location description is intended to change together.
- Keep percentages, dates, times, amounts, counts, references, and contextual prose as separate captures when they can change independently. Do not combine unrelated formats into one catch-all Regex.
- For an approved dynamic emotion or state, mark the complete changing phrase as a value while keeping unrelated metric names and labels fixed. The reviewed emotion-card set includes `(อารมณ์พุ่งทะยาน)`, `(ระดับความหวั่นไหว)`, `(โหมดติดสกินชิป)`, `(ล่องลอย)`, `(ขั้วหัวใจ)`, `(พลังเต็มร้อย)`, `(ผ่อนคลายเต็มเปี่ยม)`, and `(รสหวานเจี๊ยบ)`; percentages beside them remain separate captures.
- The Regex builder supports at most 33 capture slots per rule. If a card needs more, split captures into supplementary Regex rules by semantic group and keep each replacement's `$n` mapping aligned with its rule.
- When repeated independent items need dynamic values, give each marker a unique target instead of reusing a generic marker such as `(อีโมจิ)`; identical targets are deduplicated into one slot. For example, use `(อีโมจิ 1)` / `(ชื่อเว็บไซต์ 1)` and `(อีโมจิ 2)` / `(ชื่อเว็บไซต์ 2)` for separate favorite-site tiles.
- Before finishing a Library change, review the source HTML and generated Regex/Replacement together. A candidate shown by the scanner is not automatically a confirmed variable; use context and the user's explicit instructions to decide.
