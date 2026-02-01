"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, MoreHorizontal, BadgeCheck, SendHorizontal } from "lucide-react";
import { Socket } from "socket.io-client";
import { updateChatLastMessage } from "../lib/chatStorage";
import { getUserById } from "../lib/users";
import ProfileCard from "./ProfileCard";
import PromptCard from "./PromptCard";
import VitalsCard from "./VitalsCard";
import PhotoCard from "./PhotoCard";

interface Message {
  id: number;
  text: string;
  isMe: boolean;
  timestamp: number;
}

interface ChatDetailViewProps {
  chat: { id: number; name: string };
  onBack: () => void;
  currentUserId: number;
  socket: Socket;
}

export default function ChatDetailView({ chat, onBack, currentUserId, socket }: ChatDetailViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "profile">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatUserProfile = getUserById(chat.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load message history on mount
  useEffect(() => {
    socket.emit("get_messages", { otherUserId: chat.id.toString() });

    const handleMessagesHistory = (history: any[]) => {
      const formatted = history.map(msg => ({
        id: msg.id,
        text: msg.text,
        isMe: msg.from === currentUserId.toString(),
        timestamp: msg.timestamp
      }));
      setMessages(formatted);
    };

    socket.on("messages_history", handleMessagesHistory);

    return () => {
      socket.off("messages_history", handleMessagesHistory);
    };
  }, [chat.id, socket, currentUserId]);

  useEffect(() => {
    const handleReceiveMessage = ({ from, message, timestamp, id }: { from: string; message: string; timestamp: number; id: number }) => {
      // Only handle messages from the current chat user
      if (from !== chat.id.toString()) return;

      console.log("Received message:", { from, message, timestamp });
      setMessages(prev => [...prev, {
        id: id || Date.now(),
        text: message,
        isMe: false,
        timestamp
      }]);
      // Update last message time for this chat
      updateChatLastMessage(chat.id);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, chat.id]);

  const handleSend = () => {
    if (inputText.trim() === "") return;

    const newMessage = {
      id: Date.now(),
      text: inputText,
      isMe: true,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMessage]);

    socket.emit("send_message", {
      to: chat.id.toString(),
      message: inputText,
      tempId: newMessage.id
    });

    // Update last message time for this chat
    updateChatLastMessage(chat.id);

    setInputText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white text-black font-sans z-50 fixed inset-0">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-100 bg-white">
        <button onClick={onBack} className="p-1 -ml-2">
          <ChevronLeft size={32} />
        </button>
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg">{chat.name}</span>
        </div>
        <div className="w-8"></div> {/* Spacer for center alignment */}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-100 bg-white">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-3 text-center text-sm font-bold ${activeTab === "chat" ? "border-b-2 border-black text-black" : "text-zinc-400"}`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 py-3 text-center text-sm font-bold ${activeTab === "profile" ? "border-b-2 border-black text-black" : "text-zinc-400"}`}
        >
          Profile
        </button>
      </div>

      {activeTab === "chat" ? (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-white">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex w-full ${msg.isMe ? 'justify-end' : 'justify-start items-end gap-2'}`}>

                {/* Avatar for Their messages */}
                {!msg.isMe && (
                  <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-500 shrink-0">
                    {chat.name[0]}
                  </div>
                )}

                <div
                  className={`max-w-[75%] px-4 py-3 text-sm leading-relaxed
                    ${msg.isMe
                      ? 'bg-black text-white rounded-2xl rounded-tr-sm'
                      : 'bg-zinc-100 text-black rounded-2xl rounded-tl-sm'
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-zinc-100 pb-24">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-zinc-100 rounded-full h-12 flex items-center px-4">
                <input
                  type="text"
                  placeholder="Send a message"
                  className="bg-transparent w-full outline-none text-sm placeholder-zinc-400"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <button
                onClick={handleSend}
                className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-black bg-white shadow-sm hover:bg-zinc-50 active:scale-95 transition-all"
              >
                <SendHorizontal size={20} />
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Profile View */
        <div className="flex-1 overflow-y-auto p-3 pb-24 flex flex-col gap-3 bg-[#f4f4f5]">
          {chatUserProfile ? (
            <>
              <ProfileCard
                name={chatUserProfile.name}
                imageSrc={chatUserProfile.mainPhoto}
                tags={chatUserProfile.tags}
              />

              {chatUserProfile.prompts?.[0] && (
                <PromptCard
                  question={chatUserProfile.prompts[0].question}
                  answer={chatUserProfile.prompts[0].answer}
                />
              )}

              <VitalsCard
                age={chatUserProfile.age}
                height={chatUserProfile.height}
                stereotype={chatUserProfile.stereotype}
                profession={chatUserProfile.profession}
                location={chatUserProfile.location}
              />

              {chatUserProfile.photos?.map((photo, idx) => (
                <PhotoCard key={`photo-${idx}`} imageSrc={photo} />
              ))}

              {chatUserProfile.prompts?.[1] && (
                <PromptCard
                  question={chatUserProfile.prompts[1].question}
                  answer={chatUserProfile.prompts[1].answer}
                />
              )}

              {chatUserProfile.prompts?.[2] && (
                <PromptCard
                  question={chatUserProfile.prompts[2].question}
                  answer={chatUserProfile.prompts[2].answer}
                />
              )}
            </>
          ) : (
            <div className="p-8 text-center text-zinc-400">User profile not found</div>
          )}
        </div>
      )}
    </div>
  );
}
