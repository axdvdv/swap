import alight from 'alight'
import { localStorage } from 'helpers'
import { room, ethereum } from 'instances'
import { ETH2BTC } from 'core/flows'
import { Swap } from 'core'


const ethToBtc = {
  scope: {},
}

alight.controllers.ethToBtc = (scope) => {
  console.info('ETH to BTC controller!')

  const order             = scope.$parent.data.order
  const swapData          = localStorage.getItem(`swap:${order.id}`) || {}
  const requiredAmount    = order.isMy ? order.sellAmount : order.buyAmount
  const requiredCurrency  = order.isMy ? order.sellCurrency : order.buyCurrency

  scope.data = {
    step: 0,
  }

  // ----------------------------------------------------------------

  const swap = new Swap({
    order: {
      sellAmount: requiredAmount,
      sellCurrency: requiredCurrency,
      participant: swapData.participant,
    },
    initialState: localStorage.getItem('swap:eth2btc'),
    connection: room.connection,
  })

  swap.setFlow(new ETH2BTC({
    swap,
    getBalance: async () => await ethereum.getBalance(),
  }))

  swap.storage.on('update', (values) => {
    const { step, stepsData } = values

    scope.data = {
      ...scope.data,
      ...stepsData,
      step,
    }
    scope.$scan()

    console.log('update values', values)
    localStorage.setItem('swap:eth2btc', values)
  })

  // ----------------------------------------------------------------

  scope.updateBalance = async () => {
    scope.data.checkingBalance = true
    scope.$scan()

    const balance = await ethereum.getBalance()

    scope.data.checkingBalance = false
    scope.data.balance = balance
    scope.$scan()

    const isEnough = checkBalance()

    if (isEnough) {
      scope.goNextStep()
    }
  }


  ethToBtc.scope = scope
}


export default ethToBtc
