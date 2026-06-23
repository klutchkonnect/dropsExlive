import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DropsEx — Delivery Tracking Infrastructure",
  description: "Real-time delivery tracking for Lagos businesses. Every drop, tracked.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
