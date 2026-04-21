"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import ChatDrawer from "@/components/chat-interface/ChatDrawer"
import { Button } from "@/components/ui/button"

export default function Page() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">

      {/* 📄 Main Content (only shifts) */}
      <motion.div
        animate={{
          marginRight: open ? 380 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 25,
        }}
        className="flex-1"
      >
        <div className="max-w-4xl mx-auto px-6 py-20">
          {/* Hero Section */}
          <header className="text-center mb-16 space-y-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block p-3 rounded-2xl bg-blue-50 text-blue-600 mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
            </motion.div>
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
              Next-Gen <span className="text-blue-600">AI Assistant</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              A full-stack demonstration of real-time AI streaming using Next.js, FastAPI, Langgraph and LangChain. 
              Built with precision, performance, and a premium interface for better user experience.
            </p>
          </header>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <h3 className="font-bold text-lg mb-2">SSE Streaming</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Experience ultra-fast token-by-token responses using Server-Sent Events for a fluid, human-like interaction.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Agentic Workflow</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Powered by LangChain graphs with real-time status updates showing precisely what the AI is thinking.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Modern Stack</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                A seamless integration between a Next.js frontend and a high-performance FastAPI Python backend.
              </p>
            </div>
          </div>

          {/* Tech Badges */}
          <div className="flex flex-wrap justify-center gap-4 border-t pt-10 mb-12">
            <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 font-medium text-sm">Next.js 15+</span>
            <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 font-medium text-sm">FastAPI</span>
            <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 font-medium text-sm">LangChain v2</span>
            <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 font-medium text-sm">LangGraph</span>
            <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 font-medium text-sm">Tailwind CSS</span>
            <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 font-medium text-sm">Framer Motion</span>
            <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 font-medium text-sm">Open AI</span>
            <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 font-medium text-sm">Python</span>
          </div>

          <div className="flex justify-center">
            <Button 
                onClick={() => setOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-full text-lg font-bold shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Start Chatting Now
            </Button>
          </div>
        </div>

        {/* ✅ FLOAT BUTTON RESTORED */}
        {!open && (
          <Button
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 rounded-full bg-amber-300 z-50 group hover:bg-amber-500 transition"
          >
            <span className="absolute inset-0 bg-red-300 rounded-full opacity-70 animate-ping"></span>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 20l1.2-3.2A7.7 7.7 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </Button>
        )}
      </motion.div>

      {/* 💬 Chat Drawer */}
      <ChatDrawer open={open} onClose={() => setOpen(false)} />

    </div>
  )
}