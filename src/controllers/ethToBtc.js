import alight from 'alight'
import crypto from 'swap-crypto'
import { app } from 'controllers'
import { room, orders } from 'instances'
import { orderStatuses } from 'helpers'
import { ethSwap, btcSwap } from 'swaps'


const ethToBtc = {
  scope: {},
}

alight.controllers.ethToBtc = function(scope) {
  console.log('ETH to BTC controller!')

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

  // Initial
  // 2. Bob pushes a 'Buy' button in the orders list and is redirected to /eth-to-btc/:id page.
  // 3. Alice is notified about Bob and is redirected to /btc-to-eth/:id page.

  room.sendMessageToPeer(order.owner.peer, [
    {
      type: 'startProcessOrder',
      data: {
        orderId,
      },
    },
  ])

  scope.goNextStep = () => {
    scope.data.step++;

    if (scope.data.step === 2) {
      scope.data.secretHash = crypto.ripemd160(scope.data.secret)
    }
    else if (scope.data.step === 3) {
      scope.data.waitingForUser = true;
    }
    else if (scope.data.step === 4) {

    }

    scope.$scan()
  }

  ethToBtc.scope = scope
}


export default ethToBtc
