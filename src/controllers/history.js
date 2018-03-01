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

    $.when(user.getBtcTransactions()).then(
      function( data, textStatus, jqXHR ) {

        history.scope.btcTransactions = data
        let total = 0;

        console.log(history.scope.btcTransactions)
        $.each(history.scope.btcTransactions, function (k, i) {


          total += i.value / 1000000
        })
        scope.total_btc = total
        scope.$scan()
      }
    )


  }

  scope.ETHTransaction = function () {

    if (user.data.address) {


      $.when(user.getEthTransactions()).then(
        function(data) {
          scope.ethTransactions = data
          console.log(scope.ethTransactions)
          scope.$scan()
        }
      );






    } else {
      console.log('bitcoin_address is missing')
    }
  }


  scope.sign()
  scope.BTCTransaction();
  scope.ETHTransaction();

  history.scope = scope
}


export default history
