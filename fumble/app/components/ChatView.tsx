"use client";

import { MessageCircle } from "lucide-react";
import { UserProfile } from "../types/user";
import { getAllUsersExcept } from "../lib/users";
import { getChatLastMessageTime } from "../lib/chatStorage";

interface ChatViewProps {
  onSelectChat?: (chat: { id: number; name: string }) => void;
  currentUser: UserProfile;
}

export default function ChatView({ onSelectChat, currentUser }: ChatViewProps) {
  // Get all users except the current user for testing
  const allOtherUsers = getAllUsersExcept(currentUser.id);

  // Map users to chats with last message time
  const chatsWithTime = allOtherUsers.map(user => {
    const lastMessageTime = getChatLastMessageTime(user.id);
    return {
      id: user.id,
      name: user.name,
      message: lastMessageTime > 0 ? "Tap to view conversation" : "Start a conversation!",
      time: lastMessageTime > 0 ? formatTime(lastMessageTime) : "New",
      lastMessageTime
    };
  });

  // Sort by last message time (most recent first), then alphabetically
  const chats = chatsWithTime.sort((a, b) => {
    if (a.lastMessageTime === 0 && b.lastMessageTime === 0) {
      // Both have no messages, sort alphabetically
      return a.name.localeCompare(b.name);
    }
    if (a.lastMessageTime === 0) return 1; // a has no messages, put it after b
    if (b.lastMessageTime === 0) return -1; // b has no messages, put it after a
    // Both have messages, sort by most recent first
    return b.lastMessageTime - a.lastMessageTime;
  });

  function formatTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  }

  return (
    <div className="flex flex-col h-full bg-[#f4f4f5] pb-24">
      {/* Header */}
      <div className="p-4 bg-white shadow-sm border-b border-zinc-200">
        <h1 className="text-xl font-bold">Messages</h1>
      </div>

      {/* Chat List */}
      {chats.length > 0 ? (
        <div className="flex flex-col">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat && onSelectChat(chat)}
              className="p-4 bg-white border-b border-zinc-100 flex items-center gap-4 hover:bg-zinc-50 active:bg-zinc-100 transition-colors cursor-pointer"
            >
              {/* Avatar Placeholder */}
              <div className="w-12 h-12 bg-zinc-200 rounded-full flex items-center justify-center shrink-0">
                <span className="font-bold text-zinc-400">{chat.name[0]}</span>
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-md truncate">{chat.name}</h3>
                  <span className="text-xs text-zinc-400">{chat.time}</span>
                </div>
                <p className="text-zinc-500 text-sm truncate">{chat.message}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400 opacity-50">
          <MessageCircle size={48} className="mb-2" />
          <p>Keep swiping to match!</p>
        </div>
      )}
    </div>
  );
}
