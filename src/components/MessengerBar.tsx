"use client";

import { LuPinOff, LuMegaphone } from "react-icons/lu";

import { useSession } from "next-auth/react";

import MessageInput from "@/components/MessageInput";
import MessagesViewer from "@/components/MessagesViewr";
import { useChat } from "@/hooks/useChat";

export default function MessengerBar() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { messages, currentChatroom } = useChat();

  return (
    <>
      <div className="h-screen w-full">
        <div className="flex h-full w-full flex-col overflow-hidden shadow-lg">
          <MessengerHeader currentChatroom={currentChatroom} userId={userId} />
          <MessagesViewer messages={messages} />
          <MessageInput />
        </div>
      </div>
    </>
  );
}

function MessengerHeader({
  currentChatroom,
  userId,
}: {
  currentChatroom;
  userId: string | undefined;
}) {
  const { unpinMessage } = useChat();
  if (!currentChatroom) return null;

  const pinnedSenderUsername =
    currentChatroom.pinned_message_sender_id === currentChatroom.user_id1
      ? currentChatroom.username1
      : currentChatroom.username2;

  const replaceUrl = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
      return ` <a href="${url}" target="_blank" class="no-underline hover:underline text-blue-500"><p> ${url} </p></a> `;
    });
  };

  return (
    <>
      <nav className="w-full p-3 text-lg font-semibold shadow-md">
        <div className="flex flex-col">
          <span>
            {userId === currentChatroom.user_id1
              ? currentChatroom.username2
              : currentChatroom.username1}
          </span>
        </div>
      </nav>
      {currentChatroom.pinned_message_id !== null ? (
        <div className="flex flex-row">
          <nav className="m-1 w-full rounded-full bg-gray-100 p-2">
            <div className="flex flex-row">
              <LuMegaphone className="m-1" size={20} strokeWidth={2} />
              <span>
                <div
                  dangerouslySetInnerHTML={{
                    __html: replaceUrl(
                      pinnedSenderUsername +
                        ": " +
                        currentChatroom.pinned_message_content,
                    ),
                  }}
                  className="flex flex-row gap-x-1"
                ></div>
              </span>
            </div>
          </nav>
          <button className="group">
            <div
              // prefix a class with hover: to make it only apply when the element is hovered
              className="flex w-fit items-center gap-4 rounded-full p-2 align-bottom transition-colors duration-300 group-hover:bg-gray-200 lg:pr-4"
              onClick={() => {
                unpinMessage(currentChatroom.pinned_message_id);
              }}
            >
              <div className="grid h-[20px] w-[20px] place-items-center">
                <LuPinOff size={20} strokeWidth={2} />
              </div>
            </div>
          </button>
        </div>
      ) : null}
    </>
  );
}
