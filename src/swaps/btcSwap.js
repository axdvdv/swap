import bitcoin from 'instances/bitcoin'
import { getLockTime } from 'helpers'


const createScript = ({ secretHash, btcOwnerPublicKey, ethOwnerPublicKey, lockTime: _lockTime }) => {
  console.log('\n\nCreate BTC Swap Script', { secretHash, btcOwnerPublicKey, ethOwnerPublicKey, lockTime: _lockTime })

  const lockTime = _lockTime || getLockTime()

  // const script = bitcoin.core.script.compile([
  //   bitcoin.core.opcodes.OP_RIPEMD160,
  //   Buffer.from(secretHash, 'hex'),
  //   bitcoin.core.opcodes.OP_EQUALVERIFY,
  //   Buffer.from(ethOwnerPublicKey, 'hex'),
  //   bitcoin.core.opcodes.OP_CHECKSIG,
  // ])

  const script = bitcoin.core.script.compile([
    bitcoin.core.opcodes.OP_RIPEMD160,
    Buffer.from(secretHash, 'hex'),
    bitcoin.core.opcodes.OP_EQUALVERIFY,

    Buffer.from(ethOwnerPublicKey, 'hex'),
    bitcoin.core.opcodes.OP_EQUAL,
    bitcoin.core.opcodes.OP_IF,

    Buffer.from(ethOwnerPublicKey, 'hex'),
    bitcoin.core.opcodes.OP_CHECKSIG,

    bitcoin.core.opcodes.OP_ELSE,

    bitcoin.core.script.number.encode(lockTime),
    bitcoin.core.opcodes.OP_CHECKLOCKTIMEVERIFY,
    bitcoin.core.opcodes.OP_DROP,
    Buffer.from(btcOwnerPublicKey, 'hex'),
    bitcoin.core.opcodes.OP_CHECKSIG,

    bitcoin.core.opcodes.OP_ENDIF,
  ])

  const scriptPubKey    = bitcoin.core.script.scriptHash.output.encode(bitcoin.core.crypto.hash160(script))
  const scriptAddress   = bitcoin.core.address.fromOutputScript(scriptPubKey, bitcoin.testnet)

  console.log('BTC Swap created', {
    script,
    scriptAddress,
  })

  return {
    script,
    address: scriptAddress,
    secretHash,
    lockTime,
    btcOwnerPublicKey,
    ethOwnerPublicKey,
  }
}

const fundScript = ({ btcData, script, amount }) => {
  console.log('\n\nFund BTC Swap Script', { btcData, script, amount })

  return new Promise(async (resolve, reject) => {
    // const script        = hexStringToByte(scriptHash)
    try {
      const scriptPubKey  = bitcoin.core.script.scriptHash.output.encode(bitcoin.core.crypto.hash160(script))
      const scriptAddress = bitcoin.core.address.fromOutputScript(scriptPubKey, bitcoin.testnet)

      const tx            = new bitcoin.core.TransactionBuilder(bitcoin.testnet)
      const unspents      = await bitcoin.fetchUnspents(btcData.address)

      const fundValue     = Math.floor(Number(amount) * 1e8)
      const feeValue      = 4e5
      const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
      const skipValue     = totalUnspent - fundValue - feeValue

      console.log('Data', { totalUnspent, fundValue, feeValue, skipValue, tx, scriptAddress })

      unspents.forEach(({ txid, vout }) => {
        tx.addInput(txid, vout)
      })
      tx.addOutput(scriptAddress, fundValue)
      tx.addOutput(btcData.address, skipValue)
      tx.inputs.forEach((input, index) => {
        tx.sign(index, btcData.keyPair)
      })

      const txRaw     = tx.buildIncomplete()
      const txRawHex  = txRaw.toHex()

      console.log('tx', tx)
      console.log('txRawHex', txRawHex)

      const result = await bitcoin.broadcastTx(txRawHex)

      resolve(result)
    }
    catch (err) {
      reject(err)
    }
  })
}

const withdraw = ({ btcData, script, secret }) => {
  console.log('\n\nWithdraw money from BTC Swap Script', { btcData, script, secret })

  return new Promise(async (resolve, reject) => {
    try {
      const scriptPubKey  = bitcoin.core.script.scriptHash.output.encode(bitcoin.core.crypto.hash160(script))
      const scriptAddress = bitcoin.core.address.fromOutputScript(scriptPubKey, bitcoin.testnet)

      const hashType      = bitcoin.core.Transaction.SIGHASH_ALL
      const tx            = new bitcoin.core.TransactionBuilder(bitcoin.testnet)

      const unspents      = await bitcoin.fetchUnspents(scriptAddress)

      const feeValue      = 4e5
      const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)

      unspents.forEach(({ txid, vout }) => {
        tx.addInput(txid, vout, 0xfffffffe)
      })
      tx.addOutput(btcData.address, totalUnspent - feeValue)

      const txRaw               = tx.buildIncomplete()
      const signatureHash       = txRaw.hashForSignature(0, script, hashType)
      const signature           = btcData.account.sign(signatureHash).toScriptSignature(hashType)

      const scriptSig = bitcoin.core.script.scriptHash.input.encode(
        [
          signature,
          btcData.account.getPublicKeyBuffer(),
          Buffer.from(secret.replace(/^0x/, ''), 'hex'),
        ],
        script,
      )

      txRaw.setInputScript(0, scriptSig)

      const txId      = txRaw.getId()
      const txRawHex  = txRaw.toHex()

      console.log('txId', txId)
      console.log('txRawHex', txRawHex)

      const result = await bitcoin.broadcastTx(txRawHex)

      resolve(result)
    }
    catch (err) {
      reject(err)
    }
  })
}

const refund = ({ btcData, script, lockTime, secret }, handleTransactionHash) => {
  console.log('\n\nRefund money from BTC Swap Script')

  return new Promise(async (resolve, reject) => {
    try {
      const scriptPubKey  = bitcoin.core.script.scriptHash.output.encode(bitcoin.core.crypto.hash160(script))
      const scriptAddress = bitcoin.core.address.fromOutputScript(scriptPubKey, bitcoin.testnet)

      const hashType      = bitcoin.core.Transaction.SIGHASH_ALL
      const tx            = new bitcoin.core.TransactionBuilder(bitcoin.testnet)

      const unspents      = await bitcoin.fetchUnspents(scriptAddress)

      const feeValue      = 4e5
      const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)

      tx.setLockTime(lockTime)
      unspents.forEach(({ txid, vout }) => {
        tx.addInput(txid, vout, 0xfffffffe)
      })
      tx.addOutput(btcData.address, totalUnspent - feeValue)

      const txRaw               = tx.buildIncomplete()
      const signatureHash       = txRaw.hashForSignature(0, script, hashType)
      const signature           = btcData.account.sign(signatureHash).toScriptSignature(hashType)

      const scriptSig = bitcoin.core.script.scriptHash.input.encode(
        [
          signature,
          btcData.account.getPublicKeyBuffer(),
          Buffer.from(secret, 'hex'),
        ],
        script,
      )

      txRaw.setInputScript(0, scriptSig)

      const txId      = txRaw.getId()
      const txRawHex  = txRaw.toHex()

      console.log('txId', txId)
      console.log('txRawHex', txRawHex)

      const result = await bitcoin.broadcastTx(txRawHex)

      handleTransactionHash && handleTransactionHash(txId)
      resolve(result)
    }
    catch (err) {
      reject(err)
    }
  })
}


export default {
  createScript,
  fundScript,
  withdraw,
  refund,
}
