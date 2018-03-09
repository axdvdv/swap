import Web3 from 'web3'
import localStorage from 'helpers/localStorage'
import EA from './EA'


class Ethereum {

  constructor() {
    this.core = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/JCnK5ifEPH9qcQkX0Ahl"))
    this.data = {
      address: '0x0',
      balance: 0,
    }
  }

  login() {
    let privateKey = localStorage.getItem('user:privateEthKey')

    if (privateKey) {
      this.data = this.core.eth.accounts.privateKeyToAccount(privateKey)
    }
    else {
      this.data = this.core.eth.accounts.create()

      this.core.eth.accounts.wallet.add(this.data)
      this.core.eth.accounts.wallet.save('qwerty123')
    }

    this.data = {
      ...this.data,
      privateKey,
    }

    this.core.eth.accounts.wallet.add(this.data.privateKey)

    localStorage.setItem('user:privateEthKey', this.data.privateKey)

    console.log('Logged in with Ethereum', this.data)

    EA.dispatchEvent('eth:login', this.data)

    return this.data
  }

  getBalance() {
    return new Promise((resolve) => {
      this.core.eth.getBalance(this.data.address)
        .then((wei) => {
          const balance = Number(this.core.utils.fromWei(wei))

          console.log('ETH Balance:', balance)

          this.data.balance = balance
          resolve(balance)

          EA.dispatchEvent('eth:updateBalance', balance)
        })
    })
  }

  getContract(abi, address) {
    return new this.core.eth.Contract(abi, address)
  }
}


export default new Ethereum()
