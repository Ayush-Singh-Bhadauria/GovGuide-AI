"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProfileBreadcrumb } from "@/components/profile-breadcrumb"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Save,
  Smartphone,
  Globe,
  Moon,
  Sun,
  Palette,
} from "lucide-react"

export default function SettingsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    applicationUpdates: true,
    newSchemes: true,
    deadlineReminders: true,
    marketingEmails: false,
  })

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "system",
    colorScheme: "green",
    fontSize: "medium",
    reducedMotion: false,
  })

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name,
        email: user.email,
        phone: "+91 98765 43210", // Mock data
        location: "New Delhi, India", // Mock data
      })
    }
  }, [user])

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle profile form submission
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would send this data to your API
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    })
  }

  // Handle password form submission
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Your new password and confirmation password do not match.",
        variant: "destructive",
      })
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Your new password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    // In a real app, you would send this data to your API
    toast({
      title: "Password Updated",
      description: "Your password has been updated successfully.",
    })

    // Reset form
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  // Handle notification settings submission
  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would send this data to your API
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    })
  }

  // Handle appearance settings submission
  const handleAppearanceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would send this data to your API
    toast({
      title: "Appearance Settings Updated",
      description: "Your appearance preferences have been saved.",
    })
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
    <div className="container max-w-6xl py-8">
      {/* Breadcrumb Navigation */}
      <ProfileBreadcrumb currentPage="Settings" />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and settings</p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <User className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal information and contact details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="name"
                          name="name"
                          value={profileForm.name}
                          onChange={handleProfileChange}
                          className="pl-10 border-green-200 dark:border-green-800"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profileForm.email}
                          onChange={handleProfileChange}
                          className="pl-10 border-green-200 dark:border-green-800"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="phone"
                          name="phone"
                          value={profileForm.phone}
                          onChange={handleProfileChange}
                          className="pl-10 border-green-200 dark:border-green-800"
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <Label html For="location">
                        Location
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="location"
                          name="location"
                          value={profileForm.location}
                          onChange={handleProfileChange}
                          className="pl-10 border-green-200 dark:border-green-800"
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPassword.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        className="pl-10 pr-10 border-green-200 dark:border-green-800"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword((prev) => ({ ...prev, current: !prev.current }))}
                      >
                        {showPassword.current ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showPassword.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        className="pl-10 pr-10 border-green-200 dark:border-green-800"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword((prev) => ({ ...prev, new: !prev.new }))}
                      >
                        {showPassword.new ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        className="pl-10 pr-10 border-green-200 dark:border-green-800"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPassword.confirm ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                    <Save className="h-4 w-4 mr-2" />
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose how you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNotificationSubmit} className="space-y-6">
                  {/* Notification Methods */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Notification Methods</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={notificationSettings.email}
                          onCheckedChange={(checked) =>
                            setNotificationSettings((prev) => ({ ...prev, email: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="push-notifications">Push Notifications</Label>
                        </div>
                        <Switch
                          id="push-notifications"
                          checked={notificationSettings.push}
                          onCheckedChange={(checked) => setNotificationSettings((prev) => ({ ...prev, push: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="sms-notifications">SMS Notifications</Label>
                        </div>
                        <Switch
                          id="sms-notifications"
                          checked={notificationSettings.sms}
                          onCheckedChange={(checked) => setNotificationSettings((prev) => ({ ...prev, sms: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notification Types */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Notification Types</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="application-updates">Application Updates</Label>
                          <p className="text-xs text-muted-foreground">Get notified about your application status</p>
                        </div>
                        <Switch
                          id="application-updates"
                          checked={notificationSettings.applicationUpdates}
                          onCheckedChange={(checked) =>
                            setNotificationSettings((prev) => ({ ...prev, applicationUpdates: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="new-schemes">New Schemes</Label>
                          <p className="text-xs text-muted-foreground">Be the first to know about new schemes</p>
                        </div>
                        <Switch
                          id="new-schemes"
                          checked={notificationSettings.newSchemes}
                          onCheckedChange={(checked) =>
                            setNotificationSettings((prev) => ({ ...prev, newSchemes: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="deadline-reminders">Deadline Reminders</Label>
                          <p className="text-xs text-muted-foreground">Get reminded about application deadlines</p>
                        </div>
                        <Switch
                          id="deadline-reminders"
                          checked={notificationSettings.deadlineReminders}
                          onCheckedChange={(checked) =>
                            setNotificationSettings((prev) => ({ ...prev, deadlineReminders: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="marketing-emails">Marketing Emails</Label>
                          <p className="text-xs text-muted-foreground">Receive promotional content and tips</p>
                        </div>
                        <Switch
                          id="marketing-emails"
                          checked={notificationSettings.marketingEmails}
                          onCheckedChange={(checked) =>
                            setNotificationSettings((prev) => ({ ...prev, marketingEmails: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Palette className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Appearance Settings
                </CardTitle>
                <CardDescription>Customize how Nagrik Mitra AI looks and feels</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAppearanceSubmit} className="space-y-6">
                  {/* Theme */}
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={appearanceSettings.theme}
                      onValueChange={(value) => setAppearanceSettings((prev) => ({ ...prev, theme: value }))}
                    >
                      <SelectTrigger className="border-green-200 dark:border-green-800">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center">
                            <Sun className="h-4 w-4 mr-2" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center">
                            <Moon className="h-4 w-4 mr-2" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-2" />
                            System
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Color Scheme */}
                  <div className="space-y-2">
                    <Label htmlFor="colorScheme">Color Scheme</Label>
                    <Select
                      value={appearanceSettings.colorScheme}
                      onValueChange={(value) => setAppearanceSettings((prev) => ({ ...prev, colorScheme: value }))}
                    >
                      <SelectTrigger className="border-green-200 dark:border-green-800">
                        <SelectValue placeholder="Select color scheme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="green">Green (Default)</SelectItem>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Font Size */}
                  <div className="space-y-2">
                    <Label htmlFor="fontSize">Font Size</Label>
                    <Select
                      value={appearanceSettings.fontSize}
                      onValueChange={(value) => setAppearanceSettings((prev) => ({ ...prev, fontSize: value }))}
                    >
                      <SelectTrigger className="border-green-200 dark:border-green-800">
                        <SelectValue placeholder="Select font size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium (Default)</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Accessibility */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Accessibility</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="reduced-motion">Reduced Motion</Label>
                        <p className="text-xs text-muted-foreground">Minimize animations and transitions</p>
                      </div>
                      <Switch
                        id="reduced-motion"
                        checked={appearanceSettings.reducedMotion}
                        onCheckedChange={(checked) =>
                          setAppearanceSettings((prev) => ({ ...prev, reducedMotion: checked }))
                        }
                      />
                    </div>
                  </div>

                  <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                    <Save className="h-4 w-4 mr-2" />
                    Save Appearance
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Account Actions */}
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-lg text-red-600 dark:text-red-400 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h4 className="font-medium">Delete Account</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
