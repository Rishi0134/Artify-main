const express = require("express");

const { createReview, getArtworkReviews, getMyReviews } = require("../controllers/reviewController");
const { authorize, protect } = require("../middleware/authMiddleware");

const router = express.Router();

// User's own reviews (must come before /:artworkId to avoid route conflict)
router.get("/user/my", protect, authorize("user"), getMyReviews);

// Create or update a review
router.post("/", protect, authorize("user"), createReview);

// Public — get reviews for a specific artwork
router.get("/:artworkId", getArtworkReviews);

module.exports = router;