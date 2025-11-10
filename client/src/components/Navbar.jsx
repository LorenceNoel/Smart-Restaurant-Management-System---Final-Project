import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "../styles/Header.css";

function Navbar() {
  const { user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const location = useLocation();
  const isAdmin = user?.role === "admin";
  const isOnAdminPage = location.pathname === "/admin";
  const cartCount = getCartItemCount();

  return (
    <nav className="navbar">
      <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Home</NavLink>
      
      {isAdmin ? (
        // Admin navigation
        <>
          <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Admin Dashboard</NavLink>
          <NavLink to="/menu" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>View Menu</NavLink>
          {!isOnAdminPage && <button onClick={logout} className="nav-item logout-btn">Logout</button>}
        </>
      ) : (
        // Regular user navigation
        <>
          <NavLink to="/menu" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Menu</NavLink>
          {!user ? (
            <>
              <NavLink to="/login" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Login</NavLink>
              <NavLink to="/signup" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Signup</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/reservation" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Reservation</NavLink>
              <NavLink to="/cart" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                Cart {cartCount > 0 && <span className="cart-badge">({cartCount})</span>}
              </NavLink>
              <button onClick={logout} className="nav-item logout-btn">Logout</button>
            </>
          )}
        </>
      )}
    </nav>
  );
}

export default Navbar;
