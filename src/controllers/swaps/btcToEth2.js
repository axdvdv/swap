import alight from 'alight'
import { localStorage } from 'helpers'
import { room, ethereum } from 'instances'
import { BTC2ETH } from 'core/flows'
import { Swap } from 'core'


const btcToEth = {
  scope: {},
}

alight.controllers.btcToEth = (scope) => {
  console.info('BTC to ETH controller!')

  scope.data = {
    step: 0,
  }

  const swap = new Swap({
    initialState: localStorage.getItem('swap:btc2eth'),
    connection: room.connection,
    flow: BTC2ETH,
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


  btcToEth.scope = scope
}


export default btcToEth
