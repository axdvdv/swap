import Navigo from 'navigo'
import EA from 'instances/EA'


const router = IS_DEV ? new Navigo(null, true, '#') : new Navigo('https://alpha.swap.online', false)

const bind = (path) => [ path, (params, query) => {
  console.log(`Route changed to ${path}`)

  EA.dispatch('route:change', {
    path,
    params,
    query,
  })
} ]

router
  .on(...bind('/'))
  .on(...bind('/orders'))
  .on(...bind('/balances'))
  .on(...bind('/history'))
  .on(...bind('/swap/:slug/:id'))

EA.subscribe('redirect', (path) => router.navigate(path))


export default router
