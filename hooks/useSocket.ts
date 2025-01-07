import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

export const useSocket = (channelId?: string) => {
  const socket = useRef<Socket | null>(null)

  useEffect(() => {
    if (!socket.current) {
      const socketUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      
      socket.current = io(socketUrl, {
        path: '/api/socket',
        addTrailingSlash: false,
      })

      socket.current.on('connect', () => {
        console.log('Connected to Socket.IO server')
        if (channelId) {
          socket.current?.emit('join-channel', channelId)
        }
      })

      socket.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
      })

      socket.current.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server')
      })
    }

    return () => {
      if (socket.current) {
        if (channelId) {
          socket.current.emit('leave-channel', channelId)
        }
        socket.current.disconnect()
        socket.current = null
      }
    }
  }, [channelId])

  const sendMessage = useCallback((message: any) => {
    if (socket.current?.connected) {
      socket.current.emit('message', message)
    }
  }, [])

  const onMessageReceived = useCallback((callback: (message: any) => void) => {
    if (socket.current) {
      socket.current.on('message_received', callback)
      return () => {
        socket.current?.off('message_received', callback)
      }
    }
    return () => {}
  }, [])

  const addReaction = useCallback((messageId: string, reaction: string) => {
    if (socket.current?.connected) {
      socket.current.emit('reaction', { messageId, reaction })
    }
  }, [])

  const onReactionAdded = useCallback((callback: (data: { messageId: string, reaction: string }) => void) => {
    if (socket.current) {
      socket.current.on('reaction_added', callback)
      return () => {
        socket.current?.off('reaction_added', callback)
      }
    }
    return () => {}
  }, [])

  const notifyFileUpload = useCallback((fileData: { fileName: string, progress: number }) => {
    if (socket.current?.connected) {
      socket.current.emit('file_upload_progress', fileData)
    }
  }, [])

  const onFileUploadProgress = useCallback((callback: (data: { fileName: string, progress: number }) => void) => {
    if (socket.current) {
      socket.current.on('file_upload_progress', callback)
      return () => {
        socket.current?.off('file_upload_progress', callback)
      }
    }
    return () => {}
  }, [])

  const onFileUploadFinished = useCallback((callback: (message: any) => void) => {
    if (socket.current) {
      socket.current.on('file_upload_finished', callback)
      return () => {
        socket.current?.off('file_upload_finished', callback)
      }
    }
    return () => {}
  }, [])

  return {
    socket: socket.current,
    isConnected: socket.current?.connected || false,
    sendMessage,
    onMessageReceived,
    addReaction,
    onReactionAdded,
    notifyFileUpload,
    onFileUploadProgress,
    onFileUploadFinished,
  }
} 