import { getLatestMessages } from "@/lib/messageQueries";
import NewPostsItem from "./NewPostsItem";

export const revalidate = 0;

export async function MessagesPage() {
    // 1. データ取得ロジックを呼び出す
    const latestMessages = await getLatestMessages();
  
    // 2. クライアントコンポーネントにデータを渡す
    return <NewPostsItem serverMessages={latestMessages || []} />;
}