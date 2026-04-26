const Artwork = require("../models/Artwork");
const Category = require("../models/Category");
const Review = require("../models/Review");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");

const artworkPopulate = [
  { path: "artistId", select: "name email profileImage bio" },
  { path: "artist", select: "name email profileImage bio" },
  { path: "categoryId", select: "name description" },
  { path: "categoryRef", select: "name description" },
];

const normalizeArtwork = (artworkDoc) => {
  const artwork = artworkDoc.toObject ? artworkDoc.toObject() : artworkDoc;
  const normalizedStatus =
    artwork.status === "sold"
      ? "sold"
      : artwork.status === "available" || artwork.status === "approved" || artwork.status === "pending"
        ? "available"
        : "available";

  return {
    ...artwork,
    imageUrl: artwork.imageUrl || artwork.image || "",
    artistId: artwork.artistId || artwork.artist || null,
    categoryId: artwork.categoryId || artwork.categoryRef || null,
    status: normalizedStatus,
  };
};

const getArtworks = asyncHandler(async (req, res) => {
  const { search = "", categoryId = "", artistId = "", status = "" } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (categoryId) {
    filter.categoryId = categoryId;
  }

  if (artistId) {
    filter.artistId = artistId;
  }

  if (status) {
    filter.status = status;
  }

  const artworks = await Artwork.find(filter)
    .populate(artworkPopulate)
    .sort({ createdAt: -1 });

  sendResponse(res, {
    data: artworks.map(normalizeArtwork),
  });
});

const getArtworkById = asyncHandler(async (req, res) => {
  const artwork = await Artwork.findById(req.params.id).populate(artworkPopulate);

  if (!artwork) {
    res.status(404);
    throw new Error("Artwork not found");
  }

  const reviews = await Review.find({ artworkId: artwork._id })
    .populate("userId", "name profileImage")
    .sort({ createdAt: -1 });

  sendResponse(res, {
    data: {
      ...normalizeArtwork(artwork),
      reviews,
    },
  });
});

const createArtwork = asyncHandler(async (req, res) => {
  const { title, description = "", price, categoryId } = req.body;

  if (!title || !price || !categoryId) {
    res.status(400);
    throw new Error("Title, price, and category are required");
  }

  if (!req.file) {
    res.status(400);
    throw new Error("Artwork image is required");
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  const artwork = await Artwork.create({
    title,
    description,
    price: Number(price),
    imageUrl: `/uploads/${req.file.filename}`,
    categoryId,
    artistId: req.user._id,
  });

  const populatedArtwork = await Artwork.findById(artwork._id).populate(artworkPopulate);

  sendResponse(res, {
    statusCode: 201,
    message: "Artwork uploaded successfully",
    data: normalizeArtwork(populatedArtwork),
  });
});

const updateArtwork = asyncHandler(async (req, res) => {
  const artwork = await Artwork.findById(req.params.id);

  if (!artwork) {
    res.status(404);
    throw new Error("Artwork not found");
  }

  const ownerId = artwork.artistId || artwork.artist;
  const isOwner = String(ownerId) === String(req.user._id);
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("Not allowed to update this artwork");
  }

  if (req.body.categoryId) {
    const category = await Category.findById(req.body.categoryId);
    if (!category) {
      res.status(404);
      throw new Error("Category not found");
    }
    artwork.categoryId = req.body.categoryId;
  }

  if (req.body.title !== undefined) {
    artwork.title = req.body.title;
  }

  if (req.body.description !== undefined) {
    artwork.description = req.body.description;
  }

  if (req.body.price !== undefined) {
    artwork.price = Number(req.body.price);
  }

  if (req.body.status && ["available", "sold"].includes(req.body.status)) {
    artwork.status = req.body.status;
  }

  if (req.file) {
    artwork.imageUrl = `/uploads/${req.file.filename}`;
  }

  await artwork.save();

  const populatedArtwork = await Artwork.findById(artwork._id).populate(artworkPopulate);

  sendResponse(res, {
    message: "Artwork updated successfully",
    data: normalizeArtwork(populatedArtwork),
  });
});

const deleteArtwork = asyncHandler(async (req, res) => {
  const artwork = await Artwork.findById(req.params.id);

  if (!artwork) {
    res.status(404);
    throw new Error("Artwork not found");
  }

  const ownerId = artwork.artistId || artwork.artist;
  const isOwner = String(ownerId) === String(req.user._id);
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("Not allowed to delete this artwork");
  }

  await artwork.deleteOne();

  sendResponse(res, {
    message: "Artwork deleted successfully",
  });
});

module.exports = {
  createArtwork,
  deleteArtwork,
  getArtworkById,
  getArtworks,
  updateArtwork,
};
