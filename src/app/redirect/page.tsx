// redirect user
// import { useEffect } from "react";
import { redirect } from "next/navigation";
// import { useRouter } from 'next/navigation'
// import { useRouter } from "next/router";
import { NextResponse } from "next/server";

import { sql } from "drizzle-orm";

import { db } from "@/db";
import { auth } from "@/lib/auth";

export default async function RedirectPage() {
  // get user session
  const session = await auth();
  if (!session || !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  // const router = useRouter();

  const fetchAndRedirect = async () => {
    try {
      const res = await db.execute(
        sql`SELECT C.display_id as id, C.user_id1, C.user_id2, C.pinned_message_id, C.latest_message_id, U.username as username1, V.username as username2, M.content as latest_message_content, N.content as pinned_message_content, M.timestamp as latest_message_timestamp, M.sender_id as latest_message_sender_id, N.sender_id as pinned_message_sender_id FROM chats as C JOIN users U ON C.user_id1 = U.display_id JOIN users V ON C.user_id2 = V.display_id LEFT JOIN messages M ON C.latest_message_id = M.display_id LEFT JOIN messages N ON C.pinned_message_id = N.display_id WHERE C.user_id1 = ${userId} OR C.user_id2 = ${userId} ORDER BY latest_message_timestamp DESC`,
      );

      const chatrooms = res.rows;
      const firstChatroomId = chatrooms[0].id;

      // redirect
      // redirect(`${publicEnv.NEXT_PUBLIC_BASE_URL}/chat/${firstChatroomId}`);
      redirect(`/chat/${firstChatroomId}`)
      // router.push(`/chat/${firstChatroomId}`);
    } catch (e) {
      // redirect(`${publicEnv.NEXT_PUBLIC_BASE_URL}/chat`);
      redirect(`/chat`)
      // router.push(`/chat`);
    }
  };

  setTimeout(() => {
    fetchAndRedirect();
  }, 1000);

  return <></>;
}
