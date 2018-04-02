import { localStorage } from 'helpers'
import { merge } from 'lodash'
import reputation from 'swaps/reputation'
import bitcoin from './bitcoin'
import ethereum from './ethereum'
import EA from './EA'
import room from './room'


class User {

  constructor() {
    this.peer = null
    this.reputation = 0
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

    room.once('ready', () => {
      this.sign()
      this.getBalances()
      this.getReputation()
    })
  }

  sign() {
    // chrome 0x5618fc7da976842efc5cb11af77050755c8e1ca8d32de35afd9923f11f327a9e
    // yandex 0x3111c5cb43fc75e26595278ad9dc5dbb9e57c09a880633a7675ea756c958623e
    const ethPrivateKey = localStorage.getItem('user:privateEthKey')
    // chrome cRkKzpir8GneA48iQVjSpUGT5mopFRTGDES7Kb43JduzrbhuVncn
    // yandex cT5n9yx1xw3TcbvpEAuXvzhrTb5du4RAYbAbTqHfZ9nbq6gJQMGn
    const btcPrivateKey = localStorage.getItem('user:privateBtcKey')

    this.ethData = ethereum.login(ethPrivateKey)
    this.btcData = bitcoin.login(btcPrivateKey)

    localStorage.setItem('user:privateEthKey', this.ethData.privateKey)
    localStorage.setItem('user:privateBtcKey', this.btcData.privateKey)
  }

  async getBalances(currency='all') {
    if (currency === 'eth' || currency ==='all') {
      this.ethData.balance = await ethereum.getBalance(this.ethData.address)
    }
    if (currency === 'btc' || currency === 'all') {
      this.btcData.balance = await bitcoin.getBalance(this.btcData.address)
    }
  }

  async getReputation() {
    this.reputation = await reputation.get(this.ethData.address)
  }

  getTransactions() {
    ethereum.getTransaction(this.ethData.address)
    bitcoin.getTransaction(this.btcData.address)
  }

  createOrder(data) {
    return {
      ...data,
      owner: {
        address: this.ethData.address,
        peer: this.peer,
        // TODO move `reputation` to room.peers and add to all orders related to such user
        reputation: this.reputation,
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
    if(!settings) {

      return
    }

    if (name === 'all') {
      return settings
    }

    if(typeof settings[name] !== 'undefined') {
      return settings[name]
    }

    return
  }
}


export default new User()
