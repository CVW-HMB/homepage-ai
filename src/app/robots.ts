import type { MetadataRoute } from "next";

// Deliberately does NOT mention /admin.
//
// Listing it under Disallow would be counterproductive twice over: robots.txt is
// public, so a Disallow entry advertises the exact path to anyone who reads it;
// and a disallowed URL can still end up indexed as a bare link, because the
// crawler is forbidden from fetching the page and therefore never sees the
// noindex directive that would have excluded it.
//
// Nothing on the site links to /admin, unauthenticated requests 404, and the
// pages carry noindex in both the headers and the markup. Silence here is the
// stronger position.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://vince-welke.com/sitemap.xml",
  };
}
