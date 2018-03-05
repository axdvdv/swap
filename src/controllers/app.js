import alight from 'alight'
import { EA, room } from 'instances'


const app = {
  scope: {},
}

alight.controllers.app = function (scope) {
  console.log('App controller!')

  scope.data = {
    activeRoute: {},
    room,
  }

  EA.once('room:ready', () => {
    scope.$scan()
  })

  app.scope = scope
}


export default app
