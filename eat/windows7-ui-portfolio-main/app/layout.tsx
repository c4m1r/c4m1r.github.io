import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "7.css/dist/7.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gividu Elladeniya | Portfolio",
  description: "Portfolio of Gividu Elladeniya — a Windows 7 themed interactive desktop experience.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Gividu Elladeniya | Portfolio",
    description: "Portfolio of Gividu Elladeniya — a Windows 7 themed interactive desktop experience.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gividu Elladeniya | Portfolio",
    description: "Portfolio of Gividu Elladeniya — a Windows 7 themed interactive desktop experience.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
