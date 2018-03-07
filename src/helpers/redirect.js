import { app } from 'controllers'
import router from 'router'


const redirect = (link) => {
  console.log(`Route changed to ${link}`)

  router.navigate(link)
  app.scope.data.activeRoute = link
  app.scope.$scan()
}


export default redirect
