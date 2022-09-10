const jwt = require('jsonwebtoken')

const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  })
  // send token
  return token
}

const attachCookiesToResponse = ({ res, user }) => {
  const token = createJWT({ payload: user })
  const oneDayinMillisec = 24 * 60 * 60 * 1000
  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDayinMillisec),
    secure: process.env.NODE_ENV === 'production',
    signed: true, // this will sign the cookie
  })
}

const isTokenValid = ({ token }) => jwt.verify(token, process.env.JWT_SECRET)

module.exports = { createJWT, isTokenValid, attachCookiesToResponse }
