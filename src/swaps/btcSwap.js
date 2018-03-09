import bitcoin from 'instances/bitcoin'


const utcNow = () => Math.floor(Date.now() / 1000)
const lockTime = utcNow() + 3600 * 3 // 3 days from now


const createScript = (btcOwnerSecretHash, btcOwnerPublicKey, ethOwnerPublicKey) => {
  console.log('Create BTC Swap script')

  return bitcoin.core.script.compile([
    btcOwnerPublicKey,
    bitcoin.core.opcodes.OP_CHECKSIG,

    bitcoin.core.opcodes.OP_IF,
    bitcoin.core.script.number.encode(lockTime),
    bitcoin.core.opcodes.OP_CHECKLOCKTIMEVERIFY,
    bitcoin.core.opcodes.OP_ENDIF,

    ethOwnerPublicKey,
    bitcoin.core.opcodes.OP_CHECKSIG,

    bitcoin.core.opcodes.OP_IF,
    bitcoin.core.opcodes.OP_RIPEMD160,
    Buffer.from(btcOwnerSecretHash, 'hex'),
    bitcoin.core.opcodes.OP_EQUALVERIFY,
    bitcoin.core.opcodes.OP_ENDIF,
  ])
}

const addMoney = (script, amount) => {
  return new Promise(function (resolve, reject) {
    const scriptPubKey    = bitcoin.core.script.scriptHash.output.encode(bitcoin.core.crypto.hash160(script))
    const scriptAddress   = bitcoin.core.address.fromOutputScript(scriptPubKey, bitcoin.networks.testnet)

    const tx = new bitcoin.core.TransactionBuilder(bitcoin.networks.testnet)

    tx.setLockTime(lockTime)
    tx.addInput(bitcoin.data.address, 2e4)
    tx.addOutput(scriptAddress, 1e4)

    tx.sign(0, bitcoin.data.privateKey)

    const result = tx().toHex()

    console.log(444, result)

    resolve(result)
  })
}

const withdraw = (script, unspent, secret, withdrawAddress) => {
  return new Promise(function (resolve, reject) {
    const hashType  = bitcoin.core.Transaction.SIGHASH_ALL
    const tx        = new bitcoin.core.TransactionBuilder(bitcoin.networks.testnet)

    tx.setLockTime(lockTime)
    tx.addInput(unspent.txId, unspent.vout, 0xfffffffe)
    tx.addOutput(withdrawAddress, 1e4)

    const txRaw               = tx.buildIncomplete()
    const signatureHash       = txRaw.hashForSignature(0, script, hashType)
    const ethOwner            = new bitcoin.ECPair.fromWIF(bitcoin.data.privateKey, bitcoin.networks.testnet)
    const ethOwnerSignature   = ethOwner.sign(signatureHash).toScriptSignature(hashType)

    const scriptSig = bitcoin.core.script.scriptHash.input.encode(
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
    const hashType  = bitcoin.core.Transaction.SIGHASH_ALL
    const tx        = new bitcoin.core.TransactionBuilder(bitcoin.networks.testnet)

    tx.setLockTime(lockTime)
    tx.addInput(unspent.txId, unspent.vout, 0xfffffffe)
    tx.addOutput(refundAddress, 1e4)

    const txRaw               = tx.buildIncomplete()
    const signatureHash       = txRaw.hashForSignature(0, script, hashType)
    const btcOwner            = new bitcoin.ECPair.fromWIF(bitcoin.data.privateKey, bitcoin.networks.testnet)
    const btcOwnerSignature   = btcOwner.sign(signatureHash).toScriptSignature(hashType)

    const scriptSig = bitcoin.core.script.scriptHash.input.encode(
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
