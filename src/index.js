import alight from 'alight'
import 'alight/ext/component.es'
import './style.scss'


alight.autostart = false

const timer = setInterval(() => {
  if (Ipfs && jQuery && bootstrap) {
    require('./directives')
    require('./controllers')
    require('./components')
    require('./models')
    require('./instances')

    const router = require('./router').default

    clearInterval(timer)
    alight.bootstrap()
    router.resolve()
  }
}, 300)
