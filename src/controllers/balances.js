import alight from 'alight'
import request from 'swap-request'
import { EA, user } from 'instances'
import { localStorage } from 'helpers'


const balances = {
  scope: {},
}

alight.controllers.balances = (scope) => {

  scope.data = {
    eth: user.ethData,
    btc: user.btcData,
  }

  scope.getDemoMoney = () => {
    request.get('https://swap.online/demokeys.php', {})
      .then((r) => {
        localStorage.setItem('user:privateBtcKey', r[0])
        localStorage.setItem('user:privateEthKey', r[1])
        // TODO WHYY????
        // location.reload()
      })
  }

  EA.subscribe('notification:show', (messange) => {
    $('.modal').modal('hide')
    alert(messange)
  })

  EA.subscribe('form:showError', (formId, messange) => {
    let form = $(formId)

    if(form.length) {
      form.find('.text-danger').text(messange).slideDown(1000)
    }
  })

  EA.subscribe('form:hideError', (formId, messange) => {
    $('form .text-danger').text('').slideUp(1000)
  })

  balances.scope = scope
}


export default balances
