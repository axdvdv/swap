import IpfsRoom from 'ipfs-pubsub-room'
import EA from './EA'
import user from './user'


class Room {

  constructor() {
    this.peers = []
    this.connection = null
    // this.waitList = []

    global.room = this

    this.onMount()
  }

  onMount() {
    EA.once('ipfs:ready', ({ connection }) => {
      this.connection = IpfsRoom(connection, 'jswaps', {
        pollInterval: 5000,
      })

      this.connection.on('message', this.handleNewMessage)
      this.connection.on('peer joined', this.handleNewUserConnected)
      this.connection.on('peer left', this.handleUserLeft)
      this.connection.on('subscribed', this.handleSubscribe)
    })
  }

  handleSubscribe = () => {
    console.info('Room ready!')

    EA.dispatchEvent('room:ready')
  }

  handleNewMessage = (message) => {
    if (message.from === user.peer) {
      return
    }

    const data = JSON.parse(message.data.toString())

    // console.log('New message', { ...message, data })

    // if (this.waitList.includes(JSON.stringify({ peer: message.from, message: data }))) {
    //
    // }

    if (data && data.length) {
      data.forEach(({ event, data }) => {
        if (data) {
          console.room(event, { ...message, data })
          EA.dispatchEvent(`room:${event}`, { ...data, peerFrom: message.from })
        }
      })
    }
  }

  handleNewUserConnected = (peer) => {
    if (!this.peers.includes(peer)) {
      console.room('newPeer', peer)

      this.peers.push(peer)
      EA.dispatchEvent('room:newPeer', { peer })
    }
  }

  handleUserLeft = (peer) => {
    if (this.peers.includes(peer)) {
      console.room('peerLeft', peer)

      this.peers.splice(this.peers.indexOf(peer), 1)
      EA.dispatchEvent('room:peerLeft', { peer })
    }
  }

  checkMessageDeliveryStatus() {

  }

  addMessageToWaitList() {

  }

  isPeerExist(peer) {
    return this.connection.hasPeer(peer)
  }

  sendMessage(message) {
    this.connection.broadcast(JSON.stringify(message))
  }

  sendMessageToPeer(peer, message) {
    // this.waitList.push(JSON.stringify({
    //   peer,
    //   message
    // }))

    this.connection.sendTo(peer, JSON.stringify(message))
  }
}


export default new Room()
