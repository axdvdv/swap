import $ from 'jquery'
import alight from 'alight'
import sha256 from 'js-sha256'
import { orderStatuses } from 'helpers'
import { EA, web3, user, room, myOrders, orders } from 'instances'


const main = {
  scope: {},
}

alight.controllers.main = function(scope) {
  console.log('Main controller!')

  scope.user = user
  scope.orders = orders
  scope.advs = []
  scope.balance = 0
  scope.address = ''
  scope.eth_exchange_rate = ''
  scope.btc_exchange_rate = ''
  scope.eth = ''
  scope.btc = ''
  scope.sell_eth = ''
  scope.sell_btc = ''
  scope.total_eth = 0
  scope.total_btc = 0
  scope.bitcoin_address = 0
  scope.min_withdraw_eth = 0.01
  scope.min_withdraw_btc = 0.1
  scope.my_setting = {}
  scope.btcTransactions = []


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


  scope.send_eth = function (modal) {
    scope.saveApps()
    scope.$scan()
    user.sendTransactionEth(modal)

    // var m = $(modal)
    // if (m.length > 0) {
    //     m.modal('hide')
    // }
  }

  scope.send_btc = function (modal) {
    scope.saveApps()
    scope.$scan()
    user.sendTransactionBtc(modal)

    // var m = $(modal)
    // if (m.length > 0) {
    //     m.modal('hide')
    // }
  }

  scope.saveApps = function () {
    const mySetting = JSON.stringify({
      'withdraw_eth_address': scope.withdraw_eth_address,
      'withdraw_btc_address': scope.withdraw_btc_address,
    })

    localStorage.setItem('my_setting',  mySetting)
  }

  scope.getCurrentExchangeRate = () => {
    try {
      $.getJSON('https://noxonfund.com/curs.php', ({ price_btc }) => {
        scope.eth_exchange_rate = price_btc
        scope.btc_exchange_rate = price_btc
        scope.$scan()
      })
    }
    catch (e) {
      console.log(e)
    }
  }

  scope.updateBalanceEth = function () {
    web3.eth.getBalance(user.ethData.address).then(function (r) {

      scope.balance = web3.utils.fromWei(r);
      scope.address = user.ethData.address;
      scope.bitcoin_address = user.btcData.address;
      
      scope.updateBalanceBitcoin();
      scope.$scan();
    })
  }

  scope.updateBalanceBitcoin = function () {
    if (scope.bitcoin_address) {
      const url = `https://api.blocktrail.com/v1/tbtc/address/${scope.bitcoin_address}?api_key=MY_APIKEY`
      //  var url = 'https://api.blockcypher.com/v1/btc/main/addrs/'+scope.bitcoin_address

      //bitcoin
      $.getJSON(url, function (r) {
        try {
          scope.bitcoin_balance = r.balance / 100000000
          scope.$scan()
        }
        catch (e) {
          console.log(e)
        }
      })
    }
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
      currency1: 'BTC',
      currency2: 'ETH',
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

  // scope.sell_checked = function () {
  //   $('#sell_ch_active').attr('checked', function() {
  //     if (parseMess.myAdvs) {
  //       return parseMess.myAdvs.active
  //     }
  //
  //     return true
  //   })
  // }
  //
  // scope.checked = function () {
  //   $('#ch_active').attr('checked', function() {
  //     if (parseMess.myAdvs) {
  //       return parseMess.myAdvs.active
  //     }
  //
  //     return true
  //   })
  // }

  scope.checked = () => {
    $('#ch_active').attr('checked', function() {
      if (parseMess.myAdvs) {
        return parseMess.myAdvs.active
      }
      
      return true
    })
  }

  scope.init = function () {
    let my_setting = localStorage.getItem('my_setting')

    if (my_setting) {
      my_setting = JSON.parse(my_setting)

      scope.withdraw_eth_address = my_setting.withdraw_eth_address
      scope.withdraw_btc_address = my_setting.withdraw_btc_address
    }

    scope.$scan()
  }

  scope.init()
  scope.updateBalanceEth()
  scope.getCurrentExchangeRate()

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
