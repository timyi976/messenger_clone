"use client";

import { useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { LuPlus } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import useChatrooms from "@/hooks/useChatrooms";

export default function AddChatroomButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  const { addChatroom } = useChatrooms();

  const usernameRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    const targetUsername = usernameRef.current?.value;

    if (!targetUsername) {
      alert("Please enter an username!");
      return false;
    }

    try {
      const ret = await addChatroom(targetUsername);

      if (!ret.chatroom && !ret.ok) {
        const body = await ret.json();
        alert(body.error);
        return false;
      }

      const newChatroom = ret.chatroom;

      const chatId = newChatroom.displayId;

      setModalOpen(false);

      router.push(`/chat/${chatId}`)
    } catch (e) {
      console.error(e);
      alert(e);
    }
  };

  const dialog = (
    <Dialog
      open={modalOpen}
      onOpenChange={() => {
        setModalOpen(false);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a new chatroom</DialogTitle>
          <DialogDescription>
            Create a new chatroom!
            Please enter the username of the person you want to chat with.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              ref={usernameRef}
              placeholder="Enter an username"
              className="w-fit"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <div className="m-1 flex self-end">
        <button className="group">
          <div
            className="flex w-fit items-center gap-4 rounded-full p-2 align-bottom transition-colors duration-300 group-hover:bg-gray-200 lg:pr-4"
            onClick={() => {
              setModalOpen(true);
            }}
          >
            <div className="grid h-[20px] w-[20px] place-items-center">
              <LuPlus size={26} strokeWidth={2} />
            </div>
          </div>
        </button>
      </div>
      {dialog}
    </>
  );
}
