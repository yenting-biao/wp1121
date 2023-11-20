import { User2 } from "lucide-react";

type ChatPreviewProps = {
  username: string;
  lastMessage: string;
};

export default function ChatPreview({
  username,
  lastMessage,
}: ChatPreviewProps) {
  return (
    <div className="mb-2 flex w-11/12 cursor-pointer flex-row items-center gap-2 rounded-xl border-solid border-white pb-1 pl-2 pr-2 pt-1 hover:bg-gray-700">
      <div>
        <User2 />
      </div>
      <div className="w-10/12">
        <div className="font-bold">{username}</div>
        <div className="truncate text-xs">{lastMessage}</div>
      </div>
    </div>
  );
}
