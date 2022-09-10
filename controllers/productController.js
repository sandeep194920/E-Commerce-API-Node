const Product = require('../models/Product')
const { StatusCodes } = require('http-status-codes')
const CustomErrors = require('../errors')
const path = require('path')
const createProduct = async (req, res) => {
  req.body.user = req.user.userId // req.uesr.uesrID comes from auth mw
  const product = await Product.create(req.body)
  res.status(StatusCodes.CREATED).json({ product })
}

const getAllProducts = async (req, res) => {
  const products = await Product.find({})
  res.status(StatusCodes.OK).json({ products, count: products.length })
}

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params

  // populate will now work as we have added virtuals - true to product model

  // const product = await Product.findOne({ _id: productId }).populate('reviews')
  const product = await Product.findOne({ _id: productId })
  if (!product) {
    throw new CustomErrors.NotFoundError(`No product with ID ${productId}`)
  }
  res.status(StatusCodes.OK).json({ product })
}

const updateProduct = async (req, res) => {
  const { id: productId } = req.params
  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  })
  if (!product) {
    throw new CustomErrors.NotFoundError(`No product with ID ${productId}`)
  }
  res.status(StatusCodes.OK).json({ product })
}

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params
  const product = await Product.findOne({ _id: productId })
  if (!product) {
    throw new CustomErrors.NotFoundError(`No product with ID ${productId}`)
  }
  // we are not doing findOneAndDelete here because we will do some other functionality later
  // after finding the product and before deleting it here
  await product.remove()
  res.status(StatusCodes.OK).json({ msg: 'Success! Product removed' })
}

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new CustomErrors.BadRequestError('No file uploaded')
  }
  const productImage = req.files.image
  if (!productImage.mimetype.startsWith('image')) {
    throw new CustomErrors.BadRequestError('Please upload an image file')
  }
  const maxSize = 1024 * 1024
  if (productImage.size > maxSize) {
    throw new CustomErrors.BadRequestError(
      'Please upload an image of size less than 1Mb'
    )
  }
  // the image path will be the complete path (DESTINATION PATH we need to move) of image on our computer
  const imagePath = path.join(
    __dirname,
    '../public/uploads/',
    `${productImage.name}`
  )
  // moving our uploaded image to the above mentioned path
  productImage.mv(imagePath)
  res
    .status(StatusCodes.OK)
    .json({ img: { src: `/uploads/${productImage.name}` } })
}

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
}
