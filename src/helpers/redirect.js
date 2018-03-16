import EA from 'instances/EA'


const redirect = (path) => EA.dispatchEvent('redirect', path)


export default redirect
