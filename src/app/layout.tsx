import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oura Dashboard",
  description: "Advanced health analytics powered by Oura Ring",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navigation />
        <main className="ml-56 min-h-screen p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
