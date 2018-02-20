import alight from 'alight'


const app = {
  scope: {},
}

alight.controllers.app = function (scope) {
  scope.activeRoute = '/'

  app.scope = scope
}


export default app
