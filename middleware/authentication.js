const customErrors = require('../errors')
const { isTokenValid } = require('../utils')

const authenticateUser = async (req, res, next) => {
  const { token } = req.signedCookies
  if (!token)
    throw new customErrors.UnauthenticatedError('Authentication Invalid')
  try {
    // we get payload (that we stored in token while creating jwt) if token is valid
    const { name, userId, role } = isTokenValid({ token })
    req.user = { name, userId, role }
    next()
  } catch (error) {
    throw new customErrors.UnauthenticatedError('Authentication Invalids')
  }
}

const authorizePermissions = (roles) => {
  return async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new customErrors.UnAuthorizedError(
        'Unauthorized to access this route'
      )
    }
    next()
  }
}

module.exports = { authenticateUser, authorizePermissions }
