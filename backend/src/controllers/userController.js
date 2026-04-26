const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  profileImage: user.profileImage,
  bio: user.bio,
  createdAt: user.createdAt,
});

const getProfile = asyncHandler(async (req, res) => {
  sendResponse(res, {
    data: sanitizeUser(req.user),
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user || user.isDeleted) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, phone, bio } = req.body;

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (bio !== undefined) user.bio = bio;

  if (req.file) {
    user.profileImage = `/uploads/${req.file.filename}`;
  }

  await user.save();

  sendResponse(res, {
    message: "Profile updated successfully",
    data: sanitizeUser(user),
  });
});

// GET /api/users/artists — public endpoint to list all active artists
const getArtists = asyncHandler(async (req, res) => {
  const artists = await User.find({
    role: "artist",
    isDeleted: false,
    isBlocked: false,
  })
    .select("name email profileImage bio")
    .sort({ name: 1 });

  sendResponse(res, { data: artists });
});

module.exports = { getProfile, updateProfile, getArtists };