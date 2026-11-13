import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nvidia Escape: Silicon Valley Run",
  description: "A 3D Parody Endless Runner starring Jensen Huang escaping Wall Street, Divorce, Board Members & Chinese PM!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full w-full overflow-hidden select-none">
      <body className="h-full w-full overflow-hidden bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}

