import alight from 'alight'
import {user, room} from 'models'
import $ from 'jquery'
const history = {
  scope: {},
}

alight.controllers.history = function (scope) {
  console.log('history controller!')

  scope.sign = function () {
    user.sign()
  }

  scope.refreshBTCTransaction = function () {

    if (user.bitcoinData.address) {
      const url = 'https://api.blocktrail.com/v1/tbtc/address/' + user.bitcoinData.address + '/transactions?api_key=MY_APIKEY'

      let total = 0
      let transactions = []

      $.getJSON(url, function (r) {
        history.scope.btcTransactions = r.data

          $.getJSON(url, function (r) {

              $.each(r.data, function (k, i) {

                  transactions.push(
                      {
                          status:1,
                          value: i.outputs[0].value / 100000000,
                          address: i.outputs[0].address,
                          date: i.time
                      }
                  )

                  console.log(i)
                  total += i.outputs[0].value / 100000000;
                  //если дошли до конца обновляем все
                  if((k+1) == r.data.length ) {

                      history.scope.btcTransactions = transactions
                      history.scope.total_btc = total
                      history.scope.$scan()
                  }
              })
          })

      })
    } else {
      console.log('bitcoin_address is missing')
    }
  }

  scope.sign()
  scope.refreshBTCTransaction()

  history.scope = scope
}


export default history
