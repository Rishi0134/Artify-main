import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../utils/api";
import { getStoredUser } from "../utils/auth";
import "./ChatPage.css";

const ChatPage = () => {
  const user = getStoredUser();
  const [chats, setChats] = useState([]);
  const [artists, setArtists] = useState([]);
  const [activeChatId, setActiveChatId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [startForm, setStartForm] = useState({
    artistId: "",
    subject: "",
    orderId: "",
    message: "",
  });
  const messagesEndRef = useRef(null);

  const activeChat = useMemo(
    () => chats.find((chat) => chat._id === activeChatId) || null,
    [chats, activeChatId]
  );

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages?.length]);

  const fetchChats = useCallback(async () => {
    try {
      const res = await api.get("/api/chats/my");
      const data = res.data?.data || [];
      setChats(data);
      // Auto-select first chat if none selected
      setActiveChatId((prev) => {
        if (!prev && data[0]) return data[0]._id;
        return prev;
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load chats");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchArtists = useCallback(async () => {
    if (user?.role !== "user") return;
    try {
      const res = await api.get("/api/users/artists");
      setArtists(res.data?.data || []);
    } catch {
      // Non-fatal — just means dropdown stays empty
    }
  }, [user?.role]);

  // Initial load
  useEffect(() => {
    fetchChats();
    fetchArtists();
  }, [fetchChats, fetchArtists]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, [fetchChats]);

  const handleSendMessage = async () => {
    if (!activeChat || !message.trim() || sending) return;
    setError("");
    setSending(true);
    try {
      const res = await api.post(
        `/api/chats/${activeChat._id}/messages`,
        { text: message.trim() }
      );
      const updated = res.data?.data;
      setChats((prev) =>
        prev.map((chat) => (chat._id === updated._id ? updated : chat))
      );
      setMessage("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartChat = async (e) => {
    e.preventDefault();
    setError("");

    if (!startForm.artistId || !startForm.message.trim()) {
      setError("Please select an artist and enter a message");
      return;
    }

    try {
      const payload = {
        artistId: startForm.artistId,
        subject: startForm.subject.trim() || "Customization discussion",
        message: startForm.message.trim(),
      };
      if (startForm.orderId.trim()) {
        payload.orderId = startForm.orderId.trim();
      }

      const res = await api.post("/api/chats/start", payload);
      const created = res.data?.data;
      setChats((prev) => [
        created,
        ...prev.filter((c) => c._id !== created._id),
      ]);
      setActiveChatId(created._id);
      setStartForm({ artistId: "", subject: "", orderId: "", message: "" });
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        "Failed to start chat";
      setError(msg);
    }
  };

  const getOtherParticipantName = (chat) => {
    if (user?.role === "artist") return chat.customer?.name || "Customer";
    return chat.artist?.name || "Artist";
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <section className="chat-page">
        <p className="chat-loading">Loading chats...</p>
      </section>
    );
  }

  return (
    <section className="chat-page">
      <div className="chat-header">
        <h1>{user?.role === "artist" ? "Customer Chats" : "Chats with Artists"}</h1>
        {user?.role !== "artist" && (
          <span className="chat-hint">
            Select an artist below to start a new conversation
          </span>
        )}
      </div>

      {error && (
        <p className="chat-error" onClick={() => setError("")}>
          {error} <span className="chat-error-close">✕</span>
        </p>
      )}

      {/* Start New Chat Form — only for regular users */}
      {user?.role === "user" && (
        <form className="start-chat-form" onSubmit={handleStartChat}>
          <h2>Start New Chat</h2>
          <div className="start-chat-row">
            <select
              value={startForm.artistId}
              onChange={(e) =>
                setStartForm({ ...startForm, artistId: e.target.value })
              }
              required
            >
              <option value="">— Select an artist —</option>
              {artists.length === 0 && (
                <option disabled>No artists available</option>
              )}
              {artists.map((artist) => (
                <option key={artist._id} value={artist._id}>
                  {artist.name}
                  {artist.bio ? ` — ${artist.bio.slice(0, 40)}` : ""}
                </option>
              ))}
            </select>
            <input
              placeholder="Subject (optional)"
              value={startForm.subject}
              onChange={(e) =>
                setStartForm({ ...startForm, subject: e.target.value })
              }
            />
          </div>
          <textarea
            placeholder="Describe your customization request to the artist..."
            value={startForm.message}
            onChange={(e) =>
              setStartForm({ ...startForm, message: e.target.value })
            }
            required
          />
          <button type="submit" className="btn-start-chat">
            Start Conversation
          </button>
        </form>
      )}

      <div className="chat-shell">
        {/* Sidebar — conversation list */}
        <aside className="chat-list">
          <p className="chat-list-label">Conversations</p>
          {chats.length === 0 ? (
            <p className="chat-empty">No conversations yet.</p>
          ) : null}
          {chats.map((chat) => {
            const lastMsg = chat.messages?.[chat.messages.length - 1];
            return (
              <button
                key={chat._id}
                className={`chat-list-item ${activeChatId === chat._id ? "active" : ""}`}
                onClick={() => setActiveChatId(chat._id)}
              >
                <div className="chat-list-top">
                  <strong>{getOtherParticipantName(chat)}</strong>
                  {lastMsg && (
                    <span className="chat-list-time">
                      {formatDate(lastMsg.createdAt)}
                    </span>
                  )}
                </div>
                <span className="chat-list-subject">{chat.subject}</span>
                {lastMsg && (
                  <span className="chat-list-preview">
                    {lastMsg.sender?.name?.split(" ")[0]}: {lastMsg.text?.slice(0, 38)}
                    {lastMsg.text?.length > 38 ? "…" : ""}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Main thread */}
        <section className="chat-thread">
          {!activeChat ? (
            <div className="chat-no-selection">
              <p>👈 Select a conversation to view messages</p>
            </div>
          ) : (
            <>
              <div className="chat-thread-header">
                <div>
                  <strong>{getOtherParticipantName(activeChat)}</strong>
                  <span className="chat-thread-subject">
                    {activeChat.subject}
                  </span>
                </div>
              </div>

              <div className="chat-messages">
                {activeChat.messages?.length === 0 && (
                  <p className="chat-empty-thread">No messages yet. Say hello!</p>
                )}
                {activeChat.messages?.map((msg) => {
                  const isMe = msg.sender?._id === user?._id;
                  return (
                    <article
                      key={msg._id}
                      className={`chat-bubble ${isMe ? "mine" : ""}`}
                    >
                      <p>{msg.text}</p>
                      <div className="chat-bubble-meta">
                        <small>{isMe ? "You" : msg.sender?.name || "User"}</small>
                        <small>{formatTime(msg.createdAt)}</small>
                      </div>
                    </article>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-send">
                <input
                  placeholder="Write a message… (Enter to send)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={sending || !message.trim()}
                  className="btn-send"
                >
                  {sending ? "…" : "Send"}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </section>
  );
};

export default ChatPage;
