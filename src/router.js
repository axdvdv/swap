import { app } from 'controllers'
import Navigo from 'navigo'


const router = new Navigo(null, true, '#')

const bind = (path) => [ path, (params, query) => {
  console.log(`Route changed to ${path}`)

  app.scope.activeRoute = {
    path,
    params,
    query,
  }
  app.scope.$scan()
} ]

router
  .on(...bind('/'))
  .on(...bind('/btc-to-eth'))
  .on(...bind('/eth-to-btc'))
  .on(...bind('/history'))
  .on(...bind('/btc-to-eth/:id'))
  .on(...bind('/eth-to-btc/:id'))



export default router
