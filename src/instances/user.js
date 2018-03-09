import BigInteger from 'bigi'
import { main } from 'controllers'
import { showMess, localStorage } from 'helpers'
import { ethSwap } from 'swaps'
import bitcoin from './bitcoin'
import ethereum from './ethereum'
import EA from './EA'


class User {

  constructor() {
    this.peer = null
    this.ethData = ethereum.data
    this.btcData = bitcoin.data

    window.user = this

    this.onMount()
  }

  onMount() {
    EA.once('ipfs:ready', ({ peer }) => {
      this.peer = peer
    })

    EA.once('app:ready', () => {
      this.sign()
      this.getBalances()

    })
  }

  sign() {
    this.ethData = ethereum.login()
    this.btcData = bitcoin.login()
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

  sendTransactionEth(modal) {
    ethereum.core.eth.getBalance(this.ethData.address).then((r) => {
      try {
        main.scope.balance = ethereum.core.utils.fromWei(r)

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

        if (!ethereum.core.utils.isAddress(main.scope.withdraw_eth_address)) {
          // throw new Error('Не верный адрес')
          showMess('Не верный адрес', 5, 0)
          return false
        }

        const t = {
          from: main.scope.address,
          to: main.scope.withdraw_eth_address,
          gas: "21000",
          gasPrice: "20000000000",
          value: ethereum.core.utils.toWei(main.scope.withdraw_eth_amount.toString())
        }

        ethereum.core.eth.accounts.signTransaction(t, localStorage.getItem('privateEthKey'))
          .then((result) => {
            return ethereum.core.eth.sendSignedTransaction(result.rawTransaction)
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

        // ethereum.core.eth.sendTransaction({
        //   from: main.scope.address,
        //   to: main.scope.withdraw_eth_address,
        //   amount: ethereum.core.utils.toWei(main.scope.withdraw_eth_amount.toString())
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
          addresses: [main.scope.bitcoin_address],
        },
      ],
      outputs: [
        {
          addresses: [main.scope.withdraw_btc_address],
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
        let tmptx = d

        // attribute to store public keys
        tmptx.pubkeys = []

        // build signer from WIF
        let keys = new bitcoin.ECPair.fromWIF(this.btcData.keyPair.toWIF(), bitcoin.networks.testnet)

        // iterate and sign each transaction and add it in signatures while store corresponding public key in pubkeys
        tmptx.signatures = tmptx.tosign.map((tosign, n) => {
          tmptx.pubkeys.push(keys.getPublicKeyBuffer().toString('hex'));

          return keys.sign(BigInteger.fromHex(tosign.toString('hex')).toBuffer()).toDER().toString('hex')
        })

        $.post('https://api.blockcypher.com/v1/btc/test3/txs/send', JSON.stringify(tmptx)).then((r) => {
          showMess('Платеж прошел', 5, 1)


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
    //   txb.sign(0, this.btcData.keyPair)
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
}


export default new User()
