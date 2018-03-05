import orderStatuses from 'helpers/orderStatuses'
import { merge } from 'lodash'
import { EA } from 'instances'


class Order {

  /**
   *
   * @param {object}          data
   * @param {object}          data.user
   * @param {string}          data.currency1
   * @param {string}          data.currency2
   * @param {string|number}   data.currency1Amount
   * @param {string|number}   data.currency2Amount
   * @param {string|number}   data.exchangeRate
   * @param {string}          data.status
   * @param {string}          data.type
   */
  constructor(data) {
    this.participant = null
    this.status = orderStatuses.active // active, processing, closed

    Object.keys(data).forEach((key) => {
      this[key] = data[key]
    })
  }

  update(data) {
    Object.keys(data).forEach((key) => {
      this[key] = merge(this[key], data[key])
    })

    EA.dispatchEvent('order:onUpdate', this)
  }

  updateStatus(status) {
    if (status in orderStatuses) {
      this.status = status

      EA.dispatchEvent('order:onUpdate', this)
    }
  }

  startProcessing(participant) {
    this.status = orderStatuses.processing
    this.participant = participant

    EA.dispatchEvent('order:onUpdate', this)
  }
}


export default Order
