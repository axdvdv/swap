import test from 'ava'
import ethereum, { Ethereum } from 'instances/ethereum'
import { EthSwap } from 'swaps/ethSwap'


const ratingAddress = '0xb284b19aa826f29472300e997b142927ad0130ae'
const ratingABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "getMy",
    "outputs": [
      {
        "name": "",
        "type": "int256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_userAddress",
        "type": "address"
      }
    ],
    "name": "get",
    "outputs": [
      {
        "name": "",
        "type": "int256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_userAddress",
        "type": "address"
      },
      {
        "name": "_delta",
        "type": "int256"
      }
    ],
    "name": "change",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "_ownerAddress",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  }
]

const ratingContract = ethereum.getContract(ratingABI, ratingAddress)

const swapsAddress = '0x4ac703191e76236af69884d34bf3befc9ba219f2'
const swapsABI     = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "_ratingContractAddress",
        "type": "address"
      }
    ],
    "name": "setRatingAddress",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_secret",
        "type": "bytes32"
      },
      {
        "name": "_ownerAddress",
        "type": "address"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_participantAddress",
        "type": "address"
      }
    ],
    "name": "getSecret",
    "outputs": [
      {
        "name": "",
        "type": "bytes32"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_secretHash",
        "type": "bytes20"
      },
      {
        "name": "_participantAddress",
        "type": "address"
      },
      {
        "name": "_lockTime",
        "type": "uint256"
      }
    ],
    "name": "create",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_participantAddress",
        "type": "address"
      }
    ],
    "name": "checkIfSigned",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_participantAddress",
        "type": "address"
      }
    ],
    "name": "close",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_ownerAddress",
        "type": "address"
      }
    ],
    "name": "getSecretHash",
    "outputs": [
      {
        "name": "",
        "type": "bytes20"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "changeRating",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "participantAddress",
        "type": "address"
      }
    ],
    "name": "sign",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_ownerAddress",
        "type": "address"
      }
    ],
    "name": "getBalance",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_participantAddress",
        "type": "address"
      }
    ],
    "name": "refund",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  }
]

const ethSwap = new EthSwap(swapsAddress, swapsABI)

const secret      = 'c0809ce9f484fdcdfb2d5aabd609768ce0374ee97a1a5618ce4cd3f16c00a078'
const secretHash  = 'c0933f9be51a284acb6b1a6617a48d795bdeaa80'
const lockTime    = 1841171580000

const ethOwner = {
  privateKey: '0x2792fe665e7ac38fac08af69659b31de483fa90dc657dadcc3de48a418d87069',
  address: '0x52b0ed6638D4Edf4e074D266E3D5fc05A5650DfF',
}
const btcOwner = {
  privateKey: '0xad10985ffc9c8f76c25c5b359c647e3737fffb36c2df9370fcc8654e4ac7ea90',
  address: '0xf610609b0592c292d04C59d44244bb6CB41C59bd',
}

const btcOwnerBitcoin = new Ethereum()
const ethOwnerBitcoin = new Ethereum()

const btcOwnerData = btcOwnerBitcoin.login(btcOwner.privateKey)
const ethOwnerData = ethOwnerBitcoin.login(ethOwner.privateKey)


test('sign + create + withdraw + getSecret', async (t) => {
  const expected = `0x${secret}`

  // BTC Owner signs
  // 0x52b0ed6638D4Edf4e074D266E3D5fc05A5650DfF
  await ethSwap.sign({
    ethData: btcOwnerData,
    participantAddress: ethOwnerData.address,
  })

  // ETH Owner signs
  // 0xf610609b0592c292d04C59d44244bb6CB41C59bd
  await ethSwap.sign({
    ethData: ethOwnerData,
    participantAddress: btcOwnerData.address,
  })

  // ETH Owner creates a swap
  // 0xc0933f9be51a284acb6b1a6617a48d795bdeaa80, "0xf610609b0592c292d04C59d44244bb6CB41C59bd", 1841171580000
  await ethSwap.create({
    ethData: ethOwnerData,
    participantAddress: btcOwnerData.address,
    secretHash,
    amount: 0.02,
    _lockTime: lockTime,
  })

  // BTC Owner withdraw
  // 0xc0809ce9f484fdcdfb2d5aabd609768ce0374ee97a1a5618ce4cd3f16c00a078, "0x52b0ed6638D4Edf4e074D266E3D5fc05A5650DfF"
  await ethSwap.withdraw({
    ethData: btcOwnerData,
    secret,
    ownerAddress: ethOwnerData.address,
  })

  // ETH Owner receive the secret
  // 0xf610609b0592c292d04C59d44244bb6CB41C59bd
  const result = await ethSwap.getSecret({
    ethData: ethOwnerData,
    participantAddress: btcOwnerData.address,
  })

  // ETH Owner close Swap to receive reputation
  // 0xf610609b0592c292d04C59d44244bb6CB41C59bd
  await ethSwap.close({
    ethData: ethOwnerData,
    participantAddress: btcOwnerData.address,
  })

  console.log('result', result)

  t.is(result, expected)
})
