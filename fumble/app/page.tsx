"use client";

import { useState } from "react";
import LoginView from "./components/LoginView";
import SwipingView from "./components/SwipingView";
import ChatView from "./components/ChatView";
import SelfProfileView from "./components/SelfProfileView";
import ChatDetailView from "./components/ChatDetailView";
import { Heart, MessageCircle, User } from "lucide-react";
import { UserProfile } from "./types/user";

interface Chat { id: number; name: string; }

export default function Home() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("swiping");
  const [activeChat, setActiveChat] = useState<Chat | null>(null);

  if (!currentUser) {
    return <LoginView onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  if (activeChat) {
    return <ChatDetailView chat={activeChat} onBack={() => setActiveChat(null)} />;
  }

  return (
    <main className="min-h-screen w-full bg-[#f4f4f5] flex justify-center">
      <div className="w-full max-w-md bg-[#f4f4f5] min-h-screen flex flex-col relative shadow-2xl">

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto w-full">
          {activeTab === "swiping" && <SwipingView currentUser={currentUser} />}
          {activeTab === "chat" && <ChatView onSelectChat={(chat) => setActiveChat(chat)} />}
          {activeTab === "profile" && <SelfProfileView currentUser={currentUser} />}
        </div>

        {/* Bottom Tab Bar */}
        <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-zinc-200 h-20 flex justify-around items-center z-50 left-1/2 -translate-x-1/2 pb-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {/* Swiping Tab */}
          <button
            onClick={() => setActiveTab("swiping")}
            className={`p-4 transition-colors ${activeTab === "swiping" ? "text-rose-500" : "text-zinc-400 hover:text-zinc-600"}`}
          >
            <Heart size={32} strokeWidth={activeTab === "swiping" ? 3 : 2} fill={activeTab === "swiping" ? "currentColor" : "none"} />
          </button>

          {/* Chat Tab */}
          <button
            onClick={() => setActiveTab("chat")}
            className={`p-4 transition-colors ${activeTab === "chat" ? "text-rose-500" : "text-zinc-400 hover:text-zinc-600"}`}
          >
            <MessageCircle size={32} strokeWidth={activeTab === "chat" ? 3 : 2} />
          </button>

          {/* Profile Tab */}
          <button
            onClick={() => setActiveTab("profile")}
            className={`p-4 transition-colors ${activeTab === "profile" ? "text-rose-500" : "text-zinc-400 hover:text-zinc-600"}`}
          >
            <User size={32} strokeWidth={activeTab === "profile" ? 3 : 2} />
          </button>
        </div>
      </div>
    </main>
  );
}