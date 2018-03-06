import { orderStatuses } from 'helpers'
import EA from './EA'
import room from './room'
import orders from './orders'


class MyOrders {

  constructor() {

    this.onMount()
  }

  onMount() {
    const myOrders = JSON.parse(localStorage.getItem('myOrders') || '[]')
    const myProcessingOrders = JSON.parse(localStorage.getItem('myProcessingOrders') || '[]')

    myOrders.forEach((order) => {
      orders.append(order)
    })

    myProcessingOrders.forEach((order) => {
      Object.keys(order).forEach((key) => {
        orders.getByKey(order.id)[key] = order[key]
      })
    })

    EA.dispatchEvent('myOrders:onMount')

    EA.subscribe('room:newPeer', ({ peer }) => {
      const myOrders = orders.getOwnedByMe()

      console.log(`Send my orders to ${peer}`, myOrders)

      if (myOrders.length) {
        room.sendMessageToPeer(peer, myOrders.map((order) => ({
          event: 'newOrder',
          data: order,
        })))
      }
    })

    EA.subscribe('order:onUpdate', () => {
      this.saveProcessingOrdersToLocalStorage()
    })
  }

  append(data, cb) {
    let removedOrder

    // TODO ductape to store only 1 order from any user
    orders.getOwnedByMe().forEach((order) => {
      removedOrder = JSON.parse(JSON.stringify(order))

      this.remove(order.id)
    })

    orders.append(data)
    this.saveToLocalStorage()
    cb(removedOrder)
  }

  remove(id, cb) {
    if (orders.checkIfOwnedByMe(id)) {
      orders.removeByKey(id)
      this.saveToLocalStorage()
      cb && cb()
    }
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
