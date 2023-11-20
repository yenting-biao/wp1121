"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { User2, Info, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  chattername: string | undefined;
  chatroomId: string;
};

export default function Header({ chattername, chatroomId }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-row items-center gap-2 border-b-2 pb-2">
      <div>
        <User2 />
      </div>
      <div className="flex-grow text-xl font-bold">{chattername}</div>
      <div>
        <Button
          className="rounded-full hover:bg-gray-400"
          size="icon"
          onClick={() => setModalOpen(true)}
        >
          <Info />
        </Button>
      </div>
      {modalOpen && (
        <DeleteDialog
          onClose={() => setModalOpen(false)}
          chatroomId={chatroomId}
        />
      )}
    </div>
  );
}

type DeleteDialogProps = {
  onClose: () => void;
  chatroomId: string;
};

function DeleteDialog({ onClose, chatroomId }: DeleteDialogProps) {
  const [deleteAlert, setDeleteAlert] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    const res = await fetch(`/api/chatroomInfo/${chatroomId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatroomId: chatroomId,
      }),
    });

    setIsLoading(false);

    if (!res.ok) {
      console.log(res);

      onClose();
      return;
    }

    onClose();
    router.push("/chatrooms/");
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="backdrop-brightness-sm absolute inset-0 backdrop-blur-xs"
        onClick={onClose}
      ></div>

      {deleteAlert ? (
        <div className="relative z-10 flex max-w-lg flex-col gap-2 rounded bg-white p-6 text-black shadow-lg">
          <span
            onClick={onClose}
            className="absolute right-2 top-1 inline-block cursor-pointer"
          >
            &#10006;
          </span>
          <div className="w-full text-justify">
            Are you sure you want to delete this chatroom? All the messages in
            this chatroom will be deleted once you delete it.
          </div>
          <Button
            className="gap-2 rounded-full font-semibold text-red-500 hover:bg-slate-200"
            onClick={() => handleDelete()}
            disabled={isLoading}
          >
            <AlertTriangle />
            <p>Yes, I want to delete this chatroom.</p>
          </Button>
          <Button
            className="gap-2 rounded-full font-semibold hover:bg-slate-200"
            onClick={onClose}
            disabled={isLoading}
          >
            <p>Let me think again.</p>
          </Button>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col gap-2 rounded bg-white p-6 text-black shadow-lg">
          <span
            onClick={onClose}
            className="absolute right-2 top-1 inline-block cursor-pointer"
          >
            &#10006;
          </span>
          <Button
            className="gap-2 rounded-full font-semibold text-red-500 hover:bg-slate-200"
            onClick={() => setDeleteAlert(true)}
          >
            <AlertTriangle />
            <p>Delete this chatroom!</p>
          </Button>
        </div>
      )}
    </div>
  );
}
