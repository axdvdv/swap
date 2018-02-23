import alight from 'alight'
import { user, room } from 'models'

const history = {
  scope: {},
}

alight.controllers.history = function(scope) {
  history.scope = scope;

    scope.sign = function() {
        user.sign();
    }

    scope.refreshBTCTransaction = function () {
        if (scope.bitcoin_address) {
            const url = 'https://api.blocktrail.com/v1/tbtc/address/'+scope.bitcoin_address+'/transactions?api_key=MY_APIKEY'

            $.getJSON(url, function (r) {
                scope.btcTransactions = r.data
                // scope.btcTransactions.kurs = scope.eth_price
                console.log(scope.btcTransactions)
                // console.log(scope.eth_price)
                scope.$scan()
            })
        }
    }


    scope.sign();
    scope.refreshBTCTransaction();
}


export default history
