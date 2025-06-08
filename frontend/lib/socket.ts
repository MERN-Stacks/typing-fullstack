import { io, Socket } from 'socket.io-client'

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
})
