const express = require("express");
const { body, param } = require("express-validator");

const Chat = require("../models/Chat");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");

const router = express.Router();

const isParticipant = (chat, userId) =>
  chat.customer.toString() === userId.toString() ||
  chat.artist.toString() === userId.toString();

// GET /api/chats/my — get all chats for logged-in user (user or artist)
router.get(
  "/my",
  protect,
  asyncHandler(async (req, res) => {
    const chats = await Chat.find({
      $or: [{ customer: req.user._id }, { artist: req.user._id }],
    })
      .populate("customer", "name email")
      .populate("artist", "name email")
      .populate("order")
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: chats.length,
      data: chats,
    });
  })
);

// POST /api/chats/start — only "user" role can start a chat (was wrongly "customer")
router.post(
  "/start",
  protect,
  [
    body("artistId").isMongoId().withMessage("Valid artistId is required"),
    body("orderId").optional().isMongoId().withMessage("Invalid orderId"),
    body("subject").optional().trim().isLength({ min: 3, max: 120 }),
    body("message")
      .trim()
      .notEmpty()
      .withMessage("Message is required")
      .isLength({ min: 2, max: 2000 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    // FIX: role in DB is "user", not "customer"
    if (req.user.role !== "user") {
      res.status(403);
      throw new Error("Only customers can start new chats");
    }

    const { artistId, orderId, subject, message } = req.body;

    const artist = await User.findById(artistId);
    if (!artist || artist.role !== "artist") {
      res.status(404);
      throw new Error("Artist not found");
    }

    // Check if chat already exists for same customer+artist+order combo
    let chat = await Chat.findOne({
      customer: req.user._id,
      artist: artistId,
      ...(orderId ? { order: orderId } : { order: null }),
    });

    if (!chat) {
      chat = await Chat.create({
        customer: req.user._id,
        artist: artistId,
        order: orderId || null,
        subject: subject || "Customization discussion",
        messages: [{ sender: req.user._id, text: message }],
      });
    } else {
      chat.messages.push({ sender: req.user._id, text: message });
      await chat.save();
    }

    const populated = await chat.populate([
      { path: "customer", select: "name email" },
      { path: "artist", select: "name email" },
      { path: "messages.sender", select: "name email role" },
    ]);

    res.status(201).json({
      success: true,
      data: populated,
    });
  })
);

// GET /api/chats/:id — get a single chat thread
router.get(
  "/:id",
  protect,
  [param("id").isMongoId().withMessage("Invalid chat ID")],
  validate,
  asyncHandler(async (req, res) => {
    const chat = await Chat.findById(req.params.id)
      .populate("customer", "name email")
      .populate("artist", "name email")
      .populate("messages.sender", "name email role");

    if (!chat) {
      res.status(404);
      throw new Error("Chat not found");
    }

    if (!isParticipant(chat, req.user._id)) {
      res.status(403);
      throw new Error("You can only access your own chats");
    }

    res.json({
      success: true,
      data: chat,
    });
  })
);

// POST /api/chats/:id/messages — send a message in a chat (both user and artist)
router.post(
  "/:id/messages",
  protect,
  [
    param("id").isMongoId().withMessage("Invalid chat ID"),
    body("text")
      .trim()
      .notEmpty()
      .withMessage("Message is required")
      .isLength({ min: 1, max: 2000 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      res.status(404);
      throw new Error("Chat not found");
    }

    if (!isParticipant(chat, req.user._id)) {
      res.status(403);
      throw new Error("You can only message your own chats");
    }

    chat.messages.push({
      sender: req.user._id,
      text: req.body.text,
    });

    await chat.save();

    const updated = await Chat.findById(chat._id)
      .populate("customer", "name email")
      .populate("artist", "name email")
      .populate("messages.sender", "name email role");

    res.status(201).json({
      success: true,
      data: updated,
    });
  })
);

module.exports = router;