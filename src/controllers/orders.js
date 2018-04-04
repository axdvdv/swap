import alight from 'alight'
import sha256 from 'js-sha256'
import { EA, user, orders, myOrders, room, rates } from 'instances'
import { localStorage, fixNumber } from 'helpers'


const ordersCtrl = {
  scope: {},
}

alight.controllers.orders = (scope) => {
  console.info('Orders controller!')

  scope.data = {
    myAddress: user.ethData.address,
    selectedCurrencies: localStorage.getItem('selectedCurrencies') || {
      buy: 'ETH',
      sell: 'BTC',
    },
    orders: [],
    totalAmount: 0,
    createOrderModal: {
      lastChangedField: null,
      balance: 0,
      exchangeRate: 0.1,
      buyAmount: '',
      sellAmount: '',
    },
  }

  // ------------------------------------------------------------

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

  const getOrdersTotalAmount = (orders) =>
    fixNumber(orders.reduce((summ, { sellAmount }) => summ + sellAmount, 0))

  const updateTotal = () => {
    scope.data.totalAmount = getOrdersTotalAmount(scope.data.orders)
  }

  const increaseTotals = (orders) => {
    scope.data.totalAmount += getOrdersTotalAmount(orders)
  }

  const decreaseTotals = (orders) => {
    scope.data.totalAmount -= getOrdersTotalAmount(orders)
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

  // ------------------------------------------------------------

  scope.updateSelectedCurrency = async (type, currency) => {
    scope.data.selectedCurrencies[type] = currency

    // ductape until couple of currencies will be added
    scope.data.selectedCurrencies[type === 'buy' ? 'sell' : 'buy'] = currency === 'ETH' ? 'BTC' : 'ETH'

    $(`#${type}CurrencyDropdown`).dropdown('toggle')
    updateOrders()
    updateTotal()
    await updateRate()
    scope.$scan()

    localStorage.setItem('selectedCurrencies', scope.data.selectedCurrencies)
  }

  scope.openModal = () => {
    const currency = scope.data.selectedCurrencies.sell.toLowerCase()

    scope.data.createOrderModal.balance = user[`${currency}Data`].balance
    scope.$scan()

    $('#createOrderModal').modal('show')
  }

  scope.createOrder = () => {
    if (scope.data.createOrderModal.sellAmount > scope.data.createOrderModal.balance) {
      return
    }

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

    $('#createOrderModal').modal('hide')

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
      scope.data.orders = orders.items
      scope.$scan()

      room.sendMessage([
        {
          event: 'removeOrder',
          data: order,
        },
      ])
    })
  }

  // ------------------------------------------------------------

  EA.once('myOrders:onMount', () => {
    increaseTotals(orders.items)
    scope.$scan()
  })

  EA.subscribe('orders:onAppend', (order) => {
    if (checkOrderCurrencies(order)) {
      scope.data.orders.unshift(order)
      increaseTotals([ order ])
      scope.$scan()
    }
  })

  EA.subscribe('orders:onRemove', (order) => {
    decreaseTotals([ order ])
    // TODO refactor this
    scope.data.orders = orders.items
    scope.$scan()
  })

  // ------------------------------------------------------------

  updateOrders()
  updateTotal()
  updateRate()

  ordersCtrl.scope = scope
}


// Filters

alight.filters.addOrderLinks = (orders) =>
  orders.map((order) => {
    const { id, sellCurrency, buyCurrency } = order
    order.link = `/swap/${buyCurrency}-${sellCurrency}/`.toLowerCase() + id
    return order
  })


// Hooks

alight.hooks.eventModifier.change_exchange_rate = {
  event: [ 'input', 'blur' ],
  fn: (event, env) => {
    const data = ordersCtrl.scope.data.createOrderModal

    if (event.type === 'blur') return
    if (!data.exchangeRate) return

    data.exchangeRate = data.exchangeRate.match(/^[\d.]+$/)
    if (data.lastChangedField === 'buyAmount') {
      data.sellAmount = fixNumber(data.buyAmount * data.exchangeRate)
    }
    else if (data.lastChangedField === 'sellAmount') {
      data.buyAmount = fixNumber(data.sellAmount / data.exchangeRate)
    }
  }
}

alight.hooks.eventModifier.change_buy_amount = {
  event: [ 'input', 'blur' ],
  fn: (event, env) => {
    const data = ordersCtrl.scope.data.createOrderModal

    if (event.type === 'blur') return
    if (!data.exchangeRate) return

    data.lastChangedField   = 'buyAmount'
    data.buyAmount          = data.buyAmount.match(/^[\d.]+$/)
    data.sellAmount         = fixNumber(data.buyAmount * data.exchangeRate)
  }
}

alight.hooks.eventModifier.change_sell_amount = {
  event: [ 'input', 'blur' ],
  fn: (event, env) => {
    const data = ordersCtrl.scope.data.createOrderModal

    if (event.type === 'blur') return
    if (!data.exchangeRate) return

    data.lastChangedField   = 'sellAmount'
    data.sellAmount         = data.sellAmount.match(/^[\d.]+$/)
    data.buyAmount          = fixNumber(data.sellAmount / data.exchangeRate)
  }
}


export default ordersCtrl
