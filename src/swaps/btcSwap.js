import bitcoin from 'bitcoinjs-lib'

const testnetUtils = {} // TODO HOW?


const utcNow = () => Math.floor(Date.now() / 1000)
const lockTime = utcNow() + 3600 * 3 // 3 days from now


const createScript = (btcOwnerSecretHash, btcOwnerPublicKey, ethOwnerPublicKey) => {
  return bitcoin.script.compile([
    btcOwnerPublicKey,
    bitcoin.opcodes.OP_CHECKSIG,

    bitcoin.opcodes.OP_IF,
    bitcoin.script.number.encode(lockTime),
    bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
    bitcoin.opcodes.OP_ENDIF,

    ethOwnerPublicKey,
    bitcoin.opcodes.OP_CHECKSIG,

    bitcoin.opcodes.OP_IF,
    bitcoin.opcodes.OP_RIPEMD160,
    Buffer.from(btcOwnerSecretHash, 'hex'),
    bitcoin.opcodes.OP_EQUALVERIFY,
    bitcoin.opcodes.OP_ENDIF,
  ])
}

const addMoney = (script, amount) => {
  return new Promise(function (resolve, reject) {
    const scriptPubKey    = bitcoin.script.scriptHash.output.encode(bitcoin.crypto.hash160(script))
    const scriptAddress   = bitcoin.address.fromOutputScript(scriptPubKey, testnet)

    testnetUtils.faucet(scriptAddress, amount, function (err, unspent) {
      if (err) {
        console.log('fund error:', err)
        reject()
        return
      }

      resolve()
    })
  })
}

const withdraw = (script, unspent, secret, withdrawAddress) => {
  return new Promise(function (resolve, reject) {
    const hashType  = bitcoin.Transaction.SIGHASH_ALL
    const tx        = new bitcoin.TransactionBuilder(testnet)

    tx.setLockTime(lockTime)
    tx.addInput(unspent.txId, unspent.vout, 0xfffffffe)
    tx.addOutput(withdrawAddress, 1e4)

    const txRaw               = tx.buildIncomplete()
    const signatureHash       = txRaw.hashForSignature(0, script, hashType)
    const ethOwnerSignature   = ethOwner.sign(signatureHash).toScriptSignature(hashType)

    const scriptSig = bitcoin.script.scriptHash.input.encode(
      [
        ethOwnerSignature,
        Buffer.from(secret, 'hex'),
      ],
      script
    )

    txRaw.setInputScript(0, scriptSig)

    const txId = txRaw.getId()

    console.log('final txid', txId)
    console.log('final txRaw', txRaw)

    testnetUtils.transactions.propagate(txRaw.toHex(), (smth, result) => {
      console.log('result', result)

      if (result) {
        resolve()
      }
      else {
        reject()
      }
    })
  })
}

const refund = (script, unspent, secret, refundAddress) => {
  return new Promise(function (resolve, reject) {
    const hashType  = bitcoin.Transaction.SIGHASH_ALL
    const tx        = new bitcoin.TransactionBuilder(testnet)

    tx.setLockTime(lockTime)
    tx.addInput(unspent.txId, unspent.vout, 0xfffffffe)
    tx.addOutput(refundAddress, 1e4)

    const txRaw               = tx.buildIncomplete()
    const signatureHash       = txRaw.hashForSignature(0, script, hashType)
    const btcOwnerSignature   = btcOwner.sign(signatureHash).toScriptSignature(hashType)

    const scriptSig = bitcoin.script.scriptHash.input.encode(
      [
        btcOwnerSignature,
        Buffer.from(secret, 'hex'),
      ],
      script
    )

    txRaw.setInputScript(0, scriptSig)

    const txId = txRaw.getId()

    console.log('final txid', txId)
    console.log('final txRaw', txRaw)

    testnetUtils.transactions.propagate(txRaw.toHex(), (smth, result) => {
      console.log('result', result)

      if (result) {
        resolve()
      }
      else {
        reject()
      }
    })
  })
}


export default {
  createScript,
  addMoney,
  withdraw,
  refund,
}
