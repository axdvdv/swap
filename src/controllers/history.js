import alight from 'alight'


const history = {
  scope: {},
}

alight.controllers.history = function(scope) {
  history.scope = scope

}


export default history
