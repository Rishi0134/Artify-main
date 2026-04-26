const express = require("express");
const { body, param } = require("express-validator");

const CustomArtRequest = require("../models/CustomArtRequest");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const { sendResponse } = require("../utils/apiResponse");

const router = express.Router();

/* ─────────────────────────────────────────
   POST /api/custom-requests
   User submits a new custom art request
───────────────────────────────────────── */
router.post(
  "/",
  protect,
  [
    body("artistId").isMongoId().withMessage("Valid artistId is required"),
    body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 120 }),
    body("description").trim().notEmpty().withMessage("Description is required").isLength({ max: 2000 }),
    body("budget").optional({ nullable: true }).isFloat({ min: 0 }).withMessage("Budget must be a positive number"),
    body("deadline").optional({ nullable: true }).isISO8601().withMessage("Invalid date format"),
  ],
  validate,
  asyncHandler(async (req, res) => {
    if (req.user.role !== "user") {
      res.status(403);
      throw new Error("Only customers can submit custom art requests");
    }

    const { artistId, title, description, size, medium, colorPreferences, deadline, budget, referenceImageUrl } = req.body;

    const artist = await User.findById(artistId);
    if (!artist || artist.role !== "artist" || artist.isBlocked || artist.isDeleted) {
      res.status(404);
      throw new Error("Artist not found");
    }

    const request = await CustomArtRequest.create({
      user: req.user._id,
      artist: artistId,
      title,
      description,
      size: size || "",
      medium: medium || "",
      colorPreferences: colorPreferences || "",
      deadline: deadline || null,
      budget: budget || null,
      referenceImageUrl: referenceImageUrl || "",
    });

    const populated = await request.populate([
      { path: "user", select: "name email" },
      { path: "artist", select: "name email" },
    ]);

    sendResponse(res, {
      statusCode: 201,
      message: "Custom art request submitted successfully",
      data: populated,
    });
  })
);

/* ─────────────────────────────────────────
   GET /api/custom-requests/my
   User sees their own requests
───────────────────────────────────────── */
router.get(
  "/my",
  protect,
  asyncHandler(async (req, res) => {
    const filter =
      req.user.role === "artist"
        ? { artist: req.user._id }
        : { user: req.user._id };

    const requests = await CustomArtRequest.find(filter)
      .populate("user", "name email")
      .populate("artist", "name email")
      .sort({ createdAt: -1 });

    sendResponse(res, { data: requests });
  })
);

/* ─────────────────────────────────────────
   GET /api/custom-requests/:id
   Get a single request (participant only)
───────────────────────────────────────── */
router.get(
  "/:id",
  protect,
  [param("id").isMongoId().withMessage("Invalid request ID")],
  validate,
  asyncHandler(async (req, res) => {
    const request = await CustomArtRequest.findById(req.params.id)
      .populate("user", "name email")
      .populate("artist", "name email");

    if (!request) {
      res.status(404);
      throw new Error("Request not found");
    }

    const isParticipant =
      request.user._id.toString() === req.user._id.toString() ||
      request.artist._id.toString() === req.user._id.toString();

    if (!isParticipant && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Access denied");
    }

    sendResponse(res, { data: request });
  })
);

/* ─────────────────────────────────────────
   PATCH /api/custom-requests/:id/respond
   Artist accepts/rejects and optionally quotes a price
───────────────────────────────────────── */
router.patch(
  "/:id/respond",
  protect,
  [
    param("id").isMongoId().withMessage("Invalid request ID"),
    body("status").isIn(["accepted", "rejected"]).withMessage("Status must be accepted or rejected"),
    body("artistNote").optional().trim().isLength({ max: 1000 }),
    body("quotedPrice").optional({ nullable: true }).isFloat({ min: 0 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    if (req.user.role !== "artist") {
      res.status(403);
      throw new Error("Only artists can respond to requests");
    }

    const request = await CustomArtRequest.findById(req.params.id);

    if (!request) {
      res.status(404);
      throw new Error("Request not found");
    }

    if (request.artist.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("This is not your request");
    }

    if (request.status !== "pending") {
      res.status(400);
      throw new Error("Request has already been responded to");
    }

    request.status = req.body.status;
    if (req.body.artistNote !== undefined) request.artistNote = req.body.artistNote;
    if (req.body.quotedPrice !== undefined) request.quotedPrice = req.body.quotedPrice;

    await request.save();

    const populated = await request.populate([
      { path: "user", select: "name email" },
      { path: "artist", select: "name email" },
    ]);

    sendResponse(res, {
      message: `Request ${request.status}`,
      data: populated,
    });
  })
);

/* ─────────────────────────────────────────
   PATCH /api/custom-requests/:id/complete
   Artist marks a request as completed
───────────────────────────────────────── */
router.patch(
  "/:id/complete",
  protect,
  [param("id").isMongoId().withMessage("Invalid request ID")],
  validate,
  asyncHandler(async (req, res) => {
    if (req.user.role !== "artist") {
      res.status(403);
      throw new Error("Only artists can mark requests as completed");
    }

    const request = await CustomArtRequest.findById(req.params.id);

    if (!request || request.artist.toString() !== req.user._id.toString()) {
      res.status(404);
      throw new Error("Request not found");
    }

    if (request.status !== "accepted") {
      res.status(400);
      throw new Error("Only accepted requests can be completed");
    }

    request.status = "completed";
    await request.save();

    const populated = await request.populate([
      { path: "user", select: "name email" },
      { path: "artist", select: "name email" },
    ]);

    sendResponse(res, { message: "Request marked as completed", data: populated });
  })
);

module.exports = router;