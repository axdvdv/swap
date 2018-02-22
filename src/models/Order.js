class Order {

  /**
   *
   * ownerAddress
   * currency1
   * currency2
   * currency1Amount
   * currency2Amount
   * exchangeRate
   * type
   */
  constructor(data) {
    Object.keys(data).forEach((key) => {
      this[key] = data[key]
    })
  }
}


export default Order
