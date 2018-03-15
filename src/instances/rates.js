class Rates {

  rate = null

  getRate() {
    return new Promise((resolve) => {
      if (!this.rate) {
        $.getJSON('https://noxonfund.com/curs.php', ({ price_btc }) => {
          this.rate = price_btc

          resolve(price_btc)
        })
      }
      else {
        resolve(this.rate)
      }
    })
  }
}

export default new Rates()
