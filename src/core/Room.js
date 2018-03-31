import EventAggregator from './EventAggregator'


class Room {

  constructor({ swap, connection }) {
    this.events       = new EventAggregator()

    this.participant  = swap.storage.participant
    this.connection   = connection

    connection.on('subscribed', this.handleSubscribe)
    connection.on('peer joined', this.handleNewUserConnected)
    connection.on('peer left', this.handleUserLeft)
    connection.on('message', this.handleNewMessage)
  }

  handleNewUserConnected = (peer) => {
    if (peer === this.participant.peer) {
      this.events.dispatch('participantOnline')
    }
  }

  handleUserLeft = (peer) => {
    if (peer === this.participant.peer) {
      this.events.dispatch('participantOffline')
    }
  }

  handleNewMessage = (message) => {
    if (message.from === this.participant.peer) {
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
