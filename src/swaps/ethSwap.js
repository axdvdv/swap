import { config } from 'helpers'
import { web3 } from 'instances/ethereum'
import EthSwap from 'core/swaps/EthSwap'


const address   = '0xa283cc6666fe6c08e96773596f51f850f7038627'
const abi       = [ { "constant": false, "inputs": [ { "name": "_user", "type": "address" } ], "name": "changeRating", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_participantAddress", "type": "address" } ], "name": "close", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_secretHash", "type": "bytes20" }, { "name": "_participantAddress", "type": "address" } ], "name": "create", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_participantAddress", "type": "address" } ], "name": "refund", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_ratingContractAddress", "type": "address" } ], "name": "setRatingAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "participantAddress", "type": "address" } ], "name": "sign", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "constant": false, "inputs": [ { "name": "_secret", "type": "bytes32" }, { "name": "_ownerAddress", "type": "address" } ], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "_participantAddress", "type": "address" } ], "name": "checkIfSigned", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_ownerAddress", "type": "address" }, { "name": "_participantAddress", "type": "address" } ], "name": "getInfo", "outputs": [ { "name": "", "type": "uint256" }, { "name": "", "type": "bytes32" }, { "name": "", "type": "bytes20" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_participantAddress", "type": "address" } ], "name": "getSecret", "outputs": [ { "name": "", "type": "bytes32" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_ownerAddress", "type": "address" }, { "name": "_participantAddress", "type": "address" } ], "name": "unsafeGetSecret", "outputs": [ { "name": "", "type": "bytes32" } ], "payable": false, "stateMutability": "view", "type": "function" } ]

const ethSwap = new EthSwap({
  web3,
  address,
  abi,
  gasLimit: config.eth.gasLimit,
})


export default ethSwap

export {
  EthSwap,
}
