import alight from 'alight'
import { redirect } from 'helpers'


alight.directives.al.link = function (scope, element, expression, env) {
  $(element).on('click', function (event) {
    event.preventDefault()
    event.stopPropagation()

    const link = $(this).attr('al-link') || $(this).attr('data-link')

    redirect(link)
  })
}
