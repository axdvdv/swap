class Rates {

  getRate() {

    return new Promise((resolve) => {
      if(!this.rate) {
        $.getJSON('https://noxonfund.com/curs.php', (r) => {
          this.rate = r.price_btc;
          resolve(r.price_btc)
        })
      } else {
        resolve( this.rate )
      }
    })
  }
}

export default new Rates()