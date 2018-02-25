import IpfsRoom from 'ipfs-pubsub-room'
import { main } from 'controllers'
import { user, orders, myOrders } from 'models'


class Room {

  constructor() {
    this.connection = null
  }

  connect(ipfsConnection) {
    this.peer = ipfsConnection._peerInfo.id.toB58String()

    this.connection = IpfsRoom(ipfsConnection, 'jswaps', {
      pollInterval: 5000,
    })

    this.connection.on('message', this.handleNewMessage)
    this.connection.on('peer joined', this.handleNewUserConnected)
    this.connection.on('subscribed', this.handleSubscribe)
  }

  handleSubscribe = () => {
    console.info('Now connected!')
  }

  handleNewMessage = (message) => {
    if (message.from === this.peer) {
      return
    }

    const data = JSON.parse(message.data.toString())

    console.log('New message', { ...message, data })

    if (data && data.length) {
      data.forEach(({ type, data }) => {
        if (data) {
          console.log(`New message data:`, { ...message, type, data })

          if (type === 'newOrder') {
            orders.append(data)
            main.scope.increaseTotals([ data ])
          }
          else if (type === 'removeOrder') {
            orders.remove(data.id)
            main.scope.decreaseTotals([ data ])
          }
        }
      })
    }
  }

  handleNewUserConnected = (peer) => {
    console.info('New peer:', peer)

    const orders = myOrders.getOwnedByMe()

    console.log('Send my orders:', orders)

    if (orders.length) {
      this.sendMessageToPeer(peer, orders.map((order) => ({
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

const room = new Room()


const ipfsConnection = new Ipfs({
  EXPERIMENTAL: {
    pubsub: true,
  },
  config: {
    Addresses: {
      Swarm: [
        '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
      ],
    },
  },
})

ipfsConnection.on('ready', () => room.connect(ipfsConnection))


export default room
