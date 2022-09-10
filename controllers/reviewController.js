const Review = require('../models/Review')
const Product = require('../models/Product')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const checkPermissions = require('../utils/checkPermissions')

const createReview = async (req, res) => {
  const { product: productId } = req.body

  // req.body contains product.
  // First we need to validate if product sent in req.body actually exists
  // and also check that product is valid

  const isValidProduct = await Product.findOne({ _id: productId })
  if (!isValidProduct) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`)
  }

  // second way of checking if user already submitted a review for this product.
  // The first way was in the Review model - ReviewSchema.index({ product: 1, user: 1 }, { unique: true })

  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  })

  // if user already submitted review for this product then he shouldn't be able to create review again
  if (alreadySubmitted) {
    throw new CustomError.BadRequestError(
      `This user with id ${req.user.userId} already left a review for this product id ${productId}`
    )
  }

  req.body.user = req.user.userId
  const review = await Review.create(req.body)
  res.status(StatusCodes.CREATED).json({ review })
}

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({})
    .populate({
      path: 'product',
      select: 'name company price',
    })
    .populate({
      path: 'user',
      select: 'name',
    })
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length })
}

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params
  const review = await Review.findOne({ _id: reviewId })
  if (!review) {
    throw new CustomError.NotFoundError(`No review found with id ${reviewId}`)
  }
  res.status(StatusCodes.OK).json({ review })
}

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params
  const { rating, title, comment } = req.body
  const review = await Review.findOne({ _id: reviewId })
  if (!review) {
    throw new CustomError.NotFoundError(`No review found with id ${reviewId}`)
  }
  checkPermissions(req.user, review.user)
  // since we are setting all 3 props here, even if one is missing we get an error.
  // Optionally, if u want to set any one, you can also do that using if statemets
  // if title is present in req.body then set that, if comment is present then set that and so on
  review.title = title
  review.rating = rating
  review.comment = comment
  await review.save()
  res.status(StatusCodes.OK).json({ review })
}

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params
  const review = await Review.findOne({ _id: reviewId })
  if (!review) {
    throw new CustomError.NotFoundError(`No review found with id ${reviewId}`)
  }
  // check if user who created the review is actually requesting it. If not throw unauthorized error
  // if (review.user.toString() !== req.user.userId) {
  //   throw new CustomError.UnAuthorizedError(
  //     'Not authorized to access this review'
  //   )
  // }

  // below code does same thing as above commmented code
  checkPermissions(req.user, review.user)

  await review.remove()
  res.status(StatusCodes.OK).json({ msg: 'Successfully deleted the review' })
}

const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params
  const reviews = await Review.find({ product: productId })
  console.log(reviews)
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length })
}

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
}
