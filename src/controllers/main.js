import alight from 'alight'
import sha256 from 'js-sha256'
import { orderStatuses } from 'helpers'
import { EA, bitcoin, ethereum, user, room, myOrders, orders, notifications } from 'instances'


const main = {
  scope: {},
}

alight.controllers.main = (scope) => {
  console.log('Main controller!')

  scope.data = {
    eth: user.ethData,
    btc: user.btcData,
  }

  scope.user = user
  scope.orders = orders
  scope.total_btc = 0
  scope.total_eth = 0
  scope.eth_exchange_rate = ''
  scope.btc_exchange_rate = ''
  scope.withdraw_eth_min_amount = 0.01
  scope.withdraw_btc_min_amount = 0.1


  const increaseTotals = (orders) => {
    orders.forEach(({ type, currency1Amount, currency2Amount }) => {
      if (type === 'buy') {
        scope.total_btc += parseFloat(currency2Amount)
      }
      else {
        scope.total_eth += parseFloat(currency1Amount)
      }
    })
  }

  const decreaseTotals = (orders) => {
    orders.forEach(({ type, currency1Amount, currency2Amount }) => {
      if (type === 'buy') {
        scope.total_btc -= parseFloat(currency2Amount)
      }
      else {
        scope.total_eth -= parseFloat(currency1Amount)
      }
    })
  }


  scope.withdrawEth =  () => {
    user.saveSettings({withdraw_eth_address: scope.withdraw_eth_address});
    ethereum.send(scope.withdraw_eth_address,  scope.withdraw_eth_amount)
  }

  scope.withdrawBtc =  () => {
    user.saveSettings({withdraw_btc_address: scope.withdraw_btc_address});
    bitcoin.send(scope.withdraw_btc_address, scope.withdraw_btc_amount)
      .then(() => {
        notifications.append({ type: 'notification', text: 'Вывод денег' })
        $('.modal').modal('hide')
      })
  }

  scope.updateRates = async () => {
    /**
     *
     *   Promise.all([ ethereum.getRate()]).then(values  => {
       console.log(values)
     })
     */
    scope.eth_exchange_rate = await ethereum.getRate();
    scope.btc_exchange_rate = await bitcoin.getRate();
    scope.$scan()
  }

  scope.showError = (msg) => {
    alert(msg)
  }

  // check if address was created
  scope.check = () => {
    const address = '' + scope.address
    if (!address.length) {
      scope.showError('Адрес не был сгенеррован')
      return false
    }

    return true
  }


  const getUniqueId = (() => {
    let id = +new Date() // TODO replace with user public key

    return () => sha256(user.ethData.address + String(++id))
  })()

  scope.createOrder = (type) => {
    const id = getUniqueId()

    const order = user.createOrder({
      id,
      currency1: type === 'buy' ? 'ETH' : 'BTC', // TODO fix this
      currency2: type === 'buy' ? 'BTC' : 'ETH', // TODO fix this
      currency1Amount: type === 'buy' ? scope.eth : scope.sell_eth, // TODO fix this
      currency2Amount: type === 'buy' ? scope.btc : scope.sell_btc, // TODO fix this
      exchangeRate: scope.eth_exchange_rate, // TODO fix this
      type,
    })

    console.log('order created:', order)

    scope.eth = ''
    scope.btc = ''
    scope.sell_eth = ''
    scope.sell_btc = ''

    myOrders.append(order, (removedOrder) => {
      const message = []

      if (removedOrder) {
        message.push({
          event: 'removeOrder',
          data: removedOrder,
        })
      }

      message.push({
        event: 'newOrder',
        data: order,
      })

      room.sendMessage(message)
    })
  }

  scope.removeOrder = (order) => {
    const { id } = order
    console.log('Remove order with id:', id)

    myOrders.remove(id, () => {
      room.sendMessage([
        {
          event: 'removeOrder',
          data: order,
        },
      ])
    })
  }

  scope.checked = () => {
    $('#ch_active').attr('checked', function() {
      if (parseMess.myAdvs) {
        return parseMess.myAdvs.active
      }
      
      return true
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

  main.scope = scope
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

    main.scope.$scan()
  }
}

alight.hooks.eventModifier.change_eth = {
  event: [ 'input', 'blur' ],
  fn: (event, env) => {
    if (event.type === 'blur') return
    if (!main.scope.eth_exchange_rate) return

    main.scope.eth = (main.scope.eth.match(/^[\d.]+$/))
    main.scope.btc = main.scope.eth *main.scope.eth_exchange_rate

    main.scope.$scan()
  }
}

alight.hooks.eventModifier.change_btc = {
  event: [ 'input', 'blur' ],
  fn: (event, env) => {
    if (event.type === 'blur') return
    if (!main.scope.eth_exchange_rate) return

    main.scope.btc = (main.scope.btc.match(/^[\d.]+$/))
    main.scope.eth = main.scope.btc / main.scope.eth_exchange_rate

    main.scope.$scan()
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

    main.scope.$scan()
  }
}

alight.hooks.eventModifier.change_sell_eth = {
  event: [ 'input', 'blur' ],
  fn: (event, env) => {
    if (event.type === 'blur') return
    if (!main.scope.btc_exchange_rate) return

    main.scope.sell_eth = (main.scope.sell_eth.match(/^[\d.]+$/))
    main.scope.sell_btc = main.scope.sell_eth *main.scope.btc_exchange_rate

    main.scope.$scan()
  }
}

alight.hooks.eventModifier.change_sell_btc = {
  event: [ 'input', 'blur' ],
  fn: (event, env) => {
    if (event.type === 'blur') return
    if (!main.scope.btc_exchange_rate) return

    main.scope.sell_btc = (main.scope.sell_btc.match(/^[\d.]+$/))
    main.scope.sell_eth = main.scope.sell_btc / main.scope.btc_exchange_rate
    
    main.scope.$scan()
  }
}


export default main
