import { orderStatuses } from 'helpers'
import orders from './orders'
import user from './user'


class MyOrders {

  constructor() {
    const items = JSON.parse(localStorage.getItem('myOrders') || '[]')

    orders.items = items
    orders.itemIds = {}

    items.forEach(({ id }, index) => orders.itemIds[id] = index)

    console.log('Orders:', orders.items)
  }

  append(data, cb) {
    let removedOrder

    // TODO ductape to store only 1 order from any user
    this.getOwnedByMe().forEach((order) => {
      removedOrder = JSON.parse(JSON.stringify(order))

      this.remove(order.id)
    })

    orders.append({
      ...data,
      owner: {
        address: user.data.address,
        peer: user.peer,
      },
    })
    this.saveToLocalStorage()
    cb(removedOrder)
  }

  remove(id, cb) {
    if (this.checkIfOwnedByMe(id)) {
      orders.removeByKey(id)
      this.saveToLocalStorage()
      cb && cb()
    }
  }

  checkIfOwnedByMe(id) {
    const order = orders.getByKey(id)

    if (!order) {
      return false
    }

    return order.owner.address === user.data.address
  }

  saveToLocalStorage() {
    localStorage.setItem('myOrders', JSON.stringify(orders.getOwnedByMe()))
  }

  getProcessingOrders() {
    const myOrders = orders.getOwnedByMe()

    return myOrders.length ? myOrders.filter(({ status }) => status === orderStatuses.processing) : []
  }

  saveProcessingOrdersToLocalStorage() {
    localStorage.setItem('myProcessingOrders', JSON.stringify(this.getProcessingOrders()))
  }
}


export default new MyOrders()
