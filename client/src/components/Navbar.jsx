import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="navbar">
      <NavLink to="/menu" className="nav-item">Menu</NavLink>

      {!isAuthenticated ? (
        <>
          <NavLink to="/login" className="nav-item">Login</NavLink>
          <NavLink to="/signup" className="nav-item">Signup</NavLink>
        </>
      ) : (
        <>
          <NavLink to="/reservation" className="nav-item">Reservation</NavLink>
          <NavLink to="/cart" className="nav-item">Cart</NavLink>
          <button onClick={logout} className="nav-item logout-btn">Logout</button>
        </>
      )}
    </nav>
  );
}

export default Navbar;