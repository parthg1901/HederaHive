import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AllWalletsProvider } from "@/services/wallets/AllWalletsProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const brolink = localFont({
  src: "./fonts/Brolink-Regular.ttf",
  variable: "--font-brolink",
  weight: "100 900",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "HederaHive | Payments that Scale",
  description: "Payments that Scale",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${brolink.variable} antialiased`}
      >
        <AllWalletsProvider>
          {children}
        </AllWalletsProvider>
      </body>
    </html>
  );
}
