import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"]
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex",
  weight: ["400", "500", "600", "700"]
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"]
});

export const metadata: Metadata = {
  title: "Samadhan Setu — Civic issue reporting with proof",
  description:
    "File civic complaints with live, GPS-tagged photos. Track them from filed to fixed, with a tamper-evident record at every step.",
  icons: {
    icon: "/icon.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body className="font-sans antialiased selection:bg-amber-100">
        {/* Indian National Tricolor Ribbon */}
        <div className="sticky top-0 z-50 w-full shadow-xs">
          <div className="h-[2.5px] bg-[#FF9933] w-full" />
          <div className="h-[1.5px] bg-white w-full" />
          <div className="h-[2.5px] bg-[#138808] w-full" />
        </div>
        {children}
      </body>
    </html>
  );
}
