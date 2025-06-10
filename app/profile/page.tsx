"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { ProfileBreadcrumb } from "../../components/profile-breadcrumb"
import {
  Pencil,
  Shield,
  MapPin,
  Calendar,
  Mail,
  Phone,
  FileCheck,
  Award,
  Clock,
  GraduationCap,
  Home,
  Briefcase,
} from "lucide-react"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Mock user data (in a real app, this would come from a database)
  const mockUserData = {
    name: user?.name || "Guest",
    email: user?.email || "guest@example.com",
    phone: "+91 98765 43210",
    location: "New Delhi, India",
    joinedDate: "January 2023",
    verificationStatus: "Verified",
    eligibleSchemes: 12,
    activeApplications: 3,
    completedApplications: 5,
  }

  // Mock eligibility data
  const eligibilityCategories = [
    { name: "Housing", eligible: true, schemes: 3 },
    { name: "Education", eligible: true, schemes: 4 },
    { name: "Healthcare", eligible: true, schemes: 2 },
    { name: "Agriculture", eligible: false, schemes: 0 },
    { name: "Employment", eligible: true, schemes: 3 },
    { name: "Women & Child", eligible: false, schemes: 0 },
  ]

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
      <ProfileBreadcrumb currentPage="Profile" />

      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1 border-green-200 dark:border-green-800">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg?height=96&width=96" alt={mockUserData.name} />
                <AvatarFallback className="text-2xl bg-green-600 dark:bg-green-500 text-white">
                  {mockUserData.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl">{mockUserData.name}</CardTitle>
            <div className="flex justify-center mt-2">
              <Badge variant="outline" className="flex items-center gap-1 border-green-200 dark:border-green-800">
                <Shield className="h-3 w-3 text-green-600 dark:text-green-400" />
                <span>{mockUserData.verificationStatus}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{mockUserData.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{mockUserData.phone}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{mockUserData.location}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Joined {mockUserData.joinedDate}</span>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Eligible Schemes</span>
                <span className="font-medium">{mockUserData.eligibleSchemes}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Applications</span>
                <span className="font-medium">{mockUserData.activeApplications}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">{mockUserData.completedApplications}</span>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-4 border-green-200 dark:border-green-800">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <FileCheck className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                    Application Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {mockUserData.activeApplications}
                      </div>
                      <div className="text-sm text-muted-foreground">Active Applications</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {mockUserData.completedApplications}
                      </div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">2</div>
                      <div className="text-sm text-muted-foreground">Pending Review</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-3">Recent Activity</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">PM Awas Yojana application submitted</p>
                          <p className="text-muted-foreground text-xs">2 days ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Document verification completed for Skill India</p>
                          <p className="text-muted-foreground text-xs">1 week ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Scholarship application approved</p>
                          <p className="text-muted-foreground text-xs">2 weeks ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Award className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                    Recommended Schemes
                  </CardTitle>
                  <CardDescription>Based on your profile and eligibility</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">National Scholarship Portal</h4>
                          <p className="text-xs text-muted-foreground">Education • 95% Match</p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        Apply
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mr-3">
                          <Home className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">PM Awas Yojana</h4>
                          <p className="text-xs text-muted-foreground">Housing • 90% Match</p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        Apply
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mr-3">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">Skill India Mission</h4>
                          <p className="text-xs text-muted-foreground">Employment • 85% Match</p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        Apply
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Eligibility Tab */}
            <TabsContent value="eligibility">
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-lg">Eligibility Status</CardTitle>
                  <CardDescription>Your eligibility for various scheme categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {eligibilityCategories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{category.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {category.eligible ? `${category.schemes} schemes available` : "Not eligible"}
                          </p>
                        </div>
                        <Badge
                          variant={category.eligible ? "default" : "outline"}
                          className={
                            category.eligible
                              ? "bg-green-600 hover:bg-green-700"
                              : "text-muted-foreground border-muted-foreground"
                          }
                        >
                          {category.eligible ? "Eligible" : "Not Eligible"}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Update Eligibility Information
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents">
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-lg">Uploaded Documents</CardTitle>
                  <CardDescription>Manage your verification documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3">
                          <FileCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">Aadhaar Card</h4>
                          <p className="text-xs text-muted-foreground">Uploaded on 15 Jan 2023</p>
                        </div>
                      </div>
                      <Badge className="bg-green-600">Verified</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3">
                          <FileCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">PAN Card</h4>
                          <p className="text-xs text-muted-foreground">Uploaded on 15 Jan 2023</p>
                        </div>
                      </div>
                      <Badge className="bg-green-600">Verified</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3">
                          <FileCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">Income Certificate</h4>
                          <p className="text-xs text-muted-foreground">Uploaded on 20 Jan 2023</p>
                        </div>
                      </div>
                      <Badge className="bg-orange-600">Pending</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3">
                          <FileCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">Address Proof</h4>
                          <p className="text-xs text-muted-foreground">Uploaded on 20 Jan 2023</p>
                        </div>
                      </div>
                      <Badge className="bg-green-600">Verified</Badge>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Upload New Document</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
