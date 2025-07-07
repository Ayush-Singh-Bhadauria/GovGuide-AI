"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { ChatBot } from "../components/chatbot"
import { useAuth } from "../contexts/auth-context"
import { useRouter } from "next/navigation"
import {
  MessageCircle,
  Users,
  BookOpen,
  Home,
  Zap,
  Heart,
  Briefcase,
  Tractor,
  Baby,
  GraduationCap,
  Building,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover"
import Image from "next/image"

export default function HomePage() {
  const { user } = useAuth()
  const [showChatbot, setShowChatbot] = useState(false)
  const [initialPrompt, setInitialPrompt] = useState("")
  const router = useRouter()

  // Enhanced featured schemes data with agriculture, women & child, and employment
  const featuredSchemes = [
    {
      title: "PM Awas Yojana",
      category: "Housing",
      description: "Affordable housing scheme for economically weaker sections",
      eligibility: "Annual income < ₹6 lakhs",
      icon: Home,
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    {
      title: "PM Kisan Samman Nidhi",
      category: "Agriculture",
      description: "Income support scheme for small and marginal farmers",
      eligibility: "Landholding up to 2 hectares",
      icon: Tractor,
      color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    },
    {
      title: "Beti Bachao Beti Padhao",
      category: "Women & Child",
      description: "Scheme for girl child welfare and women empowerment",
      eligibility: "Girl children and women across all age groups",
      icon: Baby,
      color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    },
    {
      title: "Skill India Mission",
      category: "Employment",
      description: "Skill development and training programs for youth",
      eligibility: "Age 18-35 years, any educational background",
      icon: Briefcase,
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    },
    {
      title: "Pradhan Mantri Scholarship",
      category: "Education",
      description: "Merit-based scholarship for higher education",
      eligibility: "12th grade > 85%",
      icon: GraduationCap,
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      title: "Ayushman Bharat",
      category: "Healthcare",
      description: "Health insurance coverage up to ₹5 lakhs",
      eligibility: "BPL families",
      icon: Heart,
      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
    {
      title: "Digital India Initiative",
      category: "Technology",
      description: "Digital literacy and skill development programs",
      eligibility: "Age 16-60 years",
      icon: Zap,
      color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    {
      title: "PM Mudra Yojana",
      category: "Business",
      description: "Micro-finance scheme for small business entrepreneurs",
      eligibility: "Non-corporate, non-farm enterprises",
      icon: Building,
      color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    },
  ]

  // Statistics data
  const stats = [
    { label: "Active Schemes", value: "500+", icon: Briefcase },
    { label: "Beneficiaries", value: "10M+", icon: Users },
    { label: "Categories", value: "15+", icon: BookOpen },
    { label: "Success Rate", value: "85%", icon: Zap },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 dark:from-green-950/20 dark:via-blue-950/20 dark:to-emerald-950/20">
        <div className="max-w-7xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="Nagrik Mitra Logo" width={120} height={120} className="rounded-lg" priority />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Welcome to <span className="text-green-600 dark:text-green-400">Nagrik Mitra AI</span>
          </h1>
          {/* Show Chatbot button if user is logged in */}
          {user && (
            <div className="flex justify-center mb-6">
              <Button
                className="rounded-full px-8 py-3 text-lg shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
                onClick={() => setShowChatbot(true)}
              >
                Open Chatbot
              </Button>
            </div>
          )}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Your intelligent companion for discovering and accessing government schemes, scholarships, and benefits
            tailored to your needs.
          </p>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-green-200 dark:border-green-800">
                <CardContent className="pt-6">
                  <stat.icon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Schemes Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Featured Government Schemes</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover popular schemes across various categories that might be perfect for you
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredSchemes.map((scheme, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-green-200 dark:border-green-800">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${scheme.color} flex items-center justify-center mb-3`}>
                    <scheme.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{scheme.title}</CardTitle>
                  <Badge variant="secondary" className="w-fit">
                    {scheme.category}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-3">{scheme.description}</CardDescription>
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Eligibility: {scheme.eligibility}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant CTA Section */}
      <section className="py-16 px-4 bg-green-50 dark:bg-green-950/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Need Personalized Recommendations?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Our AI assistant can help you find schemes based on your specific situation, eligibility criteria, and
            requirements.
          </p>
        </div>
      </section>

      {/* Floating Chatbot Button with Pre-written Prompts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className="rounded-full shadow-lg bg-green-600 hover:bg-green-700 text-white w-16 h-16 flex items-center justify-center text-3xl"
              aria-label="Open Chatbot"
            >
              <MessageCircle className="w-8 h-8" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-4">
            <div className="mb-2 font-semibold text-green-700">Quick Start Prompts</div>
            <div className="flex flex-col gap-0">
              <Button variant="outline" size="sm" className="justify-start whitespace-normal break-words text-left max-w-full mb-2" onClick={() => { setInitialPrompt("What housing schemes are available?"); setShowChatbot(true); }}>
                🏠 What housing schemes are available?
              </Button>
              <Button variant="outline" size="sm" className="justify-start whitespace-normal break-words text-left max-w-full mb-2" onClick={() => { setInitialPrompt("Show me education scholarships"); setShowChatbot(true); }}>
                🎓 Show me education scholarships
              </Button>
              <Button variant="outline" size="sm" className="justify-start whitespace-normal break-words text-left max-w-full mb-2" onClick={() => { setInitialPrompt("Check my eligibility for schemes"); setShowChatbot(true); }}>
                ✅ Check my eligibility for schemes
              </Button>
              <Button variant="outline" size="sm" className="justify-start whitespace-normal break-words text-left max-w-full" onClick={() => { setInitialPrompt(""); setShowChatbot(true); }}>
                💬 Start a new chat
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Chatbot Component (floating/modal) */}
      {showChatbot && (
        <ChatBot
          isOpen={showChatbot}
          onClose={() => { setShowChatbot(false); setInitialPrompt(""); }}
          initialPrompt={initialPrompt}
        />
      )}
    </div>
  )
}
