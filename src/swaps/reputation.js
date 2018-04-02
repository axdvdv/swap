import ethereum from 'instances/ethereum'


const address   = '0xa8c428737d8cb92009d0b4eea2b48ac02e4de4cb'
const abi       = [ { "constant": true, "inputs": [], "name": "getMy", "outputs": [ { "name": "", "type": "int256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_userAddress", "type": "address" } ], "name": "get", "outputs": [ { "name": "", "type": "int256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_userAddress", "type": "address" }, { "name": "_delta", "type": "int256" } ], "name": "change", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "name": "_ownerAddress", "type": "address" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" } ]


class Reputation {

  constructor(address, abi) {
    this.contract = ethereum.getContract(abi, address)
  }

  get(address) {
    return new Promise(async (resolve, reject) => {
      console.log('\n\nStart getting user reputation')

      const reputation = await this.contract.methods.get(address).call({
        from: address,
      })

      resolve(reputation)
    })
  }
}


export default new Reputation(address, abi)

export {
  Reputation,
}
