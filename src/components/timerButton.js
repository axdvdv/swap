import alight from 'alight'


alight.createComponent('timer-button', (scope, element, env) => {
  const label = env.takeAttr('label')
  const timeLeft = Number(env.takeAttr('time') || 10)

  scope.data = {
    label,
    timeLeft,
  }

  const tick = () => {
    scope.data.timeLeft--
    scope.$scan()

    if (scope.data.timeLeft === 0) {
      scope.$dispatch('click')
    }
    else {
      setTimeout(tick, 1000)
    }
  }

  setTimeout(tick, 1000)

  return {
    template: '<button type="button" class="btn btn-primary">{{data.label}} (auto click in {{data.timeLeft}}s)</button>'
  }
})
