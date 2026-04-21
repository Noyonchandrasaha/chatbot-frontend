"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { X, Send } from "lucide-react"

type Message = {
  role: "user" | "ai-bot"
  text: string
}

type ChatDrawerProps = {
  open: boolean
  onClose: () => void
}

export default function ChatDrawer({ open, onClose }: ChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai-bot", text: "Hello 👋 How can I help you?" },
  ])

  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    setMessages((p) => [...p, { role: "user", text: input }])
    setInput("")

    setTimeout(() => {
      setMessages((p) => [
        ...p,
        { role: "ai-bot", text: "Thanks! I'm processing your request..." },
      ])
    }, 700)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 25,
          }}
          className="
            fixed top-0 right-0 h-screen w-80 sm:w-96
            bg-white shadow-2xl border-l z-50
            flex flex-col
          "
        >
          {/* Header */}
          <div className="bg-blue-600 text-white flex items-center justify-between px-4 py-3">
            <h2 className="text-base font-semibold">AI Assistant</h2>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X size={18} />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-100 no-scrollbar">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-xl max-w-[75%] text-sm ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t bg-white p-3 flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}