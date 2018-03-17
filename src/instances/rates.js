import request from 'swap-request'


class Rates {

  rate = null

  getRate() {
    return new Promise((resolve) => {
      if (!this.rate) {
        request.get('https://noxonfund.com/curs.php')
          .then(({ price_btc }) => {
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
