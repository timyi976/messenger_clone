"use client";

import { useRef, useState, useEffect } from "react";
import { LuSearch, LuSearchX } from "react-icons/lu";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";

export default function SearchBar() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"search" | "clear">("search");

  useEffect(() => {
    if (search !== null) {
      setMode("clear");
    } else {
      setMode("search");
    }
  }, [search]);

  return (
    <form
      className="m-1 flex items-center justify-center"
      onSubmit={(e) => {
        e.preventDefault();

        if (mode === "search") {
          const params = new URLSearchParams(searchParams);

          params.set("search", inputRef.current?.value.toString() || "");
          if (inputRef.current?.value.toString() === "") {
            params.delete("search");
          }
          router.push(`?${params.toString()}`);
        } else {
          const params = new URLSearchParams(searchParams);
          params.delete("search");
          router.push(`?${params.toString()}`);
        }

        // clear input
        inputRef.current!.value = "";
      }}
    >
      <Input
        ref={inputRef}
        placeholder="Search..."
        className="m-1 w-3/4"
        onChange={() => {
          if (search !== null && inputRef.current?.value.toString() === "") {
            setMode("clear");
          } else {
            setMode("search");
          }
        }}
      />
      <button className="group" type="submit">
        <div
          // prefix a class with hover: to make it only apply when the element is hovered
          className="flex w-fit items-center gap-4 rounded-full p-2 transition-colors duration-300 group-hover:bg-gray-200 lg:pr-4"
          onClick={() => {}}
        >
          {mode === "search" ? (
            <div className="grid h-[20px] w-[20px] place-items-center">
              <LuSearch size={20} strokeWidth={3} className="m-1" />
            </div>
          ) : (
            <div className="grid h-[20px] w-[20px] place-items-center">
              <LuSearchX size={20} strokeWidth={3} className="m-1" />
            </div>
          )}
        </div>
      </button>
    </form>
  );
}
