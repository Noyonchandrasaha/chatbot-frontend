import { Button } from "@/components/ui/button"
import ChatCard from "@/components/chat-interface/chat-card"
export default function Page() {
  return (
    <div>
      <h1 className="text-3xl text-center font-bold py-5">Home Page</h1>

      <ChatCard />

      <Button className="fixed rounded-full bottom-5 right-5 bg-amber-300 z-50 group hover:bg-amber-500 transition">
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
    </div>
  )
}
