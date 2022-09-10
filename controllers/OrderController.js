const Order = require('../models/Order')
const Product = require('../models/Product')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const { checkPermissions } = require('../utils')

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = 'someRandomValue'
  return { client_secret, amount } // mimicing the response of real stripe function
}

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body
  if (!cartItems || cartItems.length < 1) {
    throw new BadRequestError('No cart items provided')
  }

  if (!tax || !shippingFee) {
    throw new BadRequestError('Please provide tax and shipping fee')
  }

  let orderItems = [] // used below to create the actual Order after stipe payment
  let subtotal = 0 // price * qty for each product

  for (let item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product })
    if (!dbProduct) {
      throw new NotFoundError(`No product with id ${item.product}`)
    }

    const { name, image, price, _id } = dbProduct // no need of _id here as it is same as item.product,
    // but that's ok lets have it here, no harm

    const singleOrderItem = {
      name,
      price,
      image,
      amount: item.amount, // this is coming from front-end
      product: _id,
    }

    // add this singleOrderItem to orderItems array
    orderItems = [...orderItems, singleOrderItem]

    // I also need to calculate subtotal of my cart
    subtotal += item.amount * price // note that we are choosing price (from db, not from front-end) and amount (from front-end)
  }

  // once we have orderItems and subtotal calcualated on the items fetched
  // from db, we can setup stripe (fake stripe in this case) to
  // get the client_secret and send it to front-end

  const total = subtotal + tax + shippingFee

  // get client secret (from stripe, but fake stripe in this case)
  // we will setup fakeStripeAPI function to mimic real stripe function
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: 'usd',
  })

  // look at the Order schema for all required values
  const order = await Order.create({
    cartItems: orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  })

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret })
}

const getAllOrders = async (req, res) => {
  const orders = await Order.find({}).populate({ path: 'user', select: 'name' })
  res.status(StatusCodes.OK).json({ orders })
}

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params
  const order = await Order.findOne({ _id: orderId })
  if (!order) {
    throw new NotFoundError(`No order with id ${orderId}`)
  }
  checkPermissions(req.user, order.user)
  res.status(StatusCodes.OK).json({ order })
}

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params
  const { paymentIntentId } = req.body
  if (!paymentIntentId) {
    throw new BadRequestError('Please provide payment intenet ID')
  }
  const order = await Order.findOne({ _id: orderId })
  if (!order) {
    throw new NotFoundError(`No order with id ${orderId}`)
  }
  // we don't want Susan to update Peter's order so checking permissions
  checkPermissions(req.user, order.user)

  // save payment intenet id and also the status
  order.paymentIntentId = paymentIntentId
  order.status = 'paid'

  await order.save()

  res.status(StatusCodes.OK).json({ order })
}
const getCurrentUserOrders = async (req, res) => {
  // populating here to check who the user is, for ease
  const orders = await Order.find({ user: req.user.userId }).populate({
    path: 'user',
    select: 'name',
  })
  res.status(StatusCodes.OK).json({ orders })
}

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
}
