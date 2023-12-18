import { NextResponse, type NextRequest } from "next/server";

import { and, eq } from "drizzle-orm";
import Pusher from "pusher";

import { db } from "@/db";
import { chatsTable, messagesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { privateEnv } from "@/lib/env/private";
import { publicEnv } from "@/lib/env/public";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      uId: string;
    };
  },
) {
  
  const dummyFun = (x) => {
    return x;
  }

  dummyFun(req);

  try {
    const chatId = params.uId;
    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // check if the chatroom exists
    const [chatroom] = await db
      .select({
        id: chatsTable.id,
        userId1: chatsTable.userId1,
        userId2: chatsTable.userId2,
      })
      .from(chatsTable)
      .where(and(eq(chatsTable.displayId, chatId)));

    if (!chatroom) {
      return NextResponse.json({ error: "Chatroom not found" }, { status: 404 });
    }

    const messages = await db
      .select({
        messageId: messagesTable.displayId,
        senderId: messagesTable.senderId,
        content: messagesTable.content,
        chatId: messagesTable.chatId,
        isVisible: messagesTable.isVisible,
        timestamp: messagesTable.timestamp,
      })
      .from(messagesTable)
      .where(and(eq(messagesTable.chatId, chatId)))
      .orderBy(messagesTable.timestamp)
      .execute();

    return NextResponse.json(
      {
        messages: messages,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      uId: string;
    };
  },
) {

  const dummyFun = (x) => {
    return x;
  }

  dummyFun(req);

  try {
    const messageId = params.uId;
    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // check if the message exists
    const [message] = await db
      .select({
        id: messagesTable.id,
        senderId: messagesTable.senderId,
        content: messagesTable.content,
        chatId: messagesTable.chatId,
        timestamp: messagesTable.timestamp,
      })
      .from(messagesTable)
      .where(and(eq(messagesTable.displayId, messageId)));

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // check if the user is the sender of the message
    if (message.senderId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // check if the message is pinned
    const [chatroom] = await db
      .select({
        pinnedMessageId: chatsTable.pinnedMessageId,
        userId1: chatsTable.userId1,
        userId2: chatsTable.userId2,
      })
      .from(chatsTable)
      .where(and(eq(chatsTable.displayId, message.chatId)));

    if (chatroom.pinnedMessageId === messageId) {
      return NextResponse.json(
        { error: "Pinned message cannot be deleted" },
        { status: 400 },
      );
    }

    let otherUserId;
    if (chatroom.userId1 === userId) {
      otherUserId = chatroom.userId2;
    } else {
      otherUserId = chatroom.userId1;
    }

    // delete the message
    await db
      .delete(messagesTable)
      .where(eq(messagesTable.displayId, messageId));

    // update latestMessageId
    const currentMessages = await db
      .select({
        id: messagesTable.displayId,
      })
      .from(messagesTable)
      .where(and(eq(messagesTable.chatId, message.chatId)))
      .orderBy(messagesTable.timestamp)
      .execute();

    const latestMessageId = currentMessages[currentMessages.length - 1].id;

    await db
      .update(chatsTable)
      .set({
        latestMessageId: latestMessageId,
      })
      .where(and(eq(chatsTable.displayId, message.chatId)))
      .execute();

    // pusher socket
    // TODO
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

    return NextResponse.json({ message: "Message deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
