import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getImageUrl } from "../utils/api";
import { getStoredUser } from "../utils/auth";
import { artifyApi } from "../utils/artifyApi";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const ArtworkDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getStoredUser();
  const [artwork, setArtwork] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [buying, setBuying] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [error, setError] = useState("");
  const [paymentConfig, setPaymentConfig] = useState({
    codEnabled: true,
    razorpayEnabled: false,
  });

  useEffect(() => {
    const loadArtwork = async () => {
      const [artworkResponse, reviewResponse] = await Promise.all([
        artifyApi.getArtwork(id),
        artifyApi.getReviews(id),
      ]);

      const artworkData = artworkResponse.data.data;
      setArtwork(artworkData);
      setReviews(reviewResponse.data.data || artworkData.reviews || []);
    };

    loadArtwork().catch(() => {
      setArtwork(null);
      setReviews([]);
    });
  }, [id]);

  useEffect(() => {
    if (user?.role !== "user") {
      return;
    }

    artifyApi
      .getPaymentConfig()
      .then((response) =>
        setPaymentConfig(
          response.data.data || {
            codEnabled: true,
            razorpayEnabled: false,
          }
        )
      )
      .catch(() =>
        setPaymentConfig({
          codEnabled: true,
          razorpayEnabled: false,
        })
      );
  }, [user?.role]);

  const displayStatus = artwork?.status === "pending" ? "available" : artwork?.status;
  const canBuy = useMemo(
    () => user?.role === "user" && ["available", "pending", "approved"].includes(artwork?.status),
    [artwork, user]
  );

  const handleOpenCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setShowCheckout(true);
    setPaymentMethod(paymentConfig.razorpayEnabled ? "razorpay" : "cod");
    setError("");
  };

  const handleCheckout = async () => {
    setBuying(true);
    setError("");

    try {
      if (paymentMethod === "cod") {
        await artifyApi.createCheckout({
          artworkId: artwork._id,
          paymentMethod: "cod",
        });
        navigate("/user/orders");
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay checkout");
      }

      const checkoutResponse = await artifyApi.createCheckout({
        artworkId: artwork._id,
        paymentMethod: "razorpay",
      });

      const { gateway } = checkoutResponse.data.data;

      const razorpay = new window.Razorpay({
        key: gateway.key,
        amount: gateway.amount,
        currency: gateway.currency,
        name: gateway.name,
        description: gateway.description,
        order_id: gateway.orderId,
        prefill: gateway.prefill,
        theme: {
          color: "#a44a3f",
        },
        handler: async (response) => {
          await artifyApi.verifyPayment({
            artworkId: artwork._id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          navigate("/user/orders");
        },
      });

      razorpay.on("payment.failed", () => {
        setError("Online payment failed. Please try again.");
      });

      razorpay.open();
    } catch (checkoutError) {
      setError(checkoutError.response?.data?.message || checkoutError.message || "Unable to start checkout");
    } finally {
      setBuying(false);
    }
  };

  if (!artwork) {
    return (
      <section className="section-block site-shell">
        <p>Artwork not found.</p>
      </section>
    );
  }

  return (
    <section className="section-block site-shell">
      <div className="details-grid">
        <img
          src={getImageUrl(artwork.imageUrl || artwork.image)}
          alt={artwork.title}
          className="details-image"
        />
        <div className="details-panel">
          <span className="eyebrow">{artwork.categoryId?.name}</span>
          <h1>{artwork.title}</h1>
          <p>{artwork.description}</p>
          <div className="detail-list">
            <p>
              <strong>Artist:</strong> {artwork.artistId?.name || artwork.artist?.name || "Unknown artist"}
            </p>
            <p>
              <strong>Price:</strong> Rs. {artwork.price}
            </p>
            <p>
              <strong>Status:</strong> {displayStatus}
            </p>
          </div>
          {canBuy ? (
            <div className="inline-actions">
              <button type="button" className="btn btn-primary" onClick={handleOpenCheckout} disabled={buying}>
                {buying ? "Processing..." : "Buy Artwork"}
              </button>
            </div>
          ) : null}
          {error ? <p className="error-text">{error}</p> : null}
        </div>
      </div>

      {showCheckout ? (
        <div className="checkout-box panel">
          <div className="section-head">
            <div>
              <span className="eyebrow">Checkout</span>
              <h2>Choose payment option</h2>
            </div>
          </div>
          <div className="stack-list">
            <label className="radio-card">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(event) => setPaymentMethod(event.target.value)}
              />
              <span>Cash on Delivery</span>
            </label>
            <label className="radio-card">
              <input
                type="radio"
                name="paymentMethod"
                value="razorpay"
                checked={paymentMethod === "razorpay"}
                onChange={(event) => setPaymentMethod(event.target.value)}
                disabled={!paymentConfig.razorpayEnabled}
              />
              <span>
                Online Payment with Razorpay
                {!paymentConfig.razorpayEnabled ? " (currently unavailable)" : ""}
              </span>
            </label>
            <div className="bill-preview">
              <p>
                <strong>Artwork:</strong> {artwork.title}
              </p>
              <p>
                <strong>Amount:</strong> Rs. {artwork.price}
              </p>
              <p>
                <strong>Customer:</strong> {user?.name}
              </p>
            </div>
            <div className="inline-actions">
              <button type="button" className="btn btn-primary" onClick={handleCheckout} disabled={buying}>
                {paymentMethod === "cod" ? "Place COD Order" : "Pay with Razorpay"}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowCheckout(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="section-block">
        <div className="section-head">
          <div>
            <span className="eyebrow">Reviews</span>
            <h2>What collectors are saying</h2>
          </div>
        </div>

        <div className="stack-list">
          {reviews.map((review) => (
            <div key={review._id} className="panel">
              <div className="inline-spread">
                <strong>{review.userId?.name || "Customer"}</strong>
                <span>{review.rating}/5</span>
              </div>
              <p>{review.comment}</p>
            </div>
          ))}
          {!reviews.length ? <p>No reviews yet.</p> : null}
        </div>
      </div>
    </section>
  );
};

export default ArtworkDetails;
