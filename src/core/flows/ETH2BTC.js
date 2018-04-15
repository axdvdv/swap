import Flow from '../Flow'


class ETH2BTC extends Flow {

  constructor({ swap, data, options: { ethSwap, btcSwap, getBalance } }) {
    super({ swap, data })

    this.swap = swap
    this.ethSwap = ethSwap
    this.btcSwap = btcSwap
    this.getBalance = getBalance

    this._getSteps()
    this._persist()
  }

  _getSteps() {
    const { room, storage } = this.swap
    const flow = this

    this.steps = [

      // Wait participant create BTC Script

      () => {
        room.subscribe('swap:btcScriptCreated', function ({ orderId, secretHash, btcScriptData }) {
          if (storage.data.id === orderId) {
            this.unsubscribe()

            flow.finishStep({
              secretHash,
              btcScriptData,
            })
          }
        })
      },

      // Verify BTC Script

      () => {
        this.finishStep({
          btcScriptVerified: true,
        })
      },

      // Check balance

      () => {
        this.syncBalance()
      },

      // Create ETH Contract

      async () => {
        const swapData = {
          myAddress:            storage.data.me.ethData.address,
          participantAddress:   storage.data.participant.ethData.address,
          secretHash:           flow.storage.data.secretHash,
          amount:               storage.data.requiredAmount,
        }

        await this.ethSwap.create(swapData, (transactionUrl) => {
          this.storage.update({
            ethSwapCreationTransactionUrl: transactionUrl,
          })
        })

        room.sendMessage(storage.data.participant.peer, [
          {
            event: 'swap:ethSwapCreated',
            data: {
              orderId: storage.data.id,
            },
          },
        ])

        this.finishStep({
          isEthSwapCreated: true,
        })
      },

      // Wait participant withdraw

      () => {
        room.subscribe('swap:ethWithdrawDone', function ({ orderId }) {
          if (storage.data.id === orderId) {
            this.unsubscribe()

            flow.finishStep({
              isEthWithdrawn: true,
            })
          }
        })
      },

      // Withdraw

      () => {
        let secret

        const myAndParticipantData = {
          myAddress: storage.data.me.ethData.address,
          participantAddress: storage.data.participant.ethData.address,
        }

        this.ethSwap.getSecret(myAndParticipantData)
          .then((result) => {
            secret = result

            return flow.ethSwap.close(myAndParticipantData)
          })
          .then(() => {
            const { script } = flow.btcSwap.createScript(flow.storage.data.btcScriptData)

            return flow.btcSwap.withdraw({
              // TODO here is the problem... now in `btcData` stored bitcoinjs-lib instance with additional functionality
              // TODO need to rewrite this - check instances/bitcoin.js and core/swaps/btcSwap.js:185
              btcData: storage.data.me.btcData,
              script,
              secret,
            }, (transactionUrl) => {
              flow.storage.update({
                btcSwapWithdrawTransactionUrl: transactionUrl,
              })
            })
          })
          .then(() => {
            flow.finishStep({
              isWithdrawn: true,
            })
          })
      },


      () => {

      },
    ]
  }

  async syncBalance() {
    const { storage } = this.swap

    this.storage.update({
      checkingBalance: true,
    })

    const balance = await this.getBalance()
    const isEnoughMoney = storage.data.requiredAmount <= balance

    if (isEnoughMoney) {
      this.finishStep({
        checkingBalance: false,
        notEnoughMoney: false,
      })
    }
    else {
      this.storage.update({
        checkingBalance: false,
        notEnoughMoney: true,
      })
    }
  }
}


export default ETH2BTC
