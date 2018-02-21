import alight from 'alight'


const btcToEth = {
  scope: {},
}

alight.controllers.btcToEth = function(scope) {
  btcToEth.scope = scope

  scope.data = {
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
