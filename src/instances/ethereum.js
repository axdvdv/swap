import Web3 from 'web3'
import request from 'swap-request'
import config from 'helpers/config'
import EA from './EA'


const web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/JCnK5ifEPH9qcQkX0Ahl'))


class Ethereum {

  constructor() {
    this.core = web3

    global.ethereum = this
    global.wallet = this.core.eth.accounts.wallet
  }

  getRate()  {
    return new Promise((resolve) => {
      request.get('https://noxonfund.com/curs.php')
        .then(({ price_btc }) => {
          resolve(price_btc)
        })
    })
  }

  login(privateKey) {

    let data
    if (privateKey) {
      data = this.core.eth.accounts.privateKeyToAccount(privateKey)
    }
    else {
      data = this.core.eth.accounts.create()
      this.core.eth.accounts.wallet.add(data)
    }

    this.core.eth.accounts.wallet.add(data.privateKey)

    console.info('Logged in with Ethereum', data)
    EA.dispatchEvent('eth:login', data)

    return data
  }

  getBalance(address) {
    return this.core.eth.getBalance(address)
      .then((wei) => {
        const balance = Number(this.core.utils.fromWei(wei))

        EA.dispatchEvent('eth:updateBalance', balance)
        return balance
      })
  }

  getTransaction(address) {
    return new Promise((resolve) => {
      if (address) {
        const url = `http://api-rinkeby.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${config.apiKeys.blocktrail}`
        let transactions

        request.get(url)
          .then((res) => {

            console.log(res)
            if (res.status) {
              transactions = res.result.map((item) => ({
                status: item.blockHash != null ? 1 : 0,
                value: item.value / 1e18,
                address: item.to,
                date: new Date(item.timeStamp * 1000),
                type: address.toLowerCase() === item.to.toLowerCase() ? 'in' : 'out'
              }))

              EA.dispatchEvent('eth:updateTransactions', transactions.reverse())
              resolve(transactions)
            }
            else {
              console.log(res.result)
            }
          })
      }
    })
  }

  send(from, to, amount, privateKey) {

    EA.dispatchEvent('form:hideError')

    return new Promise((resolve, reject) => {
      this.core.eth.getBalance(from).then((r) => {
        try {
          let balance = this.core.utils.fromWei(r)
          if (balance == 0) {

            reject( 'Ваш балансе пуст')
            return
          }

          if (balance < amount) {
            EA.dispatchEvent('form:showError', '#withdrawEth', 'На вашем балансе недостаточно средств')
            reject()
            return
          }

          if (!this.core.utils.isAddress(to)) {

            EA.dispatchEvent('form:showError', '#withdrawEth', 'Адрес не верный')
            reject()
            return
          }

          const t = {
            from: from,
            to: to,
            gas: "21000",
            gasPrice: "20000000000",
            value: ethereum.core.utils.toWei(''+amount)
          }

          this.core.eth.accounts.signTransaction(t, privateKey)
            .then((result) => {
              return this.core.eth.sendSignedTransaction(result.rawTransaction)
            })
            .then((receipt) => {

              resolve(receipt)
            })
            .catch(error => console.error(error))
        }
        catch (e) {
          console.error(e)
        }
      })
    })
  }

  getContract(abi, address) {
    return new this.core.eth.Contract(abi, address)
  }
}


export default new Ethereum()

export {
  Ethereum,
}
