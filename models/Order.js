const mongoose = require('mongoose')

// we can techincally set this up directly as a simple object in cartItems prop in OrderSchema, but this is the clean way to setup as we will get the validation for the cart item as well

const SingleCartItemSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  // amount is the quantity
  amount: {
    type: Number,
    required: true,
  },
  product: {
    type: mongoose.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
})

const OrderSchema = new mongoose.Schema(
  {
    tax: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    // this is the total for all cart items where for each item, we multiply price by quantity
    subtotal: {
      type: Number,
      required: true,
    },
    // total = subtotal + tax + shippingFee
    total: {
      type: Number,
      required: true,
    },
    // we can techincally set this up directly as a simple object in cartItems here, but this is the clean way to setup as a different schema as we will get the validation for SingleCartItemSchema as well

    cartItems: [SingleCartItemSchema],
    status: {
      type: String,
      enum: ['pending', 'failed', 'paid', 'delivered', 'cancelled'],
      default: 'pending',
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user'],
    },
    clientSecret: {
      type: String,
      required: true,
    },
    paymentIntentId: {
      type: String,
    },
  },
  { timestamps: true }
)

const Order = mongoose.model('Order', OrderSchema)

module.exports = Order

/*

The above two lines is same as
module.exports = mongoose.model('Order', OrderSchema)

*/
