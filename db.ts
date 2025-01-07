import { MongoClient, ObjectId } from 'mongodb'

// Types
interface User {
  _id?: ObjectId;
  clerkId: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

// MongoDB Connection
if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

const uri = process.env.MONGODB_URI
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}

// Global is used here to maintain a cached connection across hot reloads
// in development. This prevents connections growing exponentially
// during API Route usage.
let cached = global as typeof globalThis & {
  mongoClient?: MongoClient
  clientPromise?: Promise<MongoClient>
}

if (!cached.clientPromise) {
  cached.mongoClient = new MongoClient(uri, options)
  cached.clientPromise = cached.mongoClient.connect()
}

const clientPromise = cached.clientPromise!

// Database helper functions
export const db = {
  async getUser(clerkId: string): Promise<User | null> {
    const client = await clientPromise
    return client
      .db('chatgenius')
      .collection<User>('users')
      .findOne({ clerkId })
  },

  async getUserByUsername(username: string): Promise<User | null> {
    const client = await clientPromise
    return client
      .db('chatgenius')
      .collection<User>('users')
      .findOne({ 
        username: { $regex: new RegExp(`^${username}$`, 'i') } 
      })
  },

  async updateUsername(clerkId: string, username: string) {
    const client = await clientPromise
    return client
      .db('chatgenius')
      .collection<User>('users')
      .updateOne(
        { clerkId },
        { 
          $set: { 
            username,
            updatedAt: new Date()
          },
          $setOnInsert: { 
            clerkId,
            createdAt: new Date()
          }
        },
        { upsert: true }
      )
  }
} 