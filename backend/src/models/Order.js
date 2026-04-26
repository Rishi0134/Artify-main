const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    artworkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artwork",
      required: true,
    },
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "razorpay"],
      default: "cod",
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    billingDetails: {
      customerName: { type: String, default: "", trim: true },
      customerEmail: { type: String, default: "", trim: true },
      customerPhone: { type: String, default: "", trim: true },
      artworkTitle: { type: String, default: "", trim: true },
      artistName: { type: String, default: "", trim: true },
      categoryName: { type: String, default: "", trim: true },
      subtotal: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      currency: { type: String, default: "INR", trim: true },
    },
    razorpay: {
      orderId: { type: String, default: "", trim: true },
      paymentId: { type: String, default: "", trim: true },
      signature: { type: String, default: "", trim: true },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
