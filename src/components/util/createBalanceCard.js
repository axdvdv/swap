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
            <a href="" data-toggle="modal" data-target="#{{data.modal_id}}">вывести средства</a>
        </div>
        <hr />
        <a href="" al-copy title="скопировать в буффер">{{data.address}}</a>
      </div>
      
      <div class="modal fade" id="{{data.modal_id}}" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
    <div class="modal-dialog" role="document">
        <form action="" al-submit="withdraw()">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title" >Вывести {{data.currency}}</h4>
                    <button type="button" class="close"  data-dismiss="modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="text-danger">
                    </div>
                    <div class="form-group">
                        <label>Адрес</label>
                        <div class="input-group mb-3">
                            <input class="form-control" value=""  pattern="[a-zA-HJ-NP-Z0-9]{25,34}" al-value="data.withdraw_address" required=""   type="text" placeholder="Адрес" onkeyup="this.value = this.value.trim()">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Сумма</label>
                        <div class="input-group mb-3">
                            <input class="form-control" onkeyup="this.value=this.value.match(/^[\\d.]+$/)"  value="0" al-change="(data.amount > data.balance)?(data.amount=data.balance):''"  al-init="data.amount = data.min_amount"  al-value="data.amount" required=""   type="text"  >
                            <div class="input-group-append">
                                <span class="input-group-text">{{data.currency}}</span>
                            </div>

                        </div>
                        <p class="list-text">мин: <a href="" @click="data.amount=data.min_amount">{{data.min_amount}}</a>, макс <a href="" @click="data.amount=data.balance">{{data.balance}}</a>
                        </p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Закрыть</button>
                    <button type="submit" class="btn btn-primary">Отправить</button>
                </div>
            </div>
        </form>
    </div>
</div>
    `
    }
  })
}


export default createBalanceCard
