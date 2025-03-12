const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  replies: [{
    username: {
      type: String,
    },
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reply: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: new Date().getTime()
    }
  }],
},{ timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
