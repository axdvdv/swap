import alight from 'alight'
import { localStorage } from 'helpers'
import { room, ethereum } from 'instances'
import { ethSwap, btcSwap } from 'swaps'


const ethToBtc = {
  scope: {},
}

alight.controllers.ethToBtc = (scope) => {
  console.info('ETH to BTC controller!')

  const order           = scope.$parent.data.order
  const swapData        = localStorage.getItem(`swap:${order.id}`) || {}
  const requiredAmount  = order.isMy ? order.sellAmount : order.buyAmount

  global.swapData = swapData

  scope.data = {
    myAddress: user.ethData.address,
    step: 0,

    // step 1
    secretHash: null,
    btcScriptData: null,

    // step 2
    btcScriptVerified: false,
    address: user.ethData.address,
    balance: user.ethData.balance,
    notEnoughMoney: false,
    checkingBalance: false,

    // step 3
    ethSwapCreationTransactionHash: null,
    isEthSwapCreated: false,

    // step 4
    isEthWithdrawn: false,

    // step 5
    btcSwapWithdrawTransactionHash: null,
  }

  function checkBalance() {
    console.log('Checking if there is enough money on balance')
    console.log('Available balance', user.ethData.balance)
    console.log('Required amount', requiredAmount)

    scope.data.notEnoughMoney = user.ethData.balance < requiredAmount
    scope.$scan()

    if (scope.data.notEnoughMoney) {
      console.log('Not enough money')
    }
    else {
      console.log('There is enough money for swap')
    }

    return !scope.data.notEnoughMoney
  }

  scope.updateBalance = async () => {
    scope.data.checkingBalance = true
    scope.$scan()

    const balance = await ethereum.getBalance()

    scope.data.balance = balance
    scope.$scan()

    const isEnough = checkBalance()

    if (isEnough) {
      scope.goNextStep()
    }
  }

  scope.goNextStep = async () => {
    scope.data.step++;
    scope.$scan()

    console.log('\n-------------------------------------------\n\n')
    console.log(`\nSTEP ${scope.data.step}\n\n`)

    if (scope.data.step === 1) {
      console.log('Waiting until owner creates secretHash and BTC Swap script')

      room.subscribe('swap:btcScriptCreated', async function ({ orderId, secretHash, btcScriptData }) {
        if (order.id === orderId) {
          console.log('Owner created secretHash', secretHash)
          console.log('Owner created btcScript', btcScriptData)

          this.unsubscribe()

          // localStorage.updateItem(`swap:${order.id}`, {
          //   secretHash,
          // })

          scope.data.secretHash = secretHash
          scope.data.btcScriptData = btcScriptData
          scope.$scan()
        }
      })
    }
    else if (scope.data.step === 2) {
      scope.data.btcScriptVerified = true
      scope.$scan()

      const isEnough = checkBalance()

      if (isEnough) {
        scope.goNextStep()
      }
    }
    else if (scope.data.step === 3) {
      await ethSwap.create({
        myAddress: user.ethData.address,
        secretHash: scope.data.secretHash,
        participantAddress: swapData.participant.eth.address,
        amount: requiredAmount,
      }, (transactionHash) => {
        scope.data.ethSwapCreationTransactionHash = transactionHash
        scope.$scan()
      })

      scope.data.isEthSwapCreated = true
      scope.$scan()

      room.sendMessage(swapData.participant.peer, [
        {
          event: 'swap:ethSwapCreated',
          data: {
            orderId: order.id,
          },
        },
      ])

      scope.goNextStep()
    }
    else if (scope.data.step === 4) {
      room.subscribe('swap:ethWithdrawDone', function ({ orderId }) {
        if (order.id === orderId) {
          this.unsubscribe()

          scope.data.isEthWithdrawn = true
          scope.$scan()
          scope.goNextStep()
        }
      })
    }
    else if (scope.data.step === 5) {
      let secret

      ethSwap.getSecret({
        myAddress: user.ethData.address,
        participantAddress: swapData.participant.eth.address,
      })
        .then((_secret) => {
          secret = _secret

          return ethSwap.close({
            myAddress: user.ethData.address,
            participantAddress: swapData.participant.eth.address,
          })
        })
        .then(() => {
          const { script } = btcSwap.createScript(scope.data.btcScriptData)

          return btcSwap.withdraw({
            btcData: user.btcData,
            script,
            secret,
          }, (transactionHash) => {
            scope.data.btcSwapWithdrawTransactionHash = transactionHash
          })
        })
        .then(() => {
          scope.data.isWithdrawn = true
          scope.$scan()
          scope.goNextStep()
        })
    }
    else if (scope.data.step === 6) {

    }
  }

  scope.goNextStep()

  ethToBtc.scope = scope
}


export default ethToBtc
