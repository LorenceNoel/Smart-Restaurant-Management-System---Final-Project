import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Header.css";

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <h2>Smart Restaurant App</h2>
      <nav>
        {user ? (
          <>
            <Link to="/menu">Menu</Link>
            <Link to="/reservation">Reservations</Link>
            <Link to="/cart">Cart</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;