import createBalanceCard from './util/createBalanceCard'
import { EA, user, bitcoin } from 'instances'


createBalanceCard('btc-balance-card', (scope) => {
  scope.data.currency = 'BTC'
  scope.data.address = user.btcData.address

  scope.updateBalance = async () => {
    scope.data.balance = await bitcoin.getBalance(user.btcData.address)
    scope.$scan()
  }

  scope.updateBalance()
})
