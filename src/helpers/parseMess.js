import { main } from 'controllers'


class ParseMess {

  constructor() {
    this.advs = []
    this.myAdvs = []
  }

  getStringify(arr) {
    return JSON.stringify(arr)
  }

  showMessage(mess) {
    mess = JSON.parse(mess)

    for (let i=0; i < this.advs.length; i++)  {
      if (mess.address === this.advs[i].address || !this.advs[i].active) {
        this.advs.splice(i, 1)
      }
    }

    if (mess.active) {
      this.advs.push(mess)
    }

    this.updateAdv()
  }

  updateAdv() {
    main.scope.advs = this.advs
    main.scope.updateCommon()
    main.scope.$scan()
  }
}


export default new ParseMess()
