# CLAUDE.md — Frontend Website Rules

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. 
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server: `node serve.mjs` (serves the project root at `http://localhost:3000`)
- `serve.mjs` lives in the project root. Start it in the background before taking any screenshots.
- If the server is already running, do not start a second instance.

## Screenshot Workflow
- **Always screenshot from localhost:** `node screenshot.mjs http://localhost:3000`
- Screenshots are saved automatically to `./temporary screenshots/screenshot-N.png`.
- Optional label suffix: `node screenshot.mjs http://localhost:3000 label` → saves as `screenshot-N-label.png`
- `screenshot.mjs` lives in the project root. Use it as-is.
- Optional selection of individual elements by ID: `node screenshot.mjs http://localhost:3000 galerie "#galerie"` → creates a screenshot of an element with the ID "#galerie"
- Optional selection of individual elements by CSS-Selector: `node screenshot.mjs http://localhost:3000 cards ".features-grid"` → creates a screenshot of an element with the CSS-Selector ".features-grid"
- Optional simulation of DOM manipulation: `node screenshot.mjs http://localhost:3000 nav-scrolled "nav" "document.getElementById('main-nav').classList.add('scrolled')"` → creates a screenshot after executing javascript
- **Optional viewport override (6th argument, format `WxH`):** `node screenshot.mjs http://localhost:3000 mobile null null 402x874` → renders at iPhone 17 Pro dimensions
- After screenshotting, read the PNG from `temporary screenshots/` with the Read tool — Claude can see and analyze the image directly.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing

## Brand Assets
- Always check the `brand_assets/` folder before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values — do not invent brand colors.
- Use brand assets at a size where they are clearly recognizable, or omit
  them entirely. No decorative logo placements that sacrifice legibility.

## Mobile Viewport Testing
- After any nav, layout, or responsive work: always take a mobile screenshot at **402 × 874** (iPhone 17 Pro CSS px) before finishing.
- Command: `node screenshot.mjs http://localhost:3000 mobile "" "" 402x874`
- Explicitly check in the screenshot:
  1. Hamburger button visible and not clipped
  2. No horizontal scroll (no element forces layout wider than the viewport)
  3. All text legible at mobile size
- **`overflow-x: hidden` must always be on both `html` AND `body`** — never only on `body`. Firefox transfers horizontal scroll to the `html` element, which shifts `position: fixed` elements (like the nav) out of view.

## Output Defaults
- Single `index.html` file, all styles inline, unless user says otherwise
- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Mobile-first responsive
- Placeholder images: Use images from `https://picsum.photos/seed/{CONTENT_BASED_SEED}/200/300`, where you replace {CONTENT_BASED_SEED} with a keyword from your content (200 = width, 300 = height). For example: seed/mountain-hiking/200/300 for hiking content, or seed/web-design/200/300 for design articles — this ensures the same image appears consistently for the same topic.

## Readability Contract
- **Every text element must be legible at all times** — no exceptions for any scroll state, section, or breakpoint.
- **Never rely on a background image for text contrast.** Images vary. Always add a guaranteed contrast layer:
  - Text over images → `text-shadow` + gradient overlay behind the text area
  - Nav on transparent/hero background → dark-to-transparent gradient behind the nav (e.g. `rgba(0,0,0,0.55) → transparent`)
  - Nav on scrolled/light background → real dark color (e.g. `#1E1108`), not a muted gray
- **After every screenshot pass, explicitly check:**
  1. Nav links readable on hero? (Check against brightest part of the image)
  2. Nav links readable when scrolled? (Check against the light background)
  3. All body text readable on its section background?
  4. Text over images readable in every card/gallery caption?

## Navigation
- Always implement a responsive nav: desktop links visible, mobile links
  hidden behind a hamburger menu that opens a fullscreen or drawer overlay.
- Only place a logo in the nav if it is legible at nav height. Otherwise
  use a text wordmark. Never scale a complex logo down until it becomes
  unreadable.

## Contact & CTAs
- Never resolve a "contact" or "enquiry" CTA with a bare mailto:/tel: link.
  Always use a form with appropriate fields, client-side validation, and a
  visible confirmation state after submission.

## Lighthouse Audit (after Design Completion)
- **Run after all design iterations and screenshot comparisons are done.**
- Create the `seo/` directory if it doesn't exist: `mkdir -p seo`
- Run: `npx lighthouse http://localhost:3000 --output json --output-path ./seo/lighthouse.json`
- Read and interpret the resulting `seo/lighthouse.json`. Summarize the four category scores (Performance, Accessibility, Best Practices, SEO) and all failing audits to the user.
- Fix all issues that are within your control. Iterate: fix → re-run Lighthouse → check scores → repeat until all scores are (near) perfect.
- If certain scores are structurally limited by the project setup (e.g. CDN dependencies, external resources), document these trade-offs when reporting results instead of trying to work around them.

## Hard Rules
- If no reference image: design from scratch with high craft (see frontend-design skill)
- If reference available:
  - Do not add sections, features, or content not in the reference
  - Do not "improve" a reference design — match it
- Do not stop after one screenshot pass