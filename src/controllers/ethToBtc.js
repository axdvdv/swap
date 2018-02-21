import alight from 'alight'


const ethToBtc = {
  scope: {},
}

alight.controllers.ethToBtc = function(scope) {
  ethToBtc.scope = scope

}


export default ethToBtc
