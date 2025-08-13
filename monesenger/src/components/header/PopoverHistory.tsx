import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import * as ScrollArea from "@radix-ui/react-scroll-area";

interface Message {
  serial_id: number;
  message_text: string;
  created_at: string;
  ai_text: string;
  serials: {
    serial_number: string;
  }[];
}

const dataFormat = (isoString: string) => {
  const date = new Date(isoString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");
  return `${year}年${month}月${day}日${hour}時${minute}分`;
};

export default function PropoverHistory({
  userMessages,
}: {
  userMessages: Message[];
}) {
  return (
    <Popover modal ={true}>
      <PopoverTrigger asChild>
        <Button variant="outline">📖</Button>
      </PopoverTrigger>
      <PopoverContent
        style={{
          width: "400px",
          padding: "16px",
          backgroundColor: "#1a1a1a",
          color: "#fff",
          borderRadius: "8px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        }}
      >
        <ScrollArea.Root
          type="always"
          style={{
            height: "300px",
            overflow: "hidden",
          }}
        >
          <ScrollArea.Viewport
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {userMessages && userMessages.length > 0 ? userMessages.map((message, index) => {
                 const aiText = JSON.parse(message.ai_text);
                 return (
                   <div
                     key={index}
                     style={{
                       borderBottom: "1px solid #444",
                       paddingBottom: "8px",
                     }}
                   >
                     <p style={{ fontWeight: "bold" }}>
                       {message.serials[0]?.serial_number}
                     </p>
                     <h3 style={{ margin: "4px 0", color: "#ccc" }}>
                       {aiText.title}
                     </h3>
                     <p style={{ margin: "4px 0", color: "#aaa" }}>
                       {aiText.summary}
                     </p>
                     <p style={{ fontWeight: "bold", color: "#fff", marginTop: "6px",marginRight:"6px" }}>
                       {message.message_text}
                     </p>
                     <p style={{ fontSize: "12px", color: "#888" }}>
                       {dataFormat(message.created_at)}
                     </p>
                   </div>
                 );
               }) : <h3>履歴がありません。今すぐ登録しましょう！</h3>}
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            orientation="vertical"
            style={{
              width: "8px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "4px",
            }}
          >
            <ScrollArea.Thumb
              style={{
                background: "rgba(255,255,255,0.4)",
                borderRadius: "4px",
              }}
            />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </PopoverContent>
    </Popover>
  );
}
