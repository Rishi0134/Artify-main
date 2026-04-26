const express = require("express");

const {
  deleteArtwork,
  deleteUser,
  getArtists,
  getArtworks,
  getCategories,
  getOrders,
  getStats,
  getUsers,
  updateOrder,
  updateUser,
} = require("../controllers/adminController");
const { authorize, protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/stats", getStats);
router.get("/users", getUsers);
router.get("/artists", getArtists);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/artworks", getArtworks);
router.delete("/artworks/:id", deleteArtwork);
router.get("/orders", getOrders);
router.put("/orders/:id", updateOrder);
router.get("/categories", getCategories);

module.exports = router;
