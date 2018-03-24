import { localStorage } from 'helpers'
import bitcoin from './bitcoin'
import ethereum from './ethereum'
import EA from './EA'
import { merge } from 'lodash'


class User {

  constructor() {
    this.peer = null
    this.rating = 0
    this.ethData = {
      address: '0x0',
      balance: 0,
    }
    this.btcData = {
      address: '0x0',
      balance: 0,
    }
    this.localStorageName = 'user:settings'

    global.user = this

    this.onMount()
  }

  onMount() {
    EA.once('ipfs:ready', ({ peer }) => {
      this.peer = peer
    })

    EA.once('room:ready', () => {
      this.sign()
      this.getBalances()
    })
  }

  sign() {
    const ethPrivateKey = localStorage.getItem('user:privateEthKey')
    const btcPrivateKey = localStorage.getItem('user:privateBtcKey')

    this.ethData = ethereum.login(ethPrivateKey)
    this.btcData = bitcoin.login(btcPrivateKey)

    localStorage.setItem('user:privateEthKey', this.ethData.privateKey)
    localStorage.setItem('user:privateBtcKey', this.btcData.privateKey)
  }

  getTransactions() {

    ethereum.getTransaction(this.ethData.address)
    bitcoin.getTransaction(this.btcData.address)
  }

  async getBalances(currency='all') {

    if(currency == 'eth' || currency=='all') {
      this.ethData.balance = await ethereum.getBalance(this.ethData.address)
    }
    if(currency == 'btc' || currency == 'all') {
      this.btcData.balance = await bitcoin.getBalance(this.btcData.address)
    }
  }

  createOrder(data) {
    return {
      ...data,
      owner: {
        address: this.ethData.address,
        peer: this.peer,
        rating: this.rating,
      },
    }
  }

  saveSettings(data) {
    let settings = localStorage.getItem(this.localStorageName) || {}
    settings = merge(settings, data)

    console.log(settings)

    if (true) {
      localStorage.setItem(this.localStorageName, settings)
    }
  }

  getSettings(name) {
    let settings = localStorage.getItem(this.localStorageName)

    if (name === 'all') {
      return settings
    }

    if(settings[name]) {
      return settings[name]
    }

    console.log(`setting {$name} is missing`)

    return false
  }
}


export default new User()
