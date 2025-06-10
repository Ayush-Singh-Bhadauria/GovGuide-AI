"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../contexts/auth-context"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { ProfileBreadcrumb } from "../../components/profile-breadcrumb"
import { Bell, CheckCircle, AlertCircle, FileText, Info, CheckCheck, Trash2, Settings } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"

// Mock notification data
const mockNotifications = [
	{
		id: "notif-001",
		title: "Application Status Update",
		message: "Your PM Awas Yojana application has moved to the verification stage.",
		type: "update",
		isRead: false,
		date: "2 hours ago",
	},
	{
		id: "notif-002",
		title: "Document Verification",
		message: "Your income certificate has been successfully verified.",
		type: "success",
		isRead: false,
		date: "1 day ago",
	},
	{
		id: "notif-003",
		title: "New Scheme Available",
		message: "A new scholarship scheme for higher education is now available. Check your eligibility now!",
		type: "info",
		isRead: false,
		date: "2 days ago",
	},
	{
		id: "notif-004",
		title: "Application Approved",
		message: "Congratulations! Your National Scholarship Portal application has been approved.",
		type: "success",
		isRead: true,
		date: "1 week ago",
	},
	{
		id: "notif-005",
		title: "Document Required",
		message: "Please upload your updated address proof for the Skill India Mission application.",
		type: "alert",
		isRead: true,
		date: "1 week ago",
	},
	{
		id: "notif-006",
		title: "Application Deadline",
		message: "Reminder: The PM Kisan Samman Nidhi application deadline is in 3 days.",
		type: "alert",
		isRead: true,
		date: "2 weeks ago",
	},
	{
		id: "notif-007",
		title: "Payment Received",
		message: "You have received the first installment of ₹2,000 under PM Kisan Samman Nidhi.",
		type: "success",
		isRead: true,
		date: "1 month ago",
	},
	{
		id: "notif-008",
		title: "Profile Update",
		message: "Your profile information has been successfully updated.",
		type: "info",
		isRead: true,
		date: "1 month ago",
	},
]

export default function NotificationsPage() {
	const { user, isLoading } = useAuth()
	const router = useRouter()
	const [notifications, setNotifications] = useState(mockNotifications)

	// Redirect if not logged in
	useEffect(() => {
		if (!isLoading && !user) {
			router.push("/login")
		}
	}, [user, isLoading, router])

	// Mark notification as read
	const markAsRead = (id: string) => {
		setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)))
	}

	// Mark all notifications as read
	const markAllAsRead = () => {
		setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
	}

	// Delete notification
	const deleteNotification = (id: string) => {
		setNotifications((prev) => prev.filter((notif) => notif.id !== id))
	}

	// Get notification icon based on type
	const getNotificationIcon = (type: string) => {
		switch (type) {
			case "success":
				return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
			case "alert":
				return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
			case "update":
				return <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
			case "info":
				return <Info className="h-5 w-5 text-purple-600 dark:text-purple-400" />
			default:
				return <Bell className="h-5 w-5 text-muted-foreground" />
		}
	}

	// Filter notifications
	const unreadNotifications = notifications.filter((notif) => !notif.isRead)
	const readNotifications = notifications.filter((notif) => notif.isRead)

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
			<ProfileBreadcrumb currentPage="Notifications" />

			<div className="space-y-6">
				{/* Header with Actions */}
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div>
						<h1 className="text-2xl font-bold">Notifications</h1>
						<p className="text-muted-foreground">Stay updated with your application status and new schemes</p>
					</div>

					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="sm"
							className="border-green-200 dark:border-green-800"
							onClick={markAllAsRead}
							disabled={unreadNotifications.length === 0}
						>
							<CheckCheck className="h-4 w-4 mr-2" />
							Mark All as Read
						</Button>
						<Button variant="outline" size="icon" className="border-green-200 dark:border-green-800">
							<Settings className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{/* Notifications Summary */}
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
					<Card className="border-green-200 dark:border-green-800">
						<CardContent className="p-4 flex flex-col items-center justify-center">
							<div className="text-3xl font-bold">{notifications.length}</div>
							<div className="text-sm text-muted-foreground">Total Notifications</div>
						</CardContent>
					</Card>
					<Card className="border-green-200 dark:border-green-800">
						<CardContent className="p-4 flex flex-col items-center justify-center">
							<div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{unreadNotifications.length}</div>
							<div className="text-sm text-muted-foreground">Unread</div>
						</CardContent>
					</Card>
					<Card className="border-green-200 dark:border-green-800">
						<CardContent className="p-4 flex flex-col items-center justify-center">
							<div className="text-3xl font-bold text-green-600 dark:text-green-400">
								{notifications.filter((n) => n.type === "success").length}
							</div>
							<div className="text-sm text-muted-foreground">Good News</div>
						</CardContent>
					</Card>
				</div>

				{/* Notifications Tabs */}
				<Tabs defaultValue="unread" className="w-full">
					<TabsList className="grid grid-cols-2 mb-4">
						<TabsTrigger value="unread">
							Unread
							{unreadNotifications.length > 0 && (
								<Badge className="ml-2 bg-blue-600">{unreadNotifications.length}</Badge>
							)}
						</TabsTrigger>
						<TabsTrigger value="all">All Notifications</TabsTrigger>
					</TabsList>

					{/* Unread Notifications Tab */}
					<TabsContent value="unread">
						<Card className="border-green-200 dark:border-green-800">
							<CardHeader>
								<CardTitle className="text-lg flex items-center">
									<Bell className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
									Unread Notifications
								</CardTitle>
								<CardDescription>Your latest unread notifications</CardDescription>
							</CardHeader>
							<CardContent>
								{unreadNotifications.length > 0 ? (
									<div className="space-y-4">
										{unreadNotifications.map((notification) => (
											<div
												key={notification.id}
												className="flex items-start p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
											>
												<div className="mr-4 mt-1">{getNotificationIcon(notification.type)}</div>
												<div className="flex-1">
													<div className="flex items-center justify-between mb-1">
														<h4 className="font-medium">{notification.title}</h4>
														<Badge variant="outline" className="text-xs font-normal">
															{notification.date}
														</Badge>
													</div>
													<p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
													<div className="flex items-center space-x-2">
														<Button
															variant="outline"
															size="sm"
															className="text-xs h-7 border-green-200 dark:border-green-800"
															onClick={() => markAsRead(notification.id)}
														>
															Mark as Read
														</Button>
														<Button
															variant="ghost"
															size="sm"
															className="text-xs h-7 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
															onClick={() => deleteNotification(notification.id)}
														>
															<Trash2 className="h-3 w-3 mr-1" />
															Delete
														</Button>
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-8">
										<CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
										<h3 className="text-lg font-medium">All caught up!</h3>
										<p className="text-muted-foreground">You have no unread notifications at the moment.</p>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* All Notifications Tab */}
					<TabsContent value="all">
						<Card className="border-green-200 dark:border-green-800">
							<CardHeader>
								<CardTitle className="text-lg flex items-center">
									<Bell className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
									All Notifications
								</CardTitle>
								<CardDescription>Your complete notification history</CardDescription>
							</CardHeader>
							<CardContent>
								{notifications.length > 0 ? (
									<div className="space-y-4">
										{notifications.map((notification) => (
											<div
												key={notification.id}
												className={`flex items-start p-4 rounded-lg hover:bg-muted transition-colors ${
													notification.isRead ? "bg-background" : "bg-muted/50"
												}`}
											>
												<div className="mr-4 mt-1">{getNotificationIcon(notification.type)}</div>
												<div className="flex-1">
													<div className="flex items-center justify-between mb-1">
														<h4 className={`font-medium ${notification.isRead ? "" : "font-semibold"}`}>
															{notification.title}
															{!notification.isRead && <Badge className="ml-2 bg-blue-600 text-xs">New</Badge>}
														</h4>
														<Badge variant="outline" className="text-xs font-normal">
															{notification.date}
														</Badge>
													</div>
													<p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
													<div className="flex items-center space-x-2">
														{!notification.isRead && (
															<Button
																variant="outline"
																size="sm"
																className="text-xs h-7 border-green-200 dark:border-green-800"
																onClick={() => markAsRead(notification.id)}
															>
																Mark as Read
															</Button>
														)}
														<Button
															variant="ghost"
															size="sm"
															className="text-xs h-7 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
															onClick={() => deleteNotification(notification.id)}
														>
															<Trash2 className="h-3 w-3 mr-1" />
															Delete
														</Button>
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-8">
										<Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
										<h3 className="text-lg font-medium">No notifications</h3>
										<p className="text-muted-foreground">You don't have any notifications at the moment.</p>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				{/* Notification Settings Teaser */}
				<Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
					<CardContent className="p-6 flex flex-col md:flex-row items-center justify-between">
						<div className="mb-4 md:mb-0">
							<h3 className="text-lg font-medium">Customize Your Notifications</h3>
							<p className="text-muted-foreground">
								Choose which notifications you want to receive and how you want to receive them.
							</p>
						</div>
						<Button className="bg-green-600 hover:bg-green-700 text-white">
							<Settings className="h-4 w-4 mr-2" />
							Notification Settings
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
