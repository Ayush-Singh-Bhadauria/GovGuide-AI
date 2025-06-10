"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import {
  Home,
  BookOpen,
  Heart,
  Briefcase,
  Zap,
  Users,
  Banknote,
  Tractor,
  Search,
  Filter,
  ExternalLink,
} from "lucide-react"
import { Badge } from "../../components/ui/badge"

// Mock schemes database
const allSchemes = [
  {
    id: 1,
    name: "PM Awas Yojana",
    category: "Housing",
    description: "Affordable housing scheme for economically weaker sections and low-income groups",
    eligibility: "Annual family income less than ₹6 lakhs, first-time home buyer",
    benefits: "Interest subsidy up to ₹2.67 lakhs on home loans",
    applicationDeadline: "Open throughout the year",
    icon: Home,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  {
    id: 2,
    name: "Pradhan Mantri Scholarship Scheme",
    category: "Education",
    description: "Merit-based scholarship for higher education students",
    eligibility: "12th grade marks above 85%, family income less than ₹8 lakhs annually",
    benefits: "₹25,000 per year for undergraduate courses, ₹30,000 for postgraduate",
    applicationDeadline: "March 31, 2024",
    icon: BookOpen,
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
  {
    id: 3,
    name: "Ayushman Bharat",
    category: "Healthcare",
    description: "National health protection scheme providing health insurance coverage",
    eligibility: "BPL families and specified occupational categories",
    benefits: "Health coverage up to ₹5 lakhs per family per year",
    applicationDeadline: "Ongoing enrollment",
    icon: Heart,
    color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
  {
    id: 4,
    name: "Skill India Mission",
    category: "Employment",
    description: "Skill development and training programs for youth",
    eligibility: "Age 18-35 years, any educational background",
    benefits: "Free training, certification, and job placement assistance",
    applicationDeadline: "Rolling admissions",
    icon: Briefcase,
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  },
  {
    id: 5,
    name: "Digital India Initiative",
    category: "Technology",
    description: "Digital literacy and technology adoption programs",
    eligibility: "Citizens interested in digital skills, age 16-60",
    benefits: "Free digital literacy training and certification",
    applicationDeadline: "Continuous enrollment",
    icon: Zap,
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  },
  {
    id: 6,
    name: "PM Kisan Samman Nidhi",
    category: "Agriculture",
    description: "Income support scheme for small and marginal farmers",
    eligibility: "Small and marginal farmers with landholding up to 2 hectares",
    benefits: "₹6,000 per year in three equal installments",
    applicationDeadline: "Open for registration",
    icon: Tractor,
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  },
  {
    id: 7,
    name: "Pradhan Mantri Mudra Yojana",
    category: "Business",
    description: "Micro-finance scheme for small business entrepreneurs",
    eligibility: "Non-corporate, non-farm small/micro enterprises",
    benefits: "Loans up to ₹10 lakhs without collateral",
    applicationDeadline: "Year-round applications",
    icon: Banknote,
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
  },
  {
    id: 8,
    name: "Beti Bachao Beti Padhao",
    category: "Women Empowerment",
    description: "Scheme for girl child welfare and women empowerment",
    eligibility: "Girl children and women across all age groups",
    benefits: "Educational support, awareness programs, and financial incentives",
    applicationDeadline: "Ongoing program",
    icon: Users,
    color: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  },
]

// Category configuration
const categories = [
  { value: "all", label: "All Categories", icon: null },
  { value: "Housing", label: "Housing", icon: Home },
  { value: "Education", label: "Education", icon: BookOpen },
  { value: "Healthcare", label: "Healthcare", icon: Heart },
  { value: "Employment", label: "Employment", icon: Briefcase },
  { value: "Technology", label: "Technology", icon: Zap },
  { value: "Agriculture", label: "Agriculture", icon: Tractor },
  { value: "Business", label: "Business", icon: Banknote },
  { value: "Women Empowerment", label: "Women Empowerment", icon: Users },
]

export default function SchemesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("name")

  // Filter and sort schemes
  const filteredSchemes = allSchemes
    .filter((scheme) => {
      const matchesSearch =
        scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || scheme.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "category":
          return a.category.localeCompare(b.category)
        default:
          return 0
      }
    })

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Government <span className="text-green-600">Schemes</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore comprehensive government schemes across various categories. Find the perfect scheme that matches
            your needs and eligibility criteria.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-muted/50 p-6 rounded-lg mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search schemes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-green-200 dark:border-green-800 focus:border-green-500"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="border-green-200 dark:border-green-800 focus:border-green-500">
                <Filter className="h-4 w-4 mr-2 text-green-600" />
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center space-x-2">
                      {category.icon && <category.icon className="h-4 w-4" />}
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Options */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="border-green-200 dark:border-green-800 focus:border-green-500">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="category">Sort by Category</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredSchemes.length} scheme{filteredSchemes.length !== 1 ? "s" : ""}
            {selectedCategory !== "all" && ` in ${selectedCategory}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Schemes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <Card
              key={scheme.id}
              className="hover:shadow-lg transition-shadow border-green-200 dark:border-green-800 group"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-lg ${scheme.color} flex items-center justify-center`}>
                    <scheme.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {scheme.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg group-hover:text-green-600 transition-colors">{scheme.name}</CardTitle>
                <CardDescription className="text-sm">{scheme.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Eligibility */}
                <div>
                  <h4 className="font-medium text-sm text-foreground mb-1">Eligibility:</h4>
                  <p className="text-xs text-muted-foreground">{scheme.eligibility}</p>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="font-medium text-sm text-foreground mb-1">Benefits:</h4>
                  <p className="text-xs text-muted-foreground">{scheme.benefits}</p>
                </div>

                {/* Application Deadline */}
                <div>
                  <h4 className="font-medium text-sm text-foreground mb-1">Application:</h4>
                  <p className="text-xs text-green-600 font-medium">{scheme.applicationDeadline}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                    Apply Now
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950"
                  >
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results Message */}
        {filteredSchemes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No schemes found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters to find relevant schemes.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
              }}
              variant="outline"
              className="border-green-200 dark:border-green-800"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center bg-green-50 dark:bg-green-950/20 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-foreground mb-4">Need Help Finding the Right Scheme?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Our AI assistant can help you find schemes based on your specific situation, eligibility criteria, and
            requirements.
          </p>
          <Button className="bg-green-600 hover:bg-green-700 text-white">Chat with AI Assistant</Button>
        </div>
      </div>
    </div>
  )
}
