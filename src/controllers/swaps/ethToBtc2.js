import alight from 'alight'
import { localStorage } from 'helpers'
import { room, ethereum } from 'instances'
import { ethSwap, btcSwap } from 'swaps'
import { Swap } from 'core'


const ethToBtc = {
  scope: {},
}

alight.controllers.ethToBtc = (scope) => {
  console.info('ETH to BTC controller!')

  scope.data = {
    step: 0,
  }

  const swap = new Swap({
    initialState: localStorage.getItem('swap:eth2btc'),
    connection: room.connection,
    flow: eth2btc,
  })

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


  ethToBtc.scope = scope
}


export default ethToBtc
