import alight from 'alight'
import 'alight/ext/component.es'


alight.autostart = false


import './style.scss'

import './directives'
import './controllers'
import './components'
import './models'
import './instances'
import router from './router'


alight.bootstrap()
router.resolve()
