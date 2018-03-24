import { merge } from 'lodash'


let isLocalStorageEnabled

try {
  global.localStorage.setItem('test', 'test')
  global.localStorage.removeItem('test')
  isLocalStorageEnabled = true
}
catch (e) {
  isLocalStorageEnabled = false
}


const getItem = (key) => {
  if (isLocalStorageEnabled) {
    const value = global.localStorage.getItem(key)

    try {
      return JSON.parse(value)
    }
    catch (err) {
      return value
    }
  }

  return undefined
}

const setItem = (key, value) => {
  if (isLocalStorageEnabled) {
    global.localStorage.setItem(key, JSON.stringify(value))
  }
}

const updateItem = (key, value) => {
  const prevValue = getItem(key) || {}

  setItem(key, merge(prevValue, value || {}))
}

const removeItem = (key) => {
  if (isLocalStorageEnabled) {
    return global.localStorage.removeItem(key)
  }
}

const clear = () => {
  if (isLocalStorageEnabled) {
    global.localStorage.clear()
  }
}


export default {
  getItem,
  setItem,
  updateItem,
  removeItem,
  clear,
}
