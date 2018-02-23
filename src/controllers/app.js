import alight from 'alight'


const app = {
  scope: {},
}

alight.controllers.app = function (scope) {
  console.log('App controller!')

  scope.activeRoute = {}

  app.scope = scope
}


export default app
