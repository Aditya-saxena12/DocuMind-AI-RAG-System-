"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "ai";
  content: string;
  sources?: string[];
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const aiMessage: Message = { role: "ai", content: "", sources: [] };
    setMessages((prev) => [...prev, aiMessage]);

    try {
      const formData = new FormData();
      formData.append("question", input);

      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        
        const lines = chunkValue.split("\n\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "");
            if (dataStr === "[DONE]") {
              done = true;
              break;
            }
            
            try {
              const data = JSON.parse(dataStr);
              if (data.type === "token") {
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  return [...prev.slice(0, -1), { ...last, content: last.content + data.content }];
                });
              } else if (data.type === "sources") {
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  return [...prev.slice(0, -1), { ...last, sources: data.content }];
                });
              }
            } catch (e) {
              console.error("Error parsing SSE data", e);
            }
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar"
      >
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                <Bot className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Ask anything</h3>
                <p className="text-gray-400">I'm ready to answer based on your document.</p>
              </div>
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                ${msg.role === "user" ? "bg-indigo-600" : "bg-white/5 border border-white/10"}
              `}>
                {msg.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-indigo-400" />}
              </div>
              
              <div className="max-w-[80%] space-y-3">
                <div className={`
                  p-4 text-sm leading-relaxed
                  ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}
                `}>
                  {msg.content || (isLoading && i === messages.length - 1 && <Loader2 className="w-4 h-4 animate-spin" />)}
                </div>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2 animate-fade-in">
                    {msg.sources.map((src, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-gray-400">
                        <BookOpen className="w-3 h-3" />
                        <span>Source: {src.split(/[\\/]/).pop()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-8 pt-0">
        <form 
          onSubmit={handleSendMessage}
          className="relative max-w-4xl mx-auto glass-card p-2 pr-4 flex items-center gap-2 group focus-within:ring-2 ring-indigo-500/20 transition-all"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here..."
            className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm text-white placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`
              p-3 rounded-xl transition-all
              ${!input.trim() || isLoading ? "bg-white/5 text-gray-600" : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20"}
            `}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
