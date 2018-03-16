import bitcoin from 'instances/bitcoin'
// import { TextEncoder, TextDecoder } from 'text-encoding'


function byteToHexString(uint8arr) {
  if (!uint8arr) {
    return '';
  }

  var hexStr = '';
  for (var i = 0; i < uint8arr.length; i++) {
    var hex = (uint8arr[i] & 0xff).toString(16);
    hex = (hex.length === 1) ? '0' + hex : hex;
    hexStr += hex;
  }

  return hexStr.toUpperCase();
}

function hexStringToByte(str) {
  if (!str) {
    return new Uint8Array();
  }

  var a = [];
  for (var i = 0, len = str.length; i < len; i+=2) {
    a.push(parseInt(str.substr(i,2),16));
  }

  return new Uint8Array(a);
}


const createScript = ({ btcOwnerSecretHash, btcOwnerPublicKey, ethOwnerPublicKey, lockTime: _lockTime }) => {
  console.log('Create BTC Swap Script', { btcOwnerSecretHash, btcOwnerPublicKey, ethOwnerPublicKey, lockTime: _lockTime })

  const utcNow = () => Math.floor(Date.now() / 1000)
  const lockTime = _lockTime || utcNow() + 3600 * 3 // 3 days from now

  const script = bitcoin.core.script.compile([
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

  const scriptHash      = byteToHexString(script)
  const scriptPubKey    = bitcoin.core.script.scriptHash.output.encode(bitcoin.core.crypto.hash160(script))
  const scriptAddress   = bitcoin.core.address.fromOutputScript(scriptPubKey, bitcoin.testnet)

  console.log('BTC Swap created', {
    script,
    scriptHash,
    scriptAddress,
  })

  return {
    script,
    scriptHash,
    address: scriptAddress,
    lockTime,
    secretHash: btcOwnerSecretHash,
    btcOwnerPublicKey,
    ethOwnerPublicKey,
  }
}

const fundScript = async ({ script, lockTime, amount }) => {
  console.log('Fund BTC Swap Script')

  console.log('\n+++++++++++++++++++++++++++++++++++++++++++++++\n\n')
  console.log('+++++++++++++++++++++++++++++++++++++++++++++++')
  console.log('\nscript', script)

  return new Promise(async (resolve, reject) => {
    // const script        = hexStringToByte(scriptHash)
    const scriptPubKey  = bitcoin.core.script.scriptHash.output.encode(bitcoin.core.crypto.hash160(script))
    const scriptAddress = bitcoin.core.address.fromOutputScript(scriptPubKey, bitcoin.testnet)

    console.log('scriptAddress\n', scriptAddress)
    console.log('\n\n+++++++++++++++++++++++++++++++++++++++++++++++')
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++\n')

    const tx            = new bitcoin.core.TransactionBuilder(bitcoin.testnet)
    const unspents      = await bitcoin.fetchUnspents()

    const fundValue     = Number(amount) * 1e8
    const feeValue      = 4e5
    const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
    const skipValue     = totalUnspent - fundValue - feeValue

    console.log('Data', { fundValue, feeValue, skipValue, tx, scriptAddress })

    tx.setLockTime(lockTime)
    unspents.forEach(({ txid, vout }) => {
      tx.addInput(txid, vout)
    })
    tx.addOutput(scriptAddress, fundValue)
    tx.addOutput(bitcoin.data.address, skipValue)
    tx.inputs.forEach((input, index) => {
      tx.sign(index, bitcoin.data.keyPair)
	  })

    const txRaw     = tx.buildIncomplete()
    const txRawHex  = txRaw.toHex()

    console.log('tx', tx)
    console.log('txRawHex', txRawHex)

    const result = await bitcoin.broadcastTx(txRawHex)

    resolve(result)
  })
}

const withdraw = ({ script, lockTime, secret }) => {
  console.log('Withdraw money from BTC Swap Script')

  console.log('\n+++++++++++++++++++++++++++++++++++++++++++++++\n\n')
  console.log('+++++++++++++++++++++++++++++++++++++++++++++++')
  console.log('\nscript', script)

  return new Promise(async (resolve, reject) => {
    // const script        = hexStringToByte(scriptHash)
    const scriptPubKey  = bitcoin.core.script.scriptHash.output.encode(bitcoin.core.crypto.hash160(script))
    const scriptAddress = bitcoin.core.address.fromOutputScript(scriptPubKey, bitcoin.testnet)

    console.log('scriptAddress\n', scriptAddress)
    console.log('\n\n+++++++++++++++++++++++++++++++++++++++++++++++')
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++\n')

    const hashType      = bitcoin.core.Transaction.SIGHASH_ALL
    const tx            = new bitcoin.core.TransactionBuilder(bitcoin.testnet)

    const unspents      = await bitcoin.fetchUnspents(scriptAddress)

    const feeValue      = 4e5
    const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)

    console.log('Data', { totalUnspent, scriptAddress, hashType, tx })

    tx.setLockTime(lockTime)
    unspents.forEach(({ txid, vout }) => {
      tx.addInput(txid, vout, 0xfffffffe)
    })
    tx.addOutput(bitcoin.data.address, totalUnspent - feeValue)

    const txRaw               = tx.buildIncomplete()
    const txRawHex            = txRaw.toHex()
    const signatureHash       = txRaw.hashForSignature(0, script, hashType)
    const ethOwner            = new bitcoin.core.ECPair.fromWIF(bitcoin.data.privateKey, bitcoin.testnet)
    const ethOwnerSignature   = ethOwner.sign(signatureHash).toScriptSignature(hashType)

    console.log('Data2', { txRaw, signatureHash, ethOwner, ethOwnerSignature })

    const scriptSig = bitcoin.core.script.scriptHash.input.encode(
      [
        ethOwnerSignature,
        Buffer.from(secret, 'hex'),
      ],
      script
    )

    txRaw.setInputScript(0, scriptSig)

    const txId = txRaw.getId()

    console.log('tx', tx)
    console.log('txId', txId)
    console.log('txRawHex', txRawHex)

    const result = await bitcoin.broadcastTx(txRawHex)

    resolve(result)
  })
}

const refund = (scriptHash, secret, refundAddress) => {
  return new Promise(function (resolve, reject) {
    const script        = hexStringToByte(scriptHash)

    const hashType  = bitcoin.core.Transaction.SIGHASH_ALL
    const tx        = new bitcoin.core.TransactionBuilder(bitcoin.testnet)

    tx.setLockTime(lockTime)
    tx.addInput(unspent.txId, unspent.vout, 0xfffffffe)
    tx.addOutput(refundAddress, 1e4)

    const txRaw               = tx.buildIncomplete()
    const signatureHash       = txRaw.hashForSignature(0, script, hashType)
    const btcOwner            = new bitcoin.ECPair.fromWIF(bitcoin.data.privateKey, bitcoin.testnet)
    const btcOwnerSignature   = btcOwner.sign(signatureHash).toScriptSignature(hashType)

    const scriptSig = bitcoin.core.script.scriptHash.input.encode(
      [
        Buffer.from(secret, 'hex'),
        btcOwnerSignature,
      ],
      script
    )

    txRaw.setInputScript(0, scriptSig)

    const txId = txRaw.getId()

    console.log('final txid', txId)
    console.log('final txRaw', txRaw)

    // testnetUtils.transactions.propagate(txRaw.toHex(), (smth, result) => {
    //   console.log('result', result)
    //
    //   if (result) {
    //     resolve()
    //   }
    //   else {
    //     reject()
    //   }
    // })
  })
}


export default {
  createScript,
  fundScript,
  withdraw,
  refund,
}
