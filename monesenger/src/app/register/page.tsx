'use client';

import { useState, FormEvent } from 'react';
import { addNote } from '../_actions';
// useAuth の方が推奨ですが、既存のコードに合わせてuseSessionを使います
// import { useSession } from '@clerk/nextjs'; 

type AiMessageType = {
  title: string;
  summary: string;
};

// SVGスピナーコンポーネント（ボタン内に表示するため）
// const SpinnerIcon = () => (
//   <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//   </svg>
// );


export default function RegisterPage() {
  const [serial, setSerial] = useState('');
  const [story, setStory] = useState('');
  const [message, setMessage] = useState('');
  const [aiMessageState, setAiMessageState] = useState<AiMessageType | null>(null);
  const [ocrMessage, setOcrMessage] = useState('');
  // 1. フォーム送信中のローディング状態を管理するStateを追加
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // // Clerkのセッション情報（ログイン状態の確認に利用）
  // const { isLoaded, isSignedIn } = useSession();

  const handleOcr = async (file: File) => {
    // ... (この関数は変更なし)
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

  // 2. handleSubmit関数を修正
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 以前のメッセージをクリア
    setMessage('');
    setAiMessageState(null);
    // ローディング開始
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const result = await addNote(formData);
      
      setMessage(result.message);
      setAiMessageState(result.aiMessage ?? null);

      if (result.message.includes('登録しました')) {
          setSerial('');
          setStory('');
      }
    } catch (error) {
      console.error('登録エラー:', error);
      setMessage('登録中にエラーが発生しました。もう一度お試しください。');
    } finally {
      // 処理が成功しても失敗しても、必ずローディングを終了
      setIsSubmitting(false);
      // メッセージを10秒後に消す
      setTimeout(() => {
        setMessage('');
        setAiMessageState(null);
      }, 10000);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl title-glow floating">想い出を登録</h1>
        <p className="mt-3 text-lg text-gray-300 pulse-slow">お札の番号と、それにまつわるストーリーを記録しましょう。</p>
      </div>

      {ocrMessage && <div className="ocr-message mx-auto max-w-xl">{ocrMessage}</div>}

      <div className="mx-auto max-w-xl register-form-container p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="register-form-style">
          {/* ... (シリアルナンバーとストーリーの入力欄は変更なし) ... */}
          <div className="form-field">
            <label htmlFor="register-serial" className="form-label">お札のシリアルナンバー</label>
            <div className="input-group mt-2">
              <input type="text" id="register-serial" name="serial_number" value={serial} onChange={(e) => setSerial(e.target.value.toUpperCase())} className="form-input" placeholder="例: AB1234567C" required />
              <input type="file" id="register-ocr-input" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleOcr(e.target.files[0])} />
              <label htmlFor="register-ocr-input" className="camera-button-register">📷</label>
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="story" className="form-label">思い出（ストーリー）</label>
            <div className="mt-2">
              <textarea id="story" name="story" value={story} onChange={(e) => setStory(e.target.value)} rows={4} className="form-textarea" placeholder="このお札にまつわるエピソードや思い出を書いてください..." required></textarea>
            </div>
          </div>
          
          {/* 3. ボタンの表示を修正 */}
          <button
            type="submit"
            className="register-button"
            // isSubmittingがtrueの間、ボタンを無効化する
            disabled={isSubmitting} 
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center register-button-now">
                登録中...
              </span>
            ) : (
              // <span className="flex items-center justify-center register-button-now">
              //   <SpinnerIcon/>
              //   登録中...
              // </span>
              <span className="">
                登録する
              </span>
            )}
          </button>
          
          {aiMessageState && (
            <div className="success-message">
              <h2 className='margin-none'>{aiMessageState.title}</h2>
              <p className='margin-none'>{aiMessageState.summary}</p>
            </div>
          )}
          {message && !aiMessageState && <div className="success-message">{message}</div>}
        </form>
      </div>
    </div>
  );
}