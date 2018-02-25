import crypto from 'bitcoinjs-lib/src/crypto'


/*
 secret        c0809ce9f484fdcdfb2d5aabd609768ce0374ee97a1a5618ce4cd3f16c00a078
 secretHash    c0933f9be51a284acb6b1a6617a48d795bdeaa80
 */
const ripemd160 = (value) => crypto.ripemd160(Buffer.from(value, 'hex')).toString('hex')


export default {
  ripemd160,
}
