import web3 from 'web3'
import bitcoin from 'bitcoinjs-lib'


console.log('web3', web3)
console.log('bitcoin', bitcoin)


alight.router.setBase(location.pathname)

alight.ctrl.main = function (scope) {

  scope.go = (url) => {
    alight.router.go(url)
  }

  scope.$watch('$finishBinding', () => {
    alight.router.go('/login')
    scope.$scan()
  })

  scope.realUrl = () => document.location.pathname
  scope.url = alight.router.getCurrentUrl

  // history
  scope.history = []
  alight.router.subscribe( (url) => {
    scope.history.push(url)
  })
}


alight.ctrl.userCtrl = function (scope) {

  if(!scope.$route) {
    console.warn('no $route')
  }

  scope.onOut = () => {
    if(scope.ask)
      return !confirm('Do you want to out?')
    return false
  }
}
