'use client';

import { useState, FormEvent } from 'react';
import { searchSerial } from './_actions'; // Server Actionをインポート

interface SerialData {
  id: number;
  serial_number: string;
  created_at: string;
  messages: {
    id: number;
    message_text: string;
    created_at: string;
  }[];
}

export default function HomePage() {
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

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">思い出を検索</h1>
        <p className="mt-3 text-lg text-gray-400">シリアル番号を入力して、そこに刻まれたストーリーを見つけよう。</p>
      </div>

      {ocrMessage && <p className="text-center text-blue-400">{ocrMessage}</p>}

      <div className="mx-auto max-w-xl">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            value={serial}
            onChange={(e) => setSerial(e.target.value.toUpperCase())}
            className="block w-full rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-gold-500 sm:text-sm sm:leading-6"
            placeholder="例: AB1234567C"
            required
          />
          <input
            type="file"
            id="search-ocr-input"
            className="hidden"
            accept="image/*"
            onChange={(e) => e.target.files && handleOcr(e.target.files[0])}
          />
          <label htmlFor="search-ocr-input" className="cursor-pointer rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600">
            📷
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-gold-500 px-4 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-gold-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 disabled:opacity-50"
          >
            {isLoading ? '検索中...' : '検索'}
          </button>
        </form>
      </div>

      <div>
        {result === 'not_found' && (
          <div className="text-center text-gray-500">
            <p>このシリアル番号の記録は見つかりませんでした。</p>
            <p className="text-sm">新しい思い出を登録しますか？</p>
          </div>
        )}
        {result && typeof result === 'object' && (
          <div className="space-y-6 rounded-lg border border-gray-800 bg-gray-900/50 p-6 sm:p-8">
            <div>
              <h2 className="text-2xl font-bold text-gold-400">{result.serial_number}</h2>
              <p className="text-sm text-gray-500">最初の記録: {new Date(result.created_at).toLocaleString('ja-JP')}</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">思い出のタイムライン</h3>
              <ul className="space-y-4 border-l-2 border-gray-700 pl-6">
                {result.messages.map((message) => (
                  <li key={message.id}>
                    <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-gold-500"></div>
                    <p className="text-gray-300">{message.message_text}</p>
                    <time className="text-xs text-gray-500">{new Date(message.created_at).toLocaleString('ja-JP')}</time>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
