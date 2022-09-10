const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name property'],
    minLength: 2,
    maxLength: 50,
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email address is required'],
    validate: {
      validator: validator.isEmail,
      message: 'Please provide a valid email',
    },
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minLength: 3,
    maxLength: 100,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
})

// pre-commit hook to save the password
// this pre will be run before committing to the DB on save() and while creating new user
UserSchema.pre('save', async function () {
  console.log('shows what we are modifying', this.modifiedPaths()) // ['name','email']
  if (!this.isModified('password')) return // if we didn't modify the password then we just return here
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// this is the instance method we can create on a schema.
// Later this can be used in controller as UserSchema.comparePasswords(passwordStr)
UserSchema.methods.comparePasswords = async function (candidatePassword) {
  const isMatch = bcrypt.compare(candidatePassword, this.password)
  return isMatch
}

const UserModel = mongoose.model('User', UserSchema)

module.exports = UserModel
