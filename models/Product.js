const mongoose = require('mongoose')
const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide product name'],
      maxLength: [100, 'Name cannot be more than 100 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
      default: 0,
    },
    description: {
      type: String,
      required: [true, 'Please provide product descritption'],
      maxLength: [1000, 'Description cannot be more than 1000 characters'],
    },
    image: {
      type: String,
      default: '/uploads/example.jpeg',
    },
    category: {
      type: String,
      required: [true, 'Please provide product category'],
      enum: ['office', 'kitchen', 'bedroom'],
    },
    company: {
      type: String,
      required: [true, 'Please provide company'],
      enum: {
        values: ['ikea', 'liddy', 'marcos'],
        message: '{VALUE} is not supported',
      },
    },
    // we will see how this array of String works when we send data from postman
    colors: {
      type: [String],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    // we will calculate this rating and num of reviews as we build up
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user'],
    },
  },
  // setting virtuals here to true. Meaning, product model will now accept virtuals
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

// using the name 'reviews' as we used the same name in populate() in getSingleProduct controller
// ProductSchema.virtual('reviews', {
//   ref: 'Review',
//   localField: '_id', // this is the Product id
//   foreignField: 'product', // field in the Review that reference Product Model
//   justOne: false, // want more documents of reviews not just one document
//   match: { rating: 3 },
// })

ProductSchema.post('remove', async function () {
  // Even though this is product schema, I can access other model (like Review)
  await this.model('Review').deleteMany({ product: this._id }) // product is the prop on Review, so we delete that

  // the above means, Remove all reviews associated with product having _id
})

module.exports = mongoose.model('Product', ProductSchema)
