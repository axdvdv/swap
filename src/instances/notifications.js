import $ from 'jquery'
import { Collection } from 'models'
import EA from './EA'


const $headerBell = $('#headerBell')
const $notificationSound = $('#notificationSound')


class Notifications extends Collection {

  constructor() {
    super()

    this.onMount()
  }

  onMount() {
    EA.subscribe('room:swap:startProcessOrder', ({ order }) => {
      this.append(order)
    })
  }

  animate() {
    let count = Number($headerBell.attr('data-count')) || 0

    $headerBell.attr('data-count', ++count)
    $headerBell.removeClass('notify')

    setTimeout(() => {
      $headerBell.addClass('notify')

      if (count) {
        $headerBell.addClass('show-count')
      }
      else {
        $headerBell.removeClass('show-count')
      }

      $notificationSound[0].play()
    }, 0)
  }

  append(item) {
    console.log('New notification:', item)

    super.append(item)
    this.animate()

    EA.dispatchEvent('newNotification', item)
  }
}


export default new Notifications()
