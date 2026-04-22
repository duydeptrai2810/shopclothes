// File: src/App.jsx

import { Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar";
import "./App.css";

import AuthPage from "./components/authPage";
import Dashboard from "./components/dashboard";
import ProtectedRoute from "./components/protectedRoute";
import HomePage from './components/homePage.jsx'
import ForgotPasswordPage from "./components/forgotPasswordPage";
import ProfilePage from "./components/profilePage";
import CartPage from "./components/CartPage.jsx";
import ProductDetail from "./components/ProductDetail.jsx";
import ProductsPage from "./components/ProductsPage.jsx";
import AISuggestionPage from "./components/AISuggestionPage.jsx";
import CheckoutPage from './components/CheckoutPage';

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/ai-suggest" element={<AISuggestionPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        
        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
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
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;