import { NextResponse, type NextRequest } from "next/server";

import { and, eq } from "drizzle-orm";
import Pusher from "pusher";

import { db } from "@/db";
import { chatsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { privateEnv } from "@/lib/env/private";
import { publicEnv } from "@/lib/env/public";

// DELETE /api/chatrooms/:chatId
export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      chatId: string;
    };
  },
) {
  const dummyFun = (x) => {
    return x;
  }

  dummyFun(req);

  try {
    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const [chatroom] = await db
      .select({
        chatId: chatsTable.displayId,
        userId1: chatsTable.userId1,
        userId2: chatsTable.userId2,
      })
      .from(chatsTable)
      .where(and(eq(chatsTable.displayId, params.chatId)))
      .execute();

    if (!chatroom) {
      return NextResponse.json(
        { error: "Chatroom not found" },
        { status: 404 },
      );
    }

    if (chatroom.userId1 !== userId && chatroom.userId2 !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db
      .delete(chatsTable)
      .where(eq(chatsTable.displayId, params.chatId))
      .execute();

    // make sure the chatroom is deleted
    const [deletedChatroom] = await db
      .select({
        chatId: chatsTable.displayId,
      })
      .from(chatsTable)
      .where(and(eq(chatsTable.displayId, params.chatId)))
      .execute();

    if (deletedChatroom) {
      return NextResponse.json(
        { error: "Chatroom not deleted" },
        { status: 500 },
      );
    }

    let otherUserId;
    if (chatroom.userId1 === userId) {
      otherUserId = chatroom.userId2;
    } else {
      otherUserId = chatroom.userId1;
    }

    // pusher socket
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

    // return
    return NextResponse.json(
      {
        OK: true,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
