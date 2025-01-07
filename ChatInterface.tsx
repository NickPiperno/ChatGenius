'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Smile, MessageSquare, ChevronDown, ChevronRight, Bold, Italic, Underline, Code, Link, AtSign, Paperclip, List, ListOrdered, Quote, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { format, isToday, isYesterday, isSameDay } from 'date-fns'
import { toast } from 'sonner'
import { useSettings } from '@/lib/store/settings'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { MentionPopup } from '@/components/MentionPopup'
import { FilePreview } from '@/components/FilePreview'
import { EmojiPicker } from './ui/emoji-picker'
import { useUser } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSocket } from '@/lib/hooks/useSocket'
import io from 'socket.io-client'

type Reaction = {
  emoji: string
  count: number
  users: string[]
}

type Message = {
  id: string
  content: string
  sender: {
    id: string
    name: string
    imageUrl: string
  }
  timestamp: Date
  reactions: { [key: string]: Reaction }
  parentId?: string
  replies: Message[]
  isExpanded?: boolean
  isEditing?: boolean
  attachments?: FileAttachment[]
}

const commonEmojis = ['👍', '❤️', '😂', '🎉', '🤔', '👀', '🚀', '✨']

type ChatInterfaceProps = {
  channelId: string
  initialMessages: Message[]
  isDM?: boolean
  otherUser?: {
    id: string
    name: string
    status: string
    imageUrl: string
  }
}

type MessageGroup = {
  date: Date
  messages: Message[]
}

interface MessageComponentProps {
  message: Message
  isReply?: boolean
  parentTimestamp?: Date
  onReaction: (messageId: string, emoji: string) => void
  onReply: (messageId: string) => void
  onEdit: (messageId: string, newContent: string) => void
  onDelete: (messageId: string) => void
  showReplies?: boolean
  hideReplyButton?: boolean
}

function MessageComponent({ 
  message, 
  isReply = false, 
  parentTimestamp,
  onReaction,
  onReply,
  onEdit,
  onDelete,
  showReplies = true,
  hideReplyButton = false
}: MessageComponentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(message.content)
  const { user } = useUser()
  const isOwnMessage = user?.id === message.sender.id

  const handleEdit = () => {
    setIsEditing(true)
    setEditedContent(message.content)
  }

  const handleSaveEdit = () => {
    if (editedContent.trim() !== message.content) {
      onEdit(message.id, editedContent)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSaveEdit()
    }
    if (e.key === 'Escape') {
      setIsEditing(false)
      setEditedContent(message.content)
    }
  }

  const shouldShowFullDate = isReply && parentTimestamp && !isSameDay(message.timestamp, parentTimestamp)
  
  // Only apply indentation if it's a reply AND showReplies is true (meaning it's in the main chat, not sidebar)
  const indentationClass = isReply && showReplies ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''
  
  return (
    <div className={cn(
      'group flex items-start space-x-3 py-2 px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50',
      isReply && 'pl-12'
    )}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={message.sender.imageUrl} />
        <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{message.sender.name}</span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>
              {format(message.timestamp, isToday(message.timestamp) ? 'HH:mm' : 'MMM d, HH:mm')}
            </span>
            {isOwnMessage && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-5 w-5 p-0 opacity-50 hover:opacity-100 hover:bg-gray-100"
                        >
                          <MoreHorizontal className="h-4 w-4 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleEdit}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit message
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete(message.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete message
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit or delete message</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <Input
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
              autoFocus
            />
            <Button size="sm" onClick={handleSaveEdit}>Save</Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                setIsEditing(false)
                setEditedContent(message.content)
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm">{message.content}</p>
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment) => (
                  <div key={attachment.id} className="inline-block">
                    {attachment.type === 'image' ? (
                      <img 
                        src={attachment.url} 
                        alt={attachment.name}
                        className="max-w-sm rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      />
                    ) : (
                      <a 
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Paperclip className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{attachment.name}</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        <div className="mt-1 flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Smile className="h-4 w-4 text-gray-500 hover:text-gray-700" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2" align="start">
              <div className="grid grid-cols-4 gap-2">
                {commonEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onReaction(message.id, emoji)}
                    className="text-center text-xl hover:bg-gray-100 p-2 rounded"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          {!hideReplyButton && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
              onClick={() => onReply(message.id)}
            >
              <MessageSquare className="mr-1 h-3 w-3" />
              Reply
            </Button>
          )}
        </div>
        {Object.values(message.reactions).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.values(message.reactions).map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => onReaction(message.id, reaction.emoji)}
                className={`rounded-full border px-2 py-0.5 text-sm hover:bg-gray-100 ${
                  reaction.users.includes('1') ? 'bg-gray-100' : ''
                }`}
              >
                {reaction.emoji} {reaction.count}
              </button>
            ))}
          </div>
        )}
        {showReplies && message.replies.length > 0 && (
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500"
              onClick={() => onReply(message.id)}
            >
              {message.replies.length} {message.replies.length === 1 ? 'reply' : 'replies'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

interface ThreadSidebarProps {
  selectedThread: Message | null
  onReaction: (messageId: string, emoji: string) => void
  onReply: (messageId: string) => void
  onEdit: (messageId: string, newContent: string) => void
  onDelete: (messageId: string) => void
  onClose: () => void
  isDM?: boolean
  otherUser?: {
    id: string
    name: string
    status: string
    imageUrl: string
  }
}

function ThreadSidebar({ 
  selectedThread, 
  onReaction, 
  onReply, 
  onEdit,
  onDelete,
  onClose, 
  isDM, 
  otherUser 
}: ThreadSidebarProps) {
  const threadScrollRef = useRef<HTMLDivElement>(null)

  if (!selectedThread) return null

  return (
    <div className="w-80 border-l flex flex-col flex-shrink-0">
      <div className="flex-shrink-0 p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold">Thread</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ✕
        </Button>
      </div>
      <ScrollArea 
        ref={threadScrollRef}
        className="flex-1 p-4 scroll-smooth"
        style={{
          '--scrollbar-width': '8px',
          '--scrollbar-track': 'transparent',
          '--scrollbar-thumb': 'rgba(0, 0, 0, 0.2)',
          '--scrollbar-thumb-hover': 'rgba(0, 0, 0, 0.3)',
        } as React.CSSProperties}
      >
        <MessageComponent
          message={selectedThread}
          onReaction={onReaction}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          showReplies={false}
        />
        {selectedThread.replies.length > 0 && (
          <>
            <div className="my-4 flex items-center gap-4">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-sm text-gray-500">
                {selectedThread.replies.length} {selectedThread.replies.length === 1 ? 'reply' : 'replies'}
              </span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>
            <div className="space-y-4">
              {selectedThread.replies.map((reply) => (
                <MessageComponent
                  key={reply.id}
                  message={reply}
                  isReply={true}
                  parentTimestamp={selectedThread.timestamp}
                  onReaction={onReaction}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  showReplies={false}
                  hideReplyButton={true}
                />
              ))}
            </div>
          </>
        )}
      </ScrollArea>
    </div>
  )
}

type FormattedMessage = {
  text: string
  mentions: string[]
  attachments: {
    id: string
    name: string
    url: string
    type: 'document' | 'image'
  }[]
}

function MessageToolbar({ 
  onFormat, 
  onMention, 
  onAttach 
}: { 
  onFormat: (type: string) => void
  onMention: () => void
  onAttach: () => void
}) {
  const tools = [
    { icon: Bold, label: 'Bold', format: 'bold' },
    { icon: Italic, label: 'Italic', format: 'italic' },
    { icon: Underline, label: 'Underline', format: 'underline' },
    { icon: Code, label: 'Code', format: 'code' },
    { icon: Link, label: 'Link', format: 'link' },
    { icon: List, label: 'Bullet List', format: 'bullet' },
    { icon: ListOrdered, label: 'Numbered List', format: 'number' },
    { icon: Quote, label: 'Quote', format: 'quote' },
  ]

  return (
    <div className="flex items-center gap-1 p-2 border-b">
      <TooltipProvider>
        {tools.map(({ icon: Icon, label, format }) => (
          <Tooltip key={format}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onFormat(format)}
              >
                <Icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        <div className="h-6 w-px bg-gray-200 mx-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onMention}
            >
              <AtSign className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mention someone</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onAttach}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Attach file</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

type UploadResponse = {
  id: string
  name: string
  url: string
  type: 'image' | 'document'
}

type FileAttachment = {
  id: string
  name: string
  url: string
  type: 'image' | 'document'
}

export function ChatInterface({ 
  channelId, 
  initialMessages, 
  isDM = false,
  otherUser 
}: ChatInterfaceProps) {
  const { user, isLoaded } = useUser();
  const { chatSettings, notifications } = useSettings();
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.map(msg => ({ ...msg, reactions: {}, replies: [], isExpanded: true }))
  )
  const [newMessage, setNewMessage] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<File[]>([])
  const [showMentionPopup, setShowMentionPopup] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [cursorPosition, setCursorPosition] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [lastScrollPosition, setLastScrollPosition] = useState(0)
  const [customUsername, setCustomUsername] = useState<string>('')

  // Filter root messages (those without parentId)
  const rootMessages = messages.filter(msg => !msg.parentId)

  // Group messages by date
  const messageGroups: MessageGroup[] = messages
    .filter(msg => !msg.parentId) // Only group top-level messages
    .reduce((groups: MessageGroup[], message) => {
      const messageDate = new Date(message.timestamp)
      const existingGroup = groups.find(group => isSameDay(group.date, messageDate))
      
      if (existingGroup) {
        existingGroup.messages.push(message)
      } else {
        groups.push({
          date: messageDate,
          messages: [message]
        })
      }
      
      return groups
    }, [])
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const formatDate = (date: Date) => {
    if (isToday(date)) {
      return 'Today'
    }
    if (isYesterday(date)) {
      return 'Yesterday'
    }
    return format(date, 'MMMM d, yyyy')
  }

  // Initialize socket
  const socket = useSocket(channelId)

  // Listen for real-time updates
  useEffect(() => {
    const messageHandler = (message: Message) => {
      setMessages(prev => [...prev, message])
      if (notifications.sounds) {
        playNotificationSound()
      }
    }

    const reactionHandler = ({ messageId, reaction }: { messageId: string, reaction: string }) => {
      handleReaction(messageId, reaction)
    }

    const fileUploadProgressHandler = ({ fileName, progress }: { fileName: string, progress: number }) => {
      toast.info(`Uploading ${fileName}: ${progress}%`)
    }

    const fileUploadFinishedHandler = (message: Message) => {
      setMessages(prev => [...prev, message])
      toast.success('File upload complete')
    }

    // Subscribe to events
    const unsubscribeMessage = socket.onMessageReceived(messageHandler)
    const unsubscribeReaction = socket.onReactionAdded(reactionHandler)
    const unsubscribeProgress = socket.onFileUploadProgress(fileUploadProgressHandler)
    const unsubscribeFileFinished = socket.onFileUploadFinished(fileUploadFinishedHandler)

    return () => {
      unsubscribeMessage()
      unsubscribeReaction()
      unsubscribeProgress()
      unsubscribeFileFinished()
    }
  }, [socket, notifications.sounds])

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

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if ((!newMessage.trim() && attachments.length === 0) || !isLoaded || !user) return

    try {
      const toastId = toast.loading('Sending message...')

      // Upload files first if there are any attachments
      const uploadedAttachments: FileAttachment[] = []
      if (attachments.length > 0) {
        for (const file of attachments) {
          try {
            // Notify others that file upload started
            socket.notifyFileUploadStarted(file.name)

            const formData = new FormData()
            formData.append('file', file)
            
            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            })
            
            if (!response.ok) {
              throw new Error(`Failed to upload file ${file.name}`)
            }
            
            const data = await response.json()
            uploadedAttachments.push({
              id: data.id,
              name: file.name,
              url: data.url,
              type: file.type.startsWith('image/') ? 'image' : 'document'
            })
          } catch (error) {
            console.error('Error uploading file:', error)
            toast.error(`Failed to upload ${file.name}`)
            continue
          }
        }
      }

      // Create message object
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        sender: {
          id: user.id,
          name: customUsername || user.fullName || 'Anonymous',
          imageUrl: user.imageUrl || '',
        },
        timestamp: new Date(),
        reactions: {},
        replies: [],
        parentId: replyingTo || undefined,
        attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined
      }

      // Send message through socket
      if (replyingTo) {
        setMessages(prev => {
          const newMessages = prev.map(msg => {
            if (msg.id === replyingTo) {
              return { ...msg, replies: [...msg.replies, message] }
            }
            return msg
          })
          // Notify others about the reply
          socket.sendMessage({ ...message, type: 'reply', parentId: replyingTo })
          return newMessages
        })
        setReplyingTo(null)
      } else {
        setMessages(prev => {
          const newMessages = [...prev, message]
          // Notify others about the new message
          socket.sendMessage(message)
          return newMessages
        })
      }

      // Clear form
      setNewMessage('')
      setAttachments([])
      scrollToBottom()

      // Notify others that file upload is complete (if any)
      if (uploadedAttachments.length > 0) {
        socket.notifyFileUploadComplete(message)
      }

      toast.success('Message sent', { id: toastId })
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  // Separate handler for textarea key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && chatSettings.enterToSend) {
      e.preventDefault()
      const formEvent = new Event('submit', { bubbles: true, cancelable: true }) as unknown as React.FormEvent<HTMLFormElement>
      handleSendMessage(formEvent)
    }
  }

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(messages.map(message => {
      if (message.id === messageId) {
        const currentReactions = { ...message.reactions }
        if (currentReactions[emoji]) {
          if (currentReactions[emoji].users.includes(user?.id || '')) {
            if (currentReactions[emoji].count === 1) {
              delete currentReactions[emoji]
            } else {
              currentReactions[emoji] = {
                ...currentReactions[emoji],
                count: currentReactions[emoji].count - 1,
                users: currentReactions[emoji].users.filter(id => id !== user?.id)
              }
            }
          } else {
            currentReactions[emoji] = {
              ...currentReactions[emoji],
              count: currentReactions[emoji].count + 1,
              users: [...currentReactions[emoji].users, user?.id || '']
            }
          }
        } else {
          currentReactions[emoji] = {
            emoji,
            count: 1,
            users: [user?.id || '']
          }
        }
        // Notify others about the reaction
        socket.addReaction(messageId, emoji)
        return { ...message, reactions: currentReactions }
      }
      return message
    }))
  }

  const toggleThread = (messageId: string) => {
    setMessages(messages.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, isExpanded: !msg.isExpanded }
      }
      return msg
    }))
  }

  const handleReply = (messageId: string) => {
    setReplyingTo(messageId)
    setSelectedThreadId(messageId)
  }

  // Find the selected thread
  const selectedThread = messages.find(msg => msg.id === selectedThreadId)

  const handleFileUpload = (files: FileList) => {
    const newFiles = Array.from(files)
    setAttachments(prev => [...prev, ...newFiles])
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileUpload(e.dataTransfer.files)
  }, [])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items)
    const imageItems = items.filter(item => item.type.startsWith('image/'))
    
    imageItems.forEach(item => {
      const file = item.getAsFile()
      if (file) {
        // Create a FileList-like object with required Symbol.iterator
        const fileList = {
          0: file,
          length: 1,
          item: (index: number) => index === 0 ? file : null,
          [Symbol.iterator]: function* () {
            yield file;
          }
        } as unknown as FileList
        handleFileUpload(fileList)
      }
    })
  }, [])

  // Add scroll position memory
  useEffect(() => {
    const scrollArea = scrollAreaRef.current
    if (scrollArea) {
      scrollArea.scrollTop = lastScrollPosition
    }
  }, [lastScrollPosition])

  // Handle scroll events
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100)
    setLastScrollPosition(scrollTop)
  }

  // Scroll to bottom function
  const scrollToBottom = () => {
    const scrollArea = scrollAreaRef.current
    if (scrollArea) {
      scrollArea.scrollTo({
        top: scrollArea.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages])

  const handleEditMessage = (messageId: string, newContent: string) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent }
          : msg.replies.length > 0
          ? { ...msg, replies: msg.replies.map(reply => 
              reply.id === messageId 
                ? { ...reply, content: newContent }
                : reply
            )}
          : msg
      )
    )
  }

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prevMessages => 
      prevMessages.filter(msg => {
        if (msg.id === messageId) return false
        if (msg.replies.length > 0) {
          msg.replies = msg.replies.filter(reply => reply.id !== messageId)
        }
        return true
      })
    )
  }

  // Add notification sound
  const playNotificationSound = () => {
    if (notifications.sounds) {
      const audio = new Audio('/notification.mp3') // Add this sound file to your public folder
      audio.play().catch(console.error)
    }
  }

  // Show desktop notification
  const showDesktopNotification = (message: Message) => {
    if (notifications.desktop && "Notification" in window && Notification.permission === "granted") {
      new Notification("New Message", {
        body: `${message.sender.name}: ${message.content}`,
        icon: message.sender.imageUrl || '/favicon.ico'
      })
    }
  }

  // Handle new message notifications
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.sender.id !== user?.id) {
      playNotificationSound()
      showDesktopNotification(lastMessage)
    }
  }, [messages])

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea 
          ref={scrollAreaRef}
          className="flex-1 p-4 relative scroll-smooth"
          onScroll={handleScroll}
          style={{
            '--scrollbar-width': '8px',
            '--scrollbar-track': 'transparent',
            '--scrollbar-thumb': 'rgba(0, 0, 0, 0.2)',
            '--scrollbar-thumb-hover': 'rgba(0, 0, 0, 0.3)',
          } as React.CSSProperties}
        >
          {messageGroups.map((group) => (
            <div key={group.date.toISOString()}>
              <div className="sticky top-0 z-10 py-2 px-4 bg-white/80 backdrop-blur-sm">
                <time className="text-sm font-medium text-gray-500">
                  {formatDate(group.date)}
                </time>
              </div>
              <div className="space-y-4">
                {group.messages.map((message) => (
                  <MessageComponent
                    key={message.id}
                    message={message}
                    onReaction={handleReaction}
                    onReply={handleReply}
                    onEdit={handleEditMessage}
                    onDelete={handleDeleteMessage}
                    showReplies={true}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Scroll to bottom button */}
          {showScrollButton && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-4 right-4 rounded-full shadow-lg animate-bounce"
              onClick={scrollToBottom}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </ScrollArea>
        <form 
          onSubmit={handleSendMessage} 
          className="flex-shrink-0 border-t"
          encType="multipart/form-data"
        >
          {replyingTo && (
            <div className="flex items-center justify-between rounded bg-gray-50 px-3 py-2 text-sm">
              <span className="text-gray-600">
                Replying to a message
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={() => setReplyingTo(null)}
              >
                Cancel
              </Button>
            </div>
          )}
          <MessageToolbar 
            onFormat={(type) => {
              const formats = {
                bold: '**',
                italic: '_',
                underline: '__',
                code: '`',
                link: '[](url)',
                bullet: '• ',
                number: '1. ',
                quote: '> '
              }
              const format = formats[type as keyof typeof formats]
              setNewMessage(prev => prev + format)
            }}
            onMention={() => {
              setNewMessage(prev => prev + '@')
              setShowMentionPopup(true)
            }}
            onAttach={() => {
              document.getElementById('file-upload')?.click()
            }}
          />
          <div className="p-4">
            {attachments.length > 0 && (
              <div className="mb-4 space-y-2">
                {attachments.map((file, index) => (
                  <FilePreview
                    key={index}
                    file={file}
                    onRemove={() => {
                      setAttachments(prev => prev.filter((_, i) => i !== index))
                    }}
                  />
                ))}
              </div>
            )}
            <div 
              className="relative flex space-x-2"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value)
                    setCursorPosition(e.target.selectionStart)
                  }}
                  onKeyDown={handleKeyPress}
                  onPaste={handlePaste}
                  placeholder={replyingTo ? "Write a reply..." : "Type a message..."}
                  className="w-full min-h-[80px] p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {dragOver && (
                  <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-500 border-dashed rounded-md flex items-center justify-center transition-opacity duration-200">
                    <div className="text-blue-500 font-medium">Drop files here</div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="h-5 w-5" />
                </Button>
                <Button 
                  type="submit"
                  disabled={!newMessage.trim() && attachments.length === 0}
                >
                  Send
                </Button>
              </div>
              {showEmojiPicker && (
                <div className="absolute right-0 bottom-full mb-2">
                  <EmojiPicker
                    onEmojiSelect={(emoji) => {
                      setNewMessage(prev => prev + emoji)
                      setShowEmojiPicker(false)
                    }}
                  />
                </div>
              )}
            </div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  handleFileUpload(e.target.files)
                }
              }}
            />
          </div>
        </form>
      </div>
      {selectedThread && (
        <ThreadSidebar
          selectedThread={selectedThread}
          onReaction={handleReaction}
          onReply={handleReply}
          onEdit={handleEditMessage}
          onDelete={handleDeleteMessage}
          onClose={() => setSelectedThreadId(null)}
          isDM={isDM}
          otherUser={otherUser}
        />
      )}
    </div>
  )
}

