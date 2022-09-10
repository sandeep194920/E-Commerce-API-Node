const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const customError = require('../errors')
const { attachCookiesToResponse, createTokenUser } = require('../utils')

const register = async (req, res) => {
  const { name, email, password } = req.body
  const emailAlreadyExists = await User.findOne({ email })
  if (emailAlreadyExists) {
    throw new customError.BadRequestError('Email already exists')
  }
  // let's setup first user as admin
  const isFirstUser = (await User.countDocuments({})) === 0
  const role = isFirstUser ? 'admin' : 'user'
  const user = await User.create({ name, email, password, role })
  // const tokenUser = { userId: user._id, name: user.name, role: user.role }
  const tokenUser = createTokenUser(user)
  //createJWT({ payload: tokenUser }) // legacy
  attachCookiesToResponse({ res, user: tokenUser }) // this creates JWT token, and attaches the token in res.cookie
  res.status(StatusCodes.CREATED).json({ user: tokenUser })
}

const login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    throw new customError.BadRequestError('Please provide email and password')
  const user = await User.findOne({ email })
  if (!user) throw new customError.UnauthenticatedError('Invalid credentials.')
  const isPasswordCorrect = await user.comparePasswords(password)
  if (!isPasswordCorrect)
    throw new customError.UnauthenticatedError('Invalid credentials.')
  // const tokenUser = { userId: user._id, name: user.name, role: user.role }
  const tokenUser = createTokenUser(user)
  attachCookiesToResponse({ res, user: tokenUser })
  res.status(StatusCodes.OK).json({ user: tokenUser })
}

const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  })
  res.status(StatusCodes.OK).json({ msg: 'user logged out' })
}

module.exports = { register, login, logout }
