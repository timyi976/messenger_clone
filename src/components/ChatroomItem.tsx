import { useState } from "react";
import { LuTrash2 } from "react-icons/lu";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useChatrooms from "@/hooks/useChatrooms";

import { Button } from "./ui/button";

type ChatroomItemProps = {
  chatId: string;
  otherUsername: string;
  otherUserId: string;
  latestMessageId: string;
  latestMessageContent: string;
  latestMessageTimestamp: string;
  latestMessageSender: string;
  latest_message_isVisible: boolean;
};

const dummyFun = (x) => {
  return x;
};

export default function ChatroomItem({
  chatId,
  otherUsername,
  otherUserId,
  latestMessageId,
  latestMessageContent,
  latestMessageTimestamp,
  latestMessageSender,
  latest_message_isVisible,
}: ChatroomItemProps) {
  dummyFun(latestMessageId);
  dummyFun(latestMessageTimestamp);

  const { deleteChatroom } = useChatrooms();
  const currentChatId = useParams().chatId;

  const [modalOpen, setModalOpen] = useState(false);

  const dialog = (
    <Dialog
      open={modalOpen}
      onOpenChange={() => {
        setModalOpen(false);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete a chatroom</DialogTitle>
          <DialogDescription>
            Delete the chatroom with {otherUsername}? Note that this action is
            irreversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={async () => {
              await deleteChatroom(chatId);
              setModalOpen(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <div className="flex items-center">
        <Link
          className={`m-1 w-10/12 rounded-full ${
            currentChatId === chatId ? "bg-sky-200" : "bg-gray-200"
          } p-4 px-4 transition-colors ${currentChatId === chatId? "" : "hover:bg-sky-100"}`}
          href={{
            pathname: `/chat/${chatId}`,
          }}
        >
          <div className="flex flex-col">
            <span className="text-lg font-medium">{otherUsername}</span>
            <p className="truncate">
              {latestMessageSender === otherUserId ? "" : "You: "}
              {latestMessageSender !== null &&
              latestMessageSender !== otherUserId &&
              !latest_message_isVisible
                ? "[Deleted Message]"
                : latestMessageContent}
            </p>
          </div>
        </Link>

        <button className="group">
          <div
            // prefix a class with hover: to make it only apply when the element is hovered
            className="flex w-fit items-center gap-4 rounded-full p-2 align-bottom transition-colors duration-300 group-hover:bg-gray-200 lg:pr-4"
            onClick={() => {
              // deleteChatroom(chatId);
              setModalOpen(true);
            }}
          >
            <div className="grid h-[20px] w-[20px] place-items-center">
              <LuTrash2 size={26} strokeWidth={2} />
            </div>
          </div>
        </button>
      </div>
      {dialog}
    </>
  );
}
