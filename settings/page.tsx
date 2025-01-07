'use client'

import { useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import {
  Bell,
  Moon,
  Sun,
  Volume2,
  MessageSquare,
  Palette,
  Monitor,
  Languages,
  KeyRound
} from 'lucide-react'
import { useSettings } from '@/lib/store/settings'

export default function SettingsPage() {
  const {
    theme,
    fontSize,
    language,
    notifications,
    chatSettings,
    setTheme,
    setFontSize,
    setLanguage,
    setNotifications,
    setChatSettings,
  } = useSettings()

  // Apply theme
  useEffect(() => {
    const root = window.document.documentElement
    root.style.fontSize = `${fontSize}px`

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.toggle('dark', systemTheme === 'dark')
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  }, [theme, fontSize])

  // Handle notifications permission
  useEffect(() => {
    if (notifications.desktop && "Notification" in window) {
      Notification.requestPermission()
    }
  }, [notifications.desktop])

  const handleSave = () => {
    toast.success('Settings saved successfully')
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-background p-8">
      <div className="container max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        
        {/* Appearance */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Palette className="mr-2 h-5 w-5" />
            Appearance
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Theme</Label>
                <div className="text-sm text-gray-500">
                  Choose your preferred theme
                </div>
              </div>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center">
                      <Sun className="mr-2 h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center">
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center">
                      <Monitor className="mr-2 h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Font Size</Label>
              <Slider
                value={[fontSize]}
                onValueChange={([value]) => setFontSize(value)}
                min={12}
                max={20}
                step={1}
                className="w-full"
              />
              <div className="text-sm text-gray-500">
                {fontSize}px
              </div>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Notifications
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Desktop Notifications</Label>
                <div className="text-sm text-gray-500">
                  Show notifications on your desktop
                </div>
              </div>
              <Switch
                checked={notifications.desktop}
                onCheckedChange={(checked) => 
                  setNotifications({ desktop: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Sound Effects</Label>
                <div className="text-sm text-gray-500">
                  Play sounds for new messages
                </div>
              </div>
              <Switch
                checked={notifications.sounds}
                onCheckedChange={(checked) => 
                  setNotifications({ sounds: checked })
                }
              />
            </div>
          </div>
        </Card>

        {/* Chat Preferences */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Chat Preferences
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enter to Send</Label>
                <div className="text-sm text-gray-500">
                  Press Enter to send messages
                </div>
              </div>
              <Switch
                checked={chatSettings.enterToSend}
                onCheckedChange={(checked) => 
                  setChatSettings({ enterToSend: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Compact View</Label>
                <div className="text-sm text-gray-500">
                  Show messages in a more compact layout
                </div>
              </div>
              <Switch
                checked={chatSettings.compactView}
                onCheckedChange={(checked) => 
                  setChatSettings({ compactView: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Typing Indicators</Label>
                <div className="text-sm text-gray-500">
                  Show when others are typing
                </div>
              </div>
              <Switch
                checked={chatSettings.showTypingIndicators}
                onCheckedChange={(checked) => 
                  setChatSettings({ showTypingIndicators: checked })
                }
              />
            </div>
          </div>
        </Card>

        {/* Language */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Languages className="mr-2 h-5 w-5" />
            Language
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Display Language</Label>
                <div className="text-sm text-gray-500">
                  Choose your preferred language
                </div>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
} 