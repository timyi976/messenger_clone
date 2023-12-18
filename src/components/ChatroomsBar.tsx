"use client";

// import { useEffect, useRef } from "react";
import { LuPlus } from "react-icons/lu";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import AddChatroomButton from "@/components/AddChatroomButton";
import ChatroomItem from "@/components/ChatroomItem";
import SearchBar from "@/components/SearchBar";
import useChatrooms from "@/hooks/useChatrooms";

export default function ChatroomsBar() {
  const { chatrooms, addChatroom } = useChatrooms();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const router = useRouter();

  // let partialChatrooms = useRef([]);

  // useEffect(() => {
  //   if (search !== null) {
  //     partialChatrooms = chatrooms.filter((chatroom) => {
  //       if (userId === chatroom.user_id1) {
  //         return chatroom.username2.includes(search);
  //       } else {
  //         return chatroom.username1.includes(search);
  //       }
  //     });
  //   }
  // }, [search, chatrooms, userId]);

  const handleAddChatroom = async () => {
    try {
      if (!search) {
        return;
      }
      const ret = await addChatroom(search);

      if (!ret.chatroom && !ret.ok) {
        const body = await ret.json();
        alert(body.error);
        return false;
      }

      const newChatroom = ret.chatroom;

      const chatId = newChatroom.displayId;

      // clearn seach param
      const tmp = new URLSearchParams(searchParams);
      tmp.delete("search");

      router.push(`/chat/${chatId}`);
    } catch (e) {
      console.error(e);
      alert(e);
    }
  };

  return (
    <>
      <div className="flex flex-col">
        <div className="m-1 flex flex-row items-center">
          <span className="w-full p-3 px-4 text-2xl font-bold">Chat</span>
          <div className="">
            <AddChatroomButton />
          </div>
        </div>
        <SearchBar />
        {search === null
          ? chatrooms.map((chatroom) => (
              <ChatroomItem
                key={chatroom.id}
                chatId={chatroom.id}
                otherUsername={
                  chatroom.user_id1 === userId
                    ? chatroom.username2
                    : chatroom.username1
                }
                otherUserId={
                  chatroom.user_id1 === userId
                    ? chatroom.user_id2
                    : chatroom.user_id1
                }
                latestMessageId={chatroom.latest_message_id}
                latestMessageContent={chatroom.latest_message_content}
                latestMessageTimestamp={chatroom.latest_message_timestamp}
                latestMessageSender={chatroom.latest_message_sender_id}
                latest_message_isVisible={chatroom.latest_message_isvisible}
              />
            ))
          : chatrooms
              .filter((chatroom) => {
                if (userId === chatroom.user_id1) {
                  return chatroom.username2.includes(search);
                } else {
                  return chatroom.username1.includes(search);
                }
              })
              .map((chatroom) => (
                <ChatroomItem
                  key={chatroom.id}
                  chatId={chatroom.id}
                  otherUsername={
                    chatroom.user_id1 === userId
                      ? chatroom.username2
                      : chatroom.username1
                  }
                  otherUserId={
                    chatroom.user_id1 === userId
                      ? chatroom.user_id2
                      : chatroom.user_id1
                  }
                  latestMessageId={chatroom.latest_message_id}
                  latestMessageContent={chatroom.latest_message_content}
                  latestMessageTimestamp={chatroom.latest_message_timestamp}
                  latestMessageSender={chatroom.latest_message_sender_id}
                  latest_message_isVisible={chatroom.latest_message_isvisible}
                />
              ))}
        {search !== null &&
        chatrooms.filter((chatroom) => {
          if (userId === chatroom.user_id1) {
            return chatroom.username2.includes(search);
          } else {
            return chatroom.username1.includes(search);
          }
        }).length === 0 ? (
          <div className="m-1 flex flex-row items-center">
            <button className="group m-1 w-full rounded-full bg-gray-200 p-4 px-4 transition-colors hover:bg-sky-100">
              <div
                className=""
                onClick={() => {
                  handleAddChatroom();
                }}
              >
                <div className="flex flex-row items-center">
                  <div className="grid h-[20px]">
                    <LuPlus size={26} strokeWidth={2} />
                  </div>
                  <span> Create a chatroom with {search}?</span>
                </div>
              </div>
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
