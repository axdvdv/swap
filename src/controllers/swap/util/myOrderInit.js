import { EA, user } from 'instances'
import processStatusNames from './processStatusNames'


let scope
let order
let swapData


function notifyParticipantThatIJoined() {
  console.log('Notify participant that I joined to this order')

  room.sendMessageToPeer(swapData.participant.peer, [
    {
      event: 'swap:ownerJoined',
      data: {
        order,
        owner: {
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


export default (_scope, _order, _swapData) => {
  console.log('I am the creator!')

  scope = _scope
  order = _order
  swapData = _swapData

  notifyParticipantThatIJoined()

  scope.data.status = processStatusNames.initialized
  scope.$scan()


  // TODO this needs in future to check if participant is offline, etc..
  // if (!swapData.participant) {
  //   console.log('There is no participant for this order')
  //
  //   scope.data.status = processStatusNames.thereIsNoAnyParticipant
  //   scope.$scan()
  // }
  // else if (!room.isPeerExist(swapData.participant.peer)) {
  //   console.log('This order participant is offline')
  //   console.log('Wait until participant become online!')
  //
  //   scope.data.status = processStatusNames.waitingParticipantToBecomeOnline
  //   scope.$scan()
  //
  //   EA.subscribe('room:newPeer', function ({ peer }) {
  //     if (peer === swapData.participant.peer) {
  //       console.log('Participant became online!')
  //
  //       // remove this event subscription
  //       this.unsubscribe()
  //       notifyParticipantAboutJoining()
  //     }
  //   })
  // }
  // else {
  //   notifyParticipantAboutJoining()
  // }
}
