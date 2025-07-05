"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { ScrollArea } from "./ui/scroll-area"
import { Badge } from "./ui/badge"
import { X, Maximize2, Minimize2, Send, Bot, User, BookOpen, Home, Heart, Briefcase } from "lucide-react"
import { useAuth } from "../contexts/auth-context"
import ReactMarkdown from 'react-markdown'

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
  schemes?: SchemeRecommendation[]
}

interface SchemeRecommendation {
  name: string
  category: string
  description: string
  eligibility: string
  benefits: string
  applicationLink: string
}

interface ChatBotProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatBot({ isOpen, onClose }: ChatBotProps) {
  const { user } = useAuth();
  // Track last spoken bot message
  const [lastSpokenId, setLastSpokenId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Hello! I'm your Nagrik Mitra AI assistant. I can help you find government schemes, scholarships, and check your eligibility. What would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pendingProfileField, setPendingProfileField] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);
  const [userLang, setUserLang] = useState("en-IN"); // default to Indian English
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Simple language detection (matches backend)
  function detectLanguage(text: string): string {
    const devnagari = /[\u0900-\u097F]/;
    if (devnagari.test(text)) return "hi-IN";
    const hinglishWords = ["kya", "hai", "kaunsa", "karna", "set", "kar", "sakta", "sakti", "aap", "mera", "mere", "hain", "ho", "ka", "ke", "ki", "tum", "profile", "update", "dhanyavaad", "poochh", "scheme", "baare"];
    const lower = text.toLowerCase();
    if (hinglishWords.some(w => lower.includes(w))) return "en-IN";
    return "en-IN";
  }

  // Voice input handler
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setUserLang(detectLanguage(transcript));
        setListening(false);
      };
      recognitionRef.current.onerror = () => setListening(false);
      recognitionRef.current.onend = () => setListening(false);
    }
    recognitionRef.current.lang = userLang;
    setListening(true);
    recognitionRef.current.start();
  };

  // Browser TTS
  function speak(text: string, lang: string = "en-IN") {
    if (!window.speechSynthesis) return;
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  }

  // IBM Watson TTS function (calls /api/tts)
  async function speakWithWatsonTTS(text: string, lang = "en-IN") {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang }),
      });
      const data = await res.json();
      if (data.audioContent) {
        const audio = new Audio("data:audio/mp3;base64," + data.audioContent);
        audio.play();
      }
    } catch (e) {
      // fallback to browser TTS if error
      speak(text, lang);
    }
  }

  // Speak bot message on new message, but only once per message
  useEffect(() => {
    if (
      voiceEnabled &&
      messages.length > 0 &&
      messages[messages.length - 1].type === "bot" &&
      messages[messages.length - 1].id !== lastSpokenId
    ) {
      speakWithWatsonTTS(messages[messages.length - 1].content, userLang);
      setLastSpokenId(messages[messages.length - 1].id);
    }
    // eslint-disable-next-line
  }, [messages, voiceEnabled])

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // If waiting for a profile field, update profile instead of normal chat
    if (pendingProfileField) {
      setIsLoading(true);
      const value = inputValue.trim();
      try {
        // Update profile field
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [pendingProfileField]: value }),
        });
        if (res.ok) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              type: "user",
              content: value,
              timestamp: new Date(),
            },
            {
              id: (Date.now() + 1).toString(),
              type: "bot",
              content: `Thank you! Your ${pendingProfileField} has been updated. Please continue your query or ask about schemes.`,
              timestamp: new Date(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 2).toString(),
              type: "bot",
              content: `Sorry, failed to update your ${pendingProfileField}. Please try again or update your profile manually.`,
              timestamp: new Date(),
            },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 3).toString(),
            type: "bot",
            content: `Sorry, something went wrong updating your ${pendingProfileField}.`,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setPendingProfileField(null);
        setInputValue("");
        setIsLoading(false);
      }
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Call LangChain API route
    try {
      const res = await fetch("/api/langchain-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.type === "user" ? "user" : "assistant", content: m.content })),
            { role: "user", content: inputValue },
          ],
          userProfile: user, // Pass user profile for personalization
        }),
      })
      const data = await res.json();
      if (data.needsProfileField) {
        setPendingProfileField(data.needsProfileField);
      }
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: data.output,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          type: "bot",
          content: "Sorry, I couldn't process your request. Please try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "housing":
        return Home
      case "education":
        return BookOpen
      case "healthcare":
        return Heart
      case "employment":
        return Briefcase
      default:
        return BookOpen
    }
  }

  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 z-50 ${isFullscreen ? "" : "p-4"}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Chat Container */}
      <div
        className={`relative bg-background border rounded-lg shadow-2xl ${
          isFullscreen ? "w-full h-full rounded-none" : "w-full max-w-4xl h-[80vh] mx-auto mt-[10vh]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-green-50 dark:bg-green-950/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Nagrik Mitra AI Assistant</h3>
              <p className="text-sm text-muted-foreground">Government Schemes Expert</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className={`${isFullscreen ? "h-[calc(100vh-140px)]" : "h-[calc(80vh-140px)]"} p-4`}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start space-x-2 max-w-[80%] ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === "user" ? "bg-blue-600" : "bg-green-600"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="space-y-2">
                    <div
                      className={`p-3 rounded-lg ${message.type === "user" ? "bg-blue-600 text-white" : "bg-muted"}`}
                    >
                      {message.type === "bot" ? (
                        <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>

                    {/* Scheme Recommendations */}
                    {message.schemes && message.schemes.length > 0 && (
                      <div className="space-y-2">
                        {message.schemes.map((scheme, index) => {
                          const IconComponent = getCategoryIcon(scheme.category)
                          return (
                            <Card key={index} className="border-green-200 dark:border-green-800">
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-base flex items-center space-x-2">
                                    <IconComponent className="h-4 w-4 text-green-600" />
                                    <span>{scheme.name}</span>
                                  </CardTitle>
                                  <Badge variant="secondary">{scheme.category}</Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <p className="text-sm text-muted-foreground">{scheme.description}</p>
                                <div className="space-y-1">
                                  <p className="text-xs">
                                    <strong>Eligibility:</strong> {scheme.eligibility}
                                  </p>
                                  <p className="text-xs">
                                    <strong>Benefits:</strong> {scheme.benefits}
                                  </p>
                                </div>
                                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white">
                                  Apply Now
                                </Button>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t bg-background">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about government schemes, eligibility, or benefits..."
              className="flex-1 border-green-200 dark:border-green-800 focus:border-green-500"
              disabled={isLoading}
            />
            <Button
              onClick={handleVoiceInput}
              disabled={isLoading || listening}
              className="bg-green-100 hover:bg-green-200 text-green-700"
              type="button"
              title="Speak"
            >
              {listening ? "🎙️..." : "🎤"}
            </Button>
            <Button
              onClick={() => setVoiceEnabled((v) => !v)}
              className={voiceEnabled ? "bg-green-100 hover:bg-green-200 text-green-700" : "bg-gray-200 hover:bg-gray-300 text-gray-500"}
              type="button"
              title={voiceEnabled ? "Disable Voice Output" : "Enable Voice Output"}
            >
              {voiceEnabled ? "🔊 Voice On" : "🔇 Voice Off"}
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("What housing schemes are available?")}
              className="text-xs border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950"
            >
              Housing Schemes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("Show me education scholarships")}
              className="text-xs border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950"
            >
              Education
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("Check my eligibility for schemes")}
              className="text-xs border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950"
            >
              Check Eligibility
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
