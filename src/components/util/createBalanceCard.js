import alight from 'alight'


const createBalanceCard = (name, cb) => {

  alight.createComponent(name, (scope, element, env) => {
    scope.data = {
      balance: 0,
      address: '0x0',
      currency: '',
    }

    cb(scope)

    return {
      template: `
      <div class="alert alert-warning fs-16" role="alert">
        <div class="d-flex justify-content-between">
          <div>Баланс <strong>{{data.balance}}</strong> {{data.currency}} <a href="#" al-click="updateBalance()">обновить</a></div>
            <a href="" data-toggle="modal" data-target="{{data.modal_link}}">вывести средства</a>
        </div>
        <hr />
        <a href="" al-copy title="скопировать в буффер">{{data.address}}</a>
      </div>
    `
    }
  })
}


export default createBalanceCard
