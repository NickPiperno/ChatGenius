'use client'

import { useParams } from 'next/navigation'
import { ChatInterface } from '@/components/ChatInterface'

// Mock function to get user details
const getUserDetails = (userId: string) => {
  const users = {
    '1': { id: '1', name: 'Elon Musk', status: 'online', imageUrl: '' },
    '2': { id: '2', name: 'Taylor Swift', status: 'offline', imageUrl: '' },
    '3': { id: '3', name: 'Bill Gates', status: 'online', imageUrl: '' },
    '4': { id: '4', name: 'Mark Zuckerberg', status: 'offline', imageUrl: '' },
    '5': { id: '5', name: 'Beyoncé', status: 'online', imageUrl: '' },
    '6': { id: '6', name: 'Leonardo DiCaprio', status: 'offline', imageUrl: '' },
    '8': { id: '8', name: 'Cristiano Ronaldo', status: 'offline', imageUrl: '' },
  }
  return users[userId as keyof typeof users]
}

export default function DMPage() {
  const params = useParams()
  const userId = params.userId as string
  const user = getUserDetails(userId)

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b p-4 flex items-center">
        <div className="flex items-center">
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-gray-200" />
            <div className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ${
              user.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
            }`} />
          </div>
          <div className="ml-3">
            <h2 className="font-semibold">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.status}</p>
          </div>
        </div>
      </div>
      <ChatInterface 
        channelId={`dm-${userId}`}
        initialMessages={[]}
        isDM={true}
        otherUser={user}
      />
    </div>
  )
} 