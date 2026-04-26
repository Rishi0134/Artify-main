const express = require("express");

const {
  createArtwork,
  deleteArtwork,
  getArtworkById,
  getArtworks,
  updateArtwork,
} = require("../controllers/artworkController");
const { authorize, protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.route("/").get(getArtworks).post(protect, authorize("artist", "admin"), upload.single("image"), createArtwork);
router
  .route("/:id")
  .get(getArtworkById)
  .put(protect, authorize("artist", "admin"), upload.single("image"), updateArtwork)
  .delete(protect, authorize("artist", "admin"), deleteArtwork);

module.exports = router;
