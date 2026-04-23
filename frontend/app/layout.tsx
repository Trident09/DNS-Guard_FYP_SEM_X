import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const BASE_URL = "https://dnsguard.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "DNS Guard — Domain Threat Intelligence",
    template: "%s | DNS Guard",
  },
  description:
    "Analyze any domain for DNS abuse, misconfigurations, phishing, typosquatting, and security threats. Free domain threat intelligence tool.",
  keywords: [
    "DNS security", "domain analysis", "threat intelligence", "DNSSEC",
    "phishing detection", "typosquatting", "DNS abuse", "domain scanner",
  ],
  authors: [{ name: "DNS Guard" }],
  creator: "DNS Guard",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "DNS Guard",
    title: "DNS Guard — Domain Threat Intelligence",
    description:
      "Analyze any domain for DNS abuse, misconfigurations, phishing, and security threats.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DNS Guard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DNS Guard — Domain Threat Intelligence",
    description: "Analyze any domain for DNS abuse, misconfigurations, and security threats.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
    { media: "(prefers-color-scheme: light)", color: "#f9fafb" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
