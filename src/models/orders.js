import Collection from './Collection'


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
}


export default new Orders()
