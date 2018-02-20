import alight from 'alight'
import router from 'router'


alight.directives.al.link = function (scope, element, expression, env) {
  $(element).on('click', function () {
    const link = $(this).attr('al-link')

    router.navigate(link)
    scope.activeRoute = link
    scope.$scan()
  })
}
