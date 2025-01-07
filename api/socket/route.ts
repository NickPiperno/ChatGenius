import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { Server as ServerIO, Socket } from 'socket.io'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request) {
  if (!req.headers.get('upgrade')?.includes('websocket')) {
    return new NextResponse('Expected Upgrade: websocket', { status: 426 })
  }

  try {
    const res = new NextResponse()
    const server = (res as any).socket?.server

    if (!server.io) {
      console.log('Setting up Socket.IO server...')
      
      server.io = new ServerIO(server, {
        path: '/api/socket',
        addTrailingSlash: false,
      })

      server.io.on('connection', (socket: Socket) => {
        console.log('Client connected:', socket.id)

        socket.on('join-channel', (channelId: string) => {
          socket.join(channelId)
          console.log(`Client ${socket.id} joined channel ${channelId}`)
        })

        socket.on('leave-channel', (channelId: string) => {
          socket.leave(channelId)
          console.log(`Client ${socket.id} left channel ${channelId}`)
        })

        socket.on('message', (message: any) => {
          // Broadcast to all clients in the channel
          if (message.channelId) {
            socket.to(message.channelId).emit('message_received', message)
          } else {
            socket.broadcast.emit('message_received', message)
          }
        })

        socket.on('reaction', ({ messageId, reaction }) => {
          socket.broadcast.emit('reaction_added', { messageId, reaction })
        })

        socket.on('file_upload_progress', (data) => {
          socket.broadcast.emit('file_upload_progress', data)
        })

        socket.on('file_upload_finished', (message: any) => {
          // Broadcast to all clients in the channel
          if (message.channelId) {
            socket.to(message.channelId).emit('file_upload_finished', message)
          } else {
            socket.broadcast.emit('file_upload_finished', message)
          }
        })

        socket.on('disconnect', () => {
          console.log('Client disconnected:', socket.id)
        })
      })
    }

    return res
  } catch (error) {
    console.error('Socket Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 