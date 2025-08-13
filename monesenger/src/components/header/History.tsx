import { searchSerialToUser } from '@/app/_actions';
import { auth } from '@clerk/nextjs/server';
import React from 'react'
import PropoverHistory from './PopoverHistory';

export default async function History() {
    // サーバーサイドでユーザー認証情報を取得
    const { userId }: { userId: string | null } = await auth();
    // ユーザーIDを元に自身が登録した投稿一覧を取得
    const userMessages = await searchSerialToUser(userId);
    // const ai_text = JSON.stringify(userMessages.);

    return (
        <>
            {userId && userMessages && (
                <div>
                    <PropoverHistory userMessages={userMessages} />
                </div>
            )}
        </>
    );
}
