const swap = {
  scope: {},
}

alight.controllers.swap = (scope) => {
  console.info('Swap controller!')

  const { $parent: { data: { activeRoute: { params: { slug, id: orderId} } } } } = scope

  scope.data = {
    slug,
    orderId,
  }

  swap.scope = scope
}


export default swap
