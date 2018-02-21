import $ from 'jquery'
import alight from 'alight'
import { user, room } from 'models'
import { parseMess } from 'helpers'


const main = {
  scope: {},
}

alight.controllers.main = function(scope) {
  main.scope = scope

  scope.advs = []
  scope.balance = 0
  scope.address = ''
  scope.eth_price = ''
  scope.btc_price = ''
  scope.total_eth =  0
  scope.total_btc =  0
  scope.bitcoin_address =  0
  scope.min_withdraw_eth =  0.01
  scope.min_withdraw_btc =  0.1
  scope.my_setting = []
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
    const mySetting = parseMess.getStringify({
      'withdraw_eth_address': scope.withdraw_eth_address,
      'withdraw_btc_address': scope.withdraw_btc_address,
    })

    localStorage.setItem('my_setting',  mySetting)
  }

  scope.updateList = function() {
    const list = localStorage.getItem('myAdvs')

    if (list) {
      scope.advs = [JSON.parse(list)]
      parseMess.myAdvs = JSON.parse(list)
      parseMess.advs = [JSON.parse(list)]

      if (parseMess.myAdvs.type === 'sell') {
        scope.sell_eth = parseMess.myAdvs.eth
        scope.sell_btc = parseMess.myAdvs.btc
      }
      else {
        scope.eth = parseMess.myAdvs.eth
        scope.btc = parseMess.myAdvs.btc
      }

      scope.$scan()
    }

    scope.updateCommon()
  }

  //take current cource
  scope.getCurrentCurs = function() {
    try {
      $.getJSON('https://noxonfund.com/curs.php', function (responce) {
        scope.eth_price = responce.price_btc
        scope.btc_price = responce.price_btc
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

  //проверяем был ли создал адресс
  scope.check = function () {
    const address = '' + scope.address

    if (!address.length) {
      scope.showError('Адрес не был сгенеррован')
      return false
    }

    return true
  }

  //форма отправки
  scope.append = function(type) {

    if (!scope.check()) {

      return false
    }
    scope.type = type

    if (scope.type =='buy') {
      var adv ={
        address: scope.address,
        eth: scope.eth,
        btc: scope.btc,
        active: +$('#ch_active').is(':checked'),
        kurs: scope.eth_price,
        btc_address: scope.bitcoin_address,
        type: scope.type
      }

    } else {
      var adv ={
        address: scope.address,
        eth: scope.sell_eth,
        btc: scope.sell_btc,
        active: +$('#sell_ch_active').is(':checked'),
        kurs: scope.eth_price,
        btc_address: scope.bitcoin_address,
        type: scope.type,
      }
    }


    //send messange
    room.connection.broadcast(parseMess.getStringify(adv))

    //save in my list adv
    parseMess.myAdvs = adv

    localStorage.setItem('myAdvs', parseMess.getStringify( parseMess.myAdvs ))

  }

  //авторизация
  scope.sign = function() {
    user.sign()
    scope.updateBalanceEth()
  }

  scope.sell_checked = function () {
    $('#sell_ch_active').attr('checked', function() {
      if (parseMess.myAdvs) {
        return parseMess.myAdvs.active
      }
      
      return true
    })
  }

  scope.updateCommon = function () {
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

  scope.checked = function () {
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
      my_setting =  JSON.parse(my_setting)
      scope.withdraw_eth_address = my_setting.withdraw_eth_address
      scope.withdraw_btc_address = my_setting.withdraw_btc_address
      scope.$scan()
    }
  }

  scope.refreshBTCTransaction = function () {
    if (scope.bitcoin_address) {
      const url = 'https://api.blocktrail.com/v1/tbtc/address/'+scope.bitcoin_address+'/transactions?api_key=MY_APIKEY'
      
      console.log(url)
      
      $.getJSON(url, function (r) {
        scope.btcTransactions = r.data
        // scope.btcTransactions.kurs = scope.eth_price
        console.log(scope.btcTransactions)
        // console.log(scope.eth_price)
        scope.$scan()
      })
    }
  }

  scope.init()
  scope.updateList()
  scope.getCurrentCurs()
  scope.sign()

  main.scope = scope
}

alight.filters.onlybuy = function(advs, scope) {
  const tmp = []
  
  for (let i=0; i < advs.length; i++) {
    if (advs[i].type === 'buy') {
      tmp.push(advs[i])
    }
  }

  return tmp
}

alight.filters.onlysell = function(advs, scope) {
  const tmp = []
  
  for (let i=0; i < advs.length; i++) {
    if (advs[i].type === 'sell') {
      tmp.push(advs[i])
    }
  }

  return tmp
}

alight.hooks.eventModifier['change_eth_price'] = {
  event: ['input', 'blur'],
  fn: (event, env) => {
    if (event.type === 'blur') return
    if (!main.scope.eth_price) return
    
    main.scope.eth_price = (main.scope.eth_price.match(/^[\d.]+$/))
    main.scope.btc = main.scope.eth *main.scope.eth_price
    
    main.scope.$scan()
  }
}

alight.hooks.eventModifier['change_eth'] = {
  event: ['input', 'blur'],
  fn: (event, env) => {
    if (event.type === 'blur') return
    if (!main.scope.eth_price) return

    main.scope.eth = (main.scope.eth.match(/^[\d.]+$/))
    main.scope.btc = main.scope.eth *main.scope.eth_price
    
    main.scope.$scan()
  }
}

alight.hooks.eventModifier['change_btc'] = {
  event: ['input', 'blur'],
  fn: (event, env) => {
    if (event.type === 'blur') return
    if (!main.scope.eth_price) return

    main.scope.btc = (main.scope.btc.match(/^[\d.]+$/))
    main.scope.eth = main.scope.btc / main.scope.eth_price
    
    main.scope.$scan()
  }
}

//for sell
alight.hooks.eventModifier['change_sell_eth_price'] = {
  event: ['input', 'blur'],
  fn: (event, env) => {
    if (event.type === 'blur') return
    if (!main.scope.btc_price) return
    
    main.scope.btc_price = (main.scope.btc_price.match(/^[\d.]+$/))
    main.scope.sell_btc = main.scope.sell_eth *main.scope.btc_price
    
    main.scope.$scan()
  }
}

alight.hooks.eventModifier['change_sell_eth'] = {
  event: ['input', 'blur'],
  fn: (event, env) => {
    if (event.type === 'blur') return
    if (!main.scope.btc_price) return

    main.scope.sell_eth = (main.scope.sell_eth.match(/^[\d.]+$/))
    main.scope.sell_btc = main.scope.sell_eth *main.scope.btc_price
    
    main.scope.$scan()
  }
}

alight.hooks.eventModifier['sell_change_btc'] = {
  event: ['input', 'blur'],
  fn: (event, env) => {
    if (event.type === 'blur') return
    if (!main.scope.btc_price) return

    main.scope.sell_btc = (main.scope.sell_btc.match(/^[\d.]+$/))
    main.scope.sell_eth = main.scope.sell_btc / main.scope.btc_price
    
    main.scope.$scan()
  }
}


export default main
