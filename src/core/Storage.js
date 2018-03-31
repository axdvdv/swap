import EventAggregator from './EventAggregator'


class Storage {

  constructor({ initialState }) {
    const { order, participant, data, step } = initialState || {}

    this.events         = new EventAggregator()

    this.order          = order
    this.participant    = participant
    this.step           = step || 0
    this.stepsData      = data || {}
  }

  update(values) {
    Object.keys(values).forEach((key) => {
      const value = values[key]

      if (value && typeof value === 'object') {
        this[key] = {
          ...this[key],
          ...value,
        }
      }
      else {
        this[key] = value
      }
    })

    const { order, participant, step, stepsData } = this

    this.events.dispatch('update', {
      order,
      participant,
      step,
      stepsData,
    })
  }

  on(eventName, handler) {
    this.events.subscribe(eventName, handler)
  }
}


export default Storage
