import {
  useEffect,
  useState,
  useContext,
  useCallback,
  createContext,
} from "react";

import { useSession } from "next-auth/react";
import { useParams, useRouter, usePathname } from "next/navigation";

import { pusherClient } from "@/lib/pusher/client";

import useChatrooms from "./useChatrooms";

type PusherPayload = {
  senderId: string;
};

type ChatContextType = {
  messages;
  currentChatroom;
  sendMessage;
  deleteMessage;
  invisibleMessage;
  pinMessage;
  unpinMessage;
};

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { chatrooms, fetchChatrooms } = useChatrooms();
  const { chatId } = useParams();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const router = useRouter();

  const pathname = usePathname();

  const [messages, setMessages] = useState([]);
  const [currentChatroom, setCurrentChatroom] = useState(null);

  useEffect(() => {
    if (!chatId) return;
    // find the chatroom
    const chatroom = chatrooms.find((chatroom) => chatroom.id === chatId);

    setCurrentChatroom(chatroom);
  }, [chatId, chatrooms]);

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;
    const ret = await fetch(`/api/messages/${chatId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!ret.ok) {
      const error_data = await ret.json();
      console.log(error_data.error);

      // // redirect to home page
      // router.push("/chat");
      return;
    }
    const data = await ret.json();
    setMessages(data.messages);
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;
    fetchMessages();
  }, [chatId, fetchMessages]);

  // pusher
  // useEffect(() => {
  //   if (!userId) return;
  //   const channelName = `private-${userId}`;
  //   try {
  //     const channel = pusherClient.subscribe(channelName);
  //     channel.bind("chat:update", ({ senderId }: PusherPayload) => {
  //       if (senderId === userId) {
  //         return;
  //       }
  //       fetchMessages();
  //       fetchChatrooms();
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }

  //   return () => {
  //     pusherClient.unsubscribe(channelName);
  //   };
  // }, [userId, fetchMessages]);

  useEffect(() => {
    const callbackFun = async () => {
      if (!userId) return;
      const channelName = `private-${userId}`;
      try {
        const channel = pusherClient.subscribe(channelName);
        channel.bind("chatrooms:update", async ({ senderId }: PusherPayload) => {
          if (senderId === userId) {
            return;
          }
          await fetchChatrooms();
        });
        channel.bind("chat:update", async ({ senderId }: PusherPayload) => {
          if (senderId === userId) {
            return;
          }
          await fetchMessages();
          await fetchChatrooms();
        });
      } catch (error) {
        console.log(error);
      }

      return () => {
        pusherClient.unsubscribe(channelName);
      };
    };
    callbackFun();
  }, [userId, fetchChatrooms, fetchMessages]);

  useEffect(()=>{
    if (chatId) {
      const chatroom = chatrooms.find(
        (chatroom) => chatroom.id === chatId,
      );
      if (!chatroom) {
        router.push("/chat");
      }
    }
    else{
      // check if is at /chat
      if (pathname === "/chat" && chatrooms.length > 0) {
        // get first chatroom
        const chatroom = chatrooms[0];
        // redirect to first chatroom
        router.push(`/chat/${chatroom.id}`);
      }
    }
  }, [chatrooms, router, pathname, chatId])

  const sendMessage = async (content: string) => {
    const res = await fetch(`/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatId: chatId,
        content: content,
      }),
    });
    if (!res.ok) {
      return res;
    }
    const data = await res.json();
    await fetchMessages();
    fetchChatrooms();
    return data;
  };

  const deleteMessage = async (messageId: string) => {
    const res = await fetch(`/api/messages/${messageId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      return res;
    }
    const data = await res.json();
    await fetchMessages();
    fetchChatrooms();
    return data;
  };

  const invisibleMessage = async (messageId: string) => {
    const res = await fetch(`/api/messages`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messageId: messageId,
        method: "invisible",
      }),
    });
    if (!res.ok) {
      return res;
    }
    const data = await res.json();
    await fetchMessages();
    fetchChatrooms();
    return data;
  };

  const pinMessage = async (messageId: string) => {
    const res = await fetch(`/api/messages`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messageId: messageId,
        method: "pin",
      }),
    });
    if (!res.ok) {
      return res;
    }
    const data = await res.json();
    await fetchMessages();
    fetchChatrooms();
    return data;
  };

  const unpinMessage = async (messageId: string) => {
    const res = await fetch(`/api/messages`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messageId: messageId,
        method: "unpin",
      }),
    });
    if (!res.ok) {
      return res;
    }
    const data = await res.json();
    await fetchMessages();
    fetchChatrooms();
    return data;
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        currentChatroom,
        sendMessage,
        deleteMessage,
        invisibleMessage,
        pinMessage,
        unpinMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === null) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
