import alight from 'alight'

alight.autostart = false


import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap'
import './style.scss'

import 'directives'
import 'controllers'
import router from 'router'


alight.bootstrap()
router.resolve()
