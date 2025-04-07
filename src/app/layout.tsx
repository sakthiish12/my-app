import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "SocioPrice - AI-Powered Pricing Intelligence",
  description: "Optimize your pricing with AI-powered audience analytics and market insights",
  keywords: ["pricing intelligence", "social media analytics", "AI pricing", "creator economy"],
  authors: [{ name: "SocioPrice" }],
  openGraph: {
    title: "SocioPrice - AI-Powered Pricing Intelligence",
    description: "Optimize your pricing with AI-powered audience analytics and market insights",
    type: "website",
    locale: "en_US",
    siteName: "SocioPrice",
  },
  twitter: {
    card: "summary_large_image",
    title: "SocioPrice - AI-Powered Pricing Intelligence",
    description: "Optimize your pricing with AI-powered audience analytics and market insights",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <AuthProvider>
            {children}
          </AuthProvider>
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
