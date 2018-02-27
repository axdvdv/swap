import alight from 'alight'
import crypto from 'swap-crypto'
import { app } from 'controllers'
import { room, orders } from 'instances'
import { orderStatuses } from 'helpers'
import { ethSwap, btcSwap } from 'swaps'


const btcToEth = {
  scope: {},
}

alight.controllers.btcToEth = function(scope) {
  console.log('BTC to ETH controller!')

  const { params: { id: orderId } } = app.scope.activeRoute

  const order = orders.getByKey(orderId)

  order.status = orderStatuses.processing

  console.log('Order:', order)

  scope.data = {
    order,
    secret: 'c0809ce9f484fdcdfb2d5aabd609768ce0374ee97a1a5618ce4cd3f16c00a078',
    secretHash: '',
    btcScriptAddress: '0x0dsgsdhsdhsddsh',
    waitingForUser: false,
    step: 1,
  }

  // Step 1
  // 4. Alice is asked to create a 'Secret Key'.

  scope.goNextStep = () => {
    scope.data.step++;

    if (scope.data.step === 2) {
      // 5. The system automatically generates the 'Secret Hash', shows it to Alice and sends to Bob.
      scope.data.secretHash = crypto.ripemd160(scope.data.secret)

      room.sendMessageToPeer(order.participant.peer, [
        {
          type: 'orderProcessing:sendSecretHash',
          data: {
            secretHash: scope.data.secretHash,
          },
        },
      ])
    }
    else if (scope.data.step === 3) {
      scope.data.waitingForUser = true;
    }
    else if (scope.data.step === 4) {

    }

    scope.$scan()
  }

  btcToEth.scope = scope
}


export default btcToEth
