import { useState, useRef, useEffect } from 'react'

interface InputAreaProps {
  onSendMessage: (content: string, sendMessageToBackend: (msg: string) => Promise<string>) => void
}

const InputArea = ({ onSendMessage }: InputAreaProps) => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const API_BASE_URL = 'http://localhost:8000'

  const sendMessageToBackend = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userMessage }),
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      const data = await response.json()
      if (typeof data.answer === 'string') {
        return data.answer
      } else {
        throw new Error('Invalid response from backend')
      }
    } catch (error) {
      return `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }

  const handleSubmit = async () => {
    const trimmedMessage = message.trim()
    if (trimmedMessage && !isTyping) {
      setIsTyping(true)
      onSendMessage(trimmedMessage, sendMessageToBackend)
      setMessage('')
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [message])

  return (
    <div className="border-t border-gray-100 bg-gradient-to-b from-white to-gray-50 py-6">
      <div className="max-w-3xl mx-auto px-4">
        <div className="relative flex items-end">
          {/* Modern Input Container */}
          <div className="flex-1 flex items-center bg-white/80 shadow-lg rounded-full px-4 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
            {/* Placeholder for future features (e.g., attachments, voice) */}
            <button className="mr-2 p-2 rounded-full hover:bg-gray-100 transition-colors" title="Coming soon" disabled>
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l2 2" />
              </svg>
            </button>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 resize-none border-0 bg-transparent py-2 px-0 text-gray-900 placeholder-gray-400 focus:ring-0 text-base rounded-full outline-none min-h-[44px] max-h-[120px]"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            {/* Send Button */}
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || isTyping}
              className="ml-2 inline-flex items-center justify-center rounded-full bg-blue-700 p-3 text-white shadow-lg hover:from-blue-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Send"
            >
              {isTyping ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {/* Footer Text */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-400">
            Connected to Intelligent ChatGPT Backend • Ask me anything about the data!
          </p>
        </div>
      </div>
    </div>
  )
}

export default InputArea 