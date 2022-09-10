const CustomAPIError = require('./custom-api')
const UnauthenticatedError = require('./unauthenticated')
const NotFoundError = require('./not-found')
const BadRequestError = require('./bad-request')
const UnAuthorizedError = require('./unauhorized')
module.exports = {
  CustomAPIError,
  UnauthenticatedError,
  NotFoundError,
  BadRequestError,
  UnAuthorizedError,
}
