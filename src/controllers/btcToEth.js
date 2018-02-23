import alight from 'alight'
import crypto from 'bitcoinjs-lib/src/crypto'
import { app } from 'controllers'
import { orders } from 'models'


const result1 = crypto.ripemd160('0xc0809ce9f484fdcdfb2d5aabd609768ce0374ee97a1a5618ce4cd3f16c00a078')
const result2 = crypto.ripemd160('c0809ce9f484fdcdfb2d5aabd609768ce0374ee97a1a5618ce4cd3f16c00a078')

console.log(111, result1)
console.log(222, Buffer.from(result1).toString('hex'))
console.log(333, result2)
console.log(444, Buffer.from(result2).toString('hex'))


const btcToEth = {
  scope: {},
}

alight.controllers.btcToEth = function(scope) {
  console.log('BTC to ETH controller!')

  btcToEth.scope = scope

  const { params: { id: orderId } } = app.scope.activeRoute
  const order = orders.getByKey(orderId)

  console.log('Order:', order)

  scope.data = {
    order,
    secret: '',
    secretHash: '',
    btcScriptAddress: '0x0dsgsdhsdhsddsh',
    waitingForUser: false,
    step: 1,
  }

  scope.goNextStep = () => {
    scope.data.step++;

    if (scope.data.step === 2) {
      // TODO generate hash
      scope.data.secretHash = 'foo';
      // TODO send it to ETH owner
      // socket.send('secretHash', secretHash);

      scope.$scan();
    }
    else if (scope.data.step === 3) {
      scope.data.waitingForUser = true;

      scope.$scan();
    }
    else if (scope.data.step === 4) {

    }
  }
}


export default btcToEth
