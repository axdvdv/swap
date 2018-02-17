import alight from 'alight'


// alight.router.setBase('/')

alight.controllers.app = function (scope) {
  scope.url = alight.router.getCurrentUrl

  scope.go = (url) => alight.router.go(url)
  scope.realUrl = () => document.location.pathname

  scope.$watch('$finishBinding', () => {
    if (location.pathname === '/') {
      alight.router.go('/main')
      scope.$scan()
    }
  })

  alight.router.subscribe((url) => {
    console.log(`Moved to ${url}`)
  })
}
