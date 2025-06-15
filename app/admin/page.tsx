"use client"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Eye, EyeOff } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { schemeCategories } from "../../components/ui/scheme-categories"
import Papa from "papaparse"

export default function AdminPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [schemes, setSchemes] = useState<any[]>([])
  const [form, setForm] = useState({ title: "", description: "", category: "", eligibility: "", link: "" })
  const [editId, setEditId] = useState<string | null>(null)
  const [actionError, setActionError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [adminSession, setAdminSession] = useState(false)

  // CSV upload state
  const [csvError, setCsvError] = useState("")
  const [csvSuccess, setCsvSuccess] = useState("")
  const [csvLoading, setCsvLoading] = useState(false)

  // Fetch schemes
  const fetchSchemes = async () => {
    const res = await fetch("/api/schemes", {
      headers: adminSession ? { "x-admin-auth": "session" } : undefined,
    })
    const data = await res.json()
    setSchemes(data.schemes || [])
  }

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem("govguide-admin", "true")
      fetchSchemes()
    } else {
      localStorage.removeItem("govguide-admin")
    }
  }, [isLoggedIn])

  // Admin login (username/password)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    if (!username || !password) {
      setLoginError("Enter username and password")
      return
    }
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setLoginError(data.error || "Invalid credentials")
      return
    }
    setIsLoggedIn(true)
    setAdminSession(true)
    fetchSchemes()
  }

  // Add or update scheme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionError("")
    if (!form.title || !form.description) {
      setActionError("Title and description are required")
      return
    }
    const method = editId ? "PUT" : "POST"
    const body = editId ? { ...form, id: editId } : form
    const res = await fetch("/api/schemes", {
      method,
      headers: { "Content-Type": "application/json", "x-admin-auth": "session" },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setActionError(data.error || "Failed to save scheme")
      return
    }
    setForm({ title: "", description: "", category: "", eligibility: "", link: "" })
    setEditId(null)
    fetchSchemes()
  }

  // Edit scheme
  const handleEdit = (scheme: any) => {
    console.log('Editing scheme:', scheme); // Debug: log the scheme object
    setForm({
      title: scheme.title,
      description: scheme.description,
      category: scheme.category || "",
      eligibility: scheme.eligibility || "",
      link: scheme.link || "",
    })
    setEditId(scheme._id)
    // Scroll to the form for better UX
    setTimeout(() => {
      const formEl = document.getElementById('admin-scheme-form');
      if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  // Delete scheme
  const handleDelete = async (id: string) => {
    setActionError("")
    const res = await fetch("/api/schemes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-auth": "session" },
      body: JSON.stringify({ id }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setActionError(data.error || "Failed to delete scheme")
      return
    }
    fetchSchemes()
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setAdminSession(false)
    localStorage.removeItem("govguide-admin")
  }

  // CSV upload handler
  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCsvError("")
    setCsvSuccess("")
    const file = event.target.files?.[0]
    if (!file) return
    setCsvLoading(true)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        if (!Array.isArray(results.data) || results.data.length === 0) {
          setCsvError("CSV file is empty or invalid.")
          setCsvLoading(false)
          return
        }
        // Send to backend
        const res = await fetch("/api/schemes/bulk-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-auth": "session" },
          body: JSON.stringify({ schemes: results.data }),
        })
        const data = await res.json()
        if (!res.ok) {
          setCsvError(data.error + (data.details ? ":\n" + data.details.join("\n") : ""))
        } else {
          setCsvSuccess(data.message)
          fetchSchemes()
        }
        setCsvLoading(false)
      },
      error: (err) => {
        setCsvError("Failed to parse CSV: " + err.message)
        setCsvLoading(false)
      },
    })
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              {loginError && (
                <Alert variant="destructive">
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">Login</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editId ? "Edit Scheme" : "Add New Scheme"}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* CSV Upload Section */}
            <div className="mb-6">
              <Label htmlFor="csv-upload">Bulk Upload Schemes (CSV)</Label>
              <Input id="csv-upload" type="file" accept=".csv" onChange={handleCSVUpload} disabled={csvLoading} />
              {csvLoading && <div className="text-sm text-muted-foreground mt-1">Uploading...</div>}
              {csvError && <Alert variant="destructive"><AlertDescription>{csvError}</AlertDescription></Alert>}
              {csvSuccess && <Alert variant="success"><AlertDescription>{csvSuccess}</AlertDescription></Alert>}
              <div className="text-xs text-muted-foreground mt-1">CSV must have columns: title, description, category, eligibility, link</div>
            </div>
            <form id="admin-scheme-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={v => setForm(f => ({ ...f, category: v }))}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {schemeCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="eligibility">Eligibility</Label>
                <Input
                  id="eligibility"
                  value={form.eligibility}
                  onChange={e => setForm(f => ({ ...f, eligibility: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="link">Scheme Link</Label>
                <Input
                  id="link"
                  value={form.link}
                  onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                  placeholder="https://..."
                  type="url"
                />
              </div>
              {actionError && (
                <Alert variant="destructive">
                  <AlertDescription>{actionError}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">{editId ? "Update Scheme" : "Add Scheme"}</Button>
              {editId && (
                <Button type="button" variant="outline" className="w-full mt-2" onClick={() => { setEditId(null); setForm({ title: "", description: "", category: "", eligibility: "", link: "" }) }}>Cancel Edit</Button>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Schemes</CardTitle>
          </CardHeader>
          <CardContent>
            {schemes.length === 0 ? (
              <div className="text-muted-foreground">No schemes found.</div>
            ) : (
              <div className="space-y-4">
                {schemes.map(scheme => (
                  <div key={scheme._id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <div className="font-semibold">{scheme.title}</div>
                      <div className="text-sm text-muted-foreground">{scheme.description}</div>
                      {scheme.category && <div className="text-xs mt-1">Category: {scheme.category}</div>}
                      {scheme.eligibility && <div className="text-xs">Eligibility: {scheme.eligibility}</div>}
                      {scheme.link && (
                        <div className="text-xs mt-1">
                          Link: <a href={scheme.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{scheme.link}</a>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(scheme)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(scheme._id)}>Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
