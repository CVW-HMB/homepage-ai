import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vince Welke | Engineering Leader",
  description:
    "Engineering leader with 10+ years building data platforms and leading teams. PhD Physics from UC San Diego, experience at FICO, LiveRamp, and DeepSync. Based in San Diego.",
  keywords: [
    "Vince Welke",
    "Data Engineer",
    "Engineering Leader",
    "San Diego",
    "Data Platforms",
    "Machine Learning",
    "Python",
    "AWS",
  ],
  authors: [{ name: "Vince Welke" }],
  creator: "Vince Welke",
  openGraph: {
    title: "Vince Welke | Engineering Leader",
    description:
      "Engineering leader with 10+ years building data platforms and leading teams. PhD Physics, based in San Diego.",
    url: "https://vince-welke.com",
    siteName: "Vince Welke",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Vince Welke | Engineering Leader",
    description: "Engineering leader with 10+ years building data platforms and leading teams.",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://vince-welke.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
