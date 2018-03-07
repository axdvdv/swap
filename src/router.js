import { app } from 'controllers'
import Navigo from 'navigo'


const router = new Navigo(null, true, '#')

const bind = (path) => [ path, (params, query) => {
  console.log(`Route changed to ${path}`)

  app.scope.data.activeRoute = {
    path,
    params,
    query,
  }
  app.scope.$scan()
} ]

router
  .on(...bind('/'))
  .on(...bind('/history'))
  .on(...bind('/swap/:slug/:id'))



export default router
