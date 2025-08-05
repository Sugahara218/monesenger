import type { Message } from '@/hooks/useSearch'; // Message型をインポート

interface AiMessage {
    ai_text?: string | null;
}
  
interface ParsedAiResponse {
    title: string;
    summary: string;
}

// Propsの型を定義
type TimelineItemProps = {
    message: Message;
};


export function parseAiText(message: AiMessage): ParsedAiResponse {
    const defaultValue: ParsedAiResponse = { title: '', summary: '' };
    if (!message.ai_text) {
        return defaultValue;
    }

    try {
        const parsed = JSON.parse(message.ai_text);
        if (parsed && typeof parsed.title === 'string' && typeof parsed.summary === 'string') {
        return parsed;
        }
    } catch (e) {
        console.error("JSONの解析に失敗しました:", e);
    }

    return { ...defaultValue, summary: message.ai_text };
}


export function TimelineItem ({ message }: TimelineItemProps){
    const aiResponse = parseAiText(message);
    return (
        <div key={message.id} className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="message-card">
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
    )
}
