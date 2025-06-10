"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../contexts/auth-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
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
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Label } from "../../components/ui/label"

type ProfileFormState = {
  fullName: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
  aadhaarLinked: string;
  address: string;
  state: string;
  district: string;
  pincode: string;
  ruralUrban: string;
  casteCategory: string;
  familyIncome: string;
  bplCard: string;
  rationCardType: string;
  ewsStatus: string;
  disability: string;
  disabilityType: string;
  maritalStatus: string;
  highestQualification: string;
  currentlyStudying: string;
  course: string;
  studentId: string;
  collegeName: string;
  employed: string;
  profession: string;
  unemployedYouth: string;
  selfEmployed: string;
  skillCertificate: string;
  bankLinked: string;
  accountHolder: string;
  bankName: string;
  ifsc: string;
  upi: string;
  farmer: string;
  landOwnership: string;
  landArea: string;
  pregnantMother: string;
  seniorCitizen: string;
  minority: string;
  minorityReligion: string;
  interestedCategories: string[];
  languages: string[];
};

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState<ProfileFormState>({
    fullName: user?.name || "",
    dob: "",
    gender: "",
    email: user?.email || "",
    phone: "",
    aadhaarLinked: "no",
    address: "",
    state: "",
    district: "",
    pincode: "",
    ruralUrban: "",
    casteCategory: "",
    familyIncome: "",
    bplCard: "no",
    rationCardType: "",
    ewsStatus: "no",
    disability: "no",
    disabilityType: "",
    maritalStatus: "",
    highestQualification: "",
    currentlyStudying: "no",
    course: "",
    studentId: "",
    collegeName: "",
    employed: "no",
    profession: "",
    unemployedYouth: "no",
    selfEmployed: "no",
    skillCertificate: "no",
    bankLinked: "no",
    accountHolder: "",
    bankName: "",
    ifsc: "",
    upi: "",
    farmer: "no",
    landOwnership: "no",
    landArea: "",
    pregnantMother: "no",
    seniorCitizen: "no",
    minority: "no",
    minorityReligion: "",
    interestedCategories: [],
    languages: [],
  })

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Fetch user profile and update form state
  useEffect(() => {
    if (!isLoading && user) {
      setForm((f) => ({
        ...f,
        ...user,
        fullName: user.name || user.fullName || "",
        email: user.email || "",
        interestedCategories: Array.isArray(user.interestedCategories) ? user.interestedCategories : [],
        languages: Array.isArray(user.languages) ? user.languages : [],
      }))
    }
  }, [user, isLoading])

  // Save profile handler
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      // Refetch user (triggers AuthContext update)
      window.location.reload()
    } else {
      // Optionally show error
      alert("Failed to update profile")
    }
  }

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
    <div className="container max-w-3xl py-8">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      {!editMode ? (
        <div>
          {/* Profile Card */}
          <Card className="border-green-200 dark:border-green-800 mb-6">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src="/placeholder.svg?height=96&width=96"
                    alt={user?.name || user?.fullName || "User"}
                  />
                  <AvatarFallback className="text-2xl bg-green-600 dark:bg-green-500 text-white">
                    {(user?.name || user?.fullName || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl">{user?.name || user?.fullName || "User"}</CardTitle>
              <div className="flex justify-center mt-2">
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 border-green-200 dark:border-green-800"
                >
                  <Shield className="h-3 w-3 text-green-600 dark:text-green-400" />
                  <span>{user?.verificationStatus || "Verified"}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{user?.phone}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{user?.address || user?.location || ""}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Joined {user?.joinedDate || ""}</span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Eligible Schemes</span>
                  <span className="font-medium">{user?.eligibleSchemes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Applications</span>
                  <span className="font-medium">{user?.activeApplications}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium">{user?.completedApplications}</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full mt-4 border-green-200 dark:border-green-800"
                onClick={() => setEditMode(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="space-y-6">
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
                          {user?.activeApplications}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Active Applications
                        </div>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {user?.completedApplications}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Completed
                        </div>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                          2
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Pending Review
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-3">Recent Activity</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">
                              PM Awas Yojana application submitted
                            </p>
                            <p className="text-muted-foreground text-xs">
                              2 days ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">
                              Document verification completed for Skill India
                            </p>
                            <p className="text-muted-foreground text-xs">
                              1 week ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">Scholarship application approved</p>
                            <p className="text-muted-foreground text-xs">
                              2 weeks ago
                            </p>
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
                    <CardDescription>
                      Based on your profile and eligibility
                    </CardDescription>
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
                            <p className="text-xs text-muted-foreground">
                              Education • 95% Match
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
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
                            <p className="text-xs text-muted-foreground">
                              Housing • 90% Match
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
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
                            <p className="text-xs text-muted-foreground">
                              Employment • 85% Match
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
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
                    <CardDescription>
                      Your eligibility for various scheme categories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(user?.eligibilityCategories || []).map((category: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium">{category.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {category.eligible
                                ? `${category.schemes} schemes available`
                                : "Not eligible"}
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
                    <CardDescription>
                      Manage your verification documents
                    </CardDescription>
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
                            <p className="text-xs text-muted-foreground">
                              Uploaded on 15 Jan 2023
                            </p>
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
                            <p className="text-xs text-muted-foreground">
                              Uploaded on 15 Jan 2023
                            </p>
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
                            <p className="text-xs text-muted-foreground">
                              Uploaded on 20 Jan 2023
                            </p>
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
                            <p className="text-xs text-muted-foreground">
                              Uploaded on 20 Jan 2023
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-600">Verified</Badge>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                        Upload New Document
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        <form
          className="space-y-6 bg-white dark:bg-background p-6 rounded-lg shadow"
          onSubmit={handleSave}
        >
          <h2 className="text-lg font-semibold mb-2">
            Basic Personal Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={form.dob}
                onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={form.gender} onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="email">Email ID</Label>
              <Input
                id="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="aadhaarLinked">Aadhaar Linked</Label>
              <Select
                value={form.aadhaarLinked}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, aadhaarLinked: v }))
                }
              >
                <SelectTrigger id="aadhaarLinked">
                  <SelectValue placeholder="Select Aadhaar linking status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="address">Residential Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={form.state}
                onChange={(e) =>
                  setForm((f) => ({ ...f, state: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                value={form.district}
                onChange={(e) =>
                  setForm((f) => ({ ...f, district: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                value={form.pincode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pincode: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="ruralUrban">Rural/Urban</Label>
              <Select
                value={form.ruralUrban}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, ruralUrban: v }))
                }
              >
                <SelectTrigger id="ruralUrban">
                  <SelectValue placeholder="Select area type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rural">Rural</SelectItem>
                  <SelectItem value="urban">Urban</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <h2 className="text-lg font-semibold mt-6 mb-2">
            Socioeconomic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="casteCategory">Caste Category</Label>
              <Select
                value={form.casteCategory}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, casteCategory: v }))
                }
              >
                <SelectTrigger id="casteCategory">
                  <SelectValue placeholder="Select caste category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="obc">OBC</SelectItem>
                  <SelectItem value="sc">SC</SelectItem>
                  <SelectItem value="st">ST</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="familyIncome">Annual Family Income</Label>
              <Input
                id="familyIncome"
                value={form.familyIncome}
                onChange={(e) =>
                  setForm((f) => ({ ...f, familyIncome: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="bplCard">BPL Card</Label>
              <Select
                value={form.bplCard}
                onValueChange={(v) => setForm((f) => ({ ...f, bplCard: v }))}
              >
                <SelectTrigger id="bplCard">
                  <SelectValue placeholder="Select BPL card status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rationCardType">Ration Card Type</Label>
              <Select
                value={form.rationCardType}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, rationCardType: v }))
                }
              >
                <SelectTrigger id="rationCardType">
                  <SelectValue placeholder="Select ration card type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apl">APL</SelectItem>
                  <SelectItem value="bpl">BPL</SelectItem>
                  <SelectItem value="aay">AAY</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ewsStatus">EWS Status</Label>
              <Select
                value={form.ewsStatus}
                onValueChange={(v) => setForm((f) => ({ ...f, ewsStatus: v }))}
              >
                <SelectTrigger id="ewsStatus">
                  <SelectValue placeholder="Select EWS status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="disability">Disability Status</Label>
              <Select
                value={form.disability}
                onValueChange={(v) => setForm((f) => ({ ...f, disability: v }))}
              >
                <SelectTrigger id="disability">
                  <SelectValue placeholder="Select disability status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.disability === "yes" && (
              <div>
                <Label htmlFor="disabilityType">Disability Type</Label>
                <Input
                  id="disabilityType"
                  value={form.disabilityType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, disabilityType: e.target.value }))
                  }
                />
              </div>
            )}
            <div>
              <Label htmlFor="maritalStatus">Marital Status</Label>
              <Select
                value={form.maritalStatus}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, maritalStatus: v }))
                }
              >
                <SelectTrigger id="maritalStatus">
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <h2 className="text-lg font-semibold mt-6 mb-2">
            Educational and Employment Info
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="highestQualification">Highest Qualification</Label>
              <Select
                value={form.highestQualification}
                onValueChange={(v) => setForm((f) => ({ ...f, highestQualification: v }))}
              >
                <SelectTrigger id="highestQualification">
                  <SelectValue placeholder="Select qualification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high school">High School</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="graduation">Graduation</SelectItem>
                  <SelectItem value="post graduation">Post Graduation</SelectItem>
                  <SelectItem value="doctorate">Doctorate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="currentlyStudying">Currently Studying?</Label>
              <Select
                value={form.currentlyStudying}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, currentlyStudying: v }))
                }
              >
                <SelectTrigger id="currentlyStudying">
                  <SelectValue placeholder="Select studying status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.currentlyStudying === "yes" && (
              <>
                <div>
                  <Label htmlFor="course">Course</Label>
                  <Input
                    id="course"
                    value={form.course}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, course: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    value={form.studentId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, studentId: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="collegeName">College Name</Label>
                  <Input
                    id="collegeName"
                    value={form.collegeName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, collegeName: e.target.value }))
                    }
                  />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="employed">Employed?</Label>
              <Select
                value={form.employed}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, employed: v }))
                }
              >
                <SelectTrigger id="employed">
                  <SelectValue placeholder="Select employment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.employed === "yes" && (
              <div>
                <Label htmlFor="profession">Profession/Job Type</Label>
                <Input
                  id="profession"
                  value={form.profession}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, profession: e.target.value }))
                  }
                />
              </div>
            )}
            <div>
              <Label htmlFor="unemployedYouth">Unemployed Youth</Label>
              <Select
                value={form.unemployedYouth}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, unemployedYouth: v }))
                }
              >
                <SelectTrigger id="unemployedYouth">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="selfEmployed">Self-Employed?</Label>
              <Select
                value={form.selfEmployed}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, selfEmployed: v }))
                }
              >
                <SelectTrigger id="selfEmployed">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="skillCertificate">Skill Certificate?</Label>
              <Select
                value={form.skillCertificate}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, skillCertificate: v }))
                }
              >
                <SelectTrigger id="skillCertificate">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <h2 className="text-lg font-semibold mt-6 mb-2">
            Financial/Banking Information (optional)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bankLinked">Bank Account Linked to Aadhaar?</Label>
              <Select
                value={form.bankLinked}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, bankLinked: v }))
                }
              >
                <SelectTrigger id="bankLinked">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="accountHolder">Account Holder Name</Label>
              <Input
                id="accountHolder"
                value={form.accountHolder}
                onChange={(e) =>
                  setForm((f) => ({ ...f, accountHolder: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={form.bankName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bankName: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="ifsc">IFSC Code</Label>
              <Input
                id="ifsc"
                value={form.ifsc}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ifsc: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="upi">UPI ID</Label>
              <Input
                id="upi"
                value={form.upi}
                onChange={(e) =>
                  setForm((f) => ({ ...f, upi: e.target.value }))
                }
              />
            </div>
          </div>

          <h2 className="text-lg font-semibold mt-6 mb-2">
            Special Targeted Groups
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="farmer">Farmer Status</Label>
              <Select
                value={form.farmer}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, farmer: v }))
                }
              >
                <SelectTrigger id="farmer">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="landOwnership">Land Ownership</Label>
              <Select
                value={form.landOwnership}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, landOwnership: v }))
                }
              >
                <SelectTrigger id="landOwnership">
                  <SelectValue placeholder="Select ownership status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.landOwnership === "yes" && (
              <div>
                <Label htmlFor="landArea">Land Area (acres)</Label>
                <Input
                  id="landArea"
                  value={form.landArea}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, landArea: e.target.value }))
                  }
                />
              </div>
            )}
            <div>
              <Label htmlFor="pregnantMother">Pregnant/Lactating Mother</Label>
              <Select
                value={form.pregnantMother}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, pregnantMother: v }))
                }
              >
                <SelectTrigger id="pregnantMother">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="minority">Minority Group</Label>
              <Select
                value={form.minority}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, minority: v }))
                }
              >
                <SelectTrigger id="minority">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.minority === "yes" && (
              <div>
                <Label htmlFor="minorityReligion">Religion</Label>
                <Input
                  id="minorityReligion"
                  value={form.minorityReligion}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, minorityReligion: e.target.value }))
                  }
                />
              </div>
            )}
          </div>

          <h2 className="text-lg font-semibold mt-6 mb-2">Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="interestedCategories">Interested Scheme Categories (comma separated)</Label>
              <Input
                id="interestedCategories"
                value={form.interestedCategories.join(", ")}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    interestedCategories: e.target.value.split(/,\s*/),
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="languages">Languages Preferred (comma separated)</Label>
              <Input
                id="languages"
                value={form.languages.join(", ")}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    languages: e.target.value.split(/,\s*/),
                  }))
                }
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
