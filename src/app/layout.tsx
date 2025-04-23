import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Daily Prompt - Personal AI Reflection",
  description: "Get a new personal reflection prompt every day for your AI conversations",
  keywords: ["daily prompt", "AI prompt", "self-reflection", "personal growth", "AI conversation"],
  authors: [{ name: "Sakthiish Vijayadass" }],
  openGraph: {
    title: "Daily Prompt - Personal AI Reflection",
    description: "Get a new personal reflection prompt every day for your AI conversations",
    type: "website",
    locale: "en_US",
    siteName: "Daily Prompt",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Prompt - Personal AI Reflection",
    description: "Get a new personal reflection prompt every day for your AI conversations",
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
} 