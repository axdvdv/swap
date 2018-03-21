import alight from 'alight'


const balances = {
  scope: {},
}

alight.controllers.balances = (scope) => {
  console.log('Balances controller!')

  scope.data = {

  }

  balances.scope = scope
}


export default balances
