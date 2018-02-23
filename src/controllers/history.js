import alight from 'alight'
import {user, room} from 'models'
import $ from 'jquery'
const history = {
  scope: {},
}

alight.controllers.history = function (scope) {
  console.log('history controller!')
  history.scope = scope

  scope.sign = function () {
    user.sign()
  }

  scope.refreshBTCTransaction = function () {

    if (user.bitcoinData.address) {
      const url = 'https://api.blocktrail.com/v1/tbtc/address/' + user.bitcoinData.address + '/transactions?api_key=MY_APIKEY'

      let total = 0

      $.getJSON(url, function (r) {
        history.scope.btcTransactions = r.data

        $.each(r.data, function (k, i) {
          console.log(i)

        })

        history.scope.$scan()

      })
    } else {
      console.log('bitcoin_address is missing')
    }
  }

  scope.sign()
  scope.refreshBTCTransaction()
}


export default history
