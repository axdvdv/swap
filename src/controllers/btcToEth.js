import alight from 'alight'
import crypto from 'swap-crypto'
import { app } from 'controllers'
import { orders } from 'models'
import { ETHSwap, BTCSwap } from 'swaps'


const btcToEth = {
  scope: {},
}

alight.controllers.btcToEth = function(scope) {
  console.log('BTC to ETH controller!')

  const { params: { id: orderId } } = app.scope.activeRoute

  const order = orders.getByKey(orderId)

  console.log('Order:', order)

  scope.data = {
    order,
    secret: 'c0809ce9f484fdcdfb2d5aabd609768ce0374ee97a1a5618ce4cd3f16c00a078',
    secretHash: '',
    btcScriptAddress: '0x0dsgsdhsdhsddsh',
    waitingForUser: false,
    step: 1,
  }

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

  btcToEth.scope = scope
}


export default btcToEth
