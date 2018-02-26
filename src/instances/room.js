import IpfsRoom from 'ipfs-pubsub-room'
import { main } from 'controllers'
import { orderStatuses } from 'helpers'
import EA from './EA'
import user from './user'
import orders from './orders'
import myOrders from './myOrders'


class Room {

  constructor() {
    this.connection = null

    this.onMount()
  }

  onMount() {
    EA.once('ipfs:ready', (data) => {
      this.connection = IpfsRoom(data.connection, 'jswaps', {
        pollInterval: 5000,
      })

      this.connection.on('message', this.handleNewMessage)
      this.connection.on('peer joined', this.handleNewUserConnected)
      this.connection.on('subscribed', this.handleSubscribe)
    })
  }

  handleSubscribe = () => {
    console.info('Now connected!')
  }

  handleNewMessage = (message) => {
    if (message.from === user.peer) {
      return
    }

    const data = JSON.parse(message.data.toString())

    console.log('New message', { ...message, data })

    if (data && data.length) {
      data.forEach(({ type, data }) => {
        if (data) {
          console.log(`New message data:`, { ...message, type, data })

          EA.dispatchEvent(`room:${type}`, { ...data, peerFrom: message.from })
        }
      })
    }
  }

  handleNewUserConnected = (peer) => {
    console.info('New peer:', peer)

    const myOrders = orders.getOwnedByMe()

    console.log('Send my orders:', myOrders)

    if (myOrders.length) {
      this.sendMessageToPeer(peer, myOrders.map((order) => ({
        type: 'newOrder',
        data: order,
      })))
    }
  }

  sendMessage(message) {
    this.connection.broadcast(JSON.stringify(message))
  }

  sendMessageToPeer(peer, message) {
    this.connection.sendTo(peer, JSON.stringify(message))
  }
}


export default new Room()
