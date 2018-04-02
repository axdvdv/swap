import { Collection } from 'models'
import { localStorage } from 'helpers'
import EA from 'instances/EA'
import user from 'instances/user'
import room from 'instances/room'


class Notifications extends Collection {

  constructor() {
    super()

    global.notifications = this

    this.onMount()
  }

  onMount() {
    room.subscribe('swap:userConnected', ({ order, participant }) => {
      // notify only order creator
      if (order.owner.peer === user.peer) {
        try {
          // TODO move this from here
          localStorage.updateItem(`swap:${order.id}`, {
            participant,
          })

          this.append({
            ...order,
            link: `/swap/${order.sellCurrency}-${order.buyCurrency}/`.toLowerCase() + order.id,
            type: 'newOrder',
          })
        }
        catch (err) {
          console.log(33333333, err)
        }
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
      EA.dispatch('newNotification', item)
    }
  }
}


export default new Notifications()
