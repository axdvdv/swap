import { EA, user } from 'instances'
import { localStorage } from 'helpers'
import processStatusNames from './processStatusNames'


let scope
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
}

function waitUntilOwnerJoin() {
  console.log('Wait until owner join this order')

  scope.data.status = processStatusNames.waitingParticipantConnectToDeal
  scope.$scan()

  EA.subscribe('room:swap:ownerJoined', function ({ order: { id: orderId }, owner }) {
    if (order.id === orderId) {
      console.log('Owner joined this order')

      this.unsubscribe()

      swapData.participant = owner

      localStorage.updateItem(`swap:${orderId}`, swapData)

      scope.data.status = processStatusNames.initialized
      scope.$scan()
    }
  })
}


export default (_scope, _order, _swapData) => {
  console.log('I am participant!')

  scope = _scope
  order = _order
  swapData = _swapData

  notifyOwnerThatIJoined()
  waitUntilOwnerJoin()
}
