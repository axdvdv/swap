import user from 'instances/user'
import ethereum from 'instances/ethereum'
import { config } from 'helpers'

const address = '0x2650528f848472f346c9f72011e74410f4ebf60f'
const abi = [{"constant":false,"inputs":[{"name":"_secret","type":"bytes32"},{"name":"_ownerAddress","type":"address"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_secretHash","type":"bytes20"},{"name":"_unlockTime","type":"uint256"}],"name":"open","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"refund","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getSecret","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]


const contract = ethereum.getContract(abi, address)


/**
 *
 * @param {object} data
 * @param {string} data.secretHash
 * @param {number} data.lockTime
 * @param {function} handleTransaction
 */
const create = ({ secretHash, lockTime }, handleTransaction) =>
  new Promise(async (resolve, reject) => {
    const hash      = `0x${secretHash.replace(/^0x/, '')}`
    const lockTime  = Math.floor(Date.now() / 1000) + 3600 * 3 // 3 days

    // const gasLimit = await contract.methods.open(hash, lockTime).estimateGas({ from: user.ethData.address })

    const params = {
      from: user.ethData.address,
      gas: config.eth.gasLimit,
      // gasPrice: config.eth.gasPrice,
      value: ethereum.core.utils.toWei(String(0.005)),
    }

    console.log('Start creating ETH Swap', { arguments: { secretHash: hash, lockTime }, params })

    const receipt = await contract.methods.open(hash, lockTime).send(params)
      .on('transactionHash', (hash) => {
        console.log('ETH Swap > transactionHash', `https://rinkeby.etherscan.io/tx/${hash}`)
        handleTransaction && handleTransaction(`https://rinkeby.etherscan.io/tx/${hash}`)
      })
      .on('confirmation', (confirmationNumber) => {
        // console.log('ETH Swap > confirmation', confirmationNumber)
      })
      .on('error', (err) => {
        console.error('ETH Swap > receipt', err)

        reject()
      })

    console.log('ETH Swap created:', receipt)
    resolve(receipt)
  })

/**
 *
 * @param {string} secret
 * @param {string} ownerAddress
 * @param {function} handleTransaction
 */
const withdraw = ({ secret: _secret, ownerAddress }, handleTransaction) =>
  new Promise(async (resolve, reject) => {
    const secret = `0x${_secret.replace(/^0x/, '')}`

    const params = {
      from: user.ethData.address,
      gas: config.eth.gasLimit,
      // gasPrice: config.eth.gasPrice,
    }

    console.log('Start withdraw from ETH Swap', { arguments: { secret, ownerAddress }, params })

    const receipt = await contract.methods.withdraw(secret, ownerAddress).send(params)
      .on('transactionHash', (hash) => {
        console.log('ETH Swap > transactionHash', `https://rinkeby.etherscan.io/tx/${hash}`)
        handleTransaction && handleTransaction(`https://rinkeby.etherscan.io/tx/${hash}`)
      })
      .on('confirmation', (confirmationNumber) => {
        // console.log('ETH Swap > confirmation', confirmationNumber)
      })
      .on('error', (err) => {
        console.error('ETH Swap > receipt', err)

        reject()
      })

    console.log('ETH Swap withdraw complete:', receipt)
    resolve(receipt)
  })

const getSecret = () =>
  new Promise(async (resolve, reject) => {
    console.log('Start getting secret from ETH Swap')

    const secret = await contract.methods.getSecret().call()

    console.log('ETH Swap secret:', secret)
    resolve(secret)
  })


export default {
  create,
  withdraw,
  getSecret,
}
