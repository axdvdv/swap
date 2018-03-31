import IpfsRoom from 'ipfs-pubsub-room'
import EventAggregator from 'models/EventAggregator'
import EA from './EA'
import user from './user'


class Room {

  constructor() {
    this.events = new EventAggregator()
    this.peers = []
    this.connection = null

    global.room = this

    this.onMount()
  }

  onMount() {
    EA.once('ipfs:ready', ({ connection }) => {
      this.connection = IpfsRoom(connection, 'jswaps', {
        pollInterval: 5000,
      })

      this.connection.on('subscribed', this.handleSubscribe)
      this.connection.on('peer joined', this.handleNewUserConnected)
      this.connection.on('peer left', this.handleUserLeft)
      this.connection.on('message', this.handleNewMessage)
    })
  }

  handleSubscribe = () => {
    console.info('Room ready!')

    this.events.dispatch('ready')
  }

  handleNewUserConnected = (peer) => {
    if (!this.peers.includes(peer)) {
      console.room('newPeer', peer)

      this.peers.push(peer)
      this.events.dispatch('newPeer', { peer })
    }
  }

  handleUserLeft = (peer) => {
    if (this.peers.includes(peer)) {
      console.room('peerLeft', peer)

      this.peers.splice(this.peers.indexOf(peer), 1)
      this.events.dispatch('peerLeft', { peer })
    }
  }

  handleNewMessage = (message) => {
    if (message.from === user.peer) {
      return
    }

    const data = JSON.parse(message.data.toString())

    if (data && data.length) {
      data.forEach(({ event, data }) => {
        if (data) {
          console.room(event, { ...message, data })
          this.events.dispatch(event, { ...data, peerFrom: message.from })
        }
      })
    }
  }

  subscribe(eventName, handler) {
    this.events.subscribe(eventName, handler)
  }

  once(eventName, handler) {
    this.events.once(eventName, handler)
  }

  sendMessage(...args) {
    if (args.length === 1) {
      const [ message ] = args

      this.connection.broadcast(JSON.stringify(message))
    }
    else {
      const [ peer, message ] = args

      this.connection.sendTo(peer, JSON.stringify(message))
    }
  }

  isPeerExist(peer) {
    return this.connection.hasPeer(peer)
  }
}


export default new Room()
