import EventAggregator from './EventAggregator'


class Flow {

  constructor({ swap, flow }) {
    this.events   = new EventAggregator()

    this.swap     = swap
    this.steps    = flow({ swap })
    this.index    = 0
  }

  goNextStep() {
    this.goStep(++this.index)
  }

  goStep(index) {
    this.index = index
    const prevIndex = index - 1

    if (prevIndex >= 0) {
      this.events.dispatch('leaveStep', prevIndex)
    }
    this.events.dispatch('enterStep', this.index)
    this.steps[this.index]({ index: this.index })
  }

  on(eventName, handler) {
    this.events.subscribe(eventName, handler)
  }
}


export default Flow
