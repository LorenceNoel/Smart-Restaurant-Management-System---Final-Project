
import React from "react";
import { Routes, Route } from "react-router-dom";
// These are for managing global state - like the shopping cart and notifications
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./components/Toast";
// Main components that appear on every page
import Navbar from "./components/Navbar";
import AdminDashboard from "./components/AdminDashboard";
import ChatAssistant from "./components/ChatAssistant";
// All the different pages in our app
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MenuPage from "./pages/MenuPage";
import ReservationPage from "./pages/ReservationPage";
import CartPage from "./pages/CartPage";
import SignupPage from "./pages/SignupPage";
import ComponentShowcase from "./pages/ComponentShowcase";


function App() {
  return (
  
    <ToastProvider>
      
      <CartProvider>
        
        <Navbar />
        
        {/* Here's where we define all our routes (different pages) */}
        <Routes>
          {/* These are the pages customers can visit */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/reservation" element={<ReservationPage />} />
          <Route path="/cart" element={<CartPage />} />
          
          {/* Admin page for restaurant staff */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          
          <Route path="/showcase" element={<ComponentShowcase />} />
        </Routes>
        
        {/* The AI chat assistant - it floats on every page to help customers */}
        <ChatAssistant />
      </CartProvider>
    </ToastProvider>
  );
}

export default App;
