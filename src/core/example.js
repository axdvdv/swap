const localStorage = {
  getItem: () => {},
  setItem: () => {},
}

const room = {
  connection: {
    on: () => {},
  },
}


import Swap from './Swap'
import { eth2btc } from './flows'


const swap = new Swap({
  initialState: localStorage.getItem('swap'),
  connection: room.connection,
  flow: eth2btc,
})

swap.storage.on('update', (values) => {
  console.log('update values', values)
  localStorage.setItem('swap', values)
})

swap.flow.on('leaveStep', (index) => {
  console.log('leave step', index)
})

swap.flow.on('enterStep', (index) => {
  console.log('enter step', index)
})


swap.flow.goNextStep()
