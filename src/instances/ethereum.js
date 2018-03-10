import Web3 from 'web3'
import localStorage from 'helpers/localStorage'
import EA from './EA'
import {user} from "./index";
import config from "../helpers/config";


class Ethereum {

  constructor() {
    this.core = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/JCnK5ifEPH9qcQkX0Ahl"))
    this.data = {
      address: '0x0',
      balance: 0,
    }

    window.ethereum = this
  }

  login() {
    let privateKey = localStorage.getItem('user:privateEthKey')

    if (privateKey) {
      this.data = this.core.eth.accounts.privateKeyToAccount(privateKey)
    }
    else {
      this.data = this.core.eth.accounts.create()

      this.core.eth.accounts.wallet.add(this.data)
      this.core.eth.accounts.wallet.save('qwerty123')
    }

    this.core.eth.accounts.wallet.add(this.data.privateKey)

    localStorage.setItem('user:privateEthKey', this.data.privateKey)

    console.log('Logged in with Ethereum', this.data)

    EA.dispatchEvent('eth:login', this.data)

    return this.data
  }

  getTransaction() {

    return new Promise((resolve) => {

      if (this.data.address) {
        const url = `http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${this.data.address}&startblock=0&endblock=99999999&sort=asc&apikey=${config.api.blocktrail}`
        let transactions = [];
        let address = this.data.address.toLowerCase()

       $.getJSON(url, (r) => {

          if(r.status) {

            $.each(r.result, function (k, i) {

              transactions.push(
                {
                  status: i.blockHash != null ? 1 : 0,
                  value: i.value / 1000000000000000000,
                  address: i.to,
                  date: new Date(i.timeStamp * 1000),
                  type: address == i.to.toLowerCase() ? 'in' : 'out'
                });
            })

            resolve(transactions)

            EA.dispatchEvent('eth:updateTransactions', transactions.reverse())

          } else {

            console.log(r.result)
          }
        });
      }
    })
  }


  getBalance() {
    return new Promise((resolve) => {
      this.core.eth.getBalance(this.data.address)
        .then((wei) => {
          const balance = Number(this.core.utils.fromWei(wei))

          console.log('ETH Balance:', balance)

          this.data.balance = balance
          resolve(balance)

          EA.dispatchEvent('eth:updateBalance', balance)
        })
    })
  }

  getContract(abi, address) {
    return new this.core.eth.Contract(abi, address)
  }
}


export default new Ethereum()
