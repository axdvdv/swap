import { app } from 'controllers'
import Navigo from 'navigo'


const router = new Navigo(null, true, '#')

const bind = (path) => [ path, () => {
  console.log(`Route changed to ${path}`)

  app.scope.activeRoute = path
  app.scope.$scan()
} ]

router
  .on(...bind('/'))
  .on(...bind('/btc-to-eth'))
  .on(...bind('/eth-to-btc'))
  .on(...bind('/history'))


export default router
