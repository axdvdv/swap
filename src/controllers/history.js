import alight from 'alight'
import {user, room} from 'instances'
import $ from 'jquery'


const history = {
  scope: {},
}

alight.controllers.history = function (scope) {
  console.log('history controller!')

  scope.sign = function () {
    user.sign()
  }

  scope.BTCTransaction = function () {


    let transactions = [];
    scope.total_btc = 0;
    if (user.bitcoinData.address) {
      const url = 'https://api.blocktrail.com/v1/tbtc/address/' + user.bitcoinData.address + '/transactions?api_key=MY_APIKEY'
      $.getJSON(url, (r) => {

        $.each(r.data, function (k, i) {

          transactions.push(
            {
              status: i.block_hash != null ? 1 : 0,
              value: i.outputs[0].value / 100000000,
              address: i.outputs[0].address,
              date: i.time,
              type: user.bitcoinData.address == i.outputs[0].address ? 'text-success' : 'text-danger'
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

  scope.ETHTransaction = function () {


    scope.total_eth = 0;
    if (user.data.address) {
      let eth_address = user.data.address;
      const url = 'http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=' + eth_address + '&startblock=0&endblock=99999999&sort=asc&apikey=YourApiKeyToken'
      let transactions = [];


      $.getJSON(url, (r) => {


        $.each(r.result, function (k, i) {

          transactions.push(
            {
              status: i.blockHash != null ? 1 : 0,
              value: i.value / 1000000000000000,
              address: i.to,
              date: i.timeStamp,
              type: eth_address.toLowerCase() == i.to.toLowerCase() ? 'text-success' : 'text-danger'
            });

          scope.total_eth += i.value / 1000000000000000
        })

        scope.ethTransactions = transactions.reverse();
        scope.$scan()
      });

      return transactions;
    }

  }


  scope.sign()
  scope.BTCTransaction();
  scope.ETHTransaction();

  history.scope = scope
}


export default history
