import Flow from '../Flow'


class BTC2ETH extends Flow {

  constructor({ swap }) {
    super()

    this.swap = swap

    this.getSteps()
  }

  getSteps() {
    const { storage, steps } = this.swap

    this.steps = [
      () => {

      },
      ({ index }) => {
        swap.room.subscribe('swap:btcScriptCreated', async function ({ orderId, secretHash, btcScriptData }) {
          if (self.swap.order.id === orderId) {
            this.unsubscribe()

            swap.storage.update({
              step: index,
              stepsData: {
                secretHash,
                btcScriptData,
              },
            })
            swap.flow.goNextStep()
          }
        })
      },
      () => {
        swap.storage.update({
          stepsData: {
            step: index,
            btcScriptVerified: true,
          },
        })
        swap.flow.goNextStep()
      },
    ]
  }


}


export default BTC2ETH
