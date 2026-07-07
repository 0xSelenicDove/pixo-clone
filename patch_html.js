const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'public/scraped-assets/pixo.video');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Normalize relative paths (e.g. "../" or "../../") in nested directories to absolute paths first
  content = content.replace(/(href|src)=(["'])(\.\.\/)+/g, '$1=$2/scraped-assets/pixo.video/');

  // Inject correct src, autoplay, and preload attributes into the empty <video> tags sequentially
  let videoCount = 0;
  content = content.replace(/<video([^>]*)>/gi, (match, p1) => {
    videoCount++;
    // Avoid double-patching if a src is already defined
    if (match.includes('src=')) return match;
    
    if (videoCount === 1) {
      return `<video${p1} src="/scraped-assets/pixo.video/videos/demo-video-en.mp4" preload="metadata">`;
    } else if (videoCount === 2) {
      return `<video${p1} src="/scraped-assets/pixo.video/videos/feature-ai-agents.mp4" autoplay="" preload="auto">`;
    } else if (videoCount === 3) {
      return `<video${p1} src="/scraped-assets/pixo.video/videos/feature-team-collab.mp4" autoplay="" preload="auto">`;
    } else if (videoCount === 4) {
      return `<video${p1} src="/scraped-assets/pixo.video/videos/feature-video-series.mp4" autoplay="" preload="auto">`;
    }
    return match;
  });

  // Remove the corrupted srcset and srcSet attributes from all images to force fallback to clean src attribute
  content = content.replace(/srcset="[^"]*"/gi, '');
  content = content.replace(/srcSet="[^"]*"/gi, '');

  // Ensure all video tags have muted, loop, and playsinline attributes to bypass browser autoplay blocks
  content = content.replace(/<video\b([^>]*)/gi, (match) => {
    let updated = match;
    if (!updated.toLowerCase().includes('muted')) updated += ' muted=""';
    if (!updated.toLowerCase().includes('loop')) updated += ' loop=""';
    if (!updated.toLowerCase().includes('playsinline')) updated += ' playsinline=""';
    return updated;
  });

  // Replace all occurrences of _next/ with scraped-next/ (handles absolute, relative, and nested paths)
  content = content.replace(/_next\//g, 'scraped-next/');
  content = content.replace(/\/_next\//g, '/scraped-next/');

  // Force all Next.js optimized image requests (both absolute and relative) to fetch directly from production live site
  content = content.replace(/src=["'](?:\/scraped-assets\/pixo\.video)?\/scraped-next\/image\?/gi, 'src="https://pixo.video/_next/image?');
  content = content.replace(/src=["']https:\/\/pixo\.video\/scraped-next\/image\?/gi, 'src="https://pixo.video/_next/image?');
  content = content.replace(/src=["']https:\/\/pixo\.video\/_next\/image\?/gi, 'src="https://pixo.video/_next/image?');

  // Replace other resource paths to point directly to the scraped-assets folder
  content = content.replace(/(["'])(images\/)/g, '$1/scraped-assets/pixo.video/$2');
  content = content.replace(/(["'])\/images\//g, '$1/scraped-assets/pixo.video/images/');
  content = content.replace(/(["'])(pixo-logo)/g, '$1/scraped-assets/pixo.video/$2');
  content = content.replace(/(["'])\/pixo-logo/g, '$1/scraped-assets/pixo.video/pixo-logo');
  content = content.replace(/(["'])(icon@d266dcc34)/g, '$1/scraped-assets/pixo.video/$2');
  content = content.replace(/(["'])\/icon@d266dcc34/g, '$1/scraped-assets/pixo.video/icon@d266dcc34');
  content = content.replace(/(["'])(videos\/)/g, '$1/scraped-assets/pixo.video/$2');
  content = content.replace(/(["'])\/videos\//g, '$1/scraped-assets/pixo.video/videos/');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Patched asset paths, normalized relative paths, and removed corrupted srcset in: ${filePath}`);
}

function traverseAndPatch(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverseAndPatch(fullPath);
    } else if (file.endsWith('.html')) {
      patchFile(fullPath);
    }
  }
}

traverseAndPatch(targetDir);
console.log('HTML asset path normalization and relative path fixing complete!');
