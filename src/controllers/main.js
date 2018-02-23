import $ from 'jquery'
import alight from 'alight'
import sha256 from 'js-sha256'
import { user, room, Order, orders } from 'models'


const main = {
  scope: {},
}

alight.controllers.main = function(scope) {
  console.log('Main controller!')

  main.scope = scope

  scope.orders = orders
  scope.advs = []
  scope.balance = 0
  scope.address = ''
  scope.eth_exchange_rate = ''
  scope.btc_exchange_rate = ''
  scope.total_eth =  0
  scope.total_btc =  0
  scope.bitcoin_address = 0
  scope.min_withdraw_eth = 0.01
  scope.min_withdraw_btc = 0.1
  scope.my_setting = {}
  scope.btcTransactions = []

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
    user.web3.eth.getBalance(user.data.address).then(function (r) {
      scope.balance = user.web3.utils.fromWei(r)
      scope.address = user.data.address
      scope.bitcoin_address = user.bitcoinData.address

      scope.updateBalanceBitcoin()
      scope.$scan()
      scope.refreshBTCTransaction()
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

  scope.showError = function (msg) {
    alert(msg)
  }

  // check if address was created
  scope.check = function () {
    const address = '' + scope.address

    if (!address.length) {
      scope.showError('Адрес не был сгенеррован')
      return false
    }

    return true
  }

  scope.createOrder = (type) => {
    const id = sha256(user.data.address) // TODO replace with user public key
    const order = new Order({
      id,
      ownerAddress: user.data.address,
      currency1: 'BTC',
      currency2: 'ETH',
      currency1Amount: type === 'buy' ? scope.eth : scope.sell_eth, // TODO fix this
      currency2Amount: type === 'buy' ? scope.btc : scope.sell_btc, // TODO fix this
      exchangeRate: scope.eth_exchange_rate, // TODO fix this
      type,
    })

    console.log('order created:', order)

    room.sendMessage({
      data: order,
      type: 'newOrder',
    })
    orders.append(order)

    localStorage.setItem('myOrders', JSON.stringify(orders.getOwnedByMe()))
  }

  // auth
  scope.sign = function() {
    user.sign()
    scope.updateBalanceEth()
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

  scope.init = function () {
    let my_setting = localStorage.getItem('my_setting')

    if (my_setting) {
      my_setting = JSON.parse(my_setting)
      scope.withdraw_eth_address = my_setting.withdraw_eth_address
      scope.withdraw_btc_address = my_setting.withdraw_btc_address
      scope.$scan()
    }

    scope.total_btc = 0
    scope.total_eth = 0

    for (let i=0; i < scope.advs.length; i++) {
      if (scope.advs[i].type === 'buy') {
        scope.total_btc += parseFloat(scope.advs[i].btc)
      }
      else {
        scope.total_eth += parseFloat(scope.advs[i].eth)
      }
    }
  }

  scope.refreshBTCTransaction = function () {
    if (scope.bitcoin_address) {
      const url = 'https://api.blocktrail.com/v1/tbtc/address/'+scope.bitcoin_address+'/transactions?api_key=MY_APIKEY'

      console.log(url)

      $.getJSON(url, function (r) {
        scope.btcTransactions = r.data
        // scope.btcTransactions.exchange_rate = scope.eth_exchange_rate
        console.log(scope.btcTransactions)
        // console.log(scope.eth_exchange_rate)
        scope.$scan()
      })
    }
  }

  scope.init()
  scope.getCurrentExchangeRate()
  scope.sign()

  main.scope = scope
}


// Filters

alight.filters.onlyBuy = (items, scope) =>
  items.filter(({ type }) => type === 'buy')

alight.filters.onlySell = (items, scope) =>
  items.filter(({ type }) => type === 'sell')


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
