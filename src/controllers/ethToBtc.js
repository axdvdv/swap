import alight from 'alight'


const ethToBtc = {
  scope: {},
}

alight.controllers.ethToBtc = function(scope) {
  console.log('ETH to BTC controller!')


  ethToBtc.scope = scope
}


export default ethToBtc
