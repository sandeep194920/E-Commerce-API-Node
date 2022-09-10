const { StatusCodes } = require('http-status-codes')
const customErrors = require('../errors')
const User = require('../models/User')
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require('../utils')

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password')
  res.status(StatusCodes.OK).json({ users })
}

const getSingleUser = async (req, res) => {
  const { id } = req.params
  const user = await User.findOne({ _id: id }).select('-password')
  if (!user)
    throw new customErrors.NotFoundError(`User not found with ID ${id}`)
  // what are we checking in checkPermissions?
  // Our authenticated user (req.user) and user._id got from DB, if they both are same

  // if they both are same, that means the logged in user is accessing his own info and we can very well give him

  // if they both are not same, that means the logged in user is accessing others' user id. We can give the user back only if the user requesting is an admin. If not we will throw error

  // both user._id and req.param.id will be same but user._id will be in form of object. we need toString() on that
  checkPermissions(req.user, user._id)
  res.status(StatusCodes.OK).json({ user })
}

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user })
}

const updateUser = async (req, res) => {
  const { name, email } = req.body
  if (!name || !email) {
    throw new customErrors.BadRequestError('Please provide name and email')
  }

  // findOneAndUpdate doesn't invoke pre save hook

  // const user = await User.findOneAndUpdate(
  //   { _id: req.user.userId },
  //   { name, email },
  //   { new: true, runValidators: true }
  // )

  // save() invokes/calls the pre save hook
  const user = await User.findOne({ _id: req.user.userId })
  user.name = name
  user.email = email
  console.log('the user is', user)
  await user.save()

  const tokenUser = createTokenUser(user)
  attachCookiesToResponse({ res, user: tokenUser })
  res.status(StatusCodes.OK).json({ user: tokenUser })
}

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body
  if (!oldPassword || !newPassword) {
    throw new customErrors.BadRequestError('Old or new password is missing')
  }
  const user = await User.findOne({ _id: req.user.userId })
  const isMatch = await user.comparePasswords(oldPassword, user.password)
  if (!isMatch) {
    throw new customErrors.UnauthenticatedError('Invalid Credentials')
  }
  user.password = newPassword
  await user.save() // user.save will run the pre hook (which hashes the password) before saving to db
  // save() method also runs DB validation
  res.status(StatusCodes.OK).json({ message: 'Updated password successfully' })
}

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
}
