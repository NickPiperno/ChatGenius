import { ChatInterface } from '@/components/ChatInterface'

// This would typically come from your database
const mockMessages = [
  {
    id: '1',
    content: 'Hello, everyone!',
    sender: {
      id: 'user1',
      name: 'Alice',
      imageUrl: 'https://example.com/alice.jpg',
    },
    timestamp: new Date('2023-06-01T10:00:00'),
  },
  {
    id: '2',
    content: 'Hi Alice, how are you?',
    sender: {
      id: 'user2',
      name: 'Bob',
      imageUrl: 'https://example.com/bob.jpg',
    },
    timestamp: new Date('2023-06-01T10:01:00'),
  },
]

export default function ChannelPage({ params }: { params: { id: string } }) {
  return (
    <div className="h-full">
      <ChatInterface channelId={params.id} initialMessages={mockMessages.map(msg => ({
        ...msg,
        reactions: {},
        replies: []
      }))} />
    </div>
  )
}

