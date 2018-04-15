import EventAggregator from './EventAggregator'
import Storage from './Storage'


class Flow {

  constructor({ swap, data }) {
    this.events   = new EventAggregator()
    this.storage  = new Storage({
      data: data || {
        step: 0,
      },
    })

    this.swap     = swap
    this.steps    = null
    this.index    = 0
  }

  _persist() {
    this.goStep(this.storage.data.step)
  }

  finishStep(data) {
    this.goNextStep(data)
  }

  goNextStep(data) {
    this.goStep(++this.index, data)
  }

  goStep(index, data) {
    this.index = index
    const prevIndex = index - 1

    if (prevIndex >= 0) {
      this.events.dispatch('leaveStep', prevIndex)
    }

    if (data) {
      this.storage.update({
        step: this.index + 1,
        ...data,
      })
    }

    this.events.dispatch('enterStep', this.index)
    this.steps[this.index]({ index: this.index })
  }

  on(eventName, handler) {
    this.events.subscribe(eventName, handler)
  }
}


export default Flow
