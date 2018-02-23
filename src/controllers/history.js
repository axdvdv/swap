import alight from 'alight'


const history = {
  scope: {},
}

alight.controllers.history = function(scope) {
  console.log('History controller!')

  history.scope = scope

}


export default history
