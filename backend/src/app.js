const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const artworkRoutes = require("./routes/artworkRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatRoutes = require("./routes/chatRoutes");
const customRequestRoutes = require("./routes/customRequestRoutes"); // ← NEW
const errorHandler = require("./middleware/errorMiddleware");

const app = express();
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

/* =======================
   SECURITY MIDDLEWARE
======================= */

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 300, // increased from 100 — chat pages make many requests
  message: "Too many requests, try again later",
  skip: (req) => req.method === "OPTIONS",
});

app.use(cors(corsOptions));
app.use(limiter);

/* =======================
   BODY PARSER
======================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =======================
   LOGGER
======================= */

app.use(morgan("dev"));

/* =======================
   HEALTH CHECK
======================= */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "OK",
    data: {},
  });
});

/* =======================
   API ROUTES
======================= */

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/artworks", artworkRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chats", chatRoutes); // ← ADDED
app.use("/api/custom-requests", customRequestRoutes); // ← NEW

/* =======================
   STATIC UPLOADS
======================= */

app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

/* =======================
   ERROR HANDLER (ALWAYS LAST)
======================= */

app.use(errorHandler);

module.exports = app;
