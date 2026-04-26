const Artwork = require("../models/Artwork");
const Category = require("../models/Category");
const Order = require("../models/Order");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");

const getStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalArtists, totalArtworks, totalOrders, revenueResult] = await Promise.all([
    User.countDocuments({ role: "user", isDeleted: false }),
    User.countDocuments({ role: "artist", isDeleted: false }),
    Artwork.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$price" } } },
    ]),
  ]);

  sendResponse(res, {
    data: {
      totalUsers,
      totalArtists,
      totalArtworks,
      totalOrders,
      totalRevenue: revenueResult[0]?.totalRevenue || 0,
    },
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "user", isDeleted: false }).select("-password");
  sendResponse(res, { data: users });
});

const getArtists = asyncHandler(async (req, res) => {
  const artists = await User.find({ role: "artist", isDeleted: false }).select("-password");
  sendResponse(res, { data: artists });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user || user.isDeleted) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, phone, bio, role, isBlocked } = req.body;

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (bio !== undefined) user.bio = bio;
  if (role && ["user", "artist"].includes(role)) user.role = role;
  if (typeof isBlocked === "boolean") user.isBlocked = isBlocked;

  await user.save();

  sendResponse(res, {
    message: "User updated successfully",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
      bio: user.bio,
      isBlocked: user.isBlocked,
    },
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user || user.isDeleted) {
    res.status(404);
    throw new Error("User not found");
  }

  user.isDeleted = true;
  user.deletedAt = new Date();
  user.deletedBy = req.user._id;
  await user.save();

  sendResponse(res, {
    message: "User deleted successfully",
  });
});

const getArtworks = asyncHandler(async (req, res) => {
  const artworks = await Artwork.find()
    .populate("artistId", "name email")
    .populate("categoryId", "name")
    .sort({ createdAt: -1 });

  sendResponse(res, { data: artworks });
});

const deleteArtwork = asyncHandler(async (req, res) => {
  const artwork = await Artwork.findById(req.params.id);

  if (!artwork) {
    res.status(404);
    throw new Error("Artwork not found");
  }

  await artwork.deleteOne();

  sendResponse(res, {
    message: "Artwork deleted successfully",
  });
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("userId", "name email")
    .populate("artistId", "name email")
    .populate("artworkId", "title imageUrl")
    .sort({ createdAt: -1 });

  sendResponse(res, { data: orders });
});

const updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (req.body.status && ["pending", "completed"].includes(req.body.status)) {
    order.status = req.body.status;
  }

  if (req.body.paymentStatus && ["paid", "unpaid"].includes(req.body.paymentStatus)) {
    order.paymentStatus = req.body.paymentStatus;
  }

  await order.save();

  const populatedOrder = await Order.findById(order._id)
    .populate("userId", "name email")
    .populate("artistId", "name email")
    .populate("artworkId", "title imageUrl");

  sendResponse(res, {
    message: "Order updated successfully",
    data: populatedOrder,
  });
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  sendResponse(res, { data: categories });
});

module.exports = {
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
};
