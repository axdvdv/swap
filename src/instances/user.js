import BigInteger from 'bigi'
import { main } from 'controllers'
import { showMess, localStorage } from 'helpers'
import { ethSwap } from 'swaps'
import bitcoin from './bitcoin'
import ethereum from './ethereum'
import EA from './EA'
import { merge } from 'lodash'



class User {

  constructor() {
    this.peer = null
    this.ethData = ethereum.data
    this.btcData = bitcoin.data
    this.localStorageName = 'user:settings';

    window.user = this

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
    this.ethData = ethereum.login()
    this.btcData = bitcoin.login()
  }

  getTransactions() {
    ethereum.getTransaction()
    bitcoin.getTransaction()
  }

  getBalances() {
    ethereum.getBalance()
    bitcoin.getBalance()
  }

  createOrder(data) {
    return {
      ...data,
      owner: {
        address: this.ethData.address,
        peer: this.peer,
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
