import type { Metadata } from "next";
import { Heebo, Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import { LanguageEffect } from "@/components/site/language-effect";
import { ThemeEffect } from "@/components/site/theme-effect";
import { ThemeScript } from "@/components/site/theme-script";
import { TooltipProvider } from "@/components/ui/tooltip";

// Heebo covers Hebrew text (RTL default). Inter handles English UI. Fira Code
// is used inside `<code>` blocks - the tabular figures and tighter glyphs read
// better next to SAP tcode patterns like MD01N / ME21N.
const heebo = Heebo({
  variable: "--font-sans",
  subsets: ["latin", "hebrew"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Fira_Code({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SAP AI Knowledge Hub",
  description:
    "Copilot for SAP implementers - chat with SAP Press core titles in Hebrew, with grounded citations and visualizations.",
  authors: [{ name: "Sali Halif" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      suppressHydrationWarning
      data-theme="dark"
      className={`${heebo.variable} ${inter.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full bg-background text-foreground flex flex-col">
        <LanguageEffect />
        <ThemeEffect />
        <TooltipProvider delay={150}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
