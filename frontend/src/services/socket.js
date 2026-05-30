import { io } from 'socket.io-client'

const socket = io(window.location.origin, {
  autoConnect: false,
  path: '/socket.io'
})

export default socket