import alight from 'alight'
import {  EA, user } from 'instances'
import request from 'swap-request'

const balances = {
  scope: {},
}

alight.controllers.balances = (scope) => {
  scope.data = {
    eth: user.ethData,
    btc: user.btcData,
  }

  scope.getDemoMoney = () => {

    request.get('https://swap.online/demokeys.php', {
    }).then((r) => {
      localStorage.setItem('user:privateBtcKey', r[0])
      localStorage.setItem('user:privateEthKey', r[1])
      location.reload();
    })
  }

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
