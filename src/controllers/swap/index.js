import alight from 'alight'
import { localStorage } from 'helpers'
import { EA, orders, user } from 'instances'
import { processStatusNames, myOrderInit, otherOrderInit } from './util'
import btcToEth from './btcToEth'
import ethToBtc from './ethToBtc'


const swap = {
  scope: {},
}

alight.controllers.swap = (scope) => {
  console.log('Swap controller!')

  const { $parent: { data: { activeRoute: { params: { id: orderId, slug } } } } } = scope

  const swapData = localStorage.getItem(`swap:${orderId}`) || {}
  let order = orders.getByKey(orderId)

  scope.data = {
    statuses: processStatusNames,
    status: null,
    slug,
    order,
  }

  console.log('Swap data:', swapData)
  console.log('Order:', order)

  if (!order) {
    console.error('There is no such order!')

    scope.data.status = processStatusNames.waitingParticipantToBecomeOnline
    scope.$scan()

    EA.subscribe('orders:onAppend', function ({ id }) {
      if (id === orderId) {
        console.log('Participant became online!')

        scope.data.order = order = orders.getByKey(id)

        console.log('Order:', order)

        this.unsubscribe()
        init()
      }
    })
  }
  else {
    init()
  }

  function init() {
    const isMyOrder = order.owner.address === user.ethData.address

    scope.data.status = processStatusNames.waitingParticipantToBecomeOnline
    scope.$scan()

    if (isMyOrder) {
      myOrderInit(scope, order, swapData)
    }
    else {
      otherOrderInit(scope, order, swapData)
    }
  }

  swap.scope = scope
}


export default swap

export {
  btcToEth,
  ethToBtc,
}
