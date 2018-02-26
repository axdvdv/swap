import EA from './EA'


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

ipfsConnection.on('ready', () => {
  EA.dispatchEvent('ipfs:ready', {
    connection: ipfsConnection,
  })
})


export default ipfsConnection
