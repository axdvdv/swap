import orders from './orders'
import user from './user'
import room from './room'


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

    orders.append(data)
    this.saveLocalStorage()
    cb(removedOrder)
  }

  remove(id, cb) {
    if (this.checkIfOwnedByMe(id)) {
      orders.removeByKey(id)
      this.saveLocalStorage()
      cb && cb()
    }
  }

  checkIfOwnedByMe(id) {
    const order = orders.getByKey(id)

    if (!order) {
      return false
    }

    return order.ownerAddress === user.data.address
  }

  getOwnedByMe() {
    return orders.items.length ? orders.items.filter(({ ownerAddress }) => ownerAddress === user.data.address) : []
  }

  saveLocalStorage() {
    localStorage.setItem('myOrders', JSON.stringify(this.getOwnedByMe()))
  }
}


export default new MyOrders()
