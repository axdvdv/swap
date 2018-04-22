import EventAggregator from './EventAggregator'
import Storage from './Storage'


class Flow {

  /*

    Flow storage data:

    {boolean} isWaitingParticipant
    {string}  signTransactionUrl
    {boolean} isSignFetching
    {boolean} isMeSigned
    {boolean} isParticipantSigned

   */

  constructor({ swap, data, options: { ethSwap, syncData } }) {
    if (typeof syncData !== 'function') {
      throw new Error('Flow failed. "syncData" of type function required.')
    }

    this.ethSwap  = ethSwap
    this.syncData = syncData

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
    this.steps = [
      ...this._getInitialSteps(),
      ...this._getSteps(),
    ]

    this.goStep(this.storage.data.step)
  }

  _getInitialSteps() {
    const { room, storage } = this.swap
    const flow = this

    return [

      // Check swap ID, if it doesn't exist wait for data sync

      async () => {
        if (!storage.data.id) {
          flow.storage.update({
            isWaitingParticipant: true, // this means that participant with such order is offline
          })

          const data = await this.syncData()

          storage.update(data)
        }

        flow.finishStep()
      },

      // Setup data

      () => {
        const isMyOrder = storage.data.owner.address === storage.data.me.ethData.address

        storage.update({
          isMy: isMyOrder,
        })

        if (!isMyOrder) {
          storage.update({
            participant: storage.data.owner,
          })

          flow.storage.update({
            waitingParticipantToConnect: true,
          })

          room.subscribe('swap:userConnected', function ({ orderId, participant }) {
            if (storage.data.id === orderId) {
              this.unsubscribe()

              flow.storage.update({
                participant,
              })
              flow.finishStep()
            }
          })
        }

        room.sendMessage(swapData.participant.peer, [
          {
            event: 'swap:userConnected',
            data: {
              orderId: storage.data.id,
              participant: storage.data.me,
            },
          },
        ])

        if (isMyOrder) {
          flow.finishStep()
        }
      },

      // Signs

      () => {
        room.subscribe('swap:signed', function ({ orderId }) {
          if (storage.data.id === orderId) {
            this.unsubscribe()

            flow.finishStep({
              isParticipantSigned: true,
            })

            const { isMeSigned, isParticipantSigned } = flow.storage.data

            if (isMeSigned && isParticipantSigned) {
              flow.finishStep()
            }
          }
        })
      },
    ]
  }

  _getSteps() {
    return []
  }

  finishStep(data = {}) {
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


  // TODO need to move sign functionality from Flow class coz in other swaps this process could be necessary

  async sign() {
    const { room, storage } = this.swap

    this.storage.update({
      isSignFetching: true,
    })

    await this.ethSwap.sign(
      {
        myAddress: storage.data.me.ethData.address,
        participantAddress: storage.data.participant.eth.address,
      },
      (signTransactionUrl) => {
        this.storage.update({
          signTransactionUrl,
        })
      }
    )

    this.storage.update({
      isSignFetching: false,
      isMeSigned: true,
    })

    room.sendMessage(storage.data.participant.peer, [
      {
        event: 'swap:signed',
        data: {
          orderId: storage.data.id,
        },
      },
    ])

    const { isMeSigned, isParticipantSigned } = this.storage.data

    if (isMeSigned && isParticipantSigned) {
      this.finishStep()
    }
  }
}


export default Flow
