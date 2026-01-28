import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pastebin Lite",
  description: "Secure, ephemeral paste sharing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} antialiased bg-gray-950 text-gray-100 min-h-screen flex flex-col`}
      >
        <main className="flex-grow container mx-auto px-4 py-8">
            {children}
        </main>
        <footer className="py-4 text-center text-gray-500 text-sm">
            Pastebin Lite &copy; {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
