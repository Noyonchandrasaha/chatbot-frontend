"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { X, Send } from "lucide-react"

// ✅ Props type
type ChatCardProps = {
  onClose: () => void
}

type Message = {
  role: "user" | "bot"
  text: string
}

export default function ChatCard({ onClose }: ChatCardProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hello 👋 How can I help you?" },
  ])
  const [input, setInput] = useState("")
  
  // ✅ Properly typed ref
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // ✅ Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ✅ Send message handler
  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = { role: "user", text: input }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // 🔁 Simulated bot response (replace with API later)
    setTimeout(() => {
      const botMessage: Message = {
        role: "bot",
        text: "Thanks! I'm processing your request...",
      }

      setMessages((prev) => [...prev, botMessage])
    }, 800)
  }

  return (
    <Card className="fixed bottom-24 right-5 w-80 h-150 flex flex-col shadow-2xl z-50 rounded-2xl overflow-hidden border p-0 gap-0">
      
      {/* Header */}
      <CardHeader className="bg-blue-600 text-white flex flex-row items-center justify-between px-4 py-3 space-y-0">
        <CardTitle className="text-base font-semibold">
          AI Assistant
        </CardTitle>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X size={18} />
        </Button>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 bg-gray-500 no-scrollbar">
        
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-3 py-2 rounded-2xl max-w-[75%] text-sm ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      <CardFooter className="px-2 pb-2 border-t flex flex-col gap-2 bg-white">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 text-sm"
          />

          <Button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Send size={16} />
          </Button>
        </div>

        <p className="text-center text-[10px] text-gray-400">
          AI may make mistakes. Please verify important information.
        </p>
      </CardFooter>
    </Card>
  )
}