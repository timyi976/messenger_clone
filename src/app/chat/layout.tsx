"use client";

import AuthBar from "@/components/AuthBar";
import ChatroomsBar from "@/components/ChatroomsBar";
import { ChatProvider } from "@/hooks/useChat";

type Props = {
  children: React.ReactNode;
};

function DocsLayout({ children }: Props) {
  return (
    // overflow-hidden for parent to hide scrollbar
    <main className="flex-rows fixed top-0 flex h-screen w-full overflow-hidden">
      <ChatProvider>
        <nav className="flex w-1/5 flex-col overflow-y-scroll border-r bg-slate-100 pb-10">
          <AuthBar />
        </nav>
        <nav className="flex w-2/5 flex-col overflow-y-scroll border-r bg-slate-100 pb-10">
          <ChatroomsBar />
        </nav>
        <div className="w-full overflow-y-scroll">{children}</div>
      </ChatProvider>
    </main>
  );
}

export default DocsLayout;
