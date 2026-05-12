import type { Metadata } from "next";
import { Heebo, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageEffect } from "@/components/site/language-effect";
import { ThemeEffect } from "@/components/site/theme-effect";
import { ThemeScript } from "@/components/site/theme-script";
import { TooltipProvider } from "@/components/ui/tooltip";

const heebo = Heebo({
  variable: "--font-sans",
  subsets: ["latin", "hebrew"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${heebo.variable} ${geistMono.variable} dark h-full antialiased`}
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
