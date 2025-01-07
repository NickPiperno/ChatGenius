import { NextResponse } from 'next/server'
import { MongoClient, GridFSBucket } from 'mongodb'
import { Readable } from 'stream'

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

export async function GET(
  request: Request,
  { params }: { params: { fileId: string; fileName: string } }
) {
  try {
    const { fileId, fileName } = params
    
    // Connect to MongoDB
    const client = await MongoClient.connect(uri)
    const db = client.db('chatgenius')
    const bucket = new GridFSBucket(db, {
      bucketName: 'uploads'
    })

    // Find the file by filename (which includes the UUID)
    const files = await bucket.find({ filename: `${fileId}-${fileName}` }).toArray()
    
    if (!files.length) {
      await client.close()
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    const file = files[0]

    // Create a readable stream
    const downloadStream = bucket.openDownloadStreamByName(`${fileId}-${fileName}`)

    // Convert stream to buffer
    const chunks: Buffer[] = []
    for await (const chunk of downloadStream) {
      chunks.push(Buffer.from(chunk))
    }
    const buffer = Buffer.concat(chunks)

    // Close the connection
    await client.close()

    // Determine content type
    const contentType = file.metadata?.type || 'application/octet-stream'

    // Return the file with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json(
      { error: 'Error serving file' },
      { status: 500 }
    )
  }
} 