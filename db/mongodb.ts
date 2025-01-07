import { MongoClient } from 'mongodb'
import { Message, MESSAGE_COLLECTION } from './schemas/message'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

let client: MongoClient | null = null

export async function getMongoClient() {
  if (!client) {
    client = await MongoClient.connect(MONGODB_URI as string)
  }
  return client
}

export async function updateUsername(userId: string, newUsername: string) {
  const client = await getMongoClient()
  const db = client.db('chatgenius')
  
  try {
    // Update username in all messages
    await db.collection<Message>(MESSAGE_COLLECTION).updateMany(
      { 'sender.id': userId },
      { $set: { 'sender.name': newUsername } }
    )

    // Update username in all replies
    await db.collection<Message>(MESSAGE_COLLECTION).updateMany(
      { 'replies.sender.id': userId },
      { $set: { 'replies.$[reply].sender.name': newUsername } },
      { arrayFilters: [{ 'reply.sender.id': userId }] }
    )
  } catch (error) {
    console.error('Error updating username in MongoDB:', error)
    throw error
  }
}

export async function closeMongoConnection() {
  if (client) {
    await client.close()
    client = null
  }
} 