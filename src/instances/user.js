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

    let settings =  localStorage.getItem(this.localStorageName) || {};
    settings = merge(settings, data);

    console.log(settings)

    if(1) {
      localStorage.setItem(this.localStorageName,  settings)
    }
  }

  getSettings(name) {

    let settings =  localStorage.getItem('user:settings');
    if(name == 'all') {

      return settings;
    }

    if(settings[name]) {

      return settings[name];
    }
    console.log(`setting {$name} is missing`)
    return false;
  }

  withdrawEth(to, amount) {


    this.saveSettings({withdraw_eth_address: to});

    ethereum.core.eth.getBalance(this.ethData.address).then((r) => {
      try {

        let balance = ethereum.core.utils.fromWei(r)


        if (!balance) {
          // throw new Error('Ваш баланс пуст')
          showMess('Ваш баланс пуст', 5, 0)
          return false
        }

        if (balance < amount) {
          // throw new Error('На вашем балансе недостаточно средств')
          showMess('На вашем балансе недостаточно средств', 5, 0)
          return false
        }

        if (!ethereum.core.utils.isAddress(to)) {
          // throw new Error('Не верный адрес')
          showMess('Не верный адрес', 5, 0)
          return false
        }


        return

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

          })
          .catch(error => console.error(error))
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
    // url = '${config.api.blocktrail}address/'+main.scope.bitcoin_address+'/unspent-outputs?api_key=MY_APIKEY'
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
