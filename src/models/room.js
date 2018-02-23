import IpfsRoom from 'ipfs-pubsub-room'
import { orders } from 'models'


class Room {

  constructor() {
    this.connection = null
  }

  connect(ipfsConnection) {
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
    const data = JSON.parse(message.data.toString())

    if (data && data.length) {
      console.log(`New message data:`, { ...message, data })

      data.forEach(({ type, data }) => {
        console.log(`Message of type ${type}:`, data)

        if (type === 'newOrder') {
          orders.append(data)
        }
      })
    }
  }

  handleNewUserConnected = (peer) => {
    console.info('New peer:', peer)

    const myOrders = orders.getOwnedByMe()

    if (myOrders.length) {
      this.connection.sendTo(peer, JSON.stringify(myOrders))
    }
  }

  sendMessage(message) {
    this.connection.broadcast(JSON.stringify(message))
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
