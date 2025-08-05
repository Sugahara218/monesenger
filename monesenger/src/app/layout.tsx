import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import {
  ClerkProvider,
  UserButton,
} from '@clerk/nextjs'

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
    <ClerkProvider>
      <html lang="ja">
        <body >
          <header className="main-header">
            <div className="header-container">
              <Link href="/" className="logo">
                想い出手帳
              </Link>
              <nav className="main-nav">
                {/* <Link href="/" className="nav-link-header">
                  検索
                </Link> */}
                <div className='flex flex-row gap-y-4'>
                  <UserButton afterSignOutUrl='/'/>
                </div>
              </nav>
              
            </div>
          </header>
          <main className="main">
            {children}
          </main>
          <footer className="mt-16 border-t border-gray-800 py-8 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Monesenger. All rights reserved.</p>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}