const express = require('express')
const router = express.Router()

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require('../controllers/userController')

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication')
// router.route('/').get(authenticateUser, authorizePermissions, getAllUsers)
router
  .route('/')
  .get(authenticateUser, authorizePermissions(['admin']), getAllUsers) // we can add multiple roles here, like admin, ownwer and so on.
router.route('/showMe').get(authenticateUser, showCurrentUser)
router.route('/updateUser').patch(authenticateUser, updateUser)
router.route('/updateUserPassword').patch(authenticateUser, updateUserPassword)

// this rout with :id must be placed last so that it won't interfer with previous routes mentioned above this
router.route('/:id').get(authenticateUser, getSingleUser)

module.exports = router
