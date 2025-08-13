'use server';

import { enhanceMemoryWithAI } from '@/lib/gemini';
import { supabase } from '../lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';

export async function addNote(formData: FormData) {

  const serialNumber = formData.get('serial_number') as string;
  const story = formData.get('story') as string;
  const aiText = await enhanceMemoryWithAI(story);


  if (!serialNumber || !story) {
    return { message: 'シリアル番号とストーリーの両方を入力してください。' };
  }

  let serialId: number;

  // 1. シリアル番号が既に存在するか確認
  const { data: existingSerial } = await supabase
    .from('serials')
    .select('id')
    .eq('serial_number', serialNumber)
    .single();

  if (existingSerial) {
    // 存在する場合、そのIDを使用
    serialId = existingSerial.id;
  } else {
    // 存在しない場合、新しく挿入してIDを取得
    const { data: newSerial, error: insertError } = await supabase
      .from('serials')
      .insert({ serial_number: serialNumber })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error inserting serial:', insertError);
      return { message: 'データベースエラーが発生しました。(serials)' };
    }
    serialId = newSerial.id;
  }

  // ログインユーザーIDを取得
  const user_id = await auth();

  // 2. 取得したserialIdを使ってmessagesテーブルにストーリーを挿入
  const { error: messageError } = await supabase
    .from('messages')
    .insert({ serial_id: serialId, message_text: story, ai_text: aiText ,user_id: user_id.userId ,});

  if (messageError) {
    console.error('Error inserting message:', messageError);
    return { message: 'データベースエラーが発生しました。(messages)' };
  }
  console.log(aiText);
  // データを再検証して一覧ページを更新
  revalidatePath('/serials');
  return { message: `シリアル番号「${serialNumber}」に新しい思い出を登録しました。` , aiMessage: aiText };
}

export async function searchSerial(serialNumber: string) {
  if (!serialNumber) return null;

  const { data, error } = await supabase
    .from('serials')
    .select('*, messages(*, created_at)')
    .eq('serial_number', serialNumber.toUpperCase())
    .order('created_at', { foreignTable: 'messages', ascending: false })
    .single();

  if (error) {
    console.error('Search error:', error);
    return null;
  }

  return data;
}


export async function searchSerialToUser(user_id: string|null) {
  if (!user_id) return null;

  // user_idが同じメッセージを全て取得し、対応するserialsテーブルの情報も一緒に取得
  const { data: messagesData, error: messagesError } = await supabase
    .from('messages')
    .select(`
      message_text, 
      ai_text, 
      created_at,
      serial_id,
      serials!inner(serial_number)
    `)
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (messagesError) {
    console.error('Messages search error:', messagesError);
    return null;
  }

  return messagesData;
}