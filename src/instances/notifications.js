import $ from 'jquery'
import { Collection } from 'models'
import EA from './EA'


class Notifications extends Collection {

  constructor() {
    super()

    window.notifications = this

    this.onMount()
  }

  onMount() {
    EA.subscribe('room:swap:startProcessOrder', ({ order }) => {
      this.append(order)
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
