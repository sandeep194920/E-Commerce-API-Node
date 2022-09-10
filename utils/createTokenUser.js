const createTokenUser = (user) => {
  // this function returns userToken object
  return { userId: user._id, name: user.name, role: user.role }
}

module.exports = createTokenUser
