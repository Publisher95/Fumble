import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const allianceNo1 = localFont({
  src: "./fonts/Alliance No.1 Light.otf",
  variable: "--font-alliance-no1",
  weight: "300", // Light weight
});

export const metadata: Metadata = {
  title: "Fumble",
  description: "Dating App Profile",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${allianceNo1.variable} antialiased bg-zinc-100 text-zinc-900`}
      >
        {children}
      </body>
    </html>
  );
}
