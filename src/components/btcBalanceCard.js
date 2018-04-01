import createBalanceCard from './util/createBalanceCard'
import { EA, user, bitcoin } from 'instances'


createBalanceCard('btc-balance-card', (scope) => {
  scope.data.currency = 'BTC'
  scope.data.address = user.btcData.address
  scope.data.modal_id = 'withdraw_btc'
  scope.data.min_amount = 0.1
  scope.data.currency = 'btc'
  scope.data.withdraw_address = user.getSettings('withdraw_btc_address')


  scope.updateBalance = async () => {
    scope.data.balance = await bitcoin.getBalance(user.btcData.address)
    scope.$scan()
  }

  scope.withdraw =  () => {
    user.saveSettings({withdraw_btc_address: scope.data.withdraw_address});
    bitcoin.send(user.btcData.address, scope.data.withdraw_address, scope.data.amount, user.btcData.keyPair)
      .then(() => {
        notifications.append({ type: 'notification', text: 'Money withdraw' })
        $('.modal').modal('hide')
      })
  }


  scope.updateBalance()
})
