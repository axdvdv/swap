import Web3 from 'web3'
import bitcoin from 'bitcoinjs-lib'
import BigInteger from 'bigi'
import { main } from 'controllers'
import { Order } from 'models'
import { showMess } from 'helpers'
import EA from './EA'


class User {

  constructor() {
    this.web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/JCnK5ifEPH9qcQkX0Ahl"))
    this.peer = null
    this.data = {}
    this.bitcoinData = {}

    this.onMount()
  }

  onMount() {
    EA.subscribe('ipfs:ready', ({ connection }) => {
      this.peer = connection._peerInfo.id.toB58String()
    })
  }

  createOrder(data) {
    return new Order({
      ...data,
      owner: {
        address: this.data.address,
        peer: this.peer,
      },
    })
  }

  sendTransactionEth(modal) {
    this.web3.eth.getBalance(this.data.address).then((r) => {
      try {
        main.scope.balance = this.web3.utils.fromWei(r)

        if (!main.scope.balance) {
          // throw new Error('Ваш баланс пуст')
          showMess('Ваш баланс пуст', 5, 0)
          return false
        }

        if (main.scope.balance < main.scope.withdraw_eth_amount) {
          // throw new Error('На вашем балансе недостаточно средств')
          showMess('На вашем балансе недостаточно средств', 5, 0)
          return false
        }

        if (!this.web3.utils.isAddress(main.scope.withdraw_eth_address)) {
          // throw new Error('Не верный адрес')
          showMess('Не верный адрес', 5, 0)
          return false
        }

        const t = {
          from: main.scope.address,
          to: main.scope.withdraw_eth_address,
          gas: "21000",
          gasPrice: "20000000000",
          value: this.web3.utils.toWei(main.scope.withdraw_eth_amount.toString())
        }

        this.web3.eth.accounts.signTransaction(t,localStorage.getItem('privateKey'))
          .then((result) => {
            return this.web3.eth.sendSignedTransaction(result.rawTransaction)
          })
          .then((receipt) => {
            showMess('Good', 5, 1)

            console.log('good')

            const m = $(modal)

            if (m.length > 0) {
              m.modal('hide')
            }
          })
          .catch(error => console.error(error))

        // this.web3.eth.sendTransaction({
        //   from: main.scope.address,
        //   to: main.scope.withdraw_eth_address,
        //   amount: this.web3.utils.toWei(main.scope.withdraw_eth_amount.toString())
        // }).then(function(err, resp) {
        //   showMess('Error', 5, 0)
        //   console.log(err)
        //   console.log(resp)
        // })
      }
      catch (e) {
        main.scope.showError(e)
      }
    })
  }

  sendTransactionBtc(modal) {
    const newtx = {
      inputs: [
        {
          addresses: [ main.scope.bitcoin_address ],
        },
      ],
      outputs: [
        {
          addresses: [ main.scope.withdraw_btc_address ],
          value: main.scope.withdraw_btc_amount * 100000000,
        },
      ],
    }

    if (main.scope.withdraw_btc_amount > main.scope.bitcoin_balance) {
      showMess('На вашем балансе недостаточно средств', 5, 0)
      // alert('На вашем балансе недостаточно средств')
      return false
    }

    $.post('https://api.blockcypher.com/v1/btc/test3/txs/new', JSON.stringify(newtx))
      .then((d) => {
        // convert response body to JSON
        let tmptx =  d

        // attribute to store public keys
        tmptx.pubkeys = []

        // build signer from WIF
        let keys = new bitcoin.ECPair.fromWIF(this.bitcoinData.keyPair.toWIF(),  bitcoin.networks.testnet)

        // iterate and sign each transaction and add it in signatures while store corresponding public key in pubkeys
        tmptx.signatures = tmptx.tosign.map((tosign, n) => {
          tmptx.pubkeys.push(keys.getPublicKeyBuffer().toString('hex'));

          return keys.sign(BigInteger.fromHex(tosign.toString('hex')).toBuffer()).toDER().toString('hex')
        })

        $.post('https://api.blockcypher.com/v1/btc/test3/txs/send',JSON.stringify(tmptx)).then((r) => {
          showMess('Платеж прошел', 5, 1)
          
          console.log(r)
          
          const m = $(modal)
          
          if (m.length > 0) {
            m.modal('hide')
          }
        })
      })

    // const txb = new bitcoin.TransactionBuilder(bitcoin.networks.testnet)
    //
    // //https://api.blocktrail.com/v1/btc/address/17hFoVScNKVDfDTT6vVhjYwvCu6iDEiXC4/transactions?api_key=MY_APIKEY
    // url = 'https://api.blocktrail.com/v1/tbtc/address/'+main.scope.bitcoin_address+'/unspent-outputs?api_key=MY_APIKEY'
    // jQuery.getJSON(url, (r) => {
    //   txb.addInput(r.data[0].hash, 1)
    //   txb.addOutput(main.scope.withdraw_btc_address, main.scope.withdraw_btc_amount * 100000000)
    //   txb.sign(0, this.bitcoinData.keyPair)
    //
    //   const pushtx = {
    //     tx: txb.build().toHex()
    //   }
    //
    //   $.post('https://api.blockcypher.com/v1/btc/test3/txs/push', JSON.stringify(pushtx)).then(function (r) {
    //
    //     console.log(r)
    //   })
    //
    // })
  }

  sign() {
    const retrievedObject = localStorage.getItem('privateKey')

    if (retrievedObject) {
      try {
        this.data = this.web3.eth.accounts.privateKeyToAccount(retrievedObject)

        this.signBitcoin(retrievedObject)
      }
      catch (e) {
        console.error('2 user cant login')
        console.error(e)
      }

    }
    else {
      try {
        this.data = this.web3.eth.accounts.create()

        localStorage.setItem('privateKey',this.data.privateKey )
        this.signBitcoin(this.data.privateKey)
      }
      catch (e) {
        console.error('1 user cant login')
        console.error(e)
      }
    }
  }

  signBitcoin(key) {
    // const publicKey = key
    // const publicKeyHash = bitcoin.crypto.hash160(publicKey)
    // const address =  bitcoin.address.toBase58Check(publicKeyHash, bitcoin.networks.bitcoin.pubKeyHash)
    // const address =  bitcoin.address.toBase58Check(publicKeyHash, bitcoin.networks.testnet.pubKeyHash)

    const hash      = bitcoin.crypto.sha256(key)
    const d         = BigInteger.fromBuffer(hash)
    const keyPair   = new bitcoin.ECPair(d, null, {network: bitcoin.networks.testnet})
    const address   = keyPair.getAddress()

    this.bitcoinData = {
      address,
      keyPair,
    }
  }
}


export default new User()
