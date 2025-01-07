import { NextResponse } from 'next/server'
import { MongoClient, GridFSBucket } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { auth } from '@clerk/nextjs'
import { validateFile, sanitizeFileName, getFileType } from '@/lib/fileValidation'

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

export async function POST(request: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const channelId = formData.get('channelId') as string
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    try {
      validateFile(file)
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      )
    }

    // Create a unique ID for the file
    const fileId = uuidv4()
    
    // Connect to MongoDB
    const client = await MongoClient.connect(uri as string)
    const db = client.db('chatgenius')
    const bucket = new GridFSBucket(db, {
      bucketName: 'uploads'
    })

    // Sanitize filename
    const sanitizedName = sanitizeFileName(file.name)
    const fileName = `${fileId}-${sanitizedName}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to GridFS
    const uploadStream = bucket.openUploadStream(fileName, {
      metadata: {
        originalName: file.name,
        type: file.type,
        size: file.size,
        userId,
        channelId,
        uploadedAt: new Date()
      }
    })

    // Upload file and get the file ID
    const gridFsId = await new Promise<string>((resolve, reject) => {
      uploadStream.end(buffer, (error) => {
        if (error) {
          reject(error)
          return
        }
        resolve(uploadStream.id.toString())
      })
    })

    // Store file metadata in MongoDB files collection
    const filesCollection = db.collection('files')
    await filesCollection.insertOne({
      id: fileId,
      name: sanitizedName,
      type: file.type,
      size: file.size,
      url: `/api/files/${fileId}/${sanitizedName}`,
      userId,
      channelId,
      gridFsId,
      uploadedAt: new Date()
    })

    // Close the MongoDB connection
    await client.close()
    
    // Return the file metadata
    return NextResponse.json({
      id: fileId,
      name: sanitizedName,
      url: `/api/files/${fileId}/${sanitizedName}`,
      type: getFileType(file.type)
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    )
  }
} 