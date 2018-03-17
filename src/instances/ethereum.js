import Web3 from 'web3'
import request from 'swap-request'
import config from 'helpers/config'
import rates from './rates'
import EA from './EA'


class Ethereum {

  constructor() {
    this.core = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/JCnK5ifEPH9qcQkX0Ahl"))

    window.ethereum = this
  }

  login(privateKey) {
    let data

    if (privateKey) {
      data = this.core.eth.accounts.privateKeyToAccount(privateKey)
    }
    else {
      data = this.core.eth.accounts.create()

      this.core.eth.accounts.wallet.add(data)
      // this.core.eth.accounts.wallet.save('qwerty123')
    }

    this.core.eth.accounts.wallet.add(data.privateKey)

    console.log('Logged in with Ethereum', data)
    EA.dispatchEvent('eth:login', data)

    return data
  }

  getBalance(address) {
    return this.core.eth.getBalance(address)
      .then((wei) => {
        const balance = Number(this.core.utils.fromWei(wei))

        console.log('ETH Balance:', balance)
        EA.dispatchEvent('eth:updateBalance', balance)

        return balance
      })
  }

  getTransaction(address) {
    return new Promise((resolve) => {
      if (address) {
        const url = `http://api-rinkeby.etherscan.io/api?module=account&action=txlist&address=${this.data.address}&startblock=0&endblock=99999999&sort=asc&apikey=${config.apiKeys.blocktrail}`
        let transactions

        request.get(url)
          .then((res) => {
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

  send(to, amount) {
    EA.dispatchEvent('form:hideError')
    ethereum.core.eth.getBalance(this.data.address).then((r) => {
      try {
        let balance = ethereum.core.utils.fromWei(r)

        if (balance === 0) {
          // TODO move this logic outside
          // notifications.append({type: 'notification', text: 'Ваш баланс пуст'})
          $('.modal').modal('hide')
          return false
        }

        if (balance < amount) {

          EA.dispatchEvent('form:showError', '#withdrawEth', 'На вашем балансе недостаточно средств')
          return false
        }

        if (!ethereum.core.utils.isAddress(to)) {

          EA.dispatchEvent('form:showError', '#withdrawEth', 'Адрес не верный')
          return false
        }

        const t = {
          from: this.ethData.address,
          to: to,
          gas: "21000",
          gasPrice: "20000000000",
          value: ethereum.core.utils.toWei(amount.trim())
        }

        // TODO Wtf? pass argument privateKey and take it from user.ethData.privateKey!
        ethereum.core.eth.accounts.signTransaction(t, localStorage.getItem('privateEthKey'))
          .then((result) => {
            return ethereum.core.eth.sendSignedTransaction(result.rawTransaction)
          })
          .then((receipt) => {
            // TODO move this logic outside
            // notifications.append({type: 'notification', text: 'Вывод денег'})
            $('.modal').modal('hide')
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

export {
  Ethereum,
}
