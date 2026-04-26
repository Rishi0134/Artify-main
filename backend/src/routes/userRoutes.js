const express = require("express");

const { getProfile, updateProfile, getArtists } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Public - list all artists (used by chat page dropdown)
router.get("/artists", getArtists);

// Protected - user profile
router.get("/profile", protect, getProfile);
router.put("/update", protect, upload.single("profileImage"), updateProfile);

module.exports = router;