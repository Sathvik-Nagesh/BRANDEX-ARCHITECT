import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { MOTION } from '@/lib/constants'
import { PageHeader } from '@/components/shared/PageHeader'
import { Sparkles, Send, Bot, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function AIWorkspace() {
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory, isTyping])

  const handleSend = async () => {
    if (!message.trim()) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: message }
    setChatHistory(prev => [...prev, userMsg])
    setMessage('')
    setIsTyping(true)

    try {
      const response = await window.brandexAPI?.ai.chat(userMsg.content)
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: typeof response === 'string' ? response : JSON.stringify(response, null, 2)
      }
      setChatHistory(prev => [...prev, assistantMsg])
    } catch (error) {
      console.error(error)
      setChatHistory(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'An error occurred while generating the response.' }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background/50">
      {/* Header */}
      <div className="p-8 pb-4">
        <PageHeader
          title="AI Workspace"
          description="Ask questions, generate documents, and analyze projects with context-aware AI"
        />
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-8">
        {chatHistory.length === 0 ? (
          <motion.div
            className="max-w-3xl mx-auto py-16 flex flex-col items-center justify-center text-center"
            {...MOTION.fadeIn}
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <Sparkles className="w-7 h-7 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">AI Assistant</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-8">
              Chat with context-aware AI. Generate PRDs, technical designs, analyze scope, and search project memory.
            </p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
              {[
                'Generate a PRD for a new project',
                'Analyze recent scope changes',
                'Create a technical design document',
                'Summarize the latest decisions'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setMessage(suggestion)}
                  className="text-left text-[13px] p-3 rounded-lg border border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors bg-card"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="max-w-3xl mx-auto py-6 space-y-6">
            <AnimatePresence initial={false}>
              {chatHistory.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border text-foreground'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-card border border-border rounded-tl-sm shadow-sm'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-foreground flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-card border border-border rounded-tl-sm shadow-sm flex items-center gap-1.5 h-11">
                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-8 pt-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 bg-card border border-border rounded-2xl p-2 shadow-sm focus-within:ring-1 focus-within:ring-primary/30 transition-all">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Ask anything about your projects..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none min-h-[40px] max-h-[200px] p-2.5"
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = `${Math.min(target.scrollHeight, 200)}px`
              }}
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || isTyping}
              className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 mb-0.5"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground/50 mt-3 text-center flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            AI responses are generated using your project context
          </p>
        </div>
      </div>
    </div>
  )
}
