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
  gameName: string;
  gameIcon: string;
  instanceSubdomain: string;
}

export function WebChat({
  kidName,
  gameName,
  gameIcon,
  instanceSubdomain,
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
      // Connect to the family's OpenClaw instance
      const res = await fetch(
        `https://${instanceSubdomain}.play.kidsclaw.club/api/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage.content,
            game: gameName,
          }),
        }
      );

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
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="bg-white/10 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
        <div className="text-2xl">{gameIcon}</div>
        <div>
          <p className="text-white font-bold text-sm">{gameName}</p>
          <p className="text-white/60 text-xs">Playing as {kidName}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
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
      <form onSubmit={sendMessage} className="p-4 bg-white/5 backdrop-blur-sm">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your answer..."
            className="flex-1 px-4 py-3 rounded-xl bg-white/90 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="px-5 py-3 rounded-xl bg-violet-500 text-white font-bold text-sm hover:bg-violet-600 disabled:opacity-50 transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
