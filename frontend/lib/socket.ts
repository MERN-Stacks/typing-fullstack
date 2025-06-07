import { io, Socket } from 'socket.io-client'

const URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001'

// We export the socket instance
// It will be null on the server-side and defined on the client-side
export const socket: Socket = io(URL, {
  autoConnect: false,
})
