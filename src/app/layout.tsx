import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import ClientHeader from "@/components/ClientHeader";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudySphere_co Mock Test Platform",
  description: "UPSC & Competitive Exam Mock Tests platform. Practice with exam-oriented mock tests and analyze your preparation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <body>
        <ClientHeader />
        
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
