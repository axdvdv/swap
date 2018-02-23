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
  }

  getOwnedByMe() {
    return this.items.filter(({ ownerAddress }) => ownerAddress === user.data.address)
  }
}


export default new Orders()
