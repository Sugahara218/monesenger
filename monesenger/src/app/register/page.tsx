'use client';

import { useState, FormEvent } from 'react';
import { addNote } from '../_actions';

export default function RegisterPage() {
  const [serial, setSerial] = useState('');
  const [story, setStory] = useState('');
  const [message, setMessage] = useState('');
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await addNote(formData);
    setMessage(result.message);

    if (result.message.includes('登録しました')) {
        setSerial('');
        setStory('');
    }
    setTimeout(() => setMessage(''), 5000);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">思い出を登録</h1>
        <p className="mt-3 text-lg text-gray-400">お札の番号と、それにまつわるストーリーを記録しましょう。</p>
      </div>

      {ocrMessage && <p className="text-center text-blue-400">{ocrMessage}</p>}

      <div className="mx-auto max-w-xl rounded-lg border border-gray-800 bg-gray-900/50 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="register-serial" className="block text-sm font-medium text-gray-300">
              シリアル番号
            </label>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                id="register-serial"
                name="serial_number"
                value={serial}
                onChange={(e) => setSerial(e.target.value.toUpperCase())}
                className="block w-full rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-gold-500 sm:text-sm sm:leading-6"
                required
              />
              <input
                type="file"
                id="register-ocr-input"
                className="hidden"
                accept="image/*"
                onChange={(e) => e.target.files && handleOcr(e.target.files[0])}
              />
              <label htmlFor="register-ocr-input" className="cursor-pointer rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600">
                📷
              </label>
            </div>
          </div>
          <div>
            <label htmlFor="story" className="block text-sm font-medium text-gray-300">
              最初の思い出（ストーリー）
            </label>
            <div className="mt-2">
              <textarea
                id="story"
                name="story"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                rows={4}
                className="block w-full rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-gold-500 sm:text-sm sm:leading-6"
                required
              ></textarea>
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-gold-500 px-3.5 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-gold-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
          >
            登録する
          </button>
          {message && <p className="mt-4 text-center text-green-400">{message}</p>}
        </form>
      </div>
    </div>
  );
}
