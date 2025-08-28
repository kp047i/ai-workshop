import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Workshop",
  description: "文章生成と画像生成の体験アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-background font-sans text-base lg:text-lg">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
