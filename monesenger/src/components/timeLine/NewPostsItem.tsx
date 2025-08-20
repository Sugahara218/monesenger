"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { dataFormat } from "../header/PopoverHistory";
import { MessageWithSerial } from "@/lib/messageQueries";


type RealtimeMessagesProps = {
    serverMessages: MessageWithSerial[];
};

export function truncateString(str:string, maxLength:number) {
    // 文字列の長さが最大長以下なら、そのまま返す
    if (str.length <= maxLength) {
      return str;
    }
  
    // 最大長を超えていれば、文字列を切り取って末尾に「...」を付ける
    return str.substring(0, maxLength) + '...';
}


export default function NewPostsItem ({ serverMessages }: RealtimeMessagesProps){
    const router = useRouter();
    const supabase = createClientComponentClient();
    const [messages, setMessages] = useState([...serverMessages].reverse());

    useEffect(() => {
        // こちらも同様に逆順にしてstateを更新
        setMessages([...serverMessages].reverse());
    }, [serverMessages]);

    // リアルタイム購読のロジック
    useEffect(() => {
        const channel = supabase
        .channel('realtime messages')
        .on(
            'postgres_changes',
            {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            },
            () => {
            // サーバーに最新データを再度問い合わせる
            router.refresh();
            }
        )
    .subscribe();
    // コンポーネントが不要になったら購読を解除
    return () => {
        supabase.removeChannel(channel);
      };
    }, [supabase, router]);

    return (
        <ul className="Hotlikesul">
            {messages.map((message) => {
                const aiText = message.ai_text ? JSON.parse(message.ai_text) : null;
                // console.log('Message data:', message); // デバッグ用
                return (
                    <li className="Hotlikesli" key={message.id} >
                        <span className="HotlikesSpan">{message.serials?.serial_number || 'No serial'}</span>
                        <h4>{truncateString(aiText?.title || 'No title', 15)}</h4>
                        <p>{truncateString(aiText?.summary || 'No summary', 15)}</p>
                        <p className="date">{dataFormat(message.created_at)}</p>
                    </li>
                );
            })}
        </ul>
        
    )
}


