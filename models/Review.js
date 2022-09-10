const mongoose = require('mongoose')
const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide a rating'],
    },
    title: {
      type: String,
      trim: true,
      required: [true, 'Please provide review title'],
      maxLength: 100,
    },
    comment: {
      type: String,
      required: [true, 'Please provide review text'],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user'],
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Please provide a product'],
    },
  },
  { timestamps: true }
)

// one user - one review per one product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true })

// creating a static method (review instance can't access this but we can access directly access it on ReviewSchema)
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  // Here, I need to calculate average rating on this product id.
  // I need to take all the reviews associated with this product id, and then get average of them and
  // then attach it to this product (of productId given).
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        numOfReviews: { $sum: 1 },
      },
    },
  ])
  console.log('The result is', result) // [ { _id: null, averageRating: 2.5, numOfReviews: 2 } ]
  // notice that the result is an array
  // if we delete all reviews for this product then this array will just be empty, so we need to check if array has atleast one element
  // we will do that through optional chaining

  try {
    // All we are doing here is - go to product and add average rating and numOfReviews
    // If array is empty (when no reviews or all reviews get deleted), then set averageRating and numOfReviews to 0
    await this.model('Product').findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    )
  } catch (error) {
    console.log(error)
  }
}

// when a review is modified (created or updated or deleted) we need to calculate number of reviews (numOfReviews)
// for a product with which this review is associated and also calculate avg rating. So we use post save and remove hooks

ReviewSchema.post('save', async function () {
  console.log(
    'Adding or updating the review.... Average rating is calculating for the product...'
  )
  await this.constructor.calculateAverageRating(this.product) // this is how we access static method
})
ReviewSchema.post('remove', async function () {
  console.log(
    'Deleting the review.... Average rating is calculating for the product...'
  )
  await this.constructor.calculateAverageRating(this.product) // this is how we access static method
})

module.exports = mongoose.model('Review', ReviewSchema)
