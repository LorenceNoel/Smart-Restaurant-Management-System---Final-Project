import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Header.css";

function Navbar() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";

  if (isAdmin) return null;

  return (
    <nav className="navbar">
      <NavLink to="/menu" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Menu</NavLink>
      {!user ? (
        <>
          <NavLink to="/login" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Login</NavLink>
          <NavLink to="/signup" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Signup</NavLink>
        </>
      ) : (
        <>
          <NavLink to="/reservation" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Reservation</NavLink>
          <NavLink to="/cart" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Cart</NavLink>
          <button onClick={logout} className="nav-item logout-btn">Logout</button>
        </>
      )}
    </nav>
  );
}

export default Navbar;