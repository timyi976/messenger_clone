import { useState } from "react";
import { LuSendHorizonal } from "react-icons/lu";

import { useChat } from "@/hooks/useChat";

import { Input } from "./ui/input";

export default function MessageInput() {
  const [content, setContent] = useState("");
  const { sendMessage } = useChat();

  return (
    <>
      <form
        className="m-1 flex items-center justify-center"
        onSubmit={async (e) => {
          e.preventDefault();
          if (content === "") return;
          await sendMessage(content);
          setContent("");
        }}
      >
        <Input
          type="text"
          placeholder="Aa"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
          }}
          className="m-1 w-full"
        />
        <button type="submit" className="group">
          <div
            // prefix a class with hover: to make it only apply when the element is hovered
            className="flex w-fit items-center gap-4 rounded-full p-2 transition-colors duration-300 group-hover:bg-gray-200 lg:pr-4"
            onClick={() => {}}
          >
            <div className="grid h-[20px] w-[20px] place-items-center">
              <LuSendHorizonal size={20} strokeWidth={2} className="m-1" />
            </div>
          </div>
        </button>
      </form>
    </>
  );
}
