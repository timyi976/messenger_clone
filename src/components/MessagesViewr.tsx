import { useEffect, useRef, useState } from "react";
import { LuPin, LuTrash2 } from "react-icons/lu";

import { useSession } from "next-auth/react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChat } from "@/hooks/useChat";

import { Button } from "./ui/button";

type Props = {
  messages;
};

export default function MessagesViewer({ messages }: Props) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div className="grow overflow-y-scroll">
      <div className="px-2 pt-4">
        {messages.map((message) => (
          <MessageItem
            message={message}
            userId={userId}
            key={message.messageId}
          />
        ))}
      </div>
      <div ref={scrollRef}></div>
    </div>
  );
}

function MessageItem({
  message,
  userId,
}: {
  message;
  userId: string | undefined;
}) {
  const isSender = message.senderId === userId;
  const [modalOpen, setModalOpen] = useState(false);
  const { deleteMessage, invisibleMessage, pinMessage } = useChat();

  const handlePin = async () => {
    try {
      const ret = await pinMessage(message.messageId);
      if (!ret.message && !ret.ok) {
        const body = await ret.json();
        alert(body.error);
        return false;
      }

      setModalOpen(false);
    } catch (e) {
      console.error(e);
      alert(e);
    }
  };

  const handleDelete = async () => {
    try {
      const ret = await deleteMessage(message.messageId);
      if (!ret.message && !ret.ok) {
        const body = await ret.json();
        alert(body.error);
        return false;
      }

      setModalOpen(false);
    } catch (e) {
      console.error(e);
      alert(e);
    }
  };

  const handleInvisible = async () => {
    try {
      const ret = await invisibleMessage(message.messageId);
      if (!ret.message && !ret.ok) {
        const body = await ret.json();
        alert(body.error);
        return false;
      }

      setModalOpen(false);
    } catch (e) {
      console.error(e);
      alert(e);
    }
  };

  const pinButton = (
    <button className="group">
      <div
        // prefix a class with hover: to make it only apply when the element is hovered
        className="flex w-fit items-center gap-4 rounded-full p-1 align-bottom transition-colors duration-300 group-hover:bg-gray-200"
        onClick={() => {
          handlePin();
        }}
      >
        <div className="grid h-[15px] w-[15px] place-items-center">
          <LuPin size={18} strokeWidth={2} />
        </div>
      </div>
    </button>
  );

  const deleteButton = (
    <button className="group">
      <div
        // prefix a class with hover: to make it only apply when the element is hovered
        className="flex w-fit items-center gap-4 rounded-full p-1 align-bottom transition-colors duration-300 group-hover:bg-gray-200"
        onClick={() => {
          setModalOpen(true);
        }}
      >
        <div className="grid h-[15px] w-[15px] place-items-center">
          <LuTrash2 size={18} strokeWidth={2} />
        </div>
      </div>
    </button>
  );

  const dialog = (
    <Dialog
      open={modalOpen}
      onOpenChange={() => {
        setModalOpen(false);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete a message</DialogTitle>
          <DialogDescription>
            Delete a message, you can choose to either delete it for yourself or
            for everyone. Note that this action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={async () => {
              await handleInvisible();
              setModalOpen(false);
            }}
          >
            Delete for me
          </Button>
          <Button
            onClick={async () => {
              await handleDelete();
              setModalOpen(false);
            }}
          >
            Delete for everyone
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const replaceUrl = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" class="no-underline hover:underline text-blue-500 ${
        isSender ? "text-sky-300" : "text-blue-500"
      }"><p> ${url} </p></a>`;
    });
  };

  return (
    <>
      {!message.isVisible && isSender ? null : (
        <div key={"dm1"} className="w-full pt-1">
          <div
            className={`flex flex-row items-end gap-2 ${
              isSender && "justify-end"
            }`}
          >
            {isSender && pinButton}
            {isSender && deleteButton}
            <div
              className={`max-w-[60%] rounded-2xl px-3 py-1 leading-6 ${
                isSender ? "bg-black text-white" : " bg-gray-200 text-black"
              }`}
              onContextMenu={(e) => {
                e.preventDefault();
                if (!isSender) return;
                setModalOpen(true);
              }}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: replaceUrl(message.content),
                }}
                className="flex flex-row gap-x-1"
              ></div>
            </div>
            {!isSender && pinButton}
          </div>
          {modalOpen && dialog}
        </div>
      )}
    </>
  );
}
