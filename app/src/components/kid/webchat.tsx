"use client";

import { useState, useRef, useEffect } from "react";
import { ChatBubble } from "./chat-bubble";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
}

interface WebChatProps {
  kidName: string;
  kidToken: string;
  gameName: string;
  gameIcon: string;
  onBack?: () => void;
}

export function WebChat({
  kidName,
  kidToken,
  gameName,
  gameIcon,
  onBack,
}: WebChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: `Hey ${kidName}! Welcome to ${gameName} ${gameIcon}\n\nI'm your game host! Ready to start? Just type "ready" or ask me anything!`,
      isUser: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: kidToken,
          message: userMessage.content,
          game: gameName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            content: data.response,
            isUser: false,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            content:
              "Oops! I had a little hiccup. Try sending your message again!",
            isUser: false,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content:
            "Hmm, I can't connect right now. Make sure you're connected to the internet and try again!",
          isUser: false,
        },
      ]);
    }

    setSending(false);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-full overflow-hidden">
      {/* Chat header */}
      <div className="bg-[#e60012] px-4 py-3 flex items-center gap-3 flex-shrink-0 pt-[max(0.75rem,env(safe-area-inset-top))]">
        {onBack && (
          <button
            onClick={onBack}
            className="text-white/80 hover:text-white text-sm font-bold flex-shrink-0 pr-1"
          >
            ← Games
          </button>
        )}
        <div className="text-2xl flex-shrink-0">{gameIcon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-white font-extrabold text-sm truncate">{gameName}</p>
          <p className="text-white/70 text-xs truncate">Playing as {kidName}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 min-h-0">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg.content}
            isUser={msg.isUser}
          />
        ))}
        {sending && (
          <div className="flex justify-start mb-3">
            <div className="bg-white/90 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="p-3 bg-white/5 backdrop-blur-sm flex-shrink-0 safe-bottom"
      >
        <div className="flex gap-2 w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your answer..."
            className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-white/90 text-gray-800 placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-[#e60012]"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="px-4 py-3 rounded-xl bg-[#e60012] text-white font-bold text-sm hover:bg-[#c7000f] disabled:opacity-50 transition-colors flex-shrink-0"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
