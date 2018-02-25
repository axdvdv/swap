import { orderStatuses } from 'helpers'
import { merge } from 'lodash'


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
    Object.keys(data).forEach((key) => {
      this[key] = data[key]
    })

    this.status = orderStatuses.active // active, processing, closed
  }

  update(data) {
    Object.keys(data).forEach((key) => {
      this[key] = merge(this[key], data[key])
    })
  }
}


export default Order
