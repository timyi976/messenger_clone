"use client";

import {
  useEffect,
  useState,
  useContext,
  createContext,
  useCallback,
} from "react";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";

type ChatroomsContextType = {
  chatrooms;
  fetchChatrooms;
  deleteChatroom;
  addChatroom;
};

const ChatroomsContext = createContext<ChatroomsContextType | null>(null);

export function ChatroomsProvider({ children }: { children: React.ReactNode }) {
  const [chatrooms, setChatrooms] = useState([]);
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const currentChatId = useParams().chatId;
  const router = useRouter();

  const fetchChatrooms = useCallback(async () => {
    const res = await fetch(`/api/chatrooms`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    setChatrooms(data.chatrooms);
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchChatrooms();
  }, [userId, fetchChatrooms]);

  // pusher
  // useEffect(() => {
  //   if (!userId) return;
  //   const channelName = `private-${userId}`;
  //   try {
  //     const channel = pusherClient.subscribe(channelName);
  //     channel.bind("chatrooms:update", ({ senderId }: PusherPayload) => {
  //       console.log("[pusher] receive channelName chatrooms:update", channelName);
  //       if (senderId === userId) {
  //         return;
  //       }
  //       console.log("[pusher] chatrooms:update");
  //       fetchChatrooms();
  //       // console.log("[pusher] fetch chatrooms");
  //       // console.log(currentChatId);
  //     });
  //     channel.bind("chat:update", ({ senderId }: PusherPayload) => {
  //       console.log("[pusher] chat:update")
  //       if (senderId === userId) {
  //         return;
  //       }
  //       console.log("[pusher] chat:update");
  //       fetchChatrooms();
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }

  //   // if current chatroom is deleted, redirect to home page
  //   if (currentChatId) {
  //     const chatroom = chatrooms.find((chatroom) => chatroom.id === currentChatId);
  //     if (!chatroom) {
  //       router.push("/chat");
  //     }
  //   }

  //   return () => {
  //     pusherClient.unsubscribe(channelName);
  //   };
  // }, [userId, fetchChatrooms]);

  // useEffect(() => {
  //   if (!userId) return;
  //   const channelName = `private-${userId}`;
  //   try {
  //     const channel = pusherClient.subscribe(channelName);
  //     channel.bind("chat:update", ({ senderId }: PusherPayload) => {
  //       if (senderId === userId) {
  //         return;
  //       }
  //       fetchChatrooms();
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }

  //   return () => {
  //     pusherClient.unsubscribe(channelName);
  //   };
  // }, [userId, fetchChatrooms]);

  const deleteChatroom = async (chatId: string) => {
    const needToRedirect = currentChatId === chatId;

    const res = await fetch(`/api/chatrooms/${chatId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    await fetchChatrooms();

    // if current chatroom is deleted, redirect to home page
    if (needToRedirect) {
      router.push("/chat");
    }

    return data;
  };

  const addChatroom = async (username: string) => {
    const res = await fetch(`/api/chatrooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
      }),
    });
    if (!res.ok) {
      return res;
    }
    const data = await res.json();
    await fetchChatrooms();
    return data;
  };

  return (
    <ChatroomsContext.Provider
      value={{
        chatrooms,
        fetchChatrooms,
        deleteChatroom,
        addChatroom,
      }}
    >
      {children}
    </ChatroomsContext.Provider>
  );
}

export default function useChatrooms() {
  const context = useContext(ChatroomsContext);
  if (!context) {
    throw new Error("useChatrooms must be used within a ChatroomsProvider");
  }
  return context;
}
