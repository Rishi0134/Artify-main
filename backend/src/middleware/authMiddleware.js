const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const normalizeRole = (role = "") => (role === "customer" ? "user" : role);

const verifyToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized, token missing");
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    res.status(401);
    throw new Error("Invalid or expired token");
  }

  const user = await User.findById(decoded.id).select("-password");

  if (!user || user.isDeleted) {
    res.status(401);
    throw new Error("User not found or inactive");
  }

  if (user.isBlocked) {
    res.status(403);
    throw new Error("Your account is blocked");
  }

  req.user = user;
  next();
});

const authorize = (...roles) => {
  return (req, res, next) => {
    const allowed = roles.map(normalizeRole);
    const currentRole = normalizeRole(req.user?.role || "");

    if (!allowed.includes(currentRole)) {
      res.status(403);
      throw new Error("Access denied: insufficient permissions");
    }

    next();
  };
};

const isAdmin = (req, res, next) => {
  const role = normalizeRole(req.user?.role || "");

  if (role !== "admin") {
    res.status(403);
    throw new Error("Admin access required");
  }

  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  protect: verifyToken,
  authorize,
};
