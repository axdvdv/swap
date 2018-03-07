import { EA, user } from 'instances'
import { localStorage } from 'helpers'


let order
let swapData


function notifyOwnerThatIJoined() {
  console.log('Notify owner that I joined to this order')

  room.sendMessageToPeer(order.owner.peer, [
    {
      event: 'swap:participantJoined',
      data: {
        order,
        participant: {
          peer: user.peer,
        },
        btcPublicKey: user.btcData.publicKey,
      },
    },
  ])
}

function waitUntilOwnerJoin() {
  console.log('Wait until owner join this order')

  EA.subscribe('room:swap:ownerJoined', ({ order: { id: orderId }, ethAddress }) => {
    if (order.id === orderId) {
      console.log('Owner joined this order')

      this.unsubscribe()

      localStorage.updateItem(`swap:${orderId}`, {
        owner: {
          ethAddress,
        },
      })
    }
  })
}


export default (scope) => {
  console.log('I am participant!')

  order = scope.data.order
  swapData = scope.data.swapData

  notifyOwnerThatIJoined()
  waitUntilOwnerJoin()
}
