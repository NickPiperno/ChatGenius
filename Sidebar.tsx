'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { MessageSquare, Users, Settings, Plus, User, LogOut, Circle } from 'lucide-react'
import { users, channels } from '@/lib/data'
import { ColoredAvatar } from '@/components/ui/colored-avatar'
import { useUser, useClerk } from '@clerk/nextjs'
import { UserButton } from "@clerk/nextjs"
import { io } from 'socket.io-client'

// Add direct message users
const directMessages = users

export function Sidebar() {
  const pathname = usePathname()
  const [userStatus, setUserStatus] = useState<'online' | 'away' | 'busy' | 'offline'>('online')
  const { user } = useUser()
  const { signOut } = useClerk()
  const [customUsername, setCustomUsername] = useState<string>('')

  const statusOptions = {
    online: { label: 'Active', color: 'bg-green-500' },
    away: { label: 'Away', color: 'bg-yellow-500' },
    busy: { label: 'Do not disturb', color: 'bg-red-500' },
    offline: { label: 'Offline', color: 'bg-gray-500' }
  }

  // Fetch custom username
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch('/api/user/username?userId=' + user?.id)
        if (response.ok) {
          const data = await response.json()
          setCustomUsername(data.username || user?.username || '')
        }
      } catch (error) {
        console.error('Error fetching username:', error)
        setCustomUsername(user?.username || '')
      }
    }

    if (user?.id) {
      fetchUsername()
    }
  }, [user?.id, user?.username])

  // Subscribe to username updates via Socket.IO
  useEffect(() => {
    const socket = io()

    socket.on('username_updated', (data) => {
      if (data.userId === user?.id) {
        setCustomUsername(data.username)
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [user?.id])

  if (!user) return null

  return (
    <div className="w-64 flex flex-col flex-shrink-0 bg-gray-900 text-white">
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-800 bg-gray-800/50">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
          ChatGenius
        </h1>
      </div>
      
      {/* User Profile Section */}
      <div className="flex-shrink-0 p-4 border-b border-gray-800 bg-gray-800/30">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full flex items-center justify-start p-2 rounded-lg transition-colors group hover:bg-gray-800"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center min-w-0">
                  <UserButton 
                    afterSignOutUrl="/sign-in"
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8"
                      }
                    }}
                  />
                  <div className="ml-2 truncate">
                    <div className="font-medium truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-pink-400 transition-colors">
                      {customUsername}
                    </div>
                  </div>
                </div>
                <div className="flex items-center ml-2 flex-shrink-0">
                  <div className={cn("w-2 h-2 rounded-full", statusOptions[userStatus].color)} />
                  <span className="ml-1 text-xs text-gray-400">{statusOptions[userStatus].label}</span>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <div className={cn("w-2 h-2 rounded-full mr-2", statusOptions[userStatus].color)} />
                <span>Status</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {(Object.entries(statusOptions) as [keyof typeof statusOptions, typeof statusOptions[keyof typeof statusOptions]][]).map(([key, { label, color }]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => setUserStatus(key)}
                  >
                    <div className={cn("w-2 h-2 rounded-full mr-2", color)} />
                    <span>{label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase">Channels</h2>
          {channels.map((channel) => (
            <Button
              key={channel.id}
              variant="ghost"
              className={cn(
                'w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800',
                pathname === `/channel/${channel.id}` && 'bg-gray-800 text-white'
              )}
              asChild
            >
              <Link href={`/channel/${channel.id}`}>
                <MessageSquare className="mr-2 h-4 w-4" />
                {channel.name}
              </Link>
            </Button>
          ))}
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold uppercase">Direct Messages</h2>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {directMessages.map((dm) => (
            <Button
              key={dm.id}
              variant="ghost"
              className={cn(
                'w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800',
                pathname === `/dm/${dm.id}` && 'bg-gray-800 text-white'
              )}
              asChild
            >
              <Link href={`/dm/${dm.id}`}>
                <div className="flex items-center">
                  <div className="relative mr-2">
                    <ColoredAvatar name={dm.name} imageUrl={dm.imageUrl} size="sm" />
                    <div className={cn(
                      'absolute bottom-0 right-0 h-2 w-2 rounded-full',
                      dm.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                    )} />
                  </div>
                  {dm.name}
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </ScrollArea>
      <div className="flex-shrink-0 p-4">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>
    </div>
  )
}

