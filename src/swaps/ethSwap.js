import user from 'instances/user'
import ethereum from 'instances/ethereum'

const address = '0xffd631cf3ac7a4f1c41027158e17e9d0a1e1de09'
const abi = [{"constant":false,"inputs":[{"name":"_secret","type":"bytes32"},{"name":"_ownerAddress","type":"address"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_secretHash","type":"bytes20"},{"name":"_unlockTime","type":"uint256"}],"name":"open","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"refund","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"getSecret","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]

const contract = ethereum.getContract(abi, address)


/**
 *
 * @param {object} data
 * @param {string} data.secretHash
 * @param {number} data.unlockTime
 */
const create = ({ secretHash, unlockTime }) =>
  new Promise((resolve, reject) => {
    console.log('Start creating ETH Swap', { secretHash, unlockTime })

    const hash      = `0x${secretHash.replace(/^0x/, '')}`
    const lockTime  = Math.floor(Date.now() / 1000) + 3600 * 3 // 3 days
    const params    = ethereum.getGasParams(0.005)

    console.log('hash', hash)
    console.log('lockTime', lockTime)
    console.log('params', params)

    contract.methods.open(hash, lockTime).send(params)
      .on('transactionHash', (hash) => {
        console.log('ETH Swap > transactionHash', hash)
      })
      .on('confirmation', (confirmationNumber, receipt) => {
        console.log('ETH Swap > confirmation', confirmationNumber, receipt)
      })
      .on('receipt', (receipt) => {
        console.log('ETH Swap > receipt', receipt)

        resolve()
      })
      .on('error', (err) => {
        console.error('ETH Swap > receipt', err)
      })
  })


export default {
  create,
}
