import { ObjectId } from 'mongodb'

export interface MessageSender {
  id: string
  name: string
  imageUrl: string
}

export interface MessageReaction {
  emoji: string
  count: number
  users: string[]
}

export interface MessageAttachment {
  id: string
  name: string
  url: string
  type: 'image' | 'document'
}

export interface MessageReply {
  id: string
  content: string
  sender: MessageSender
  timestamp: Date
  reactions: { [key: string]: MessageReaction }
  attachments?: MessageAttachment[]
}

export interface Message {
  _id: ObjectId
  id: string
  content: string
  sender: MessageSender
  timestamp: Date
  channelId: string
  reactions: { [key: string]: MessageReaction }
  parentId?: string
  replies: MessageReply[]
  attachments?: MessageAttachment[]
}

export const MESSAGE_COLLECTION = 'messages' 