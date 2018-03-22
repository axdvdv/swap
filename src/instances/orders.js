import request from 'swap-request'
import { Collection, Order } from 'models'
import EA from './EA'
import user from './user'


class Orders extends Collection {

  constructor() {
    super()

    window.orders = this

    this.onMount()
  }

  updateExchanges() {
    request.get('https://noxonfund.com/curs.php')
      .then(({ price_btc }) => {
      // scope.eth_exchange_rate = price_btc
      // scope.btc_exchange_rate = price_btc
      scope.$scan()
    })
  }

  onMount() {
    EA.subscribe('room:newOrder', (order) => {
      this.append(order)
    })

    EA.subscribe('room:removeOrder', (order) => {
      this.remove(order)
    })

    EA.subscribe('room:updateOrderStatus', ({ orderId, status }) => {
      orders.getByKey(orderId).updateStatus(status)
    })
  }

  /**
   * id
   * ownerAddress
   * currency1
   * currency2
   * currency1Amount
   * currency2Amount
   * exchangeRate
   * type
   */
  append(data) {
    const order = new Order(data)

    super.append(order, order.id)

    EA.dispatchEvent('orders:onAppend', data)
  }

  remove(data) {
    super.removeByKey(data.id)

    EA.dispatchEvent('orders:onRemove', data)
  }

  checkIfOwnedByMe(id) {
    const order = this.getByKey(id)

    if (!order) {
      return false
    }

    return order.owner.address === user.ethData.address
  }

  getOwnedByMe() {
    return this.items.length ? this.items.filter(({ owner: { address } }) => address === user.ethData.address) : []
  }
}


export default new Orders()
