# BatchCheck

A prototype web app that helps parents **find** the laboratory report for a specific batch of a children's nutrition powder and **understand** it in plain language.

> **Honest scope.** BatchCheck is a frontend-only prototype. It has no backend, no database and no connection to any laboratory or brand. It cannot verify that a report is authentic. **It currently contains no real laboratory reports** — only clearly labelled, fictional `DEMO DATA` records. It is not affiliated with, endorsed by, or partnered with Little Joys or any other company, and it is not medical advice.

Official Little Joys reports: <https://ourlittlejoys.com/honest-report>

## Quick start on Windows 11 (beginner-friendly)

You only need to do steps 1–3 once.

1. **Install Node.js.** Go to <https://nodejs.org>, download the **LTS** version (18 or newer) and run the installer, accepting the defaults.
2. **Unzip the project.** Right-click `batchcheck.zip` → **Extract All…** and choose a folder, for example `C:\Users\<you>\Documents`. You should end up with a folder called `batchcheck` that contains `package.json`.
3. **Open a terminal in that folder.** Open the `batchcheck` folder in File Explorer, click the address bar, type `cmd` and press **Enter**. (Alternatively right-click an empty area → **Open in Terminal**.)
4. **Install the dependencies** (needs internet, takes about a minute):
   ```
   npm install
   ```
5. **Start the app:**
   ```
   npm run dev
   ```
6. **Open it in your browser.** The terminal prints a line like `Local: http://localhost:5173/`. Hold **Ctrl** and click it, or paste it into Chrome/Edge.
7. **Stop the app** with **Ctrl + C** in the terminal (answer `Y` if asked).

Optional: run the automated tests with `npm test`.

**Troubleshooting**

- *"'npm' is not recognized"*: Node.js is not installed or the terminal was opened before installing. Close the terminal, reopen it and try again (restart the PC if it still fails).
- *"running scripts is disabled on this system"* in PowerShell: use **Command Prompt** (`cmd`) as in step 3, or run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once in PowerShell.
- *Port 5173 already in use*: Vite will offer the next free port; use the address it prints.
- *Errors while extracting or installing*: extract the whole ZIP first (don't run from inside the ZIP preview) and avoid very long folder paths.
- The page stays blank: make sure you opened the address printed by `npm run dev`, not the `index.html` file directly.

## Features

- **Batch lookup** by brand, product and batch number (exact match only, case- and whitespace-insensitive).
- **Report page** with product identity, source link, provenance, a three-step verification ladder, and one card per tested parameter.
- **"Understand this report"**: rule-based, hedged explanations of what each parameter measures, what the value means, the documented limit, what is missing, and what the test does *not* establish.
- **Evidence and limitations panel** separating what the source provides, what it doesn't, what the app hasn't verified, and the scope of lab tests. Neutral labels only; no red/green badges.
- **Compare page** showing documented fields side by side (ingredients, declared protein/sugar, report availability, tests documented, missing evidence). It deliberately does not rank or score products.
- States: loading, empty, error, not found, invalid input, multiple matches, missing URL, incomplete or unavailable report data.
- **QR scanning is NOT implemented.** The button is disabled and labelled "Future feature". There is no fake scanner.

## Tech

React 18 · Vite 5 · TypeScript · Tailwind CSS 3 · lucide-react · Vitest + React Testing Library. No API keys, paid services or authentication.

## Setup

Requires Node.js 18+.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # run the Vitest suite once
npm run typecheck  # TypeScript only
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build locally
```

## Deploying to Vercel

The app is a static Vite build (hash-based routing, so no rewrite rules are needed). No environment variables or API keys are required.

**Exact project settings** (Vercel normally detects these automatically; `vercel.json` also sets them):

| Setting | Value |
| --- | --- |
| Framework Preset | **Vite** |
| Root Directory | The folder that contains `package.json` (use `./` if it is at the top of your repository) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Node.js Version | 20.x or 22.x |
| Environment Variables | none |

Steps (GitHub route):

1. Extract the ZIP, then upload the **contents** of the folder (the files next to `package.json`) to a new GitHub repository, so `package.json` is at the top level of the repo. Do not upload `node_modules` or `dist`.
2. In Vercel choose **Add New → Project**, import the repository and check the settings above.
3. Click **Deploy**.

If you uploaded the folder itself, so `package.json` sits one level down (for example `batchcheck/package.json`), set **Root Directory** to that folder name instead of `./`.

Or with the CLI, from the folder that contains `package.json`: `npx vercel` (preview) or `npx vercel --prod`.

## Project structure

```
src/
  types.ts               Data model (BatchRecord, TestParameter, Product ...)
  data/
    products.ts          Selectable brands/products + official portal URL
    records.ts           Batch records (currently DEMO only)
  lib/
    normalize.ts         Batch-number normalisation and input validation
    lookup.ts            searchBatch(): exact match, near matches, never a silent fallback
    explain.ts           Rule-based interpretation and plain-language text
    route.ts             Tiny hash router
  components/            SearchForm, ResultsPanel, ReportIdentity (+ ladder),
                         TestingSummary, UnderstandReport, EvidencePanel, Badges, ...
  pages/                 FindPage, ReportPage, ComparePage
  App.tsx                State, async loading of the local dataset, routing
  App.test.tsx           Integration tests (React Testing Library)
  lib/lib.test.ts        Unit tests
```

## Data structure

Defined in `src/types.ts`.

**`BatchRecord`**

| Field | Meaning |
| --- | --- |
| `id` | Unique, stable id used in the URL (`#/report/<id>`) |
| `productId`, `brand`, `productName` | Which product the batch belongs to |
| `batchNumber` | As printed on the pack / report |
| `reportDate`, `laboratory`, `reportUrl` | `null` when the source does not provide them |
| `provenance` | `'demo'` or `'source-reviewed'` |
| `verificationStatus` | `'demo-data'` · `'source-link-listed'` · `'document-reviewed'` · `'independently-verified'` |
| `provenanceNote` | How the record was obtained and reviewed |
| `parameters` | `null` = no test data entered; `[]` = none documented; otherwise a list of `TestParameter` |

**`TestParameter`**: `name` (as in the source), `kind` (selects the plain-language text), `result` (number, text such as "Not detected", or `null`), `unit`, `limit` (`{ type: 'max' | 'min', value, unit, basis }` or `null`), `method`, `sourceRef`. Anything the source does not state is `null`; nothing is guessed.

**Interpretation rule** (`interpretParameter`): a result is compared with a limit **only** if the result is numeric, its unit is documented, a limit is documented, and the units are identical. Otherwise the app shows *"Insufficient information to interpret this result"* with the reason. The app never converts units and never says a product is safe, unsafe, clean, approved or certified.

**Verification ladder** keeps three questions separate: is a source link available; has a maintainer reviewed the original document; has authenticity been independently verified. A matching batch number alone authenticates nothing.

## Adding manually verified source records

Only add a real record after you have opened the **original** document yourself.

1. Obtain the original report from the brand's official portal (not from a screenshot or third party).
2. In `src/data/products.ts`, make sure the product exists. If you also transcribe label information, fill `declared` with the source; otherwise leave `declared: null`.
3. In `src/data/records.ts`, add a `BatchRecord`:
   - `provenance: 'source-reviewed'` and `verificationStatus: 'document-reviewed'` (use `'source-link-listed'` if you only have a link and have not reviewed the document; use `'independently-verified'` only if the issuer has confirmed authenticity).
   - Copy `batchNumber`, `reportDate`, `laboratory` and `reportUrl` exactly. Use `null` for anything not stated.
   - In `provenanceNote`, write who reviewed it, when, and what document version.
4. For each parameter, copy name, result, unit, limit, method and page reference **exactly as printed**. Put the standard or the report itself in `limit.basis`. If the document gives no limit, set `limit: null`. Never fill gaps from memory or from other products.
5. Do not use the `DEMO-` prefix, `example.org`, or the fictional brand for real records, and never reuse demo values.
6. Run `npm test` and open the report page to compare it against the original line by line.

## Manual testing checklist

- [ ] `npm install && npm run dev` starts; the landing page loads with no console errors.
- [ ] Brand and Product selects work; changing Brand updates Product.
- [ ] Choose *Demo Brand (fictional)* → *Demo Millet Mix*, search `DEMO-MILLET-0001` → one result with a **DEMO DATA** badge.
- [ ] Search `  demo-millet-0001  ` (lowercase, spaces) → same result.
- [ ] Search with the field empty → inline error under the input, no results, no spinner. Keyboard focus and screen-reader description work.
- [ ] Search `@@@` → invalid-characters message.
- [ ] Search `DEMO-MILLET-9999` → "No report found", wording says absence here ≠ no report exists, official portal link present, nothing opened.
- [ ] Search `DEMO-MILLET-001` → not found, with similar batches listed as *not exact matches*.
- [ ] Little Joys → Nutrimix with any batch → not found + portal link. With `DEMO-MILLET-0001` → not found, noted as "same batch number, different product".
- [ ] A loading indicator appears briefly while searching.
- [ ] Open `DEMO-MILLET-0001`: demo banner, identity, ladder (all "No"), parameter cards, Understand section, Evidence panel (four blocks).
  - [ ] Lead: *at or below the documented maximum*; Arsenic: *above the documented maximum*; Protein: *Insufficient information…*
- [ ] Open `DEMO-MILLET-0002`: no source link, missing date/lab/unit/result shown as "Not provided / Not reported".
- [ ] Open `DEMO-MILK-0001` (Demo Milk Powder): "Test results are not available in this entry".
- [ ] Open `DEMO-MILK-0002`: lead result in µg/kg vs limit in mg/kg → *Insufficient information*, no conversion.
- [ ] "Copy batch number" shows "Copied" only after the copy succeeds.
- [ ] "Back to search" returns to the search with previous results still shown.
- [ ] Browser Back/Forward work; opening `#/report/nope` shows "Report not found".
- [ ] "Scan QR code" is disabled and says "Future feature".
- [ ] Compare page: changing products updates columns; no ranking/score anywhere.
- [ ] No text anywhere calls a product safe, unsafe, clean, toxin-free, approved or certified.
- [ ] Resize to ~360 px wide: no horizontal scroll except the compare table; tab through every control with the keyboard.

## Limitations

- Frontend only. Data ships inside the JavaScript bundle; nothing is fetched from brands or laboratories, and nothing is authenticated.
- **No real reports are bundled.** Little Joys Nutrimix searches always end in "not found in this prototype".
- Demo limits are fictional and are not real regulatory standards.
- Explanations are fixed templates, not clinical or regulatory judgement; they do not know product-specific standards.
- Matching is exact (plus near-match *suggestions*). Batch-number formats vary between brands.
- The comparison covers only fields that were entered by hand.
- Automated tests do not cover real browsers, assistive-technology behaviour or visual layout; use the checklist above.

## Future improvements

- Review and add real source records, with page screenshots or hashes stored for audit.
- A backend or build-time pipeline to import reports, with per-record review history.
- QR/barcode scanning (browser `BarcodeDetector` or a library) after testing on real packs.
- Brand-specific batch-number formats and validation.
- A documented, peer-reviewed methodology before any form of scoring or ranking.
- Regional-language explanations and print/share-friendly report summaries.
- Accessibility audit with real screen-reader and low-vision testing.
