import alight from 'alight'
import {  EA, user } from 'instances'

const balances = {
  scope: {},
}

alight.controllers.balances = (scope) => {

  scope.withdraw_eth_min_amount = 0.01
  scope.withdraw_btc_min_amount = 0.1
  scope.data = {
    eth: user.ethData,
    btc: user.btcData,
  }

  scope.withdrawEth =  () => {
    user.saveSettings({withdraw_eth_address: scope.withdraw_eth_address});
    ethereum.send(user.ethData.address, scope.withdraw_eth_address,  scope.withdraw_eth_amount, user.ethData.privateKey)
      .then(() => {
        notifications.append({type: 'notification', text: 'Вывод денег'})
        $('.modal').modal('hide')
      }).catch((err) => {
      console.log(err)
    })
  }

  scope.withdrawBtc =  () => {
    user.saveSettings({withdraw_btc_address: scope.withdraw_btc_address});
    bitcoin.send(user.btcData.address, scope.withdraw_btc_address, scope.withdraw_btc_amount, user.btcData.privateKey)
      .then(() => {
        notifications.append({ type: 'notification', text: 'Вывод денег' })
        $('.modal').modal('hide')
      })
  }

  scope.updateEthBalance = async () => {

    user.getBalances('eth')
  }

  scope.updateBtcBalance =  () => {

    user.getBalances('btc')
  }
  scope.init = function () {

    let settings = user.getSettings('all')
    if (settings) {
      scope.withdraw_eth_address = settings.withdraw_eth_address
      scope.withdraw_btc_address = settings.withdraw_btc_address
    }
    scope.$scan()
  }

  scope.updateRates = async () => {

    /*
     Promise.all([ ethereum.getRate(),  bitcoin.getRate()]).then(value  => {
       console.log(values)
     })*/

    scope.eth_exchange_rate = await ethereum.getRate();
    scope.btc_exchange_rate = await bitcoin.getRate();
    scope.$scan()
  }

  scope.init()
  scope.updateRates()

  EA.subscribe('eth:updateBalance', (balance) => {
    scope.data.eth.balance = balance
    scope.$scan()
  })

  EA.subscribe('btc:updateBalance', (balance) => {
    scope.data.btc.balance = balance
    scope.$scan()
  })

  EA.subscribe('notification:show', (messange) => {
    $('.modal').modal('hide')
    alert(messange)
  })

  EA.subscribe('form:showError', (formId, messange) => {
    let form = $(formId)
    if(form.length) {
      form.find('.text-danger').text(messange).slideDown(1000)
    }
  })

  EA.subscribe('form:hideError', (formId, messange) => {

    $('form .text-danger').text('').slideUp(1000)
  })

  EA.once('myOrders:onMount', () => {
    increaseTotals(orders.items)
    scope.$scan()
  })

  EA.subscribe('orders:onAppend', (order) => {
    increaseTotals([ order ])
    scope.$scan()
  })

  EA.subscribe('orders:onRemove', (order) => {
    decreaseTotals([ order ])
    scope.$scan()
  })

  EA.subscribe('order:onStatusUpdate', () => {
    scope.$scan()
  })


  balances.scope = scope
}


// Filters

alight.filters.onlyBuy = (items, scope) =>
  items.filter(({ type }) => type === 'buy')

alight.filters.onlySell = (items, scope) =>
  items.filter(({ type }) => type === 'sell')

alight.filters.onlyActive = (items, scope) =>
  items.filter(({ status }) => status === orderStatuses.active)


// Hooks

alight.hooks.eventModifier.change_eth_exchange_rate = {
  event: [ 'input', 'blur' ],
  fn: (event, env) => {
    if (event.type === 'blur') return
    if (!main.scope.eth_exchange_rate) return

    main.scope.eth_exchange_rate = (main.scope.eth_exchange_rate.match(/^[\d.]+$/))
    main.scope.btc = main.scope.eth *main.scope.eth_exchange_rate

    // main. scope.$scan()
  }
}

alight.hooks.eventModifier.change_eth = {
  event: [ 'input', 'blur' ],
  fn: (event, env) => {
    if (event.type === 'blur') return
    if (!main.scope.eth_exchange_rate) return

    main.scope.eth = (main.scope.eth.match(/^[\d.]+$/))
    main.scope.btc = main.scope.eth *main.scope.eth_exchange_rate

    // main. scope.$scan()
  }
}

alight.hooks.eventModifier.change_btc = {
  event: [ 'input', 'blur' ],
  fn: (event, env) => {
    if (event.type === 'blur') return
    if (!main.scope.eth_exchange_rate) return

    main.scope.btc = (main.scope.btc.match(/^[\d.]+$/))
    main.scope.eth = main.scope.btc / main.scope.eth_exchange_rate

    // main. scope.$scan()
  }
}

//for sell
alight.hooks.eventModifier.change_btc_exchange_rate = {
  event: [ 'input', 'blur' ],
  fn: (event, env) => {
    if (event.type === 'blur') return
    if (!main.scope.btc_exchange_rate) return

    main.scope.btc_exchange_rate = (main.scope.btc_exchange_rate.match(/^[\d.]+$/))
    main.scope.sell_btc = main.scope.sell_eth *main.scope.btc_exchange_rate

    // main. scope.$scan()
  }
}

alight.hooks.eventModifier.change_sell_eth = {
  event: [ 'input', 'blur' ],
  fn: (event, env) => {
    if (event.type === 'blur') return
    if (!main.scope.btc_exchange_rate) return

    main.scope.sell_eth = (main.scope.sell_eth.match(/^[\d.]+$/))
    main.scope.sell_btc = main.scope.sell_eth *main.scope.btc_exchange_rate

    // main. scope.$scan()
  }
}

alight.hooks.eventModifier.change_sell_btc = {
  event: [ 'input', 'blur' ],
  fn: (event, env) => {
    if (event.type === 'blur') return
    if (!main.scope.btc_exchange_rate) return

    main.scope.sell_btc = (main.scope.sell_btc.match(/^[\d.]+$/))
    main.scope.sell_eth = main.scope.sell_btc / main.scope.btc_exchange_rate

    // main. scope.$scan()
  }
}


export default balances
