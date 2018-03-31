/*

/btc-eth

I am creator      - buyCurrency: 'ETH', sellCurrency: 'BTC'
I am participant  - buyCurrency: 'BTC', sellCurrency: 'ETH'

/eth-btc

I am creator      - buyCurrency: 'BTC', sellCurrency: 'ETH'
I am participant  - buyCurrency: 'ETH', sellCurrency: 'BTC'

 */


import alight from 'alight'
import { EA, orders, user, room } from 'instances'
import { ethSwap } from 'swaps'
import { localStorage } from 'helpers'


const statuses = {
  thereIsNoAnyParticipant: 'thereIsNoAnyParticipant',
  waitingSwapCreatorToBecomeOnline: 'waitingSwapCreatorToBecomeOnline',
  waitingParticipantConnectToDeal: 'waitingParticipantConnectToDeal',
  swapSigning: 'swapSigning',
  initialized: 'initialized',
}

const swap = {
  scope: {},
}

alight.controllers.swap = (scope) => {
  console.info('Swap controller!')

  const { $parent: { data: { activeRoute: { params: { id: orderId, slug } } } } } = scope

  const order       = orders.getByKey(orderId)
  const swapData    = localStorage.getItem(`swap:${orderId}`) || {}

  console.log('Order:', order)
  console.log('Swap data:', swapData)

  scope.data = {
    statuses,
    status: null,
    slug,
    order,

    // sign
    signFetching: false,
    signTransactionHash: null,
    isMeSigned: false,
    isParticipantSigned: false,
  }

  if (!order) {
    console.error('There is no such order!')

    scope.data.status = statuses.waitingSwapCreatorToBecomeOnline
    scope.$scan()

    EA.subscribe('orders:onAppend', function ({ id }) {
      if (id === orderId) {
        this.unsubscribe()
        console.log('Participant became online!')
        console.log('Order:', scope.data.order)

        scope.data.order = orders.getByKey(id)
        connect()
      }
    })
  }
  else {
    connect()
  }

  function connect() {
    const { order } = scope.data
    const isMyOrder = order.owner.address === user.ethData.address

    scope.data.order.isMy = isMyOrder
    scope.$scan()

    if (!isMyOrder) {
      swapData.participant = order.owner
    }

    console.log('Notify participant that I connected to this order')

    room.sendMessage(swapData.participant.peer, [
      {
        event: 'swap:userConnected',
        data: {
          order,
          participant: {
            peer: user.peer,
            eth: {
              address: user.ethData.address,
              publicKey: user.ethData.publicKey,
            },
            btc: {
              address: user.btcData.address,
              publicKey: user.btcData.publicKey,
            },
          },
        },
      },
    ])

    if (isMyOrder) {
      initSigning()
    }
    else {
      console.log('Wait until creator connect to this order')

      scope.data.status = statuses.waitingParticipantConnectToDeal
      scope.$scan()

      room.subscribe('swap:userConnected', function ({ order: { id: orderId }, participant }) {
        if (order.id === orderId) {
          this.unsubscribe()
          console.log('Creator connected to this order')

          swapData.participant = participant
          localStorage.setItem(`swap:${orderId}`, swapData)

          initSigning()
        }
      })
    }
  }

  function initSigning() {
    const { order } = scope.data

    scope.data.status = statuses.swapSigning
    scope.$scan()

    room.subscribe('swap:signed', function ({ orderId }) {
      if (order.id === orderId) {
        this.unsubscribe()
        console.log('Participant signed this swap')

        scope.data.isParticipantSigned = true
        scope.$scan()

        checkIfCanInit()
      }
    })
  }

  scope.signSwap = () => {
    const { order } = scope.data

    scope.data.signFetching = true
    scope.$scan()

    ethSwap.sign({
      myAddress: user.ethData.address,
      participantAddress: swapData.participant.eth.address,
    }, (signTransactionHash) => {
      scope.data.signTransactionHash = signTransactionHash
      scope.$scan()
    })
      .then(() => {
        scope.data.signFetching = false
        scope.data.isMeSigned = true
        scope.$scan()
        checkIfCanInit()

        room.sendMessage(swapData.participant.peer, [
          {
            event: 'swap:signed',
            data: {
              orderId: order.id,
            },
          },
        ])
      })
  }

  function checkIfCanInit() {
    const { isMeSigned, isParticipantSigned } = scope.data

    if (isMeSigned && isParticipantSigned) {
      init()
    }
  }

  function init() {
    scope.data.status = statuses.initialized
    scope.$scan()
  }

  swap.scope = scope
}


export default swap
