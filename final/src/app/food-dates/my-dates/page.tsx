import { MessageCircle } from "lucide-react";

export default function NoDateSelected() {
  return (
    <div className="flex flex-col h-full flex-grow items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-5 h-full">
        <MessageCircle className="text-gray-400" size={80} strokeWidth={1} />
        <p className="text-xl text-gray-400">請選擇聚會</p>
      </div>
    </div>
  );
}
