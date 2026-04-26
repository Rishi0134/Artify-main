import { useEffect, useState } from "react";
import { api } from "../utils/api";
import { getImageUrl } from "../utils/api";

const STAR_COUNT = 5;

const StarPicker = ({ value, onChange }) => (
  <div className="star-picker">
    {Array.from({ length: STAR_COUNT }, (_, i) => i + 1).map((star) => (
      <button
        key={star}
        type="button"
        className={`star-btn ${star <= value ? "filled" : ""}`}
        onClick={() => onChange(star)}
        aria-label={`${star} star`}
      >
        ★
      </button>
    ))}
  </div>
);

const Reviews = () => {
  const [orders, setOrders] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [forms, setForms] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [messages, setMessages] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("write"); // "write" | "submitted"

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ordersRes, reviewsRes] = await Promise.all([
          api.get("/api/orders/user"),
          api.get("/api/reviews/user/my"),
        ]);

        const ordersData = ordersRes.data?.data || [];
        const reviewsData = reviewsRes.data?.data || [];

        setOrders(ordersData);
        setMyReviews(reviewsData);

        // Pre-fill forms with existing reviews
        const prefilled = {};
        reviewsData.forEach((r) => {
          const artId = r.artworkId?._id || r.artworkId;
          if (artId) {
            prefilled[artId] = { rating: r.rating, comment: r.comment || "" };
          }
        });
        setForms(prefilled);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (artworkId) => {
    const form = forms[artworkId] || { rating: 5, comment: "" };
    setSubmitting((prev) => ({ ...prev, [artworkId]: true }));
    setMessages((prev) => ({ ...prev, [artworkId]: "" }));

    try {
      await api.post("/api/reviews", {
        artworkId,
        rating: Number(form.rating),
        comment: form.comment,
      });
      setMessages((prev) => ({ ...prev, [artworkId]: "✓ Review saved!" }));

      // Refresh the "submitted" list
      const reviewsRes = await api.get("/api/reviews/user/my");
      setMyReviews(reviewsRes.data?.data || []);
    } catch (err) {
      setMessages((prev) => ({
        ...prev,
        [artworkId]: err.response?.data?.message || "Failed to save review",
      }));
    } finally {
      setSubmitting((prev) => ({ ...prev, [artworkId]: false }));
    }
  };

  const updateForm = (artworkId, field, value) => {
    setForms((prev) => ({
      ...prev,
      [artworkId]: { ...(prev[artworkId] || { rating: 5, comment: "" }), [field]: value },
    }));
  };

  if (loading) {
    return (
      <div className="page-stack">
        <p style={{ color: "rgba(255,255,255,0.4)", padding: "20px 0" }}>Loading reviews…</p>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div className="section-head">
        <div>
          <span className="eyebrow">Reviews</span>
          <h1>Your Reviews</h1>
        </div>
      </div>

      {error && <p className="reviews-error">{error}</p>}

      {/* Tabs */}
      <div className="reviews-tabs">
        <button
          className={`reviews-tab ${tab === "write" ? "active" : ""}`}
          onClick={() => setTab("write")}
        >
          Write a Review
          {orders.length > 0 && <span className="tab-badge">{orders.length}</span>}
        </button>
        <button
          className={`reviews-tab ${tab === "submitted" ? "active" : ""}`}
          onClick={() => setTab("submitted")}
        >
          Submitted Reviews
          {myReviews.length > 0 && <span className="tab-badge">{myReviews.length}</span>}
        </button>
      </div>

      {/* Write Reviews Tab */}
      {tab === "write" && (
        <div className="reviews-grid">
          {orders.length === 0 && (
            <div className="reviews-empty">
              <p>You haven't purchased any artwork yet.</p>
              <a href="/gallery" className="btn btn-primary">Browse Gallery</a>
            </div>
          )}
          {orders.map((order) => {
            const artwork = order.artworkId;
            if (!artwork?._id) return null;
            const artId = artwork._id;
            const form = forms[artId] || { rating: 5, comment: "" };
            const msg = messages[artId] || "";
            const isSuccess = msg.startsWith("✓");

            return (
              <div key={order._id} className="review-card">
                <div className="review-card-art">
                  <img
                    src={getImageUrl(artwork.imageUrl || artwork.image) || "https://via.placeholder.com/64x64?text=Art"}
                    alt={artwork.title}
                    className="review-art-img"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/64x64?text=Art"; }}
                  />
                  <div>
                    <h3 className="review-art-title">{artwork.title || "Untitled"}</h3>
                    <p className="review-art-sub">
                      ₹{order.price?.toLocaleString()} ·{" "}
                      <span className={`order-status order-status--${order.status}`}>
                        {order.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="review-form-body">
                  <label className="review-label">Your Rating</label>
                  <StarPicker
                    value={Number(form.rating)}
                    onChange={(v) => updateForm(artId, "rating", v)}
                  />

                  <label className="review-label">Your Review</label>
                  <textarea
                    className="review-textarea"
                    rows={3}
                    placeholder="What did you think about this artwork?"
                    value={form.comment}
                    onChange={(e) => updateForm(artId, "comment", e.target.value)}
                  />

                  {msg && (
                    <p className={`review-msg ${isSuccess ? "review-msg--success" : "review-msg--error"}`}>
                      {msg}
                    </p>
                  )}

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleSubmit(artId)}
                    disabled={submitting[artId]}
                  >
                    {submitting[artId] ? "Saving…" : "Save Review"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submitted Reviews Tab */}
      {tab === "submitted" && (
        <div className="reviews-grid">
          {myReviews.length === 0 && (
            <div className="reviews-empty">
              <p>You haven't submitted any reviews yet.</p>
            </div>
          )}
          {myReviews.map((review) => {
            const artwork = review.artworkId;
            return (
              <div key={review._id} className="review-card review-card--submitted">
                <div className="review-card-art">
                  <img
                    src={getImageUrl(artwork?.imageUrl || artwork?.image) || "https://via.placeholder.com/64x64?text=Art"}
                    alt={artwork?.title}
                    className="review-art-img"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/64x64?text=Art"; }}
                  />
                  <div>
                    <h3 className="review-art-title">{artwork?.title || "Artwork"}</h3>
                    <div className="review-stars-display">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={i < review.rating ? "star-on" : "star-off"}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="review-submitted-comment">"{review.comment}"</p>
                )}
                <p className="review-submitted-date">
                  Reviewed on {new Date(review.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reviews;
