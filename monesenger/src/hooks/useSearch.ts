"use client"

import { searchSerial } from "@/app/_actions";
import { FormEvent, useState } from "react";


export interface Message {
  id: number;
  message_text: string;
  ai_text?: string;
  created_at: string;
  like_count?: number;
  user_id: string;
  location?: {
    [key: string]: number;
  };
}

export interface SerialData {
    id: number;
    serial_number: string;
    created_at: string;
    messages: Message[];
}


export function useSearch(){
    const [serial, setSerial] = useState('');
    const [result, setResult] = useState<SerialData | null | 'not_found'>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [ocrMessage, setOcrMessage] = useState('');

    const handleOcr = async (file: File) => {
        if (!file) return;
        setOcrMessage('AIがシリアル番号を解析中...');
        const formData = new FormData();
        formData.append("file", file);
    
        try {
          const response = await fetch('/api/ocr', { method: 'POST', body: formData });
          if (!response.ok) throw new Error('サーバーでエラーが発生しました。');
          const data = await response.json();
          if (data.serial) {
            setSerial(data.serial.toUpperCase());
            setOcrMessage('解析が完了しました。');
          } else {
            setOcrMessage('シリアル番号を抽出できませんでした。');
          }
        } catch (error) {
          console.error('OCR Error:', error);
          setOcrMessage('解析中にエラーが発生しました。');
        } finally {
          setTimeout(() => setOcrMessage(''), 3000);
        }
    };
    
    const handleSearch = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);
        const searchResult = await searchSerial(serial);
        setResult(searchResult || 'not_found');
        setIsLoading(false);
    };

    return {
      serial,
      setSerial,
      result,
      isLoading,
      ocrMessage,
      handleSearch,
      handleOcr,
    };
}