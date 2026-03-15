"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import TokenSetup from "@/components/TokenSetup";
import { getStoredToken } from "@/lib/useOuraData";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    setHasToken(!!getStoredToken());
  }, []);

  // Still checking
  if (hasToken === null) {
    return (
      <html lang="en">
        <body className="antialiased" />
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <title>Oura Dashboard</title>
        <meta name="description" content="Advanced health analytics powered by Oura Ring" />
      </head>
      <body className="antialiased">
        {!hasToken ? (
          <TokenSetup onTokenSet={() => {
            setHasToken(true);
            window.location.reload();
          }} />
        ) : (
          <>
            <Navigation />
            <main className="ml-56 min-h-screen p-6">
              {children}
            </main>
          </>
        )}
      </body>
    </html>
  );
}
