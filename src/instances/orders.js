import request from 'swap-request'
import { Collection, Order } from 'models'
import EA from 'instances/EA'
import user from 'instances/user'
import room from 'instances/room'


class Orders extends Collection {

  constructor() {
    super()

    global.orders = this

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
    room.subscribe('newOrder', (order) => {
      this.append(order)
    })

    room.subscribe('removeOrder', (order) => {
      this.remove(order)
    })

    room.subscribe('updateOrderStatus', ({ orderId, status }) => {
      orders.getByKey(orderId).updateStatus(status)
    })

    room.subscribe('peerLeft', ({ peer }) => {
      const orders = this.items.filter(({ owner }) => owner.peer === peer)

      orders.forEach((order) => this.remove(order))
    })
  }

  append(data) {
    const order = new Order(data)

    super.append(order, order.id)

    EA.dispatch('orders:onAppend', data)
  }

  remove(data) {
    super.removeByKey(data.id)

    EA.dispatch('orders:onRemove', data)
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
