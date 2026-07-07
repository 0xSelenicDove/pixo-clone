import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

function getScrapedRoutes() {
  const baseDir = path.join(process.cwd(), "public/scraped-assets/pixo.video");
  const routes: { source: string; destination: string }[] = [];
  
  if (!fs.existsSync(baseDir)) return routes;
  
  const neverOverwrite = ["auth/sign-in.html", "dashboard.html"];
  const nonEngPrefixes = ["es", "fr", "ja", "ko", "pt", "ru", "zh", "vi"];
  
  function traverse(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (file.endsWith(".html")) {
        const relPath = path.relative(baseDir, fullPath);
        
        // Skip language pages
        const firstSegment = relPath.split(path.sep)[0];
        if (nonEngPrefixes.includes(firstSegment) || nonEngPrefixes.some(p => relPath === `${p}.html`)) {
          continue;
        }
        
        // Skip auth/sign-in and dashboard (mocked Clerk pages)
        const normalizedRel = relPath.replace(/\\/g, "/");
        if (neverOverwrite.includes(normalizedRel)) {
          continue;
        }
        
        const cleanName = relPath.slice(0, -5).replace(/\\/g, "/");
        if (cleanName === "index") continue;
        
        // Map clean URL (extensionless)
        routes.push({
          source: `/${cleanName}`,
          destination: `/scraped-assets/pixo.video/${normalizedRel}`,
        });
        
        // Map .html URL
        routes.push({
          source: `/${normalizedRel}`,
          destination: `/scraped-assets/pixo.video/${normalizedRel}`,
        });
      }
    }
  }
  
  traverse(baseDir);
  return routes;
}

const nextConfig: NextConfig = {
  async rewrites() {
    const scrapedRoutes = getScrapedRoutes();
    
    return [
      // Base page mapping
      {
        source: "/",
        destination: "/scraped-assets/pixo.video/index.html",
      },
      {
        source: "/index.html",
        destination: "/scraped-assets/pixo.video/index.html",
      },
      {
        source: "/auth/sign-in",
        destination: "/scraped-assets/pixo.video/auth/sign-in.html",
      },
      {
        source: "/dashboard",
        destination: "/scraped-assets/pixo.video/org-9cbd03fa/dashboard.html",
      },
      {
        source: "/auth/sign-in.html",
        destination: "/scraped-assets/pixo.video/auth/sign-in.html",
      },

      // Programmatically generated scraped routes (clean & html)
      ...scrapedRoutes,

      // Direct local Next.js image optimization requests to production CDN
      {
        source: "/scraped-next/image",
        destination: "https://pixo.video/_next/image",
      },
      {
        source: "/_next/image",
        destination: "https://pixo.video/_next/image",
      },

      // Map static assets so they load correctly relative to the page
      {
        source: "/_next/static/chunks/:path*",
        destination: "/scraped-assets/pixo.video/scraped-next/static/chunks/:path*",
      },
      {
        source: "/_next/static/media/:path*",
        destination: "/scraped-assets/pixo.video/scraped-next/static/media/:path*",
      },
      {
        source: "/scraped-next/static/chunks/:path*",
        destination: "/scraped-assets/pixo.video/scraped-next/static/chunks/:path*",
      },
      {
        source: "/scraped-next/static/media/:path*",
        destination: "/scraped-assets/pixo.video/scraped-next/static/media/:path*",
      },
      {
        source: "/images/:path*",
        destination: "/scraped-assets/pixo.video/images/:path*",
      },
      {
        source: "/videos/:path*",
        destination: "/scraped-assets/pixo.video/videos/:path*",
      },
      {
        source: "/pixo-logo.svg",
        destination: "/scraped-assets/pixo.video/pixo-logo.svg",
      },
      {
        source: "/icon@d266dcc34ef99e73",
        destination: "/scraped-assets/pixo.video/icon@d266dcc34ef99e73",
      },
    ];
  },
};

// Trigger dev server reload to pick up new scraped folders
export default nextConfig;
