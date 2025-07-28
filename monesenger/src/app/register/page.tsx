'use client';

import { useState, FormEvent } from 'react';
import { addNote } from '../_actions';


type AiMessageType = {
  title: string;
  summary: string;
};

export default function RegisterPage() {
  const [serial, setSerial] = useState('');
  const [story, setStory] = useState('');
  const [message, setMessage] = useState('');
  const [aiMessageState, setAiMessageState] = useState<AiMessageType | null>(null);
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
    setAiMessageState(result.aiMessage ?? null);

    if (result.message.includes('登録しました')) {
        setSerial('');
        setStory('');
    }
    setTimeout(() => setMessage(''), 10000);

  };

  return (
    <div className="space-y-8">
  <div className="text-center">
    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl title-glow floating">思い出を登録</h1>
    <p className="mt-3 text-lg text-gray-300 pulse-slow">お札の番号と、それにまつわるストーリーを記録しましょう。</p>
  </div>

  {ocrMessage && <div className="ocr-message mx-auto max-w-xl">{ocrMessage}</div>}

  <div className="mx-auto max-w-xl register-form-container p-6 sm:p-8">
    <form onSubmit={handleSubmit} className="register-form-style">
      <div className="form-field">
        <label htmlFor="register-serial" className="form-label">
          お札のシリアルナンバー
        </label>
        <div className="input-group mt-2">
          <input
            type="text"
            id="register-serial"
            name="serial_number"
            value={serial}
            onChange={(e) => setSerial(e.target.value.toUpperCase())}
            className="form-input"
            placeholder="例: AB1234567C"
            required
          />
          <input
            type="file"
            id="register-ocr-input"
            className="hidden"
            accept="image/*"
            onChange={(e) => e.target.files && handleOcr(e.target.files[0])}
          />
          <label htmlFor="register-ocr-input" className="camera-button-register">
            📷
          </label>
        </div>
      </div>
      
      <div className="form-field">
        <label htmlFor="story" className="form-label">
          思い出（ストーリー）
        </label>
        <div className="mt-2">
          <textarea
            id="story"
            name="story"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            rows={4}
            className="form-textarea"
            placeholder="このお札にまつわるエピソードや思い出を書いてください..."
            required
          ></textarea>
        </div>
      </div>
      
      <button
        type="submit"
        className="register-button"
      >
        登録する
      </button>
      {aiMessageState && (
        <div className="success-message">
          <h2 className='margin-none'>{aiMessageState.title}</h2>
          <p className='margin-none'>{aiMessageState.summary}</p>
        </div>
      )}
      {message && <div className="success-message">{message}</div>}
    </form>
  </div>
</div>
  );
}
