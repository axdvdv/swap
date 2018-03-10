import alight from 'alight'
import { user } from 'instances'
import {EA} from "../instances";


const history = {
  scope: {},
}

alight.controllers.history = function (scope) {
  console.log('history controller!')

  scope.total_eth = 0;
  scope.total_btc = 0;


  scope.init = () => {
    user.getTransactions();

  }

  scope.init()

  EA.subscribe('eth:updateTransactions', (transactions) => {
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
