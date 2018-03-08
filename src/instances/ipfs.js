import EA from './EA'


const ipfs = new Ipfs({
  EXPERIMENTAL: {
    pubsub: true,
  },
  config: {
    Addresses: {
      Swarm: [
        '/ip4/46.101.244.101/tcp/9090/ws/p2p-websocket-star/',
        '/ip4/146.185.173.84/tcp/9090/ws/p2p-websocket-star/',
      ],
    },
  },
})

ipfs.once('ready', () => ipfs.id((err, info) => {
  console.log('IPFS ready!')

  if (err) {
    throw err
  }

  EA.dispatchEvent('ipfs:ready', {
    peer: info.id,
    connection: ipfs,
  })
}))


export default ipfs
