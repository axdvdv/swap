import createBalanceCard from './util/createBalanceCard'
import { EA, user, ethereum } from 'instances'


createBalanceCard('eth-balance-card', (scope) => {
  scope.data.currency = 'ETH'
  scope.data.address = user.ethData.address
  scope.data.modal_id = 'withdraw_eth'
  scope.data.min_amount = 0.01
  scope.data.withdraw_address = user.getSettings('withdraw_eth_address')
  scope.pattern = '(0x){1}[0-9a-fA-F]{40}'
  scope.disabled =0

  scope.updateBalance = () => {
    ethereum.getBalance(user.ethData.address)
  }

  scope.withdraw =  () => {
    user.saveSettings({ withdraw_eth_address: scope.data.withdraw_address })
    scope.disabled = 1

    ethereum.send(user.ethData.address, scope.data.withdraw_address,  scope.data.amount, user.ethData.privateKey)
      .then(() => {
        notifications.append({type: 'notification', text: 'Money withdraw'})
        $('.modal').modal('hide')
        scope.disabled = 0
      })
  }

  EA.subscribe('eth:updateBalance', (balance) => {
    scope.data.balance = balance
    scope.$scan()
  })

  scope.updateBalance()
})
