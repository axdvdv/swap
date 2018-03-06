import alight from 'alight'
import crypto from 'swap-crypto'
import { app } from 'controllers'
import { EA, user, room, orders } from 'instances'
import { orderStatuses } from 'helpers'
import { ethSwap, btcSwap } from 'swaps'


const ethToBtc = {
  scope: {},
}

alight.controllers.ethToBtc = (scope) => {
  console.log('ETH to BTC controller!')

  scope.data = {
    isOwner: false,
    statuses: {
      waitingParticipantToBecomeOnline: 'waitingParticipantToBecomeOnline',
      waitingParticipantConnectToDeal: 'waitingParticipantConnectToDeal',
      initialized: 'initialized',
    },
    status: null,
    step: 1,
    order: null,
    secret: null,
    secretHash: '',
    btcScriptAddress: '0x0dsgsdhsdhsddsh',
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
      scope.data.status = scope.data.statuses.waitingParticipantConnectToDeal
      scope.$scan()

      notifyParticipant(order.owner.peer)

      console.log('Wait until the owner connect to this deal!')

      EA.subscribe('room:swap:startProcessOrder', ({ order, order: { owner: { id } } }) => {
        console.log('Receive event swap:startProcessOrder', order)

        if (order.owner.id === id) {
          console.log('The owner connected to this deal!')

          resolve()
        }
      })
    })
  }

  function tryNotifyParticipant(peer) {
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
    console.log('Notify participant that I am joined to this order' )

    room.sendMessageToPeer(peer, [
      {
        event: 'swap:startProcessOrder',
        data: {
          order,
        },
      },
    ])
  }


  const { params: { id: orderId } } = app.scope.data.activeRoute

  let order = orders.getByKey(orderId)

  console.log('Order:', order)

  if (order && order.owner.address === user.data.address) {
    console.log('I am the creator!')

    scope.isOwner = true
    scope.$scan()
  }
  else {
    console.log('I am participant!')

    function init() {
      console.log('Init')

      scope.data.status = scope.data.statuses.initialized
      scope.data.order = order

      scope.$scan()

      EA.once('room:orderProcessing:sendSecretHash', ({ secretHash }) => {
        console.log('Receive secret hash:', secretHash)

        orders.getByKey(order.id).update({
          secretHash,
        })
        scope.data.secretHash = secretHash
        scope.$scan()
      })
    }

    function goStep2() {

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

    waitParticipantToBecomeOnline()
      .then(waitParticipantConnectToDeal)
      .then(init)
  }

  ethToBtc.scope = scope
}


export default ethToBtc
