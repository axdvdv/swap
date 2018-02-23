import alight from 'alight'
import { app } from 'controllers'
import { orders } from 'models'


const btcToEth = {
  scope: {},
}

alight.controllers.btcToEth = function(scope) {
  console.log('BTC to ETH controller!')

  btcToEth.scope = scope

  console.log(app.scope.activeRoute)

  scope.data = {
    order: orders.getByKey(),
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
