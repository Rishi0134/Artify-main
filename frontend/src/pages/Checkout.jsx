import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { shopApi } from "../utils/shopApi";
import "./Shop.css";

const initialAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], amounts: { total: 0 } });
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [address, setAddress] = useState(initialAddress);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const addressFieldConfig = [
    { key: "fullName", label: "Full Name", placeholder: "Enter full name" },
    { key: "phone", label: "Phone", placeholder: "Enter 10-digit mobile number" },
    { key: "addressLine1", label: "Address Line 1", placeholder: "House no, street, area" },
    { key: "addressLine2", label: "Address Line 2", placeholder: "Landmark (optional)" },
    { key: "city", label: "City", placeholder: "Enter city" },
    { key: "state", label: "State", placeholder: "Enter state" },
    { key: "postalCode", label: "Postal Code", placeholder: "Enter pincode" },
    { key: "country", label: "Country", placeholder: "Country" },
  ];

  useEffect(() => {
    const loadCart = async () => {
      try {
        const response = await shopApi.getCart();
        const payload = response.data || { items: [], amounts: { total: 0 } };
        setCart(payload);
        if (!payload.items.length) {
          navigate("/cart", { replace: true });
        }
      } catch (requestError) {
        setError(requestError?.response?.data?.message || "Failed to load cart");
      }
    };

    loadCart();
  }, [navigate]);

  const placeOrder = async () => {
    try {
      setSubmitting(true);
      setError("");

      const initResponse = await shopApi.createCheckout({
        paymentMethod,
        shippingAddress: address,
      });

      if (!initResponse.data?.paymentRequired) {
        navigate("/my-orders", { replace: true });
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Razorpay SDK failed to load");
      }

      const checkout = initResponse.data.checkout;

      const rzp = new window.Razorpay({
        key: checkout.key,
        amount: checkout.amount,
        currency: checkout.currency || "INR",
        order_id: checkout.gatewayOrderId,
        name: "Artify Virtual Art Gallery",
        description: "Painting purchase",
        handler: async (response) => {
          await shopApi.verifyCheckout({
            ...response,
            shippingAddress: address,
          });
          navigate("/my-orders", { replace: true });
        },
        prefill: {
          name: address.fullName,
          contact: address.phone,
        },
        theme: {
          color: "#ff4c60",
        },
      });

      rzp.on("payment.failed", (failedResponse) => {
        setError(
          failedResponse?.error?.description ||
            failedResponse?.error?.reason ||
            "Payment failed"
        );
      });

      rzp.open();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="shop-page">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <p>Review delivery details and complete your purchase securely.</p>
      </div>
      {error && <p className="shop-error">{error}</p>}

      <div className="checkout-grid">
        <div className="checkout-form">
          <h2>Shipping Address</h2>
          <div className="checkout-fields">
            {addressFieldConfig.map(({ key, label, placeholder }) => (
              <label key={key} className="checkout-field">
                <span>{label}</span>
                <input
                  value={address[key]}
                  placeholder={placeholder}
                  onChange={(e) => setAddress((prev) => ({ ...prev, [key]: e.target.value }))}
                />
              </label>
            ))}
          </div>

          <h2>Payment Method</h2>
          <div className="shop-radio-row">
            <label className="checkout-radio">
              <input
                type="radio"
                checked={paymentMethod === "razorpay"}
                onChange={() => setPaymentMethod("razorpay")}
              />
              <span>Razorpay (UPI / Cards / Netbanking)</span>
            </label>
            <label className="checkout-radio">
              <input
                type="radio"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              <span>Cash on Delivery</span>
            </label>
          </div>
        </div>

        <div className="shop-summary">
          <h2>Order Summary</h2>
          <div className="checkout-summary-items">
            {cart.items.map((item) => (
              <div key={item.artwork?._id} className="checkout-summary-item">
                <p>{item.artwork?.title}</p>
                <span>
                  {item.quantity} x Rs. {item.artwork?.price || 0}
                </span>
              </div>
            ))}
          </div>

          <div className="checkout-totals">
            <p>
              <span>Subtotal</span>
              <strong>Rs. {cart.amounts?.subtotal || 0}</strong>
            </p>
            <p>
              <span>Shipping</span>
              <strong>Free</strong>
            </p>
            <p className="checkout-total-row">
              <span>Total</span>
              <strong>Rs. {cart.amounts?.total || 0}</strong>
            </p>
          </div>

          <button type="button" className="checkout-place-btn" onClick={placeOrder} disabled={submitting}>
            {submitting ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Checkout;
