import alight from 'alight'
import crypto from 'swap-crypto'
import { app } from 'controllers'
import { EA, user, room, orders } from 'instances'
import { orderStatuses } from 'helpers'
import { ethSwap, btcSwap } from 'swaps'


const btcToEth = {
  scope: {},
}

alight.controllers.btcToEth = (scope) => {
  console.log('BTC to ETH controller!')

  scope.data = {
    statuses: {
      thereIsNoAnyParticipant: 'thereIsNoAnyParticipant',
      waitingParticipantToBecomeOnline: 'waitingParticipantToBecomeOnline',
      waitingParticipantConnectToDeal: 'waitingParticipantConnectToDeal',
      initialized: 'initialized',
    },
    status: null,
    step: 1,
    order: null,
    secret: 'c0809ce9f484fdcdfb2d5aabd609768ce0374ee97a1a5618ce4cd3f16c00a078',
    secretHash: '',
    btcScriptAddress: '0x0dsgsdhsdhsddsh',
  }

  const { params: { id: orderId } } = app.scope.data.activeRoute

  let order = orders.getByKey(orderId)

  console.log('Order:', order)

  if (order && order.owner.address === user.data.address) {
    console.log('I am this order creator!')

    if (order.participant && order.participant.peer) {
      tryNotifyParticipant(order.participant.peer)
        .then(init)
    }
    else {
      scope.data.status = scope.data.statuses.thereIsNoAnyParticipant
      scope.$scan()
    }
  }
  else {
    waitParticipantToBecomeOnline()
      .then(waitParticipantConnectToDeal)
      .then(notifyParticipant)
      .then(init)
  }

  function waitParticipantToBecomeOnline() {
    return new Promise((resolve) => {
      if (order) {
        resolve()
        return
      }

      console.log('Wait until participant to become online!')

      scope.data.status = scope.data.statuses.waitingParticipantToBecomeOnline
      scope.$scan()

      EA.subscribe('orders:onAppend', function ({ id }) {
        if (id === orderId) {
          order = orders.getByKey(orderId)
          console.log('Participant became online!')
          console.log('Order:', order)

          // remove 'orders:onAppend' subscription
          this.remove()
          resolve()
        }
      })
    })
  }

  function waitParticipantConnectToDeal() {
    return new Promise((resolve) => {
      console.log('Wait until participant connect to this deal!')

      scope.data.status = scope.data.statuses.waitingParticipantConnectToDeal
      scope.$scan()

      notifyParticipant(order.owner.peer)

      EA.once(`swap:participantConnectedToDeal:${order.id}`, () => {
        console.log('Participant connected to this deal!')

        resolve()
      })
    })
  }

  function tryNotifyParticipant(peer) {
    console.log('Try notify the participant')

    return new Promise((resolve) => {
      if (room.isPeerExist(peer)) {
        notifyParticipant()
        resolve()
        return
      }

      waitParticipantToBecomeOnline(() => {
        notifyParticipant()
        resolve()
      })
    })
  }

  function notifyParticipant(peer) {
    room.sendMessageToPeer(peer, [
      {
        event: 'swap:startProcessOrder',
        data: {
          order,
        },
      },
    ])
  }

  function init() {
    console.log(444, order)

    scope.status = scope.data.statuses.initialized
    scope.data.order = order
    order.status = orderStatuses.processing

    scope.$scan()
  }

  function goStep2() {
    scope.data.secretHash = crypto.ripemd160(scope.data.secret)

    room.sendMessageToPeer(order.participant.peer, [
      {
        event: 'orderProcessing:sendSecretHash',
        data: {
          secretHash: scope.data.secretHash,
        },
      },
    ])

    scope.$scan()
  }

  function goStep3() {
    scope.data.waitingForParticipant = true
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

  btcToEth.scope = scope
}


export default btcToEth
