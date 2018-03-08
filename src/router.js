import Navigo from 'navigo'
import { EA } from 'instances'


const router = new Navigo(null, true, '#')

const bind = (path) => [ path, (params, query) => {
  console.log(`Route changed to ${path}`)

  EA.dispatchEvent('route:change', {
    path,
    params,
    query,
  })
} ]

router
  .on(...bind('/'))
  .on(...bind('/history'))
  .on(...bind('/swap/:slug/:id'))



export default router
