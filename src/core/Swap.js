import EventAggregator from './EventAggregator'
import Storage from './Storage'
import Room from './Room'


class Swap {

  /**
   *
   * @param {object} data
   * @param {object} data.swap
   * @param {object} data.swap.me
   * @param {object} data.swap.me.btcData
   * @param {object} data.swap.me.ethData
   * @param {object} data.swap.participant
   * @param {object} data.swap.participant.btcData
   * @param {string} data.swap.participant.btcData.address
   * @param {string} data.swap.participant.btcData.publicKey
   * @param {object} data.swap.participant.ethData
   * @param {string} data.swap.participant.ethData.address
   * @param {string} data.swap.participant.ethData.publicKey
   * @param {string} data.swap.id - now it's order id
   * @param {number} data.swap.requiredAmount
   * @param {number} data.swap.buyAmount
   * @param {string} data.swap.buyCurrency
   * @param {number} data.swap.sellAmount
   * @param {string} data.swap.sellCurrency
   * @param {object} data.flow
   * @param {number} data.flow.step
   * @param {object} connection
   */
  constructor({ data, connection }) {
    this.events         = new EventAggregator()
    this.storage        = new Storage({ data: data.swap })
    this.room           = new Room({ swap: this, connection })
    this.flow           = null
    this._data          = data

    this.storage.on('update', this._dispatchAnyStorageUpdate)
  }

  _dispatchAnyStorageUpdate = () => {
    this.events.dispatch('updateAnyStorage', {
      swap: this.storage.data,
      flow: this.flow.storage.data,
    })
  }

  setFlow(Flow, options) {
    this.flow = new Flow({
      swap: this,
      data: this._data.flow,
      options,
    })

    this.flow.storage.on('update', this._dispatchAnyStorageUpdate)

    return this.flow
  }

  on(eventName, handler) {
    this.events.subscribe(eventName, handler)
  }
}


export default Swap
