import alight from 'alight'
import sha256 from 'js-sha256'
import { EA, user, orders, myOrders, room, rates } from 'instances'
import { localStorage } from 'helpers'


const ordersCtrl = {
  scope: {},
}

alight.controllers.orders = (scope) => {
  console.log('Orders controller!')

  scope.data = {
    myAddress: user.ethData.address,
    selectedCurrencies: localStorage.getItem('selectedCurrencies') || {
      buy: 'ETH',
      sell: 'BTC',
    },
    isFormVisible: true,
    balance: 0,
    balanceAddress: '0x0',
    orders: [],
    createOrderModal: {
      exchangeRate: 0.1,
      buyAmount: '',
      sellAmount: '',
    },
  }


  const checkOrderCurrencies = (item) => {
    const { buyCurrency, sellCurrency } = item

    return buyCurrency === scope.data.selectedCurrencies.sell
      && sellCurrency === scope.data.selectedCurrencies.buy
  }

  const updateOrders = () => {
    scope.data.orders = orders.items.filter((order) => {
      if (checkOrderCurrencies(order)) {
        return order
      }
    })
  }

  const updateRate = async () => {
    scope.data.createOrderModal.exchangeRate = await rates.getRate(
      scope.data.selectedCurrencies.buy,
      scope.data.selectedCurrencies.sell
    )
    scope.$scan()
  }

  const getUniqueOrderId = (() => {
    let id = +new Date() // TODO replace with user public key

    return () => sha256(user.ethData.address + String(++id))
  })()


  scope.updateSelectedCurrency = (type, currency) => {
    scope.data.selectedCurrencies[type] = currency

    // ductape until couple of currencies will be added
    scope.data.selectedCurrencies[type === 'buy' ? 'sell' : 'buy'] = currency === 'ETH' ? 'BTC' : 'ETH'

    $(`#${type}CurrencyDropdown`).dropdown('toggle')
    updateOrders()

    localStorage.setItem('selectedCurrencies', scope.data.selectedCurrencies)
  }

  scope.createOrder = () => {
    const id = getUniqueOrderId()
    const { exchangeRate, buyAmount, sellAmount } = scope.data.createOrderModal

    const order = user.createOrder({
      id,
      buyCurrency: scope.data.selectedCurrencies.buy,
      sellCurrency: scope.data.selectedCurrencies.sell,
      buyAmount,
      sellAmount,
      exchangeRate,
    })

    console.log('Order created:', order)

    scope.data.createOrderModal = {
      exchangeRate: 0.1,
      buyAmount: '',
      sellAmount: '',
    }

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


  EA.subscribe('orders:onAppend', (order) => {
    if (checkOrderCurrencies(order)) {
      scope.data.orders.unshift(order)
      scope.$scan()
    }
  })


  updateOrders()
  updateRate()

  ordersCtrl.scope = scope
}


alight.hooks.eventModifier.change_buy_amount = {
  event: [ 'input', 'blur' ],
  fn: (event, env) => {
    const data = ordersCtrl.scope.data.createOrderModal

    if (event.type === 'blur') return
    if (!data.exchangeRate) return

    data.buyAmount = data.buyAmount.match(/^[\d.]+$/)
    data.sellAmount = String(Number(data.buyAmount * data.exchangeRate).toFixed(12))

    ordersCtrl.scope.$scan()
  }
}

alight.hooks.eventModifier.change_sell_amount = {
  event: [ 'input', 'blur' ],
  fn: (event, env) => {
    const data = ordersCtrl.scope.data.createOrderModal

    if (event.type === 'blur') return
    if (!data.exchangeRate) return

    data.sellAmount = data.sellAmount.match(/^[\d.]+$/)
    data.buyAmount = String(Number(data.sellAmount / data.exchangeRate).toFixed(12))

    ordersCtrl.scope.$scan()
  }
}


export default ordersCtrl
