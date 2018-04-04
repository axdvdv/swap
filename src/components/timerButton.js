import alight from 'alight'


alight.createComponent('timer-button', (scope, element, env) => {
  const label = element.innerText
  const timeLeft = Number(env.takeAttr('time') || 10)

  scope.data = {
    label,
    timeLeft,
  }

  let tickTimer
  const tick = () => {
    scope.data.timeLeft--
    scope.$scan()

    if (scope.data.timeLeft === 0) {
      scope.$dispatch('click')
    }
    else {
      tickTimer = setTimeout(tick, 1000)
    }
  }

  tickTimer = setTimeout(tick, 1000)

  scope.handleClick = () => {
    clearTimeout(tickTimer)
    scope.$dispatch('click')
  }

  return {
    template: '<button type="button" class="btn btn-primary" @click="handleClick()">{{data.label}} (auto click in {{data.timeLeft}}s)</button>'
  }
})
