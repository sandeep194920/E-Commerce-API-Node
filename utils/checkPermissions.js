const customError = require('../errors')

const checkPermissions = (reqUser, resourceUserID) => {
  //   console.log(reqUser) // { name: 'john', userId: '63044830c70600e17b5ac3f3', role: 'user' }
  //   console.log(resourceUserID) //new ObjectId("6304483ac70600e17b5ac3f7")
  //   console.log(typeof resourceUserID) // object
  //   console.log(resourceUserID.toString()) // 6304483ac70600e17b5ac3f7
  // if we are using return, that means we are not stopping the request, we simply return to caller (getSingleUser controller) and then proceed to give back the response
  console.log(reqUser)
  console.log(resourceUserID.toString())
  if (reqUser.userId === resourceUserID.toString()) return
  if (reqUser.role === 'admin') return

  // if one of the above two conditions meet then we throw error as it would be unauthorized route
  throw new customError.UnAuthorizedError('Not authorized to access this route')
}

module.exports = checkPermissions
