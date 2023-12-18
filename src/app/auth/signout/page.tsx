"use client";

import { useEffect } from "react";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { publicEnv } from "@/lib/env/public";

function SignOutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (session) {
      signOut({ callbackUrl: publicEnv.NEXT_PUBLIC_BASE_URL });
    }
    router.push("/");
  }, [session, router]);

  return <></>;
}

export default SignOutPage;
