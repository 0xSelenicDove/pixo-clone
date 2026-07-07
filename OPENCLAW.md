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
After crawling/sciping new content, the HTML files will contain incorrect relative paths or references to `_next/` or mangled `srcset` paths. You **MUST** run our pre-configured patch script to normalize them:

```bash
node patch_html.js
```
* **What this script does:**
  1. Normalizes relative path chains (like `../../`) in subdirectories to absolute paths pointing to `/scraped-assets/pixo.video/`.
  2. Injects correct attributes (`src`, `autoplay`, and `preload`) into static native `<video>` elements.
  3. Strips mangled 404-prone `srcset`/`srcSet` strings on scraped tags, forcing clean browser fallbacks to native WebP/SVGs.
  4. Mappings `_next/` references in the HTML files to `scraped-next/`.

### 3. Add Custom Route Mappings (Optional)
If a newly scraped page needs a clean, extensionless route (e.g. `/my-new-page` routing to `my-new-page.html`):
1. Open [next.config.ts](file:///Users/hutao/github/pixo-clone/next.config.ts).
2. Append a new rewrite mapping to the `rewrites()` array.

---

## 🔒 Custom Mocked Pages (Do Not Overwrite)
The following mock files have been manually implemented to bypass Clerk.com API server limitations on localhost:
* [public/scraped-assets/pixo.video/auth/sign-in.html](file:///Users/hutao/github/pixo-clone/public/scraped-assets/pixo.video/auth/sign-in.html) – Mocked dark-theme Pixo sign-in form redirecting to `/dashboard`.
* [public/scraped-assets/pixo.video/dashboard.html](file:///Users/hutao/github/pixo-clone/public/scraped-assets/pixo.video/dashboard.html) – Mocked light-theme dashboard page with user creation panel, prompt tool actions, and custom community gallery cards.
