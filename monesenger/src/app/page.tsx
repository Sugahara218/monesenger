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
    ai_text:string;
  }[];
}

// interface AiMessage {
//   title: string;
//   summary: string;
// }


// AiMessageの型を仮定（必要に応じて調整してください）
interface AiMessage {
  ai_text?: string | null; // ai_textはオプショナルかnullの可能性があると仮定
}

// 戻り値の型も定義しておくと、さらに安全になります
interface ParsedAiResponse {
  title: string;
  summary: string;
}

// 1. async を削除
// 2. 戻り値の型 `ParsedAiResponse` を指定
function parseAiText(message: AiMessage): ParsedAiResponse {
  const defaultValue: ParsedAiResponse = { title: '', summary: '' };

  // message.ai_text が存在しない場合は、デフォルト値を返す
  if (!message.ai_text) {
    return defaultValue;
  }

  try {
    const parsed = JSON.parse(message.ai_text);
    // パースした結果が期待通りの形かどうかもチェックすると、より堅牢になります
    if (parsed && typeof parsed.title === 'string' && typeof parsed.summary === 'string') {
        return parsed;
    }
    // 形が違う場合は、元のテキストをsummaryに入れて返す
    return { ...defaultValue, summary: message.ai_text };

  } catch (e) {
    console.error("JSONの解析に失敗しました:", e);
    // パースに失敗した場合も、元のテキストをsummaryに入れて返す
    return { ...defaultValue, summary: message.ai_text };
  }
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
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl title-glow floating">思い出を検索</h1>
        <p className="mt-3 text-lg text-gray-300 pulse-slow">お札のシリアルナンバーを入力して、そこに刻まれたストーリーを見つけよう。</p>
      </div>

      {ocrMessage && <p className="text-center text-blue-400 shimmer">{ocrMessage}</p>}

      <div className="mx-auto max-w-xl search-container">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={serial}
            onChange={(e) => setSerial(e.target.value.toUpperCase())}
            className="block w-full search-input px-3.5 py-2 text-white placeholder-gray-400 sm:text-sm sm:leading-6"
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
          <label htmlFor="search-ocr-input" className="camera-button-register">
            📷
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="register-button-Simple"
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                検索中...
              </>
            ) : '検索'}
          </button>
        </form>
      </div>

      <div>
        {result === 'not_found' && (
          <div className="text-center text-gray-400 glass-card p-6 hover-lift">
            <p>このシリアル番号の記録は見つかりませんでした。</p>
            <p className="text-sm mt-2">新しい思い出を登録しましょう！</p>
          </div>
        )}
        {result && typeof result === 'object' && (
          <div className="result-card p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold gradient-text">{result.serial_number}</h2>
              <p className="text-sm text-gray-400 mt-1">最初の記録: {new Date(result.created_at).toLocaleString('ja-JP')}</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">思い出のタイムライン</h3>
              <div className="timeline">
              {result.messages.map((message) => {
                // --- ここからがJavaScriptの処理ブロック ---
                const aiResponse = parseAiText(message);
                // --- 処理が終わったら、最後にJSX要素を return する ---
                return (
                  <div key={message.id} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="message-card">
                      {/* パースした結果の title や summary を表示する */}
                      <div className="message-card">
                        <h3 className="font-bold text-white margin-none">{aiResponse.title}</h3>
                        <p className="text-gray-200 mt-1 margin-bottomNone">{aiResponse.summary}</p>
                      </div>
                      <p className="text-gray-200">{message.message_text}</p>
                      <time className="text-xs text-gray-500 block mt-2">
                        {new Date(message.created_at).toLocaleString('ja-JP')}
                      </time>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
