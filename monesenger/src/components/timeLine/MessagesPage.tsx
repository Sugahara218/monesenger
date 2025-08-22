import { getLatestMessages } from "@/lib/messageQueries";
import NewPostsItem from "./NewPostsItem";

export const revalidate = 0;

export async function MessagesPage() {
    const latestMessages = await getLatestMessages();
    return <NewPostsItem serverMessages={latestMessages || []} />;
}