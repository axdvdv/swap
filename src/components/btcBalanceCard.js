import createBalanceCard from './util/createBalanceCard'
import { EA, user, bitcoin } from 'instances'


createBalanceCard('btc-balance-card', (scope) => {
  scope.data.currency = 'BTC'
  scope.data.address = user.btcData.address
  scope.data.modal_id = 'withdraw_btc'
  scope.data.min_amount = 0.1
  scope.data.withdraw_address = user.getSettings('withdraw_btc_address')
  scope.pattern = '[a-zA-HJ-NP-Z0-9]{25,34}'
  scope.disabled =0
  scope.data.commission =0
  scope.data.max_amount =0
  scope.updateBalance = () => {
    bitcoin.getBalance(user.btcData.address)
  }

  scope.withdraw = () => {
    user.saveSettings({ withdraw_btc_address: scope.data.withdraw_address })
    scope.disabled = 1

    bitcoin.send(user.btcData.address, scope.data.withdraw_address, scope.data.amount, user.btcData.keyPair)
      .then(() => {
        scope.disabled = 0;
        scope.updateBalance();
        notifications.append({ type: 'notification', text: 'Money withdraw' })
        $('.modal').modal('hide')
        user.getBalances();
      }).catch(function(e){
      //error handling logic
      console.log(e); // "oh, no!"
    });
  }

  EA.subscribe('btc:updateBalance', (balance) => {
    scope.data.balance = balance
    scope.data.max_amount =balance
    scope.$scan()
  })

  scope.updateBalance()
})
