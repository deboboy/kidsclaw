import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.kidsclaw.club"),
  title: "KidsClaw - Educational Games for Kids",
  description:
    "Fun, safe, educational AI-powered games for kids aged 9-11. Science, math, and space exploration!",
  openGraph: {
    title: "KidsClaw - Educational Games for Kids",
    description:
      "AI-powered science, math, and space exploration games. No app install. No login for kids. Just scan and play.",
    siteName: "KidsClaw",
    type: "website",
    url: "https://www.kidsclaw.club",
  },
  twitter: {
    card: "summary_large_image",
    title: "KidsClaw - Educational Games for Kids",
    description:
      "AI-powered science, math, and space exploration games. No app install. No login for kids. Just scan and play.",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
