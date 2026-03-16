// File: src/App.jsx

import { Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar";
import "./App.css";

import AuthPage from "./components/authPage";
import Dashboard from "./components/dashboard";
import ProtectedRoute from "./components/protectedRoute";

import ForgotPasswordPage from "./components/forgotPasswordPage";
import ProfilePage from "./components/profilePage";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

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
      </Routes>
    </>
  );
}

export default App;