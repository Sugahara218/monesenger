import { searchSerialToUser } from '@/app/_actions';
import { auth } from '@clerk/nextjs/server';
import React from 'react'
import PropoverHistory from './PopoverHistory';

export default async function History() {
    const { userId }: { userId: string | null } = await auth();
    const userMessages = await searchSerialToUser(userId);

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
