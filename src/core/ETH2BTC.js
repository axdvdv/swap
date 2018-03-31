import Flow from './Flow'


class ETH2BTC extends Flow {

  constructor({ swap }) {
    super()

    this.swap = swap
    this.index = swap.index

    this.getSteps()
  }

  getSteps() {
    const { storage, steps } = this.swap

    this.steps = [
      () => {

      },
      () => {
        self.swap.room.subscribe('swap:btcScriptCreated', async function ({ orderId, secretHash, btcScriptData }) {
          if (self.swap.order.id === orderId) {
            this.unsubscribe()

            storage.update({
              stepsData: {
                secretHash,
                btcScriptData,
              },
            })
            steps.goNext()
          }
        })
      },
      () => {

      },
    ]
  }


}


export default ETH2BTC
