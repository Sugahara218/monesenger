import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import RegisterPage from "./register/page";

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
      <body >
      <header className="main-header">
        <div className="header-container">
          <Link href="/" className="logo">
            Monesenger
          </Link>
          <nav className="main-nav">
            <Link href="/" className="nav-link-header">
              検索
            </Link>
          </nav>
          {/* モバイルメニューボタン（オプション） */}
          {/* <button className="mobile-menu-button">
            ☰
          </button> */}
        </div>
      </header>
        <main className="main">
          {children}
          <RegisterPage/>
        </main>
        <footer className="mt-16 border-t border-gray-800 py-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Monesenger. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}