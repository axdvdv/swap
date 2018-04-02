import log from 'log-with-style'
import alight from 'alight'
import 'alight/ext/component.es'
import './style.scss'


console.info = (...args) => log(`[c="color: #157EFB"]info >[c]`, ...args)
console.room = (eventName, ...args) => log(`[c="color: #FFAB27"]room:${eventName} >[c]`, ...args)


alight.autostart = false

const timer = setInterval(() => {
  if (Ipfs && jQuery && bootstrap) {
    require('./directives')
    require('./controllers')
    require('./components')
    require('./filters')
    require('./models')
    require('./instances')

    const router = require('./router').default

    clearInterval(timer)
    alight.bootstrap()
    router.resolve()
  }
}, 300)
