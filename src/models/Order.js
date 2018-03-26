import orderStatuses from 'helpers/orderStatuses'
import { merge } from 'lodash'
import { EA } from 'instances'


class Order {

  /**
   *
   * @param {object}          data
   * @param {object}          data.owner
   * @param {string}          data.buyCurrency
   * @param {string}          data.sellCurrency
   * @param {string|number}   data.buyAmount
   * @param {string|number}   data.sellAmount
   * @param {string|number}   data.exchangeRate
   * @param {string}          data.status
   */
  constructor(data) {
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
}


export default Order
