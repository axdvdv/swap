import EventAggregator from './EventAggregator'


class Room {

  constructor({ swap, connection }) {
    this.events       = new EventAggregator()

    this.swap         = swap
    this.connection   = connection

    connection.on('peer joined', this.handleNewUserConnected)
    connection.on('peer left', this.handleUserLeft)
    connection.on('message', this.handleNewMessage)
  }

  handleNewUserConnected = (peer) => {
    const { storage } = this.swap

    if (!storage.data.participant && peer !== storage.data.me.peer) {
      this.events.dispatch('participantOnline', peer)
    }
  }

  handleUserLeft = (peer) => {
    const { storage } = this.swap

    if (storage.data.participant && peer === storage.data.participant.peer) {
      this.events.dispatch('participantOffline', peer)
    }
  }

  handleNewMessage = (message) => {
    const { storage } = this.swap

    if (message.from === storage.data.me.peer) {
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
