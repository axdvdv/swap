import EventAggregator from './EventAggregator'
import Storage from './Storage'
import Room from './Room'


class Swap {

  constructor({ initialState, connection }) {
    this.events         = new EventAggregator()
    this.storage        = new Storage({ initialState })
    this.room           = new Room({ swap: this, connection })
    this.flow           = null
  }

  setFlow(flow) {
    this.flow = flow
  }
}


export default Swap
