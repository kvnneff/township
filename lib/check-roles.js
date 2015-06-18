module.exports = function checkRoles (roles, account) {
  var roles = roles.sort().join('')
  var accountRoles = account.roles.sort().join('')
  if (roles === accountRoles) return true
  return false
}