import BigInteger from 'bigi'
import bitcoin from 'bitcoinjs-lib'
import localStorage from 'helpers/localStorage'


class Bitcoin {

  constructor() {
    this.core = bitcoin
    this.testnet = bitcoin.networks.testnet
    this.data = null
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
      const rng   = () => Buffer.from('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')

      keyPair     = bitcoin.ECPair.makeRandom({ network: this.testnet, rng })
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

    return this.data
  }
}


export default new Bitcoin()
