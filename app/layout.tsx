import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WalletConnect from "@/components/WalletConnect";
import ClientWithdrawWrapper from "@/components/ClientWithdrawWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wiser - Card Creation Platform",
  description: "Create and manage your cards with Wiser",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletConnect>
          <main>
            {children}
          </main>
          <ClientWithdrawWrapper />
        </WalletConnect>
      </body>
    </html>
  );
}
