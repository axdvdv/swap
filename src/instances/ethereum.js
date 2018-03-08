import Web3 from 'web3'
import localStorage from 'helpers/localStorage'


class Ethereum {

  constructor() {
    this.core = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/JCnK5ifEPH9qcQkX0Ahl"))
    this.data = null
  }

  login() {
    let privateKey = localStorage.getItem('user:privateEthKey')

    if (privateKey) {
      this.data = this.core.eth.accounts.privateKeyToAccount(privateKey)
    }
    else {
      this.data = this.core.eth.accounts.create()
    }

    localStorage.setItem('user:privateEthKey', this.data.privateKey)

    console.log('Logged in with Ethereum', this.data)

    return this.data
  }

  getContract(abi, address) {
    return new this.core.eth.Contract(abi, address)
  }
}


export default new Ethereum()
