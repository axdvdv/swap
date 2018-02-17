import IpfsRoom from 'ipfs-pubsub-room'
import { parseMess } from 'helpers'


class Room {

  constructor() {
    this.connection = null
  }

  connect(connection) {
    this.connection = connection
  }
}

const room = new Room()

const IpfsConnection = new Ipfs({
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


IpfsConnection.on('ready', () => {
  room.connect(IpfsRoom(IpfsConnection, 'jswaps'))

  room.connection.on('message', (message) => {
    parseMess.showMessage(message.data.toString())
  })

  // send message new users
  room.connection.on('peer joined', (peer) => {
    if (parseMess.myAdvs) {
      room.connection.sendTo(peer, parseMess.getStringify(parseMess.myAdvs))
    }
  })

  room.connection.on('subscribed', () => {
    console.log('Now connected!')
  })
})


export default room
