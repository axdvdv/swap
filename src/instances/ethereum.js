import Web3 from 'web3'
import localStorage from 'helpers/localStorage'
import config from 'helpers/config'
import showMess from 'helpers/showMess'
import rates from './rates'
import EA from './EA'


class Ethereum {

  constructor() {
    this.core = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/JCnK5ifEPH9qcQkX0Ahl"))
    this.data = {
      address: '0x0',
      balance: 0

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

  getTransaction() {
    return new Promise((resolve) => {
      if (this.data.address) {
        const url = `http://api-rinkeby.etherscan.io/api?module=account&action=txlist&address=${this.data.address}&startblock=0&endblock=99999999&sort=asc&apikey=${config.apiKeys.blocktrail}`
        let address = this.data.address.toLowerCase()
        let transactions = []

        $.getJSON(url, (r) => {
          if (r.status) {
            $.each(r.result, function (k, i) {
              transactions.push({
                status: i.blockHash != null ? 1 : 0,
                value: i.value / 1000000000000000000,
                address: i.to,
                date: new Date(i.timeStamp * 1000),
                type: address == i.to.toLowerCase() ? 'in' : 'out'
              })
            })

            resolve(transactions)

            EA.dispatchEvent('eth:updateTransactions', transactions.reverse())
          }
          else {
            console.log(r.result)
          }
        })
      }
    })
  }

  send(to, amount) {

    ethereum.core.eth.getBalance(this.data.address).then((r) => {
      try {
        let balance = ethereum.core.utils.fromWei(r)


        if (balance == 0) {
          console.log('empty')
          notifications.append({type: 'notification', text: 'Ваш баланс пуст'})
          $('.modal').modal('hide')
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

        const t = {
          from: this.ethData.address,
          to: to,
          gas: "21000",
          gasPrice: "20000000000",
          value: ethereum.core.utils.toWei(amount.trim())
        }

        ethereum.core.eth.accounts.signTransaction(t, localStorage.getItem('privateEthKey'))
          .then((result) => {
            return ethereum.core.eth.sendSignedTransaction(result.rawTransaction)
          })
          .then((receipt) => {

            showMess('Good', 5, 1)

          })
          .catch(error => console.error(error))
      }
      catch (e) {
        console.error(e)
      }
    })
  }

  getRate()  {
    return rates.getRate()
  }

  getContract(abi, address) {
    return new this.core.eth.Contract(abi, address)
  }
}


export default new Ethereum()
