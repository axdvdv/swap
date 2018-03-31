import EventAggregator from './EventAggregator'
import Storage from './Storage'
import Room from './Room'
import Flow from './Flow'


class Swap {

  constructor({ initialState, connection, flow }) {
    this.events         = new EventAggregator()
    this.storage        = new Storage({ initialState })
    this.room           = new Room({ swap: this, connection })
    this.flow           = new Flow({ swap: this, flow })
  }
}


export default Swap
