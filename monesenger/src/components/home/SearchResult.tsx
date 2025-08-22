import type { SerialData } from '@/hooks/useSearch'; 
import { Timeline } from '../timeLine/Timeline';


type SearchResultProps = {
    result:SerialData | 'not_found' | null;
}


export function SearchResult({result}:SearchResultProps){
  return (
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
            
            <Timeline messages={result.messages} />
          </div>
        )}
    </div>
  )
}