import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export interface MessageWithSerial {
  id: number;
  message_text: string;
  ai_text?: string;
  created_at: string;
  serial_id: number;
  serials: {
    serial_number: string;
  };
}



export async function getLatestMessages():Promise<MessageWithSerial[] | null> {
    const cookieStore = await cookies();
    // Todo
    const supabase = createServerComponentClient({ cookies: async() => cookieStore });
  
    // ①：データベースから `messages` テーブルを
    // ②：`created_at` カラムの降順（新しいものが先頭）で並び替え
    // ③：最初の3件だけを取得する
    const { data: messages }= await supabase
      .from('messages')
      .select(`
        id,
        message_text, 
        ai_text, 
        created_at,
        serial_id,
        serials!inner(serial_number)
      `)
      .order('created_at', { ascending: false }) // ★新しい順
      .limit(3);                                // ★3件だけ

        // クライアントコンポーネントに初期データとして渡す
    // messagesがnullの場合も考慮して空配列を渡す
    return messages as MessageWithSerial[] | null;
}