import alight from 'alight'
import crypto from 'swap-crypto'
import { app } from 'controllers'
import { EA, user, room, orders } from 'instances'
import { orderStatuses, redirect } from 'helpers'
import { ethSwap, btcSwap } from 'swaps'


const ethToBtc = {
  scope: {},
}

alight.controllers.ethToBtc = (scope) => {
  console.log('ETH to BTC controller!')

  scope.data = {
    order: null,
    secret: null,
    secretHash: '',
    btcScriptAddress: '0x0dsgsdhsdhsddsh',
    waitingForRecipient: true,
    step: 1,
  }

  const { params: { id: orderId } } = app.scope.data.activeRoute

  let order = orders.getByKey(orderId)

  console.log('Order:', order)

  if (order && order.owner.address === user.data.address) {
    redirect('/main')
    return
  }

  if (!order) {
    EA.subscribe('orders:onAppend', function ({ id }) {
      if (id === orderId) {
        order = orders.getByKey(orderId)
        this.remove()
        init()
      }
    })
  }

  function init() {
    console.log('Order:', order)

    scope.data.order = order
    scope.data.waitingForRecipient = false
    order.status = orderStatuses.processing

    scope.$scan()

    // Notify participant
    room.sendMessageToPeer(order.participant && order.participant.peer || order.owner.peer, [
      {
        event: 'swap:startProcessOrder',
        data: {
          order,
        },
      },
    ])

    EA.once('orderProcessing:sendSecretHash', ({ secretHash }) => {
      scope.data.secretHash = secretHash
      scope.goNextStep()
    })
  }

  function goStep2() {
    scope.data.secretHash = crypto.ripemd160(scope.data.secret)
    scope.$scan()
  }

  function goStep3() {
    scope.data.waitingForRecipient = true
    scope.$scan()
  }

  function goStep4() {

  }

  scope.goNextStep = () => {
    scope.data.step++;

    if (scope.data.step === 2) {
      goStep2()
    }
    else if (scope.data.step === 3) {
      goStep3()
    }
    else if (scope.data.step === 4) {
      goStep4()
    }
  }

  ethToBtc.scope = scope
}


export default ethToBtc
