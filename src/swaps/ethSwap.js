import user from 'instances/user'
import ethereum from 'instances/ethereum'
import { config } from 'helpers'

const address = '0xffd631cf3ac7a4f1c41027158e17e9d0a1e1de09'
const abi = [{"constant":false,"inputs":[{"name":"_secret","type":"bytes32"},{"name":"_ownerAddress","type":"address"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_secretHash","type":"bytes20"},{"name":"_unlockTime","type":"uint256"}],"name":"open","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"refund","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"getSecret","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]

const contract = ethereum.getContract(abi, address)


/**
 *
 * @param {object} data
 * @param {string} data.secretHash
 * @param {number} data.lockTime
 */
const create = ({ secretHash, lockTime }) =>
  new Promise(async (resolve, reject) => {
    const hash      = `0x${secretHash.replace(/^0x/, '')}`
    const lockTime  = Math.floor(Date.now() / 1000) + 3600 * 3 // 3 days

    // const gasLimit = await contract.methods.open(hash, lockTime).estimateGas({ from: user.ethData.address })

    const params = {
      from: user.ethData.address,
      gas: config.eth.gasLimit,
      value: ethereum.core.utils.toWei(String(0.005)),
    }

    console.log('Start creating ETH Swap', { arguments: { secretHash: hash, lockTime }, params })

    const receipt = await contract.methods.open(hash, lockTime).send(params)
      .on('transactionHash', (hash) => {
        console.log('ETH Swap > transactionHash', `https://ropsten.etherscan.io/tx/${hash}`)
      })
      .on('confirmation', (confirmationNumber) => {
        console.log('ETH Swap > confirmation', confirmationNumber)
      })
      .on('error', (err) => {
        console.error('ETH Swap > receipt', err)

        reject()
      })

    console.log('ETH Swap created:', receipt)
    resolve(receipt)
  })


export default {
  create,
}
