import EventAggregator from './EventAggregator'


class Storage {

  constructor({ data }) {
    this.events   = new EventAggregator()
    this.data     = data
  }

  update(values) {
    // there is no need to deep merge
    this.data = {
      ...this.data,
      ...values,
    }

    this.events.dispatch('newValues', values)
    this.events.dispatch('update', this.data)
  }

  on(eventName, handler) {
    this.events.subscribe(eventName, handler)
  }
}


export default Storage
