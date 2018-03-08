import alight from 'alight'
import { localStorage } from 'helpers'
import { EA } from 'instances'
import { ethSwap, btcSwap } from 'swaps'


const ethToBtc = {
  scope: {},
}

alight.controllers.ethToBtc = (scope) => {
  console.log('ETH to BTC controller!')

  const order = scope.$parent.data.order
  const swapData = scope.$parent.data.swapData

  scope.data = {
    order,
    step: 1,
    swapData,
  }

  EA.subscribe('room:swap:sendSecretHash', ({ orderId, secretHash }) => {
    if (order.id === orderId) {
      localStorage.updateItem(`swap:${order.id}`, {
        secretHash,
      })

      scope.data.swapData.secretHash = secretHash
      scope.$scan()

      ethSwap.create({
        secretHash,
      })
    }
  })

  ethToBtc.scope = scope
}


export default ethToBtc
