import BigInteger from 'bigi'
import bitcoin from 'bitcoinjs-lib'
import localStorage from 'helpers/localStorage'
import config from 'helpers/config'
import EA from './EA'
import rates from "./rates";
import {main} from "../controllers";
import {showMess} from "../helpers";


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

  async getRate() {

    const rate = rates.getRate()
    return rate;
  }

  send(to, amount) {
    const newtx = {
      inputs: [
        {
          addresses: [this.data.address],
        },
      ],
      outputs: [
        {
          addresses: [to],
          value: amount * 100000000,
        },
      ],
    }

    if (amount > this.data.balance) {
      showMess('На вашем балансе недостаточно средств', 5, 0)

      return false
    }
    $.post('https://api.blockcypher.com/v1/btc/test3/txs/new', JSON.stringify(newtx))
      .then((d) => {
        // convert response body to JSON
        let tmptx = d

        // attribute to store public keys
        tmptx.pubkeys = []

        // build signer from WIF
        let keys = new bitcoin.ECPair.fromWIF(this.data.keyPair.toWIF(), bitcoin.networks.testnet)

        // iterate and sign each transaction and add it in signatures while store corresponding public key in pubkeys
        tmptx.signatures = tmptx.tosign.map((tosign, n) => {
          tmptx.pubkeys.push(keys.getPublicKeyBuffer().toString('hex'));

          return keys.sign(BigInteger.fromHex(tosign.toString('hex')).toBuffer()).toDER().toString('hex')
        })

        $.post('https://api.blockcypher.com/v1/btc/test3/txs/send', JSON.stringify(tmptx)).then((r) => {
          showMess('Платеж прошел', 5, 1)
        })
      })

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
      keyPair,
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
      $.getJSON(`${config.api.bitpay}/addr/${this.data.address}`, ({ balance }) => {
        console.log('BTC Balance:', balance)

        this.data.balance = balance
        resolve(balance)

        EA.dispatchEvent('btc:updateBalance', balance)
      })
    })
  }

  getTransaction() {
    return new Promise((resolve) => {
      if (this.data.address) {
        const url = `${config.api.blocktrail}/address/${this.data.address}/transactions?api_key=${config.apiKeys.blocktrail}`
        let address = this.data.address
        let transactions = []

        $.getJSON(url, (r) => {
          if (r.total) {
            $.each(r.data, function (k, i) {
              transactions.push({
                status: i.block_hash != null ? 1 : 0,
                value: i.outputs[0].value / 1e8,
                address: i.outputs[0].address,
                date: i.time,
                type: address.toLocaleLowerCase() === i.outputs[0].address.toLocaleLowerCase() ? 'in' : 'out'
              })
            })

            resolve(transactions)

            EA.dispatchEvent('btc:updateTransactions', transactions.reverse())
          }
          else {
            console.log(r.result)
          }
        })
      }
    })
  }

  fetchUnspents() {
    return new Promise((resolve, reject) => {
      $.getJSON(`${config.api.bitpay}/addr/${this.data.address}/utxo`, (res) => {
        resolve(res)
      })
    })
  }

  broadcastTx(txRaw) {
    return new Promise((resolve, reject) => {
      $.post(`${config.api.bitpay}/tx/send`, { rawtx: txRaw }, (res) => {
        resolve(res)
      })
    })
  }
}


export default new Bitcoin()
