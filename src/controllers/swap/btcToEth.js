import alight from 'alight'
import crypto from 'swap-crypto'
import { localStorage } from 'helpers'
import { EA, user, room, ethereum, bitcoin } from 'instances'
import { ethSwap, btcSwap } from 'swaps'


const btcToEth = {
  scope: {},
}

alight.controllers.btcToEth = (scope) => {
  console.log('BTC to ETH controller!')

  const order = scope.$parent.data.order
  const swapData = localStorage.getItem(`swap:${order.id}`) || {}
  let btcScriptData

  global.swapData = swapData

  scope.data = {
    order,
    step: 0,

    // step 1
    secret: 'c0809ce9f484fdcdfb2d5aabd609768ce0374ee97a1a5618ce4cd3f16c00a078',

    // step 2
    address: user.btcData.address,
    balance: user.btcData.balance,
    notEnoughMoney: false,
    checkingBalance: false,

    // step 3

    // step 4
    btcScriptData: null,

    // step 7
    ethSwapWithdrawTransactionUrl: null,
  }

  function checkBalance() {
    console.log('Checking if there is enough money on balance')
    console.log('Available balance', user.btcData.balance)
    console.log('Required', order.currency2Amount)

    scope.data.notEnoughMoney = user.btcData.balance < order.currency2Amount
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

    const balance = await bitcoin.getBalance(user.btcData.address)

    scope.data.balance = balance
    scope.$scan()

    const isEnough = checkBalance()

    if (isEnough) {
      scope.goNextStep()
    }
  }

  scope.goNextStep = () => {
    scope.data.step++;
    scope.$scan()

    console.log('\n-------------------------------------------\n\n')
    console.log(`\nSTEP ${scope.data.step}\n\n`)

    if (scope.data.step === 1) {

    }
    else if (scope.data.step === 2) {
      const secretHash = crypto.ripemd160(scope.data.secret)

      scope.data.secretHash = secretHash
      scope.$scan()

      // localStorage.updateItem(`swap:${order.id}`, {
      //   secretHash,
      // })

      scope.goNextStep()
    }
    else if (scope.data.step === 3) {
      const isEnough = checkBalance()

      if (isEnough) {
        scope.goNextStep()
      }
    }
    else if (scope.data.step === 4) {
      btcScriptData = btcSwap.createScript({
        secretHash: scope.data.secretHash,
        btcOwnerPublicKey: user.btcData.publicKey,
        ethOwnerPublicKey: swapData.participant.btc.publicKey,
      })

      setTimeout(() => {
        scope.$scan()
        scope.goNextStep()
      }, 1500)
    }
    else if (scope.data.step === 5) {
      btcSwap.fundScript({
        btcData: user.btcData,
        script: btcScriptData.script,
        amount: order.currency2Amount,
      })
        .then(() => {
          scope.goNextStep()
        })
    }
    else if (scope.data.step === 6) {
      room.sendMessageToPeer(swapData.participant.peer, [
        {
          event: 'swap:btcScriptCreated',
          data: {
            orderId: order.id,
            secretHash: scope.data.secretHash,
            btcScriptData,
          },
        },
      ])

      EA.subscribe('room:swap:ethSwapCreated', function ({ orderId }) {
        if (order.id === orderId) {
          this.unsubscribe()

          scope.goNextStep()
        }
      })
    }
    else if (scope.data.step === 7) {
      ethSwap.withdraw({
        ethData: user.ethData,
        secret: scope.data.secret,
        ownerAddress: swapData.participant.eth.address,
      }, (transactionHash) => {
        scope.data.ethSwapWithdrawTransactionUrl = transactionHash
        scope.$scan()
      })
        .then(() => {
          scope.goNextStep()
        })
    }
    else if (scope.data.step === 8) {
      room.sendMessageToPeer(swapData.participant.peer, [
        {
          event: 'swap:ethWithdrawDone',
          data: {
            orderId: order.id,
          },
        },
      ])
    }
  }

  scope.goNextStep()

  btcToEth.scope = scope
}


export default btcToEth
