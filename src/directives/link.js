import alight from 'alight'


alight.directives.al.link = function (scope, element, expression, env) {
  $(element).on('click', function () {
    const link = $(this).attr('al-link')

    scope.activeRoute = link
    scope.$scan()
  })
}
