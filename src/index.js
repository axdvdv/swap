import web3 from 'web3'
import bitcoin from 'bitcoinjs-lib'

import './style.scss'


console.log('web3', web3)
console.log('bitcoin', bitcoin)


alight.router.setBase(location.pathname)

alight.ctrl.app = function (scope) {

  scope.url = alight.router.getCurrentUrl

  scope.go = (url) => alight.router.go(url)
  scope.realUrl = () => document.location.pathname

  scope.$watch('$finishBinding', () => {
    if (location.pathname === '/') {
      alight.router.go('/list')
      scope.$scan()
    }
  })

  alight.router.subscribe((url) => {
    console.log(`Moved to ${url}`)
  })
}
