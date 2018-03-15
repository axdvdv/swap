import { Collection } from 'models'
import { localStorage } from 'helpers'
import { user } from 'instances'
import EA from './EA'


class Notifications extends Collection {

  constructor() {
    super()

    window.notifications = this

    this.onMount()
  }

  onMount() {
    EA.subscribe('room:swap:participantJoined', ({ order, participant }) => {
      if (order.owner.peer === user.peer) {
        // TODO move this from here
        localStorage.updateItem(`swap:${order.id}`, {
          participant,
        })

        this.append({
          ...order,
          type: 'newOrder',
        })
      }
    })
  }

  animate() {
    const $headerBell = $('#headerBell')
    const $notificationSound = $('#notificationSound')
    const count = this.items.length

    $headerBell.attr('data-count', count)
    $headerBell.removeClass('notify')

    setTimeout(() => {
      $headerBell.addClass('notify')
    }, 0)

    if (count) {
      $headerBell.addClass('show-count')
    }
    else {
      $headerBell.removeClass('show-count')
    }

    $notificationSound[0].play()
  }

  append(item) {
    if (!this.isExist(item)) {
      super.append(item)
      this.animate()

      console.log('New notification:', item)
      EA.dispatchEvent('newNotification', item)
    }
  }
}


export default new Notifications()
