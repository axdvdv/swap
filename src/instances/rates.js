import request from 'swap-request'


const checkCurrencies = (currency1, currency2) => (value1, value2) => (
  value1 === currency1 || value1 === currency2
  && value2 === currency1 || value2 === currency2
)

class Rates {

  getRate(buyCurrency, sellCurrency) {
    return new Promise((resolve) => {
      if (checkCurrencies('ETH', 'BTC')(buyCurrency, sellCurrency)) {
        request.get('https://noxonfund.com/curs.php')
          .then(({ price_btc }) => {
            let rate = buyCurrency === 'ETH' ? price_btc : 1 / price_btc
                rate = Number(String(Number(rate).toFixed(12)))

            resolve(rate)
          })
      }
    })
  }
}

export default new Rates()
