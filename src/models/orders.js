import user from './user'
import Collection from './Collection'


class Orders extends Collection {

  constructor() {
    super()

    this.onMount()
  }

  onMount() {
    let items = localStorage.getItem('myOrders')

    if (items) {
      try {
        items = JSON.parse(items)
      }
      catch (err) {
        throw new Error(err)
      }
    }

    this.items = items || []
    this.itemIds = items ? items.map(({ id }) => id) : []
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
