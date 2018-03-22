import createBalanceCard from './util/createBalanceCard'
import { user, ethereum } from 'instances'


createBalanceCard('eth-balance-card', (scope) => {
  scope.data.currency = 'ETH'
  scope.data.address = user.ethData.address

  scope.updateBalance = async () => {
    scope.data.balance = await ethereum.getBalance(user.ethData.address)
    scope.$scan()
  }

  scope.updateBalance()
})
