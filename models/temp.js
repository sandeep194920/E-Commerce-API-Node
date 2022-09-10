;[
  {
    $match: {
      product: new ObjectId('63156f49d6daad5d68142a3b'),
    },
  },
  {
    $group: {
      _id: null,
      averageRating: {
        $avg: '$rating',
      },
      numOfReviews: {
        $sum: 1,
      },
    },
  },
]
