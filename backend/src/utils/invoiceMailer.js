let cachedTransporter = null;

const isMailConfigured = () =>
  Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.MAIL_FROM
  );

const getTransporter = async () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const nodemailer = require("nodemailer");
  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return cachedTransporter;
};

const buildInvoiceHtml = (order) => {
  const bill = order.billingDetails || {};

  return `
    <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #1f2937;">
      <h1 style="margin-bottom: 8px;">Artify Invoice</h1>
      <p style="margin-top: 0;">Invoice Number: <strong>${order.invoiceNumber || "-"}</strong></p>
      <p>Order Date: ${new Date(order.createdAt).toLocaleString()}</p>

      <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <h2 style="margin-top: 0;">Customer Details</h2>
        <p>${bill.customerName || "-"}</p>
        <p>${bill.customerEmail || "-"}</p>
        <p>${bill.customerPhone || "-"}</p>
      </div>

      <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <h2 style="margin-top: 0;">Artwork Details</h2>
        <p><strong>Artwork:</strong> ${bill.artworkTitle || order.artworkId?.title || "-"}</p>
        <p><strong>Artist:</strong> ${bill.artistName || order.artistId?.name || "-"}</p>
        <p><strong>Category:</strong> ${bill.categoryName || "-"}</p>
        <p><strong>Payment Method:</strong> ${String(order.paymentMethod || "-").toUpperCase()}</p>
        <p><strong>Payment Status:</strong> ${String(order.paymentStatus || "-").toUpperCase()}</p>
        <p><strong>Status:</strong> ${String(order.status || "-").toUpperCase()}</p>
      </div>

      <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <h2 style="margin-top: 0;">Bill Summary</h2>
        <p><strong>Subtotal:</strong> Rs. ${bill.subtotal || order.price || 0}</p>
        <p><strong>Tax:</strong> Rs. ${bill.tax || 0}</p>
        <p><strong>Total:</strong> Rs. ${bill.total || order.price || 0}</p>
      </div>

      <p>This invoice was generated automatically by Artify Virtual Art Gallery.</p>
    </div>
  `;
};

const sendInvoiceEmail = async (order) => {
  if (!isMailConfigured()) {
    return {
      sent: false,
      reason: "Mail configuration is missing",
    };
  }

  const recipient = order?.billingDetails?.customerEmail || order?.userId?.email;
  if (!recipient) {
    return {
      sent: false,
      reason: "Customer email is missing",
    };
  }

  const transporter = await getTransporter();
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: recipient,
    subject: `Artify Invoice ${order.invoiceNumber}`,
    html: buildInvoiceHtml(order),
  });

  return {
    sent: true,
  };
};

module.exports = {
  sendInvoiceEmail,
};
