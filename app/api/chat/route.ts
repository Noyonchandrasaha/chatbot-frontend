
export const runtime = "nodejs"

interface ChatPayload {
  user_message: string
  session?: string
}

export async function POST(req: Request) {
  const body = await req.json()
  const { userMessage, sessionId } = body

  const payload: ChatPayload = {
    user_message: userMessage,
    session: sessionId,
  }

  try {
    // ✅ Call your custom Python backend
    const response = await fetch(
      `${process.env.BACKEND_URL || "http://localhost:8000"}/api/chat/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        //   Authorization: `Bearer ${process.env.BACKEND_API_KEY || ""}`,
        },
        body: JSON.stringify(payload),
      }
    )

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`)
    }

    // ✅ Stream the response with proper SSE format
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error("No response body")
    }

    const decoder = new TextDecoder()
    const encoder = new TextEncoder()
    let buffer = ""

    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunkStr = decoder.decode(value, { stream: true })
            buffer += chunkStr

            const lines = buffer.split("\n")
            buffer = lines.pop() || "" // Keep incomplete line in buffer

            for (const line of lines) {
              const trimmedLine = line.trim()
              if (!trimmedLine || !trimmedLine.startsWith("data: ")) continue

              try {
                const jsonStr = trimmedLine.slice(6).trim()
                if (!jsonStr || jsonStr === "[DONE]") continue
                
                const parsed = JSON.parse(jsonStr)

                // ✅ Proxy the chunk to the frontend
                if (parsed.type === "token" || parsed.type === "text") {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({
                      type: "text",
                      content: parsed.content || parsed.text || "",
                    })}\n\n`)
                  )
                } else {
                  // Forward status and other updates as is
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify(parsed)}\n\n`)
                  )
                }
              } catch (e) {
                console.error("Error parsing backend JSON:", e, trimmedLine)
              }
            }
          }

          // Process any remaining data in buffer
          if (buffer.trim().startsWith("data: ")) {
            try {
              const jsonStr = buffer.trim().slice(6).trim()
              if (jsonStr && jsonStr !== "[DONE]") {
                const parsed = JSON.parse(jsonStr)
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(parsed)}\n\n`))
              }
            } catch (e) { /* ignore partial */ }
          }

          controller.close()
        } catch (error) {
          console.error("Stream reader error:", error)
          controller.error(error)
        } finally {
          reader.releaseLock()
        }
      },
    })

    return new Response(customReadable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
  } catch (error) {
    console.error("Chat API Error:", error)
    return new Response(
      `data: ${JSON.stringify({
        type: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      })}\n\n`,
      {
        status: 500,
        headers: { "Content-Type": "text/event-stream" },
      }
    )
  }
}