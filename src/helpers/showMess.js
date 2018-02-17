let countModal = 0

const showMess = (message, seconds, status) => {
  let status2 = 0
  
  if (status === 1 || status === 'success' || status === 'info') {
    status2 = 1
  }
  else if (status === 2 || status === 'danger' || status === 'error'){
    status2 = 2
  }
  
  const modal = $('#MyPopup')
  
  if (modal.length > 0) {
    countModal++

    const tnBox = modal.find('.tn-box:eq(0)').clone()

    modal.show()
    modal.append(tnBox)

    tnBox.find('p').html(message)
    tnBox.removeClass('tn-box-color-0')
    tnBox.removeClass('tn-box-color-1')
    tnBox.removeClass('tn-box-color-2')
    tnBox.addClass('tn-box-color-' + status2)
    tnBox.css({
      display: 'block',
      '-webkit-animation': 'fadeOut '+(seconds + 0.5)+'s linear forwards',
      '-moz-animation': 'fadeOut '+(seconds + 0.5)+'s linear forwards',
      '-o-animation': 'fadeOut '+(seconds + 0.5)+'s linear forwards',
      '-ms-animation': 'fadeOut '+(seconds + 0.5)+'s linear forwards',
      'animation': 'fadeOut '+(seconds + 0.5)+'s linear forwards',
    })

    const progress = tnBox.find('.tn-progress')

    progress.css({
      '-webkit-animation': 'runProgress '+(seconds - 1)+'s linear forwards 0.5s',
      '-moz-animation': 'runProgress '+(seconds - 1)+'s linear forwards 0.5s',
      '-o-animation': 'runProgress '+(seconds - 1)+'s linear forwards 0.5s',
      '-ms-animation': 'runProgress '+(seconds - 1)+'s linear forwards 0.5s',
      'animation': 'runProgress '+(seconds - 1)+'s linear forwards 0.5s',
    })

    setTimeout(function () {
      countModal--
      tnBox.remove()
      if (countModal <= 0) {
        modal.hide()
      }
    }, (seconds * 1000))
  }
}


export default showMess
