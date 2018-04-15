import alight from 'alight'
import { localStorage, config } from 'helpers'
import { user, room, ethereum } from 'instances'
import { web3 } from 'instances/ethereum'
import request from 'swap-request'

import { ETH2BTC } from 'core/flows'
import { EthSwap, BtcSwap } from 'core/swaps'
import { Swap } from 'core'


const ethToBtc = {
  scope: {},
}

alight.controllers.ethToBtc = (scope) => {
  console.info('ETH to BTC controller!')

  // Get Data ----------------------------------------------------------------

  const order             = scope.$parent.data.order
  const swapData          = localStorage.getItem(`swap:${order.id}`) || {}
  const buyAmount         = order.isMy ? order.buyAmount : order.sellAmount
  const buyCurrency       = order.isMy ? order.buyCurrency : order.sellCurrency
  const sellAmount        = order.isMy ? order.sellAmount : order.buyAmount
  const sellCurrency      = order.isMy ? order.sellCurrency : order.buyCurrency
  // const balance           = user[`${sellCurrency.toLowerCase()}Data`].balance

  const data = {
    swap: {
      id: order.id,
      me: user,
      participant: swapData.participant,
      requiredAmount: sellAmount, // difference between `requiredAmount` and `sellAmount` that `requiredAmount` may include fee
      buyAmount,
      buyCurrency,
      sellAmount,
      sellCurrency,
    },
    flow: localStorage.getItem('swap:eth2btc') || {
      step: 0,
    },
  }

  console.log('ethToBtc data', data)

  scope.data = {
    ...data,
  }

  // Setup Swap ----------------------------------------------------------------

  const swap = new Swap({
    data,
    connection: room.connection,
  })

  swap.setFlow(ETH2BTC, {
    ethSwap: new EthSwap({
      web3,
      address: '0xa283cc6666fe6c08e96773596f51f850f7038627',
      abi: [ { "constant": false, "inputs": [ { "name": "_user", "type": "address" } ], "name": "changeRating", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_participantAddress", "type": "address" } ], "name": "close", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_secretHash", "type": "bytes20" }, { "name": "_participantAddress", "type": "address" } ], "name": "create", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_participantAddress", "type": "address" } ], "name": "refund", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_ratingContractAddress", "type": "address" } ], "name": "setRatingAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "participantAddress", "type": "address" } ], "name": "sign", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "constant": false, "inputs": [ { "name": "_secret", "type": "bytes32" }, { "name": "_ownerAddress", "type": "address" } ], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "_participantAddress", "type": "address" } ], "name": "checkIfSigned", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_ownerAddress", "type": "address" }, { "name": "_participantAddress", "type": "address" } ], "name": "getInfo", "outputs": [ { "name": "", "type": "uint256" }, { "name": "", "type": "bytes32" }, { "name": "", "type": "bytes20" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_participantAddress", "type": "address" } ], "name": "getSecret", "outputs": [ { "name": "", "type": "bytes32" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_ownerAddress", "type": "address" }, { "name": "_participantAddress", "type": "address" } ], "name": "unsafeGetSecret", "outputs": [ { "name": "", "type": "bytes32" } ], "payable": false, "stateMutability": "view", "type": "function" } ],
      gasLimit: config.eth.gasLimit
    }),
    btcSwap: new BtcSwap({
      fetchUnspents: (address) => request.get(`${config.api.bitpay}/addr/${address}/utxo`),
    }),
    getBalance: async () => await ethereum.getBalance(user[`${sellCurrency.toLowerCase()}Data`].address),
  })
  
  // Subscribe ------------------------------------------------------------------

  swap.flow.storage.on('update', (values) => {
    console.log('new flow storage values', values)

    scope.data = {
      flow: values,
    }
    // do smth here if necessary
    scope.$scan()

    localStorage.setItem('swap:eth2btc', values)
  })

  swap.flow.on('leaveStep', (index) => {
    console.log('leave step', index)
  })

  swap.flow.on('enterStep', (index) => {
    console.log('\n\n-----------------------------\n')
    console.log('enter step', index)
  })

  // ----------------------------------------------------------------

  scope.updateBalance = () => {
    swap.flow.syncBalance()
  }


  ethToBtc.scope = scope
}


export default ethToBtc
