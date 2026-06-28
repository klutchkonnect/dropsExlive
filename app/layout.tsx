import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DropsEx — Real-Time Delivery Tracking by Klutch Konnect",
  description:
    "Lagos farm-to-door delivery with real-time tracking. Every order gets a unique KLUTCH tracking ID — your customers watch their delivery live. By Klutch Konnect.",
};

export const viewport: Viewport = {
  themeColor: "#080808",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-background" style={{ background: "#080808" }}>
      <body>{children}</body>
    </html>
  );
}
