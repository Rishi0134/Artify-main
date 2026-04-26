const express = require("express");

const {
  createCheckout,
  createOrder,
  getPaymentConfig,
  getOrders,
  getUserOrders,
  updateOrder,
  verifyOnlinePayment,
} = require("../controllers/orderController");
const { authorize, protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, authorize("user"), createOrder).get(protect, authorize("admin", "artist"), getOrders);
router.get("/payment-config", protect, authorize("user"), getPaymentConfig);
router.post("/checkout", protect, authorize("user"), createCheckout);
router.post("/verify-payment", protect, authorize("user"), verifyOnlinePayment);
router.get("/user", protect, authorize("user"), getUserOrders);
router.put("/:id", protect, authorize("admin", "artist"), updateOrder);

module.exports = router;
