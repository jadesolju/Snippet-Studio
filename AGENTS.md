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

## Rubii chat layout compatibility

- Treat the Rubii chat renderer as a React Native HTML renderer, not as a desktop browser. A layout that looks correct in the browser Preview is not proof that it will match in chat.
- Prefer a single-column, top-to-bottom content order for phone cards. Put images in their own block and place metric/status rows below them at full width; do not place an image beside a metric grid.
- Do not use CSS Grid or `grid-template-columns` for card content. Use normal block flow for the main layout.
- Keep horizontal layout limited to compact rows such as a heading/status pair or metric label/value pair, and only when that row has been checked in the Rubii phone chat. If renderer behavior is uncertain, stack the parts vertically.
- Avoid relying on CSS `gap`, wrapping, or implicit shrink behavior to control spacing. Use simple block flow, explicit widths, and margins that remain readable when rendered sequentially.
- Review the rendered card in the phone chat. Use the user's supplied phone screenshot as the layout reference; desktop iframe Preview alone does not validate React Native rendering.

## Chat bubble alignment: outer message vs. HTML mock chat

- Distinguish the outer Rubii message bubble from chat bubbles drawn as `<div>` elements inside a snippet. The outer side belongs to the actual Rubii sender/message; a single HTML card cannot create separate user and character messages or change its sender role.
- For real user-vs-character message styling, use the Global CSS role selectors documented by Rubii: `.rubii-message-user` and `.rubii-message-character`. Do not use `{{user}}`/`{{char}}`, `text-align`, or a nested card's `align-self` to control the outer Rubii message side.
- For a mock conversation contained inside one card, wrap each bubble in a full-width row: `display:flex;flex-direction:row;width:100%;box-sizing:border-box;justify-content:flex-start` for the left side or `justify-content:flex-end` for the right side. Put the bubble inside that row and constrain it with `max-width`.
- Do not rely on `align-self` on the bubble itself to position it horizontally. It controls the cross axis and may be ignored by the app renderer. The full-width row pattern above was confirmed in the user's phone Preview; use it for chat-card bubble alignment.
- When a message row contains an avatar and a bubble, explicitly set that inner row to `display:flex;flex-direction:row;align-items:flex-end` so React Native's column default does not stack them vertically.
- Do not confuse `text-align:right` or a right-aligned timestamp row with right-aligning the message bubble itself.
- Rubii's Styles & Regex require APP 2.4.2 or later. Complex layout may still differ between Web and APP; record the app version when auditing behavior beyond the confirmed row-wrapper pattern.
