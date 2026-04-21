"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { X, Send, Bot, User, Sparkles } from "lucide-react"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import { v4 as uuidv4 } from "uuid"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  isStreaming?: boolean
  status?: string
}

type ChatDrawerProps = {
  open: boolean
  onClose: () => void
}

export default function ChatDrawer({ open, onClose }: ChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentStatus, setCurrentStatus] = useState("")
  const [sessionId] = useState(() => uuidv4())
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ✅ Stream messages from backend with status updates
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")

    // ✅ Add user message immediately
    const userMsg: Message = {
      id: uuidv4(),
      role: "user",
      content: userMessage,
    }
    setMessages((prev) => [...prev, userMsg])

    // ✅ Add streaming assistant message
    const assistantId = uuidv4()
    const emptyAssistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      isStreaming: true,
      status: "Processing...",
    }
    setMessages((prev) => [...prev, emptyAssistantMsg])

    setIsLoading(true)
    setCurrentStatus("Starting...")
    abortControllerRef.current = new AbortController()

    try {
      // ✅ Call your Next.js API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userMessage: userMessage,
          sessionId: sessionId,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No response body")
      }

      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")

        // ✅ Keep the last incomplete line in buffer
        buffer = lines[lines.length - 1]

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim()
          if (!line) continue

          console.log("Raw Stream Line:", line)

          if (line.startsWith("data: ")) {
            try {
              const jsonStr = line.slice(6).trim()
              if (jsonStr === "[DONE]") {
                console.log("Stream signaled completion");
                continue
              }

              const chunk = JSON.parse(jsonStr)
              console.log("Parsed Chunk:", chunk)

              // ✅ Handle different message types from backend
              if ((chunk.type === "text" || chunk.type === "token") && (chunk.content || chunk.text)) {
                const content = chunk.content || chunk.text
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? {
                          ...msg,
                          content: msg.content + content,
                        }
                      : msg
                  )
                )
              } else if (chunk.type === "status") {
                // ✅ Handle status updates and display them
                const statusText = typeof chunk.data === "string" 
                  ? chunk.data 
                  : (chunk.data?.status || JSON.stringify(chunk.data))
                setCurrentStatus(statusText)

                // Also update the message with status
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? {
                          ...msg,
                          status: statusText,
                        }
                      : msg
                  )
                )

                console.log("Status Update:", statusText)
              } else if (chunk.type === "update") {
                // ✅ Handle node updates from your LangChain graph
                const nodeStatus = `${chunk.node}: Processing...`
                setCurrentStatus(nodeStatus)

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? {
                          ...msg,
                          status: nodeStatus,
                        }
                      : msg
                  )
                )

                console.log("Node Update:", chunk.node, chunk.data)
              } else if (chunk.type === "error") {
                // ✅ Handle error events
                console.error("Stream Error:", chunk.error)
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? {
                          ...msg,
                          status: `Error: ${chunk.error}`,
                        }
                      : msg
                  )
                )
              }
            } catch (e) {
              console.error("Failed to parse chunk:", e, line)
            }
          }
        }
      }

      // ✅ Mark streaming as complete
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, isStreaming: false, status: undefined }
            : msg
        )
      )
      setCurrentStatus("")
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Chat error:", error)

        // ✅ Add error message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content: `Error: ${error.message}`,
                  isStreaming: false,
                  status: undefined,
                }
              : msg
          )
        )
        setCurrentStatus("")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 💧 Rain Effect with proper initialization
  useEffect(() => {
    if (!open) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      return
    }

    const initTimeout = setTimeout(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const parent = canvas.parentElement
      if (!parent) return

      const resizeCanvas = () => {
        const rect = parent.getBoundingClientRect()
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

      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      drawRain()

      const handleResize = () => resizeCanvas()
      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
        if (frameRef.current) cancelAnimationFrame(frameRef.current)
      }
    }, 100)

    return () => clearTimeout(initTimeout)
  }, [open])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

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
          <div className="bg-blue-600 text-white flex items-center justify-between px-4 py-3 shrink-0">
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

          {/* ✅ Status Bar (Shows current processing status) */}
          {currentStatus && (
            <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-blue-500"
                    style={{
                      animation: "bounce 1.4s infinite",
                      animationDelay: "0s",
                    }}
                  />
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-blue-500"
                    style={{
                      animation: "bounce 1.4s infinite",
                      animationDelay: "0.2s",
                    }}
                  />
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-blue-500"
                    style={{
                      animation: "bounce 1.4s infinite",
                      animationDelay: "0.4s",
                    }}
                  />
                </div>
                <span className="text-xs text-gray-700 font-medium">
                  {currentStatus}
                </span>
              </div>
            </div>
          )}

          {/* Body with Messages */}
          <div className="relative flex-1 h-full overflow-hidden bg-gradient-to-b from-blue-50 to-white">
            {/* Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
              />
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

            {/* Messages */}
            <div className="relative z-10 h-full overflow-y-auto p-4 space-y-6 no-scrollbar">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in duration-500">
                  <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-amber-400 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-200">
                    <Bot size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Meet COCO</h3>
                  <p className="text-sm text-gray-500 max-w-[240px] leading-relaxed">
                    Your personal AI assistant, powered by the latest LangGraph LangChain workflows my brain is Open AI. How can I help you today?
                  </p>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className="group animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div
                    className={`flex gap-3 ${
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Icon / Avatar */}
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                      msg.role === "user" 
                        ? "bg-blue-600 border-blue-500 text-white" 
                        : "bg-white border-amber-200 text-amber-600 shadow-sm"
                    }`}>
                      {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                    </div>

                    {/* Content Area */}
                    <div className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      <div className={`px-1 py-0.5 mb-1 text-[10px] uppercase tracking-wider font-bold opacity-40 select-none ${
                        msg.role === "user" ? "text-right" : "text-left"
                      }`}>
                        {msg.role === "user" ? "You" : "Assistant"}
                      </div>
                      
                      <div
                        className={`text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-none shadow-md"
                            : "bg-transparent text-gray-800"
                        }`}
                      >
                        <div className={`prose prose-sm max-w-none dark:prose-invert prose-p:m-0 prose-headings:m-0 prose-lists:m-0 ${
                          msg.role === "user" ? "text-white" : "text-gray-800"
                        }`}>
                          <ReactMarkdown
                            components={{
                              p: ({ node, ...props }) => (
                                <p style={{ marginBottom: "0.5rem" }} {...props} />
                              ),
                              li: ({ node, ...props }) => (
                                <li style={{ marginLeft: "1rem" }} {...props} />
                              ),
                              code: ({ node, ...props }) => (
                                <code className="bg-gray-100 rounded px-1 py-0.5 font-mono text-xs" {...props} />
                              ),
                              pre: ({ node, ...props }) => (
                                <pre className="bg-gray-900 text-white p-3 rounded-lg my-2 overflow-x-auto text-xs" {...props} />
                              )
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>

                        {/* ✅ Streaming indicator for Claude-style */}
                        {msg.isStreaming && !msg.content && (
                          <div className="flex items-center gap-1.5 mt-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-100 w-fit">
                            <Sparkles size={12} className="text-amber-500 animate-pulse" />
                            <span className="text-[10px] text-amber-600 font-medium animate-pulse">Thinking...</span>
                          </div>
                        )}
                        
                        {msg.isStreaming && msg.content && (
                           <span className="inline-block w-1.5 h-4 bg-blue-400 ml-1 animate-pulse align-middle" />
                        )}
                      </div>
                      
                      {/* ✅ Display status below message */}
                      {msg.status && (
                        <div className="flex items-center gap-1.5 mt-2 px-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                          <span className="text-[10px] text-gray-400 font-medium">
                            {msg.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Section */}
          <div className="border-t bg-white p-4 flex flex-col gap-3 shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
              <Input
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 rounded-full px-4 py-2 bg-gray-100 border-0 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2.5 h-auto w-auto transition-all duration-200"
              >
                <Send size={18} />
              </Button>
            </form>
            <p className="text-center text-xs text-gray-400">
              AI may make mistakes. Please verify important information.
            </p>
          </div>

          {/* Animations */}
          <style>{`
            @keyframes bounce {
              0%, 80%, 100% {
                opacity: 0.5;
                transform: translateY(0);
              }
              40% {
                opacity: 1;
                transform: translateY(-8px);
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}