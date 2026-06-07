"use client";

import dynamic from "next/dynamic";
import { MessageSquare } from "lucide-react";

const ChatApp = dynamic(() => import("./ChatApp"), {
  ssr: false,
  loading: () => (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <MessageSquare className="h-7 w-7 text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-semibold">ChatApp</h1>
          <p className="text-sm text-muted-foreground">Preparing your workspace...</p>
        </div>
      </div>
    </main>
  ),
});

export default function Home() {
  return <ChatApp />;
}
