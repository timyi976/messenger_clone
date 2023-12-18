import { NextResponse, type NextRequest } from "next/server";

import { and, eq } from "drizzle-orm";
import Pusher from "pusher";

import { db } from "@/db";
import { chatsTable, messagesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { privateEnv } from "@/lib/env/private";
import { publicEnv } from "@/lib/env/public";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { chatId, content } = await req.json();

    const [chatroom] = await db
      .select({
        chatId: chatsTable.displayId,
        userId1: chatsTable.userId1,
        userId2: chatsTable.userId2,
      })
      .from(chatsTable)
      .where(and(eq(chatsTable.displayId, chatId)));

    if (!chatroom) {
      return NextResponse.json(
        { error: "Chatroom not found" },
        { status: 404 },
      );
    }

    if (chatroom.userId1 !== userId && chatroom.userId2 !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let otherUserId;
    if (chatroom.userId1 === userId) {
      otherUserId = chatroom.userId2;
    } else {
      otherUserId = chatroom.userId1;
    }

    // create message
    const [res] = await db
      .insert(messagesTable)
      .values({
        content: content,
        senderId: userId,
        chatId: chatId,
      })
      .returning()
      .execute();

    // update latestMessageId
    await db
      .update(chatsTable)
      .set({
        latestMessageId: res.displayId,
      })
      .where(and(eq(chatsTable.displayId, chatId)))
      .execute();

    // pusher
    const pusher = new Pusher({
      appId: privateEnv.PUSHER_ID,
      key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
      secret: privateEnv.PUSHER_SECRET,
      cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true,
    });

    await pusher.trigger(`private-${otherUserId}`, "chat:update", {
      senderId: userId,
    });

    return NextResponse.json(
      {
        message: res,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { messageId, method } = await req.json();

    // check if the message exists
    const [message] = await db
      .select({
        id: messagesTable.displayId,
        senderId: messagesTable.senderId,
        content: messagesTable.content,
        chatId: messagesTable.chatId,
        isVisible: messagesTable.isVisible,
        timestamp: messagesTable.timestamp,
      })
      .from(messagesTable)
      .where(and(eq(messagesTable.displayId, messageId)))
      .execute();

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // check if method is "pin", "unpin", "invisible"
    if (method !== "pin" && method !== "unpin" && method !== "invisible") {
      return NextResponse.json(
        { error: "Method not allowed" },
        { status: 404 },
      );
    }

    // check if the user is the sender of the message
    if (method === "invisible" && message.senderId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // get other use id
    const [chatroom] = await db
      .select({
        userId1: chatsTable.userId1,
        userId2: chatsTable.userId2,
      })
      .from(chatsTable)
      .where(and(eq(chatsTable.displayId, message.chatId)))
      .execute();

    let otherUserId;
    if (chatroom.userId1 === userId) {
      otherUserId = chatroom.userId2;
    } else {
      otherUserId = chatroom.userId1;
    }

    let ret_message;

    // pin the message
    if (method === "pin") {
      ret_message = await db
        .update(chatsTable)
        .set({
          pinnedMessageId: messageId,
        })
        .where(and(eq(chatsTable.displayId, message.chatId)))
        .execute();
      // pusher
      const pusher = new Pusher({
        appId: privateEnv.PUSHER_ID,
        key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
        secret: privateEnv.PUSHER_SECRET,
        cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
        useTLS: true,
      });

      await pusher.trigger(`private-${otherUserId}`, "chatrooms:update", {
        senderId: userId,
      });
    }
    if (method === "unpin") {
      // check if the message is pinned
      const [chatroom] = await db
        .select({
          pinnedMessageId: chatsTable.pinnedMessageId,
        })
        .from(chatsTable)
        .where(and(eq(chatsTable.displayId, message.chatId)))
        .execute();

      if (chatroom.pinnedMessageId !== messageId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      ret_message = await db
        .update(chatsTable)
        .set({
          pinnedMessageId: null,
        })
        .where(and(eq(chatsTable.displayId, message.chatId)))
        .execute();

      // pusher
      const pusher = new Pusher({
        appId: privateEnv.PUSHER_ID,
        key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
        secret: privateEnv.PUSHER_SECRET,
        cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
        useTLS: true,
      });

      await pusher.trigger(`private-${otherUserId}`, "chatrooms:update", {
        senderId: userId,
      });
    }
    if (method === "invisible") {
      const [chatroom] = await db
        .select({
          pinnedMessageId: chatsTable.pinnedMessageId,
        })
        .from(chatsTable)
        .where(and(eq(chatsTable.displayId, message.chatId)))
        .execute();

      // pinned message cannot be invisible
      if (chatroom.pinnedMessageId === messageId) {
        return NextResponse.json(
          { error: "Pinned message cannot be invisible" },
          { status: 400 },
        );
      }

      ret_message = await db
        .update(messagesTable)
        .set({
          isVisible: false,
        })
        .where(and(eq(messagesTable.displayId, messageId)))
        .execute();

      // pusher
      const pusher = new Pusher({
        appId: privateEnv.PUSHER_ID,
        key: publicEnv.NEXT_PUBLIC_PUSHER_KEY,
        secret: privateEnv.PUSHER_SECRET,
        cluster: publicEnv.NEXT_PUBLIC_PUSHER_CLUSTER,
        useTLS: true,
      });

      await pusher.trigger(`private-${otherUserId}`, "chat:update", {
        senderId: userId,
      });
    }

    // return
    return NextResponse.json(
      {
        message: ret_message,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
