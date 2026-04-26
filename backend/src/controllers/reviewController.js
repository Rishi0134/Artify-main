const Artwork = require("../models/Artwork");
const Order = require("../models/Order");
const Review = require("../models/Review");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");

/* ─────────────────────────────────────────
   POST /api/reviews
   Create or update a review (user must have purchased the artwork)
───────────────────────────────────────── */
const createReview = asyncHandler(async (req, res) => {
  const { artworkId, rating, comment = "" } = req.body;

  if (!artworkId || !rating) {
    res.status(400);
    throw new Error("Artwork and rating are required");
  }

  if (Number(rating) < 1 || Number(rating) > 5) {
    res.status(400);
    throw new Error("Rating must be between 1 and 5");
  }

  const artwork = await Artwork.findById(artworkId);
  if (!artwork) {
    res.status(404);
    throw new Error("Artwork not found");
  }

  // Check purchase — artworkId in Order is stored as ObjectId
  const hasOrder = await Order.findOne({
    artworkId: artwork._id,
    userId: req.user._id,
  });

  if (!hasOrder) {
    res.status(403);
    throw new Error("You can only review artwork you have purchased");
  }

  const review = await Review.findOneAndUpdate(
    { userId: req.user._id, artworkId: artwork._id },
    { rating: Number(rating), comment },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate("userId", "name profileImage");

  sendResponse(res, {
    statusCode: 201,
    message: "Review saved successfully",
    data: review,
  });
});

/* ─────────────────────────────────────────
   GET /api/reviews/user/my
   Get all reviews written by the logged-in user
   (with artwork info so Reviews page can display them)
───────────────────────────────────────── */
const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ userId: req.user._id })
    .populate("artworkId", "title imageUrl image price")
    .populate("userId", "name profileImage")
    .sort({ updatedAt: -1 });

  sendResponse(res, { data: reviews });
});

/* ─────────────────────────────────────────
   GET /api/reviews/:artworkId
   Public — get all reviews for a single artwork
───────────────────────────────────────── */
const getArtworkReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ artworkId: req.params.artworkId })
    .populate("userId", "name profileImage")
    .sort({ createdAt: -1 });

  sendResponse(res, { data: reviews });
});

module.exports = {
  createReview,
  getMyReviews,
  getArtworkReviews,
};