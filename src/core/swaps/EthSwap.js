class EthSwap {

  constructor({ web3, address, abi, gasLimit }) {
    this.web3       = web3
    this.gasLimit   = gasLimit
    this.contract   = new web3.eth.Contract(abi, address)
  }

  /**
   *
   * @param {object} data
   * @param {object} data.myAddress
   * @param {string} data.participantAddress
   * @param {function} handleTransaction
   */
  sign({ myAddress, participantAddress }, handleTransaction) {
    return new Promise(async (resolve, reject) => {
      const params = {
        from: myAddress,
        gas: this.gasLimit,
      }

      console.log('\n\nStart sign ETH Swap', { values: { ownerAddress: myAddress, participantAddress } })

      const receipt = await this.contract.methods.sign(participantAddress).send(params)
        .on('transactionHash', (hash) => {
          console.log('ETH Swap > transactionHash', `https://rinkeby.etherscan.io/tx/${hash}`)
          handleTransaction && handleTransaction(`https://rinkeby.etherscan.io/tx/${hash}`)
        })
        .on('confirmation', (confirmationNumber) => {
          // console.log('ETH Swap > confirmation', confirmationNumber)
        })
        .on('error', (err) => {
          console.error('ETH Swap > receipt', err)

          reject()
        })

      console.log('ETH Swap sign complete:', receipt)
      resolve(receipt)
    })
  }

  /**
   *
   * @param {object} data
   * @param {object} data.myAddress
   * @param {string} data.secretHash
   * @param {string} data.participantAddress
   * @param {number} data.amount
   * @param {number} data._lockTime - required just for AVA test
   * @param {function} handleTransaction
   */
  create({ myAddress, secretHash, participantAddress, amount, _lockTime }, handleTransaction) {
    return new Promise(async (resolve, reject) => {
      const hash      = `0x${secretHash.replace(/^0x/, '')}`

      const params = {
        from: myAddress,
        gas: this.gasLimit,
        // gasPrice: config.eth.gasPrice,
        value: Math.floor(this.web3.utils.toWei(String(amount))),
      }

      const values = [ hash, participantAddress ]

      // ductape for ava test
      if (_lockTime) {
        values.push(_lockTime)
      }

      console.log('\n\nStart creating ETH Swap', { values, params })

      const receipt = await this.contract.methods.create(...values).send(params)
        .on('transactionHash', (hash) => {
          console.log('ETH Swap > transactionHash', `https://rinkeby.etherscan.io/tx/${hash}`)
          handleTransaction && handleTransaction(`https://rinkeby.etherscan.io/tx/${hash}`)
        })
        .on('confirmation', (confirmationNumber) => {
          // console.log('ETH Swap > confirmation', confirmationNumber)
        })
        .on('error', (err) => {
          console.error('ETH Swap > receipt', err)

          reject()
        })

      console.log('ETH Swap created:', receipt)
      resolve(receipt)
    })
  }

  /**
   *
   * @param {object} data
   * @param {object} data.myAddress
   * @param {string} data.secret
   * @param {string} data.ownerAddress
   * @param {function} handleTransaction
   */
  withdraw({ myAddress, ownerAddress, secret: _secret }, handleTransaction) {
    return new Promise(async (resolve, reject) => {
      const secret = `0x${_secret.replace(/^0x/, '')}`

      const params = {
        from: myAddress,
        gas: this.gasLimit,
        // gasPrice: config.eth.gasPrice,
      }

      console.log('\n\nStart withdraw from ETH Swap', { values: { secret, ownerAddress }, params })

      const receipt = await this.contract.methods.withdraw(secret, ownerAddress).send(params)
        .on('transactionHash', (hash) => {
          console.log('ETH Swap > transactionHash', `https://rinkeby.etherscan.io/tx/${hash}`)
          handleTransaction && handleTransaction(`https://rinkeby.etherscan.io/tx/${hash}`)
        })
        .on('confirmation', (confirmationNumber) => {
          // console.log('ETH Swap > confirmation', confirmationNumber)
        })
        .on('error', (err) => {
          console.error('ETH Swap > receipt', err)

          reject()
        })

      console.log('ETH Swap withdraw complete:', receipt)
      resolve(receipt)
    })
  }

  refund() {

  }

  // ETH Owner receive a secret
  getSecret({ myAddress, participantAddress }) {
    return new Promise(async (resolve, reject) => {
      console.log('\n\nStart getting secret from ETH Swap')

      let secret

      try {
        secret = await this.contract.methods.getSecret(participantAddress).call({
          from: myAddress,
        })
      }
      catch (err) {
        reject(err)
      }

      console.log('ETH Swap secret:', secret)
      resolve(secret)
    })
  }

  // ETH Owner closes Swap to receive reputation
  close({ myAddress, participantAddress }, handleTransaction) {
    return new Promise(async (resolve, reject) => {
      console.log('\n\nStart closing ETH Swap')

      const params = {
        from: myAddress,
        gas: this.gasLimit,
        // gasPrice: config.eth.gasPrice,
      }

      const receipt = await this.contract.methods.close(participantAddress).send(params)
        .on('transactionHash', (hash) => {
          console.log('ETH Swap > transactionHash', `https://rinkeby.etherscan.io/tx/${hash}`)
          handleTransaction && handleTransaction(`https://rinkeby.etherscan.io/tx/${hash}`)
        })
        .on('confirmation', (confirmationNumber) => {
          // console.log('ETH Swap > confirmation', confirmationNumber)
        })
        .on('error', (err) => {
          console.error('ETH Swap > receipt', err)

          reject()
        })

      console.log('ETH Swap closed')
      resolve(receipt)
    })
  }
}


export default EthSwap
