const crypto = require("crypto");

const Artwork = require("../models/Artwork");
const Order = require("../models/Order");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const { sendInvoiceEmail } = require("../utils/invoiceMailer");

const orderPopulate = [
  { path: "userId", select: "name email phone profileImage" },
  {
    path: "artworkId",
    populate: [
      { path: "categoryId", select: "name" },
      { path: "artistId", select: "name email phone" },
      { path: "artist", select: "name email phone" },
    ],
  },
  { path: "artistId", select: "name email phone profileImage" },
];

const createInvoiceNumber = () => `ARTIFY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const normalizeStatus = (status) =>
  status === "sold" ? "sold" : ["available", "pending", "approved"].includes(status) ? "available" : status;

const getArtworkOwnerId = (artwork) => artwork.artistId || artwork.artist;

const getArtworkForSale = async (artworkId) => {
  const artwork = await Artwork.findById(artworkId)
    .populate("categoryId", "name")
    .populate("categoryRef", "name")
    .populate("artistId", "name email phone")
    .populate("artist", "name email phone");

  if (!artwork) {
    const error = new Error("Artwork not found");
    error.statusCode = 404;
    throw error;
  }

  if (normalizeStatus(artwork.status) === "sold") {
    const error = new Error("Artwork is already sold");
    error.statusCode = 400;
    throw error;
  }

  return artwork;
};

const buildBillingDetails = (user, artwork) => {
  const artist = artwork.artistId || artwork.artist;
  const category = artwork.categoryId || artwork.categoryRef;
  const subtotal = Number(artwork.price || 0);
  const tax = 0;

  return {
    customerName: user.name || "",
    customerEmail: user.email || "",
    customerPhone: user.phone || "",
    artworkTitle: artwork.title || "",
    artistName: artist?.name || "",
    categoryName: category?.name || artwork.category || "",
    subtotal,
    tax,
    total: subtotal + tax,
    currency: "INR",
  };
};

const createPersistedOrder = async ({
  user,
  artwork,
  paymentMethod,
  paymentStatus,
  razorpay = {},
}) => {
  const existingOrder = await Order.findOne({ artworkId: artwork._id, userId: user._id });
  if (existingOrder) {
    const error = new Error("You have already ordered this artwork");
    error.statusCode = 400;
    throw error;
  }

  const artistId = getArtworkOwnerId(artwork);
  if (!artistId) {
    const error = new Error("Artwork artist information is missing");
    error.statusCode = 400;
    throw error;
  }

  const billingDetails = buildBillingDetails(user, artwork);
  const order = await Order.create({
    userId: user._id,
    artworkId: artwork._id,
    artistId: artistId._id || artistId,
    price: billingDetails.total,
    paymentMethod,
    status: paymentStatus === "paid" ? "completed" : "pending",
    paymentStatus,
    invoiceNumber: createInvoiceNumber(),
    billingDetails,
    razorpay: {
      orderId: razorpay.orderId || "",
      paymentId: razorpay.paymentId || "",
      signature: razorpay.signature || "",
    },
  });

  artwork.status = "sold";
  await artwork.save();

  const populatedOrder = await Order.findById(order._id).populate(orderPopulate);

  try {
    await sendInvoiceEmail(populatedOrder);
  } catch (error) {
    console.error("Invoice email failed:", error.message);
  }

  return populatedOrder;
};

const createRazorpayGatewayOrder = async ({ amount, receipt }) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    const error = new Error("Razorpay keys are missing in backend environment");
    error.statusCode = 500;
    throw error;
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount,
      currency: "INR",
      receipt,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.error?.description || "Failed to create Razorpay order");
    error.statusCode = 502;
    throw error;
  }

  return data;
};

const getPaymentConfig = asyncHandler(async (req, res) => {
  sendResponse(res, {
    data: {
      codEnabled: true,
      razorpayEnabled: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    },
  });
});

const createOrder = asyncHandler(async (req, res) => {
  const { artworkId, paymentMethod = "cod" } = req.body;

  if (!artworkId) {
    res.status(400);
    throw new Error("Artwork is required");
  }

  if (paymentMethod !== "cod") {
    res.status(400);
    throw new Error("Use checkout flow for online payments");
  }

  const user = await User.findById(req.user._id);
  const artwork = await getArtworkForSale(artworkId);
  const order = await createPersistedOrder({
    user,
    artwork,
    paymentMethod: "cod",
    paymentStatus: "unpaid",
  });

  sendResponse(res, {
    statusCode: 201,
    message: "Order created successfully with Cash on Delivery",
    data: order,
  });
});

const createCheckout = asyncHandler(async (req, res) => {
  const { artworkId, paymentMethod = "razorpay" } = req.body;

  if (!artworkId) {
    res.status(400);
    throw new Error("Artwork is required");
  }

  const user = await User.findById(req.user._id);
  const artwork = await getArtworkForSale(artworkId);
  const billingDetails = buildBillingDetails(user, artwork);

  if (paymentMethod === "cod") {
    const order = await createPersistedOrder({
      user,
      artwork,
      paymentMethod: "cod",
      paymentStatus: "unpaid",
    });

    return sendResponse(res, {
      statusCode: 201,
      message: "Order placed with Cash on Delivery",
      data: {
        order,
        bill: {
          invoiceNumber: order.invoiceNumber,
          ...order.billingDetails,
        },
      },
    });
  }

  const gatewayOrder = await createRazorpayGatewayOrder({
    amount: Math.round(billingDetails.total * 100),
    receipt: `artify_${artwork._id}_${Date.now()}`,
  });

  sendResponse(res, {
    statusCode: 201,
    message: "Checkout created successfully",
    data: {
      gateway: {
        key: process.env.RAZORPAY_KEY_ID,
        amount: gatewayOrder.amount,
        currency: gatewayOrder.currency,
        orderId: gatewayOrder.id,
        name: "Artify Virtual Art Gallery",
        description: `Purchase of ${billingDetails.artworkTitle}`,
        prefill: {
          name: user.name || "",
          email: user.email || "",
          contact: user.phone || "",
        },
      },
      artworkId,
      bill: {
        invoiceNumber: createInvoiceNumber(),
        ...billingDetails,
      },
    },
  });
});

const verifyOnlinePayment = asyncHandler(async (req, res) => {
  const { artworkId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!artworkId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400);
    throw new Error("Payment verification details are required");
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    res.status(500);
    throw new Error("Razorpay secret is missing in backend environment");
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error("Payment verification failed");
  }

  const user = await User.findById(req.user._id);
  const artwork = await getArtworkForSale(artworkId);
  const order = await createPersistedOrder({
    user,
    artwork,
    paymentMethod: "razorpay",
    paymentStatus: "paid",
    razorpay: {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    },
  });

  sendResponse(res, {
    statusCode: 201,
    message: "Payment verified and order created successfully",
    data: order,
  });
});

const getOrders = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === "artist") {
    filter.artistId = req.user._id;
  }

  const orders = await Order.find(filter).populate(orderPopulate).sort({ createdAt: -1 });

  sendResponse(res, {
    data: orders,
  });
});

const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id })
    .populate(orderPopulate)
    .sort({ createdAt: -1 });

  sendResponse(res, {
    data: orders,
  });
});

const updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const canManage =
    req.user.role === "admin" ||
    (req.user.role === "artist" && String(order.artistId) === String(req.user._id));

  if (!canManage) {
    res.status(403);
    throw new Error("Not allowed to update this order");
  }

  const { status, paymentStatus } = req.body;

  if (status && ["pending", "completed"].includes(status)) {
    order.status = status;
  }

  if (paymentStatus && ["paid", "unpaid"].includes(paymentStatus)) {
    order.paymentStatus = paymentStatus;
  }

  if (order.paymentStatus === "paid") {
    order.status = "completed";
  }

  await order.save();

  const populatedOrder = await Order.findById(order._id).populate(orderPopulate);

  sendResponse(res, {
    message: "Order updated successfully",
    data: populatedOrder,
  });
});

module.exports = {
  createCheckout,
  createOrder,
  getPaymentConfig,
  getOrders,
  getUserOrders,
  updateOrder,
  verifyOnlinePayment,
};
