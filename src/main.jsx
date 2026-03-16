import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
<<<<<<< HEAD
import { worker } from "./mocks/browser";
import AuthProvider from './context/authContext.jsx'

worker.start();
=======
import AuthProvider from './context/authContext.jsx'

>>>>>>> origin/fe1

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>      
    </BrowserRouter>    
  </StrictMode>,
)
