"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { X, Send } from "lucide-react"
import Image from "next/image"

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef<number | null>(null)         // ✅ track animation frame

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

  // ✅ Re-run rain effect whenever `open` changes to true
  useEffect(() => {
    if (!open) {
      // Cancel animation when drawer closes
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      return
    }

    // ✅ Delay to wait for spring animation to settle & canvas to have real dimensions
    const initTimeout = setTimeout(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const parent = canvas.parentElement
      if (!parent) return

      const resizeCanvas = () => {
        const rect = parent.getBoundingClientRect()
        // ✅ Guard: only resize if dimensions are real
        if (rect.width > 0 && rect.height > 0) {
          canvas.width = rect.width
          canvas.height = rect.height
        }
      }

      resizeCanvas()

      const getW = () => canvas.width
      const getH = () => canvas.height

      const raindrops = Array.from({ length: 60 }).map(() => ({
        x: Math.random() * getW(),
        y: Math.random() * getH(),
        size: Math.random() * 3 + 2,
        speed: Math.random() * 2 + 1.5,
        color: `hsla(${Math.random() * 360}, 100%, 70%, 0.4)`,
      }))

      const drawRain = () => {
        ctx.clearRect(0, 0, getW(), getH())

        raindrops.forEach((drop) => {
          const x = drop.x
          const y = drop.y
          const s = drop.size

          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.bezierCurveTo(x - s, y + s, x - s, y + s * 2, x, y + s * 2.5)
          ctx.bezierCurveTo(x + s, y + s * 2, x + s, y + s, x, y)
          ctx.closePath()
          ctx.fillStyle = drop.color
          ctx.fill()

          ctx.beginPath()
          ctx.arc(x - s / 3, y + s, s / 3, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(255,255,255,0.4)"
          ctx.fill()

          drop.y += drop.speed
          if (drop.y > getH()) {
            drop.y = -20
            drop.x = Math.random() * getW()
          }
        })

        frameRef.current = requestAnimationFrame(drawRain)
      }

      // ✅ Cancel any previous animation before starting a new one
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      drawRain()

      const handleResize = () => resizeCanvas()
      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
        if (frameRef.current) cancelAnimationFrame(frameRef.current)
      }
    }, 100) // ✅ 100ms delay lets the drawer animate into view first

    return () => clearTimeout(initTimeout)
  }, [open]) // ✅ depends on `open`

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="fixed top-0 right-0 h-screen w-80 sm:w-96 bg-white shadow-2xl border-l z-50 flex flex-col"
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

          {/* BODY */}
          <div className="relative flex-1 h-full overflow-hidden bg-mist-200">
            <div className="absolute inset-0 z-0 pointer-events-none">
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="/watermark.png"
                  width={100}
                  height={100}
                  alt="watermark"
                  className="opacity-10 w-64 h-64 object-contain"
                />
              </div>
            </div>

            <div className="relative z-10 h-full overflow-y-auto p-3 space-y-3 no-scrollbar">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-3 py-2 rounded-xl max-w-[75%] text-sm ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-amber-200 text-black"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* INPUT */}
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