import { web3 } from 'instances'


const address = '0xffd631cf3ac7a4f1c41027158e17e9d0a1e1de09'
const abi = [{"constant":false,"inputs":[{"name":"_secret","type":"bytes32"},{"name":"_ownerAddress","type":"address"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_secretHash","type":"bytes20"},{"name":"_unlockTime","type":"uint256"}],"name":"open","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"refund","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"getSecret","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]

const contract = web3.eth.contract(abi).at(address)


/**
 *
 * @param {object} data
 * @param {string} data.secretHash
 * @param {number} data.unlockTime
 */
const create = ({ secretHash, unlockTime }) =>
  new Promise((resolve, reject) => {
    const lockTime = Math.floor(Date.now() / 1000) + 3600 * 3 // 3 days

    contract.open.sendTransaction(secretHash, lockTime, (err, res) => {
      if (err) {
        return reject(err)
      }

      console.log('ETH Swap created', res)

      resolve(res)
    })
  })


export default {
  create,
}
