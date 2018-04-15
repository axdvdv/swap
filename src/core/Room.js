import EventAggregator from './EventAggregator'


class Room {

  constructor({ swap, connection }) {
    this.events           = new EventAggregator()

    this.myPeer           = swap.storage.data.me.peer
    this.participantPeer  = swap.storage.data.participant.peer
    this.connection       = connection

    connection.on('peer joined', this.handleNewUserConnected)
    connection.on('peer left', this.handleUserLeft)
    connection.on('message', this.handleNewMessage)
  }

  handleNewUserConnected = (peer) => {
    if (peer === this.participantPeer) {
      this.events.dispatch('participantOnline')
    }
  }

  handleUserLeft = (peer) => {
    if (peer === this.participantPeer) {
      this.events.dispatch('participantOffline')
    }
  }

  handleNewMessage = (message) => {
    if (message.from === this.myPeer) {
      return
    }

    const data = JSON.parse(message.data.toString())

    if (data && data.length) {
      data.forEach(({ event, data }) => {
        if (data) {
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
}


export default Room
