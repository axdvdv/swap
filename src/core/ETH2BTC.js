import Flow from '../Flow'


class ETH2BTC extends Flow {

  constructor({ swap, getBalance }) {
    super()

    this.swap = swap
    this.getBalance = getBalance

    this.getSteps()
  }

  getSteps() {
    const { swap, swap: { storage, steps } } = this

    this.steps = [
      () => {

      },

      // Wait participant create BTC Script
      ({ index }) => {
        swap.room.subscribe('swap:btcScriptCreated', async function ({ orderId, secretHash, btcScriptData }) {
          if (swap.order.id === orderId) {
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

      // Verify BTC Script
      ({ index }) => {
        swap.storage.update({
          stepsData: {
            step: index,
            btcScriptVerified: true,
          },
        })
        swap.flow.goNextStep()
      },

      // Check balance
      () => {
        this.syncBalance()
      },
      () => {

      },
      () => {

      },
      () => {

      },
      () => {

      },
    ]
  }

  startSyncBalance() {
    
  }

  syncBalance() {
    this.swap.storage.update({
      stepsData: {
        checkingBalance: true,
      },
    })

    const balance = this.getBalance()
    const isEnoughMoney =

    if (isEnoughMoney) {
      swap.flow.goNextStep()
    }
    else {
      swap.storage.update({
        stepsData: {
          notEnoughMoney: true,
        },
      })
    }
  }
}


export default ETH2BTC
