"use client";
import React from "react";
import { AssistanceProvider } from "@/context/AssistantContext";
import AssistantList from "./_components/AssistantList";
import ChatUi from "./_components/ChatUi";
import AssistantSettings from "./_components/AssistantSettings";

export default function WorkspacePage() {
  return (
    <AssistanceProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {/* Left Sidebar - Assistant List */}
        <aside className="hidden md:flex w-[260px] border-r border-gray-200 bg-white overflow-hidden">
          <AssistantList />
        </aside>

        {/* Main Content - Chat UI */}
        <main className="flex flex-1 flex-col bg-gray-50 overflow-hidden">
          <ChatUi />
        </main>

        {/* Right Sidebar - Assistant Settings */}
        <aside className="hidden lg:flex w-[300px] border-l border-gray-200 bg-white overflow-hidden">
          <AssistantSettings />
        </aside>
      </div>
    </AssistanceProvider>
  );
}
