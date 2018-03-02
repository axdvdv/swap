import { Collection } from 'models'
import EA from './EA'
import user from './user'


class Orders extends Collection {

  constructor() {
    super()

    window.orders = this

    this.onMount()
  }

  onMount() {
    EA.subscribe('room:newOrder', (order) => {
      this.append(order)
    })

    EA.subscribe('room:updateOrderStatus', ({ orderId, status }) => {
      orders.getByKey(orderId).updateStatus(status)
    })

    EA.subscribe('room:startProcessOrder', ({ order, peerFrom }) => {
      orders.getByKey(order.id).startProcessing({
        peer: peerFrom,
      })
    })

    EA.subscribe('room:orderProcessing:sendSecretHash', ({ orderId, secretHash }) => {
      orders.getByKey(orderId).update({
        secretHash,
      })
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
    super.append(data, data.id)

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

    return order.owner.address === user.data.address
  }

  getOwnedByMe() {
    return this.items.length ? this.items.filter(({ owner: { address } }) => address === user.data.address) : []
  }
}


export default new Orders()
