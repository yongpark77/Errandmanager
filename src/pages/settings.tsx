import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DeleteConfirmDialog } from '@/components/errands/delete-confirm-dialog'
import { useAuth } from '@/contexts/auth-context'
import { useErrands } from '@/hooks/use-errands'
import { useUpdateProfile } from '@/hooks/use-profile'
import { exportErrandsToCSV } from '@/lib/export-csv'
import { supabase } from '@/lib/supabase'
import { User, Bell, Database, Info, LogOut, Download, Trash2, Mail } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user, profile, signOut } = useAuth()
  const { data: errands } = useErrands()
  const updateProfile = useUpdateProfile()

  const [name, setName] = useState(profile?.name ?? '')
  const [remindDays, setRemindDays] = useState(profile?.remind_days_before?.toString() ?? '3')
  const [showClearAll, setShowClearAll] = useState(false)
  const [clearing, setClearing] = useState(false)

  const initials = profile?.name
    ? profile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  const handleSaveName = () => {
    if (name.trim()) {
      updateProfile.mutate({ name: name.trim() })
    }
  }

  const handleSaveRemindDays = (value: string) => {
    setRemindDays(value)
    updateProfile.mutate({ remind_days_before: parseInt(value) })
  }

  const handleExport = () => {
    if (errands) {
      exportErrandsToCSV(errands)
      toast.success('CSV exported successfully')
    }
  }

  const handleClearAll = async () => {
    if (!user) return
    setClearing(true)
    const { error } = await supabase
      .from('errands')
      .delete()
      .eq('user_id', user.id)
    setClearing(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('All errands cleared')
      setShowClearAll(false)
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{profile?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground">{errands?.length ?? 0} errands tracked</p>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <div className="flex gap-2">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
              <Button onClick={handleSaveName} disabled={updateProfile.isPending}>
                Save
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email ?? ''} disabled />
          </div>
          <Button variant="destructive" onClick={signOut} className="w-full sm:w-auto">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Remind Days Before Due</Label>
            <Select value={remindDays} onValueChange={handleSaveRemindDays}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day before</SelectItem>
                <SelectItem value="3">3 days before</SelectItem>
                <SelectItem value="7">7 days before</SelectItem>
                <SelectItem value="14">14 days before</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Storage</p>
              <p className="text-sm text-muted-foreground">Supabase Cloud</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Export Data</p>
              <p className="text-sm text-muted-foreground">Download your errands as CSV</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm text-destructive">Clear All Errands</p>
              <p className="text-sm text-muted-foreground">Permanently delete all your errand data</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setShowClearAll(true)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            About
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Send Feedback</p>
              <p className="text-sm text-muted-foreground">Help us improve Errand Manager</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="mailto:feedback@errandmanager.app">
                <Mail className="h-4 w-4 mr-1" />
                Email
              </a>
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm">Version</p>
            <p className="text-sm text-muted-foreground">1.0.0</p>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={showClearAll}
        onOpenChange={setShowClearAll}
        onConfirm={handleClearAll}
        title="Clear All Errands"
        description="This will permanently delete all your errands and completion history. This action cannot be undone."
        loading={clearing}
      />
    </div>
  )
}
