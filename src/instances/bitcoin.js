import BigInteger from 'bigi'
import bitcoin from 'bitcoinjs-lib'
import localStorage from 'helpers/localStorage'
import config from 'helpers/config'
import EA from './EA'
import {user} from "./index";


class Bitcoin {

  constructor() {
    this.core = bitcoin
    this.testnet = bitcoin.networks.testnet
    this.data = {
      address: '0x0',
      balance: 0,
    }

    window.bitcoin = this
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

  getTransaction() {

    return new Promise((resolve) => {

      if (this.data.address) {
        const url = `https://api.blocktrail.com/v1/tbtc/address/${this.data.address}/transactions?api_key=${config.api.blocktrail}`
        let transactions = [];
        $.getJSON(url, (r) => {

          if(r.status) {

            $.each(r.result, function (k, i) {

              transactions.push(
                {
                  status: i.blockHash != null ? 1 : 0,
                  value: i.value / 100000000,
                  address: i.to,
                  date: i.timeStamp,
                  type: this.data.address.toLowerCase() == i.to.toLowerCase() ? 'in' : 'out'
                });
            })

            resolve(transactions)

            EA.dispatchEvent('btc:updateTransactions', transactions.reverse())

          } else {

            console.log(r.result)
          }
        });
      }
    })
  }

  getBalance() {
    return new Promise((resolve) => {
      const url = `https://api.blocktrail.com/v1/tbtc/address/${this.data.address}?api_key=${config.api.blocktrail}`


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
