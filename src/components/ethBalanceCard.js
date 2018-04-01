import createBalanceCard from './util/createBalanceCard'
import { user, ethereum } from 'instances'


createBalanceCard('eth-balance-card', (scope) => {
  scope.data.currency = 'ETH'
  scope.data.address = user.ethData.address
  scope.data.modal_id = 'withdraw_eth'
  scope.data.min_amount = 0.01
  scope.data.currency = 'eth'
  scope.data.withdraw_address = user.getSettings('withdraw_eth_address')

  scope.updateBalance = async () => {

    scope.data.balance = await ethereum.getBalance(user.ethData.address)
    scope.$scan()
  }

  scope.withdraw =  () => {
    user.saveSettings({withdraw_eth_address: scope.withdraw_address});
    ethereum.send(user.ethData.address, scope.withdraw_ddress,  scope.amount, user.ethData.privateKey)
      .then(() => {
        notifications.append({type: 'notification', text: 'Money withdraw'})
        $('.modal').modal('hide')
      }).catch((err) => {
      console.log(err)
    })
  }

  scope.updateBalance()
})
