class DispatchedEvent {

  constructor() {
    this.propagationStopped = false
  }

  isPropagationStopped() {
    return this.propagationStopped
  }

  stopPropagation() {
    this.propagationStopped = true
  }
}

class Event {

  /**
   *
   * @param name {string}
   */
  constructor(name) {
    this.name = name
    this.handlers = {}
  }

  /**
   * Add handler to current Event
   *
   * @param handler {function}
   * @param priority {number}
   */
  addHandler(handler, priority = 1) {
    if (!(priority in this.handlers)) {
      this.handlers[String(priority)] = []
    }
    return this.handlers[String(priority)].push(handler.bind({
      unsubscribe: () => {
        this.removeHandler(handler, priority)
      },
    }))
  }

  /**
   * Remove handler from current Event
   *
   * @param handler {function}
   * @param priority {number}
   * @returns {Array.<T>|*}
   */
  removeHandler(handler, priority = 1) {
    if (!priority in this.handlers) {
      const handlerIndex = this.handlers[priority].indexOf(handler)

      if (~handlerIndex) {
        return this.handlers[priority].splice(handlerIndex, 1);
      } else {
        console.warn('There is no such handler in Event handlers')
      }
    } else {
      console.warn(`There is no priority ${priority} in Event handlers`)
    }
    return this.handlers
  }

  /**
   * Call all handlers in all priorities of current Event
   *
   * @param eventArgs {...array}
   */
  call(...eventArgs) {
    if (!Object.keys(this.handlers).length) {
      return
    }

    const dispatchedEvent = new DispatchedEvent

    for (let priority in this.handlers) {
      if (!this.handlers.hasOwnProperty(priority)) {
        continue
      }
      if (dispatchedEvent.isPropagationStopped()) {
        continue
      }

      // TODO add `dispatchedEvent` to handler to pass `stopPropagation` method
      this.handlers[priority].forEach((handler) => handler(...eventArgs))
    }
  }
}

export default Event
