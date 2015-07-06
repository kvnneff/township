var jwt = require('jsonwebtoken')

module.exports = Tokens

function Tokens (secret, opts) {
  if (!(this instanceof Tokens)) return new Tokens(secret, opts)

  this.secret = secret
}

//Tokens.prototype.sign = function (req, res, payload, opts) {
Tokens.prototype.sign = function (req, payload, cb) {
  // payload = claims
  if (cb) {
    jwt.sign(payload, this.secret, cb)

  } else {
    var token = jwt.sign(payload, this.secret)
    req.headers['Authorization'] = "Bearer " + token
    return token
  }
}

Tokens.prototype.verify = function (req, cb) {
  // req.headers.Authorization = 'Bearer <token>'
  var token = req.headers.Authorization.split(",")[0].split(" ")[1]
  if (cb) {
    if (!token) return cb("Failed to retrieve token from Authorization header")
    //jwt.verify(token, this.secret, function (err, decoded) {
    //  return cb(err, decoded)
    //})
    jwt.verify(token, this.secret, cb)
  } else {
    return jwt.verify(token, this.secret)
  }
}
