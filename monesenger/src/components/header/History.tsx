import { searchSerialToUser } from '@/app/_actions';
import React, { use } from 'react'
import PropoverHistory from './PopoverHistory';

type UserMessagesPromise =
      ReturnType<typeof
      searchSerialToUser>;

interface HistoryProps {
    userId: string | null;
    userMessagesPromise:UserMessagesPromise;
}

export default function History({userId,userMessagesPromise}
:HistoryProps
) {
    const userMessages = use(userMessagesPromise);
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
