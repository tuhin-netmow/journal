import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | International Journal of Advanced Scientific Research",
    default: "International Journal of Advanced Scientific Research (IJASR)",
  },
  description:
    "A premier peer-reviewed, open-access international journal dedicated to publishing high-impact scholarly research across science, technology, and engineering.",
  keywords: [
    "academic journal",
    "scientific research",
    "open access",
    "peer-reviewed articles",
    "IJASR",
  ],
  authors: [{ name: "Apex Scholarly Publishing" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "International Journal of Advanced Scientific Research",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${merriweather.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
