import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import MainLayout from "./layouts/MainLayout";
import About from "./pages/About";
import AdminDashboard from "./pages/AdminDashboard";
import ArtistDashboard from "./pages/ArtistDashboard";
import ArtistProfile from "./pages/ArtistProfile";
import ArtworkDetails from "./pages/ArtworkDetails";
import ArtworkManagement from "./pages/ArtworkManagement";
import CategoryManagement from "./pages/CategoryManagement";
import Gallery from "./pages/Gallery";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ManageArtworks from "./pages/ManageArtworks";
import OrderManagement from "./pages/OrderManagement";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Reviews from "./pages/Reviews";
import Sales from "./pages/Sales";
import UploadArtwork from "./pages/UploadArtwork";
import UserDashboard from "./pages/UserDashboard";
import UserManagement from "./pages/UserManagement";
import ArtistManagement from "./pages/ArtistManagement";
import ChatPage from "./pages/ChatPage";   // ← ADD THIS

const userLinks = [
  { to: "/user/dashboard", label: "Dashboard" },
  { to: "/gallery", label: "Browse Gallery" },
  { to: "/user/profile", label: "Profile" },
  { to: "/user/orders", label: "Orders" },
  { to: "/user/reviews", label: "Reviews" },
  { to: "/user/chat", label: "Chat" },      // ← ADD THIS
];

const artistLinks = [
  { to: "/artist/dashboard", label: "Dashboard" },
  { to: "/artist/upload", label: "Upload Artwork" },
  { to: "/artist/artworks", label: "Manage Artworks" },
  { to: "/artist/sales", label: "Sales" },
  { to: "/artist/profile", label: "Profile" },
  { to: "/artist/chat", label: "Customer Chats" },  // ← ADD THIS
];

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/artists", label: "Artists" },
  { to: "/admin/artworks", label: "Artworks" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/orders", label: "Orders" },
];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/artworks/:id" element={<ArtworkDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route
          path="/user"
          element={
            <ProtectedRoute roles={["user"]}>
              <DashboardLayout title="User Dashboard" links={userLinks} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="orders" element={<Orders />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="chat" element={<ChatPage />} />   {/* ← ADD THIS */}
        </Route>

        <Route
          path="/artist"
          element={
            <ProtectedRoute roles={["artist"]}>
              <DashboardLayout title="Artist Dashboard" links={artistLinks} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ArtistDashboard />} />
          <Route path="upload" element={<UploadArtwork />} />
          <Route path="artworks" element={<ManageArtworks />} />
          <Route path="sales" element={<Sales />} />
          <Route path="profile" element={<ArtistProfile />} />
          <Route path="chat" element={<ChatPage />} />   {/* ← ADD THIS */}
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <DashboardLayout title="Admin Dashboard" links={adminLinks} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="artists" element={<ArtistManagement />} />
          <Route path="artworks" element={<ArtworkManagement />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="orders" element={<OrderManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;