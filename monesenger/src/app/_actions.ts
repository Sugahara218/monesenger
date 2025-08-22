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

interface DBResponse {
  locations: (LocationData | null)[];
}

interface LocationItem {
  id: number; 
  serial_id: string;
  location: LocationData | null;
  message_text: string,
  ai_text: string,
}

interface DBResponseHaveID {
  locations: LocationItem[];
}

export async function addNote(formData: FormData,location:object){

  const serialNumber = formData.get('serial_number') as string;
  const story = formData.get('story') as string;
  const aiText = await enhanceMemoryWithAI(story);

  if (!serialNumber || !story) {
    return { message: 'シリアル番号とストーリーの両方を入力してください。' };
  }

  let serialId: number;

  const { data: existingSerial } = await supabase
    .from('serials')
    .select('id')
    .eq('serial_number', serialNumber)
    .single();

  if (existingSerial) {
    serialId = existingSerial.id;
  } else {
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

  const user_id = await auth();

  const { error: messageError } = await supabase
    .from('messages')
    .insert({ serial_id: serialId, message_text: story, ai_text: aiText ,user_id: user_id.userId ,location:location});

  if (messageError) {
    console.error('Error inserting message:', messageError);
    return { message: 'データベースエラーが発生しました。(messages)' };
  }
  console.log(aiText);
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

  const formattedData = (messagesData as SupabaseMessage[]).map((message) => ({
    ...message,
    serials: (message.serials && message.serials.length > 0) ? message.serials[0] : { serial_number: '' },
  }));

  return formattedData as MessageWithSerial[];
}

export async function searchLocation(serialNumber:string) {
  if (!serialNumber) return null;

  const { data, error } = await supabase
    .from('messages')
    .select(`
      location,
      serials!inner()
    `)
    .eq('serials.serial_number', serialNumber)
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
  const { data, error } = await supabase.rpc('search_locations_in_bounds_v2', {
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