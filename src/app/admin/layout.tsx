import type { Metadata } from "next";

// Applies to /admin and /admin/login. Belt and braces alongside the
// X-Robots-Tag header set in next.config.ts — a crawler that somehow reaches
// either page sees noindex in the markup as well as in the response headers.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
