const express = require("express");

const {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} = require("../controllers/categoryController");
const { authorize, protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(getCategories).post(protect, authorize("admin"), createCategory);
router
  .route("/:id")
  .put(protect, authorize("admin"), updateCategory)
  .delete(protect, authorize("admin"), deleteCategory);

module.exports = router;
