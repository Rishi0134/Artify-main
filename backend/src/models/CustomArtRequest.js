const mongoose = require("mongoose");

const customArtRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    size: {
      type: String,
      default: "",
      trim: true,
    },
    medium: {
      type: String,
      default: "",
      trim: true,
    },
    colorPreferences: {
      type: String,
      default: "",
      trim: true,
    },
    deadline: {
      type: Date,
      default: null,
    },
    budget: {
      type: Number,
      default: null,
      min: 0,
    },
    referenceImageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    artistNote: {
      type: String,
      default: "",
      trim: true,
    },
    quotedPrice: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.CustomArtRequest ||
  mongoose.model("CustomArtRequest", customArtRequestSchema);