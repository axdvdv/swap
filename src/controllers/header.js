import alight from 'alight'
import { EA, notifications } from 'instances'


const header = {
  scope: {},
}

alight.controllers.header = function (scope) {
  console.log('Header controller!')

  scope.data = {
    notifications,
  }

  EA.subscribe('newNotification', () => {
    scope.$scan()
  })

  header.scope = scope
}


export default header
