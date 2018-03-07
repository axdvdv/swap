import { EA, user } from 'instances'


let order
let swapData


function notifyParticipantThatIJoined(peer) {
  console.log('Notify participant that I joined to this order')

  room.sendMessageToPeer(peer, [
    {
      event: 'swap:ownerJoined',
      data: {
        order,
        ethAddress: user.ethData.address,
      },
    },
  ])
}


export default (scope) => {
  console.log('I am the creator!')

  order = scope.data.order
  swapData = scope.data.swapData

  notifyParticipantThatIJoined()


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
  //       this.remove()
  //       notifyParticipantAboutJoining()
  //     }
  //   })
  // }
  // else {
  //   notifyParticipantAboutJoining()
  // }
}
