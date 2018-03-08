import BigInteger from 'bigi'
import bitcoin from 'bitcoinjs-lib'
import localStorage from 'helpers/localStorage'
import config from 'helpers/config'
import EA from './EA'


class Bitcoin {

  constructor() {
    this.core = bitcoin
    this.testnet = bitcoin.networks.testnet
    this.data = {
      address: '0x0',
      balance: 0,
    }
  }

  login() {
    let privateKey = localStorage.getItem('user:privateBtcKey')
    let keyPair

    if (privateKey) {
      const hash  = bitcoin.crypto.sha256(privateKey)
      const d     = BigInteger.fromBuffer(hash)

      keyPair     = new bitcoin.ECPair(d, null, { network: this.testnet })
    }
    else {
      keyPair     = bitcoin.ECPair.makeRandom({ network: this.testnet })
      privateKey  = keyPair.toWIF()
    }

    const address     = keyPair.getAddress()
    const keys        = new bitcoin.ECPair.fromWIF(privateKey, this.testnet)
    const publicKey   = keys.getPublicKeyBuffer().toString('hex')

    this.data = {
      address,
      privateKey,
      publicKey,
    }

    localStorage.setItem('user:privateBtcKey', privateKey)

    console.log('Logged in with Bitcoin', this.data)

    EA.dispatchEvent('btc:login', this.data)

    return this.data
  }

  getBalance() {
    return new Promise((resolve) => {
      const url = `https://api.blocktrail.com/v1/tbtc/address/${this.data.address}?api_key=${config.blocktrailAPIKey}`

      $.getJSON(url, ({ balance }) => {
        console.log('BTC Balance:', balance)

        this.data.balance = balance
        resolve(balance)

        EA.dispatchEvent('btc:updateBalance', balance)
      })
    })
  }
}


export default new Bitcoin()
