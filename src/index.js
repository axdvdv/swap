import alight from 'alight'

alight.autostart = false


import './style.scss'

import './directives'
import './controllers'
import './models'
import './instances'
import router from './router'


alight.bootstrap()
router.resolve()
