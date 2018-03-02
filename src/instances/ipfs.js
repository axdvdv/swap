import EA from './EA'


const ipfs = new Ipfs({
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

ipfs.once('ready', () => ipfs.id((err, info) => {
  if (err) {
    throw err
  }

  EA.dispatchEvent('ipfs:ready', {
    peer: info.id,
    connection: ipfs,
  })
}))


export default ipfs
