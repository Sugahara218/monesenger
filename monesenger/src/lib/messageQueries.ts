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
    const supabase = createServerComponentClient({ cookies: async() => cookieStore });
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
      .order('created_at', { ascending: false }) 
      .limit(3);

    return messages as MessageWithSerial[] | null;
}