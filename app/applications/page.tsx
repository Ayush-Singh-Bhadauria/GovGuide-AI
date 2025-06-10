"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Input } from "../../components/ui/input"
import { ProfileBreadcrumb } from "../../components/profile-breadcrumb"
import {
  FileText,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronRight,
  Calendar,
  Home,
  GraduationCap,
  Briefcase,
  Heart,
} from "lucide-react"

// Mock application data
const mockApplications = [
  {
    id: "APP-001",
    scheme: "PM Awas Yojana",
    category: "Housing",
    status: "In Progress",
    submittedDate: "15 May 2023",
    lastUpdated: "20 May 2023",
    icon: Home,
    color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  },
  {
    id: "APP-002",
    scheme: "National Scholarship Portal",
    category: "Education",
    status: "Approved",
    submittedDate: "10 April 2023",
    lastUpdated: "25 April 2023",
    icon: GraduationCap,
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  },
  {
    id: "APP-003",
    scheme: "Skill India Mission",
    category: "Employment",
    status: "Pending Review",
    submittedDate: "5 May 2023",
    lastUpdated: "5 May 2023",
    icon: Briefcase,
    color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  },
  {
    id: "APP-004",
    scheme: "Ayushman Bharat",
    category: "Healthcare",
    status: "Rejected",
    submittedDate: "20 March 2023",
    lastUpdated: "10 April 2023",
    icon: Heart,
    color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  },
  {
    id: "APP-005",
    scheme: "PM Kisan Samman Nidhi",
    category: "Agriculture",
    status: "Approved",
    submittedDate: "15 February 2023",
    lastUpdated: "1 March 2023",
    icon: Home,
    color: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  },
  {
    id: "APP-006",
    scheme: "Digital India Scholarship",
    category: "Education",
    status: "In Progress",
    submittedDate: "10 May 2023",
    lastUpdated: "12 May 2023",
    icon: GraduationCap,
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  },
  {
    id: "APP-007",
    scheme: "PM Mudra Yojana",
    category: "Business",
    status: "Pending Review",
    submittedDate: "25 April 2023",
    lastUpdated: "25 April 2023",
    icon: Briefcase,
    color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
  },
  {
    id: "APP-008",
    scheme: "Beti Bachao Beti Padhao",
    category: "Women & Child",
    status: "Approved",
    submittedDate: "5 January 2023",
    lastUpdated: "20 January 2023",
    icon: Heart,
    color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
  },
]

export default function ApplicationsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredApplications, setFilteredApplications] = useState(mockApplications)

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Filter applications based on search term
  useEffect(() => {
    const filtered = mockApplications.filter(
      (app) =>
        app.scheme.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.id.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredApplications(filtered)
  }, [searchTerm])

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <Badge className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-3 w-3 mr-1" /> {status}
          </Badge>
        )
      case "In Progress":
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700">
            <Clock className="h-3 w-3 mr-1" /> {status}
          </Badge>
        )
      case "Pending Review":
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            <AlertCircle className="h-3 w-3 mr-1" /> {status}
          </Badge>
        )
      case "Rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" /> {status}
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Filter applications by status
  const activeApplications = filteredApplications.filter(
    (app) => app.status === "In Progress" || app.status === "Pending Review",
  )
  const completedApplications = filteredApplications.filter(
    (app) => app.status === "Approved" || app.status === "Rejected",
  )

  // Show loading state
  if (isLoading) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="h-8 w-48 bg-muted rounded-md animate-pulse mb-8"></div>
        <div className="h-64 bg-muted rounded-lg animate-pulse"></div>
      </div>
    )
  }

  // If no user and not loading, the useEffect will redirect to login

  return (
    <div className="container max-w-6xl py-8">
      {/* Breadcrumb Navigation */}
      <ProfileBreadcrumb currentPage="My Applications" />

      <div className="space-y-6">
        {/* Header with Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Applications</h1>
            <p className="text-muted-foreground">Track and manage your scheme applications</p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-green-200 dark:border-green-800"
            />
          </div>
        </div>

        {/* Applications Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold">{filteredApplications.length}</div>
              <div className="text-sm text-muted-foreground">Total Applications</div>
            </CardContent>
          </Card>
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {filteredApplications.filter((app) => app.status === "In Progress").length}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </CardContent>
          </Card>
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {filteredApplications.filter((app) => app.status === "Approved").length}
              </div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </CardContent>
          </Card>
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {filteredApplications.filter((app) => app.status === "Pending Review").length}
              </div>
              <div className="text-sm text-muted-foreground">Pending Review</div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="active">Active Applications</TabsTrigger>
            <TabsTrigger value="completed">Completed Applications</TabsTrigger>
          </TabsList>

          {/* Active Applications Tab */}
          <TabsContent value="active">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Active Applications
                </CardTitle>
                <CardDescription>Applications that are currently in progress or under review</CardDescription>
              </CardHeader>
              <CardContent>
                {activeApplications.length > 0 ? (
                  <div className="space-y-4">
                    {activeApplications.map((application) => (
                      <div
                        key={application.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center mb-4 md:mb-0">
                          <div
                            className={`w-12 h-12 rounded-full ${application.color} flex items-center justify-center mr-4`}
                          >
                            <application.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-medium">{application.scheme}</h4>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <span>{application.category}</span>
                              <span className="mx-2">•</span>
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Submitted: {application.submittedDate}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end w-full md:w-auto">
                          <div className="md:mr-4">{getStatusBadge(application.status)}</div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/20"
                          >
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium">No active applications</h3>
                    <p className="text-muted-foreground mb-4">You don't have any active applications at the moment.</p>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">Apply for a Scheme</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Completed Applications Tab */}
          <TabsContent value="completed">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Completed Applications
                </CardTitle>
                <CardDescription>Applications that have been approved or rejected</CardDescription>
              </CardHeader>
              <CardContent>
                {completedApplications.length > 0 ? (
                  <div className="space-y-4">
                    {completedApplications.map((application) => (
                      <div
                        key={application.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center mb-4 md:mb-0">
                          <div
                            className={`w-12 h-12 rounded-full ${application.color} flex items-center justify-center mr-4`}
                          >
                            <application.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-medium">{application.scheme}</h4>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <span>{application.category}</span>
                              <span className="mx-2">•</span>
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Completed: {application.lastUpdated}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end w-full md:w-auto">
                          <div className="md:mr-4">{getStatusBadge(application.status)}</div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/20"
                          >
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium">No completed applications</h3>
                    <p className="text-muted-foreground mb-4">
                      You don't have any completed applications at the moment.
                    </p>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">Apply for a Scheme</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Apply for New Scheme */}
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-medium">Looking for more opportunities?</h3>
              <p className="text-muted-foreground">
                Explore our comprehensive database of government schemes and find the perfect match for your needs.
              </p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700 text-white">Browse All Schemes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
