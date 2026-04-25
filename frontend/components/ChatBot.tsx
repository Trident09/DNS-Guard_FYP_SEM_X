"use client";

import { useState } from "react";
import axios from "axios";
import { Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const INTENTS = ["I own this domain", "I want to report abuse", "I want to learn"];

export default function ChatBot({ domain }: { domain: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [intent, setIntent] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await axios.post("/api/chat", { domain, intent, message: text, history: messages });
      setMessages((m) => [...m, { role: "assistant", content: res.data.reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-3">AI Assistant</h2>
      {!intent && (
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">What brings you here?</p>
          <div className="flex flex-wrap gap-2">
            {INTENTS.map((i) => (
              <button
                key={i}
                onClick={() => setIntent(i)}
                className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-blue-600 rounded-lg transition-colors"
              >
                {i}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="h-64 overflow-y-auto space-y-3 mb-3 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                m.role === "user" ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 px-3 py-2 rounded-lg text-sm animate-pulse">Thinking...</div>
          </div>
        )}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={intent ? "Ask anything..." : "Select an intent first"}
          disabled={!intent}
          className="flex-1 px-3 py-2 rounded-lg bg-gray-700 text-sm focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!intent || loading}
          className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
