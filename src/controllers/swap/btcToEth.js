import alight from 'alight'
import crypto from 'swap-crypto'
import { localStorage } from 'helpers'
import { user, room } from 'instances'
import { ethSwap, btcSwap } from 'swaps'


const btcToEth = {
  scope: {},
}

alight.controllers.btcToEth = (scope) => {
  console.log('BTC to ETH controller!')

  const order = scope.$parent.data.order
  const swapData = scope.$parent.data.swapData

  scope.data = {
    order,
    swapData,
    step: 1,
    secret: 'c0809ce9f484fdcdfb2d5aabd609768ce0374ee97a1a5618ce4cd3f16c00a078',
  }

  scope.goNextStep = () => {
    scope.data.step++;

    if (scope.data.step === 2) {
      const secretHash = crypto.ripemd160(scope.data.secret)

      scope.data.swapData.secretHash = secretHash

      localStorage.updateItem(`swap:${order.id}`, {
        secretHash,
      })

      // const script = btcSwap.createScript(secretHash, user.btcData.publicKey)

      room.sendMessageToPeer(swapData.participant.peer, [
        {
          event: 'swap:sendSecretHash',
          data: {
            orderId: order.id,
            secretHash,
          },
        },
      ])

      scope.$scan()
    }
    else if (scope.data.step === 3) {
      scope.data.waitingForParticipant = true
      scope.$scan()
    }
    else if (scope.data.step === 4) {

    }
  }


  btcToEth.scope = scope
}


export default btcToEth
