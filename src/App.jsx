// File: src/App.jsx
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/navbar";
import "./App.css";

import AuthPage from "./components/authPage";
import Dashboard from "./components/dashboard";
import ProtectedRoute from "./components/protectedRoute";
import HomePage from './components/homePage.jsx';
import ForgotPasswordPage from "./components/forgotPasswordPage";
import ProfilePage from "./components/profilePage";
import CartPage from "./components/CartPage.jsx";
import ProductDetail from "./components/ProductDetail.jsx";
import ProductsPage from "./components/ProductsPage.jsx";
import AISuggestionPage from "./components/AISuggestionPage.jsx";

import CheckoutPage from "./components/CheckoutPage.jsx";
import AdminPanel from "./components/AdminPanel.jsx";

function App() {
  const location = useLocation();
  // Ẩn Navbar nếu đang ở trang Admin
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPage && <Navbar />}

      <Routes>
        {/* --- PUBLIC ROUTES (Ai cũng xem được) --- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/ai-suggest" element={<AISuggestionPage />} />


        {/* --- PROTECTED ROUTES (Phải đăng nhập mới xem được) --- */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* --- ADMIN ROUTES (Phải là Admin mới xem được) --- */}
        <Route
          path="/admin/*" 
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* Route xử lý khi gõ sai đường dẫn (404) */}
        <Route path="*" element={<div style={{padding: "100px", textAlign: "center"}}><h1>404 - Không tìm thấy trang</h1></div>} />
      </Routes>
    </>
  );
}

export default App;