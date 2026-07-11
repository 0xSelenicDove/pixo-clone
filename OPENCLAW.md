# OpenClaw Scraper & Pipeline Instructions

Welcome! This repository is a Next.js-based static cloned representation of the production website `https://pixo.video`. 
We have established a robust, hot-reloading development server and asset pipeline on `http://localhost:3000`.

---

## 🛠️ Project Architecture

1. **Scraped Assets Directory:**
   * All scraped HTML, CSS, JS, and media files are stored under [public/scraped-assets/pixo.video/](file:///Users/hutao/github/pixo-clone/public/scraped-assets/pixo.video/).
2. **Next.js Asset Loader & Client Bundles:**
   * Next.js configuration is set up in [next.config.ts](file:///Users/hutao/github/pixo-clone/next.config.ts) to transparently redirect all requests under `/scraped-next/` and `/scraped-assets/` directly to their local counterparts in the `public` directory.
3. **Dynamic Client Image Proxy:**
   * Client-side hydrated dynamic images that query `/_next/image` are dynamically proxied using our custom Next.js router interceptor under [src/proxy.ts](file:///Users/hutao/github/pixo-clone/src/proxy.ts) to fallback to local scraped files without 404s.

---

## 🚀 Tasks for OpenClaw

When processing, downloading, or verifying additional pages of the clone:

### 1. Crawl & Download Additional Pages
* Place newly scraped static pages (.html, .js, .css, etc.) into their correct corresponding paths inside `public/scraped-assets/pixo.video/`.
* Maintain the English-only crawling criteria (`"Just english pag"`).

### 2. Run the HTML Asset Patch Script
After crawling/scraping new content, the HTML files will contain incorrect relative paths or references to `_next/` or mangled `srcset` paths. You **MUST** run our pre-configured patch script to normalize them:

```bash
node patch_html.js
```
* **What this script does:**
  1. Normalizes relative path chains (like `../../`) in subdirectories to absolute paths pointing to `/scraped-assets/pixo.video/`.
  2. Injects correct attributes (`src`, `autoplay`, and `preload`) into static native `<video>` elements.
  3. Strips mangled 404-prone `srcset`/`srcSet` strings on scraped tags, forcing clean browser fallbacks to native WebP/SVGs.
  4. Mappings `_next/` references in the HTML files to `scraped-next/`.

### 3. Add Custom Route Mappings (Optional)
If a newly scraped page needs a clean, extensionless route (e.g. `/pricing` routing to `pricing.html`):
1. Open [next.config.ts](file:///Users/hutao/github/pixo-clone/next.config.ts).
2. Append a new rewrite mapping to the `rewrites()` array.

---

## 🔒 Custom Mocked Pages & High-Fidelity Interactivity

The following pages and logic scripts have been customized to support local offline interactivity and bypass Clerk.com API server limitations on localhost:

### 1. Mocked Authentication Flow
* [public/scraped-assets/pixo.video/auth/sign-in.html](file:///Users/hutao/github/pixo-clone/public/scraped-assets/pixo.video/auth/sign-in.html) – Mocked dark-theme Pixo sign-in form redirecting to `/dashboard`.

### 2. Interactive Local Dashboard Logic
* [public/scraped-assets/pixo.video/local-interactivity.js](file:///Users/hutao/github/pixo-clone/public/scraped-assets/pixo.video/local-interactivity.js) – Core script containing all interactive simulations.

### 3. Key Interactivity Features Implemented:
* **Workspace Mode Toggle Switch:**
  * Swapping between **Agent** and **Model** modes dynamically modifies the prompt input toolbar layout.
  * *Agent Mode* displays standalone aspect ratio, resolution, and duration selectors.
  * *Model Mode* replaces standalone selectors with the custom Output Type selection (`Video`) and a **Unified Settings button** displaying `16:9 · 720p · 8s` (dynamically compiled).
* **Model Picker Dropdown Popup:**
  * Displays Pinned models (`Seedance 2.0`), a searchable list of Providers (ByteDance, Google, Kuaishou, MiniMax, OpenAI, WAN) with their brand logo SVGs, and locked models (Grok Imagine, LTX 2.3, Pixverse).
  * Selection updates trigger button styling, icon, and text dynamically.
* **Unified Settings Popup:**
  * Hosts sliders for Duration and Num Generations, coin cost resolution buttons (`480p` and `720p`), Aspect Ratio comboboxes, and Generate Audio checkboxes.
* **Create New Project Modal:**
  * Compact light-themed container featuring `Video` vs `Series` cards.
  * Aspect ratio miniature graphics (`16:9`, `9:16`, `1:1`).
  * Resolution cost multiplier coin icons.
  * Custom duration text input field with strict `5s - 180s` validations.
* **Stand-Alone Duration Custom Input Box:**
  * Clicking "Custom" in the dashboard dropdown opens a custom inline text box.
  * Event propagation is stopped on clicks inside the text input to prevent the popup from closing, and values update the parent button label dynamically as the user types.
  * Includes validation checks on click-outside, defaulting back to `10s` if empty or out-of-range (`5s - 180s`).
* **Active Simulations Ledger:**
  * All generated prompts deduct credits and render playable AI simulated loop videos inside the bottom-right progress panel, compiling results into the LocalStorage projects history.
