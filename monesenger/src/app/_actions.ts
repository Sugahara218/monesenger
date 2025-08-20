'use server';

import { enhanceMemoryWithAI } from '@/lib/gemini';
import { supabase } from '../lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { MessageWithSerial } from '@/lib/messageQueries';

interface LocationData {
  lat: number;
  lng: number;
  loading: boolean;
}

// 全体のオブジェクト構造を表す型
interface DBResponse {
  locations: (LocationData | null)[];
}

// data配列の各要素の型
interface LocationItem {
  id: number; 
  serial_id: string;
  location: LocationData | null;
  message_text: string,
  ai_text: string,
}

// この関数が返すオブジェクトの型
interface DBResponseHaveID {
  locations: LocationItem[];
}

export async function addNote(formData: FormData,location:object) {

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
    .insert({ serial_id: serialId, message_text: story, ai_text: aiText ,user_id: user_id.userId ,location:location});

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


export async function searchSerialToUser(user_id: string|null): Promise<MessageWithSerial[] | null> {
  if (!user_id) return null;

  // user_idが同じメッセージを全て取得し、対応するserialsテーブルの情報も一緒に取得
  const { data: messagesData, error: messagesError } = await supabase
    .from('messages')
    .select(`
      id,
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
  
  if (!messagesData) {
    return null;
  }

  // Supabaseからのデータ（serialsが配列）の型を定義
  type SupabaseMessage = {
    id: number;
    message_text: string;
    ai_text: string;
    created_at: string;
    serial_id: number;
    serials: {
      serial_number: string;
    }[];
  };

  // anyの代わりに定義した型を使い、データを安全に変換
  const formattedData = (messagesData as SupabaseMessage[]).map((message) => ({
    ...message,
    // serialsが配列で、要素が1つ以上あることを確認してから最初の要素をセット
    serials: (message.serials && message.serials.length > 0) ? message.serials[0] : { serial_number: '' },
  }));

  return formattedData as MessageWithSerial[];
}

export async function searchLocation(serialNumber:string) {
  if (!serialNumber) return null;

  const { data, error } = await supabase
    .from('messages')
    // 1. 取得したいのは 'location' カラム
    // 2. serials テーブルと INNER JOIN するために `!inner` を指定
    .select(`
      location,
      serials!inner()
    `)
    // 3. JOINしたserialsテーブルの 'serial_number' カラムで絞り込む
    .eq('serials.serial_number', serialNumber)
    // 任意: 新しいメッセージから順に並び替え
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Search error:', error);
    return null;
  }
  console.log(serialNumber);

  const jsonData ={
    locations: data.map(item => item.location)
  };

  console.log(jsonData);

  return jsonData as DBResponse || null;
}

/**
 * 
 * @param north 北の座標
 * @param south 南の座標
 * @param east 東の座標
 * @param west 西の座標
 * @returns 境界内の位置情報リスト
 */
export async function searchLocationsInBounds(north: number, south: number, east: number, west: number) {

  console.log(north,south,east,west);
  // ->> 演算子でJSON内のキー（lat, lng）をテキストとして抽出し、数値として比較します
  const { data, error } = await supabase.rpc('search_locations_in_bounds_v2', {
    // SQL関数で定義した引数名をキーとして値を渡す
    north,
    south,
    east,
    west
  });

  if (error) {
    console.error('Search error:', error);
    return null;
  }
  console.log(data);

  const jsonData = {
    locations: data,
  };

  console.log("取得した位置情報:", jsonData);

  return jsonData as DBResponseHaveID || null;
}