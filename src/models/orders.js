import Collection from './Collection'
import user from './user'


class Orders extends Collection {

  constructor() {
    super()

    window.orders = this
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

  remove(id) {
    super.removeByKey(id)
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
