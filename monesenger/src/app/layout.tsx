import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import {
  ClerkProvider,
  UserButton,
} from '@clerk/nextjs'
import History from "@/components/header/History";
import GoogleMapsProvider from "@/components/providers/GoogleMapsProvider";
import { auth } from "@clerk/nextjs/server";
import { searchSerialToUser } from "./_actions";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "お札の想い出記録帳",
  description: "お札のシリアル番号に、あなたの想い出を刻みましょう。",
};

export  default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();
  const userMessagesPromise = searchSerialToUser(userId);
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
                <div className='flex flex-row gap-y-4'>
                  <UserButton />
                </div>
                <Suspense fallback={<div>ローディング中…</div>}>
                  <History userMessagesPromise = {userMessagesPromise} userId={userId}/>
                </Suspense>
              </nav>
            </div>
          </header>
          <GoogleMapsProvider>
            <main className="main">
              {children}
            </main>
          </GoogleMapsProvider>
          <footer className="mt-16 border-t border-gray-800 py-8 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Monesenger. All rights reserved.</p>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}