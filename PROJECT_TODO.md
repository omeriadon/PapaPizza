# PapaPizza Project TODO / Deliverables Checklist

(Assessment Due: Friday Week 8)

Use this file to track progress. Do NOT write full solutions here—link to where you complete each artifact (e.g. docs/, backend/ code). Tick boxes as you finish.

---

## 2. Problem Outline (2 marks)

- [ ] Purpose statement (WHY system exists)
- [ ] System objectives (WHAT it must achieve — 5–8 bullet points)

---

## 3. Problem Description (5 marks)

Write a richer narrative referencing: actors (customer / staff), order flow, GST inclusion, daily summary, user interaction.

- [ ] Draft description
- [ ] Review & refine (clarity, completeness)

---

## 4. Requirements (4 marks)

Create two lists: Functional vs Non‑Functional.
Functional (examples to flesh out):

- [ ] Display menu
- [ ] Accept multiple pizza selections + quantities
- [ ] Validate inputs (blank, non-numeric, negative, out-of-range)
- [ ] Calculate per-item total (price \* quantity)
- [ ] Compute subtotal
- [ ] Apply 10% GST (show GST + grand total)
- [ ] Store each order in daily sales data structure
- [ ] Provide daily sales summary (total revenue ex GST, GST, total incl GST, count per pizza type, total # pizzas, maybe most popular)
- [ ] Reset data (optional / end-of-day)

Non‑Functional (examples to elaborate):

- [ ] Usability (clear prompts/messages)
- [ ] Maintainability (modular functions, naming)
- [ ] Accuracy (currency rounding to 2 dp)
- [ ] Performance (small scale; fast response)
- [ ] Reliability (validation prevents crashes)
- [ ] Legal/compliance (GST calculation exactly 10%)

Deliverables:

- [ ] Requirements table with IDs (e.g. FR1, NFR1)
- [ ] Each Functional Requirement traceable to at least one test + UAT case

---

## 5. Algorithms – Pseudocode (5 + 3 marks for logic/control)

Create modular pseudocode using functions & lists. Required functions (suggested names—adjust as you wish):

- [x] `get_menu()` (returns list of pizzas/prices)
- [ ] `display_menu(menu)`
- [ ] `capture_order(menu)` (loop until user done) OR form handling route
- [ ] `calculate_line_total(price, quantity)`
- [x] `calculate_order_subtotal(order_items)`
- [x] `calculate_gst(subtotal)`
- [x] `calculate_grand_total(subtotal)`
- [ ] `record_order(order_items, store)`
- [ ] `generate_daily_summary(store)`
- [x] `format_currency_round(amount)`

Pseudocode tasks:

- [ ] Define data structures (list of names, list of prices OR list of dicts; list for daily counts; running totals)
- [ ] Show main program flow (sequence)
- [ ] Include selection (validation branches)
- [ ] Include iteration (loop for adding pizzas, loop for daily summary aggregation)
- [ ] Trace table examples (at least 2) to prove logic: one simple order, one multi-line order

Artifacts:

- [ ] Pseudocode document drafted
- [ ] Peer review & corrections

---

## 6. Flowchart (visual logic)

- [ ] High-level flowchart (start -> show menu -> collect items -> compute totals -> display order total -> store -> ask new order? -> summary exit)
- [ ] Symbols used correctly (terminator, process, decision, I/O)
- [ ] Matches pseudocode

---

## 7. Implementation (Flask) (5 + 5 + 3 + other marks interplay)

Backend structure (example): `backend/app.py`, optionally split into `services.py` or `logic.py` if desired.
Routes (adjust names to your design):

- [ ] `GET /api/menu` returns menu JSON
- [ ] `POST /api/order` accepts order payload (list of {pizza_id, quantity})
- [ ] `GET /api/summary` returns current daily summary
- [ ] (Optional) `POST /api/reset` clears daily data (for testing)

Core code tasks:

- [ ] Global (or module-level) data store for menu
- [ ] Data store for daily sales (counts per pizza, total revenue ex GST)
- [ ] Input validation logic (reject invalid pizza id / quantity <=0)
- [ ] Calculation functions (GST 10%): subtotal, gst = subtotal \* 0.10, total = subtotal + gst
- [ ] Rounding / formatting to 2 decimals (use `round(value, 2)` or `Decimal`)
- [ ] Update daily aggregates per order
- [ ] Daily summary computation
- [ ] Comments for each function (purpose, params, returns)
- [ ] Meaningful variable names
- [ ] Avoid magic numbers (store GST_RATE = 0.10)
- [ ] Error handling (return JSON error messages with status codes)

---

## 8. Testing (Test Plan) (5 marks)

Design the table: `Case ID | Inputs | Expected Output | Actual Output | Pass/Fail | Notes`
Categories to cover:

- [ ] Menu retrieval
- [ ] Single pizza order (quantity=1)
- [ ] Multiple pizzas (different types)
- [ ] Large quantity boundary
- [ ] Invalid pizza index (high)
- [ ] Invalid pizza index (negative)
- [ ] Non-numeric quantity
- [ ] Zero quantity
- [ ] Negative quantity
- [ ] GST calculation correctness (known subtotal \* 1.10)
- [ ] Rounding edge (e.g., prices causing repeating decimals)
- [ ] Daily summary after multiple orders
- [ ] Reset (if implemented)

Execution:

- [ ] Fill Expected before running
- [ ] Record Actual after running
- [ ] Mark Pass/Fail
- [ ] Add notes for defects

---

## 9. User Acceptance Testing (UAT) (5 marks)

- [ ] Map Functional Requirements -> Acceptance Criteria
- [ ] Create UAT script (tasks for peer: place order, view total with GST, view summary)
- [ ] Two peers perform tests
- [ ] Capture feedback & screenshots/logs
- [ ] Coverage table (Met / Partially / Not Met)

---

## 10. Bugs, Limitations, Improvements (5 marks)

Defect Log columns: ID | Title | Steps | Expected | Actual | Severity | Status | Improvement Suggestion

- [ ] Create log
- [ ] Populate during testing/UAT
- [ ] For each closed defect, note improvement / prevention idea
- [ ] Identify at least 3 future enhancements

---

## 11. Retrospective / Evaluation (3 + Evaluation criteria marks)

Evaluation (link back to requirements):

- [ ] Summarise which requirements were met (evidence references)
- [ ] Discuss user feedback & changes made
- [ ] Reflect on design decisions (data structures, functions)
- [ ] What worked well
- [ ] What didn’t / challenges
- [ ] What you’d change next time
- [ ] Sources / references (consistent format)

Retrospective add:

- [ ] Lessons learned
- [ ] Time management reflection vs original schedule
- [ ] Potential future impacts / scalability thoughts

---

## 12. Documentation & Submission

- [ ] Organise docs folder (planning/, testing/, uat/, logs/)
- [ ] Ensure all artifacts named clearly
- [ ] Final code passes a run smoke test
- [ ] README updated (run instructions, endpoints)
- [ ] Remove unused files / debug prints
- [ ] Final commit & push before deadline

---

## 14. Currency / Calculation Accuracy

- [ ] Decide rounding strategy early (e.g., round after each line vs end subtotal)
- [ ] Consistency check examples documented

---

## 15. Academic Integrity

- [ ] Original wording in docs (no copy/paste from AI)
- [ ] Cite any tutorials / references used

---
