import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import MenuPage from "./pages/MenuPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ReservationPage from "./pages/ReservationPage";
import CartPage from "./pages/CartPage";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reservation" element={<ReservationPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </>
  );
}

export default App;