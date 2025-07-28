import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "お札の思い出記録帳",
  description: "お札のシリアル番号に、あなたの思い出を刻みましょう。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-black text-white`}>
        <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/80 backdrop-blur-lg">
          <div className="container mx-auto flex h-16 max-w-4xl items-center justify-between p-4">
            <Link href="/" className="text-2xl font-bold text-white">
              Monesenger
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/" className="text-gray-300 transition-colors hover:text-gold-400">
                検索
              </Link>
              <Link href="/register" className="text-gray-300 transition-colors hover:text-gold-400">
                登録
              </Link>
              <Link href="/serials" className="text-gray-300 transition-colors hover:text-gold-400">
                一覧
              </Link>
            </nav>
          </div>
        </header>
        <main className="container mx-auto max-w-4xl p-4 sm:p-8">
          {children}
        </main>
        <footer className="mt-16 border-t border-gray-800 py-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Monesenger. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}