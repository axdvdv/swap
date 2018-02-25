import user from './user'
import Collection from './Collection'


class Orders extends Collection {

  constructor() {
    super()

    this.onMount()
  }

  onMount() {
    const items = JSON.parse(localStorage.getItem('myOrders') || '[]')

    this.items = items
    this.itemIds = {}

    items.forEach(({ id }, index) => this.itemIds[id] = index)

    console.log('Orders:', this.items)
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
    this.saveLocalStorage()
  }

  remove(id, cb) {
    if (this.checkIfOwnedByMe(id)) {
      super.removeByKey(id)
      this.saveLocalStorage()
      cb()
    }
  }

  removeAll() {
    this.items = []
    this.itemIds = {}
    this.saveLocalStorage()
  }

  checkIfOwnedByMe(id) {
    const order = this.getByKey(id)

    if (!order) {
      console.error('checkIfOwnedByMe failed', this.items, this.itemIds)
      return false
    }

    return order.ownerAddress === user.data.address
  }

  getOwnedByMe() {
    return this.items.length ? this.items.filter(({ ownerAddress }) => ownerAddress === user.data.address) : []
  }

  saveLocalStorage() {
    localStorage.setItem('myOrders', JSON.stringify(this.getOwnedByMe()))
  }
}


export default new Orders()
