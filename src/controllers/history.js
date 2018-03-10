import alight from 'alight'
import { user } from 'instances'
import {EA} from "../instances";


const history = {
  scope: {},
}

alight.controllers.history = function (scope) {
  console.log('history controller!')

  scope.total_eth = 0;
  scope.total_eth = 0;
  scope.BTCTransaction = function () {


    let transactions = [];

    if (user.btcData.address) {
      const url = 'https://api.blocktrail.com/v1/tbtc/address/' + user.btcData.address + '/transactions?api_key=MY_APIKEY'
      $.getJSON(url, (r) => {

        $.each(r.data, function (k, i) {

          transactions.push(
            {
              status: i.block_hash != null ? 1 : 0,
              value: i.outputs[0].value / 100000000,
              address: i.outputs[0].address,
              date: i.time,
              type: user.btcData.address == i.outputs[0].address ? 'text-success' : 'text-danger'
            }
          )

         scope.total_btc += i.outputs[0].value / 100000000;

        })

        scope.btcTransactions = transactions;

        scope.$scan()
      })

    } else {
      console.log('bitcoin_address is missing')
    }


  }



  scope.init = () => {
    user.getTransactions();

  }

  scope.init()

  EA.subscribe('eth:updateTransactions', (transactions) => {
    console.log(transactions)
    scope.ethTransactions = transactions;

    scope.$scan()
  })

  EA.subscribe('btc:updateTransactions', (transactions) => {
    scope.btcTransactions = transactions;

    scope.$scan()
  })

  history.scope = scope
}


export default history
