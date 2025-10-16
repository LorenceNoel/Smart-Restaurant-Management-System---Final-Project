import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <h2>Student Profile App</h2>
      <nav>
        {user ? (
          <>
            <Link to="/home">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/profession">Profession</Link>
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
