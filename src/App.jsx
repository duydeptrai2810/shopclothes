import { Route, Routes } from 'react-router-dom'
import Navbar from './components/navbar'
import './App.css'
import AuthPage from './components/authPage'
import Dashboard from './components/dashboard'
import ProtectedRoute from './components/protectedRoute'
function App() {

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>

  )
}

export default App
