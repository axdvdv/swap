import web3 from 'web3'
import bitcoin from 'bitcoinjs-lib'


console.log('web3', web3)
console.log('bitcoin', bitcoin)


alight.router.setBase(location.pathname)

alight.ctrl.app = function (scope) {

  scope.go = (url) => {
    alight.router.go(url)
  }

  scope.$watch('$finishBinding', () => {
    alight.router.go('/list')
    scope.$scan()
  })

  scope.realUrl = () => document.location.pathname
  scope.url = alight.router.getCurrentUrl

  alight.router.subscribe((url) => {
    console.log(`Moved to ${url}`)
  })
}
