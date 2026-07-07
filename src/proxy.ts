import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const url = new URL(request.url);

  // Intercept the Next.js optimized image requests
  if (url.pathname === "/_next/image") {
    const imageUrl = url.searchParams.get("url");
    const w = url.searchParams.get("w");
    const q = url.searchParams.get("q");

    if (imageUrl && w && q) {
      // Replicate the wget filename format by double-encoding slashes as %252F
      // This is because Next.js will decode the rewritten path once before checking the filesystem.
      const encodedUrl = imageUrl.replace(/\//g, "%252F");
      const filename = `image@url=${encodedUrl}&w=${w}&q=${q}`;

      // Rewrite internally to the non-reserved static folder
      return NextResponse.rewrite(
        new URL(`/scraped-assets/pixo.video/scraped-next/${filename}`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/_next/image",
  ],
};
