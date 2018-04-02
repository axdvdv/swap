import alight from 'alight'


alight.createComponent('truncate-amount', (scope, element, env) => ({
  template: '<span title="{{value}}">{{value | truncateAmount}}</span>'
}))
