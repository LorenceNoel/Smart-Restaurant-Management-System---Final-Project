import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../components/SignupPage.css";

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup } = useAuth();

  const validateForm = () => {
    if (!email.trim()) {
      alert("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return false;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleSignup = () => {
    if (validateForm()) {
      signup(email, password);
    }
  };

  return (
    <div className="signup-page">
      <h2>Create an Account</h2>
      <form className="signup-form" onSubmit={(e) => e.preventDefault()}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" onClick={handleSignup}>
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default SignupPage;