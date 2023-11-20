import { BiError } from "react-icons/bi";

export default function ChatsPage() {
  return (
    <div className="flex h-[90vh] w-full items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <BiError className="text-yellow-500" size={80} />
        <p className="text-sm font-semibold">
          Please select a chatroom to start chatting.
        </p>
      </div>
    </div>
  );
}
