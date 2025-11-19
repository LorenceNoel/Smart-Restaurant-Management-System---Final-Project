import React, { useState } from "react";
import "../styles/SignupPage.css";
import { registerUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { setUser, setToken } = useAuth();

  const validateForm = () => {
    if (!name.trim()) {
      alert("Name is required");
      return false;
    }
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

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const result = await registerUser({ name, email, password });
      // Adjust depending on backend response
      setUser(result.user || { name, email });
      setToken(result.token || null);
      setMessage(result.message || "Signup successful!");
      console.log("User registered:", result);
    } catch (err) {
      setMessage("Signup failed. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="signup-page">
      <h2>Create an Account</h2>
      <form className="signup-form" onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <button type="submit">Sign Up</button>
      </form>
      {message && <p className="signup-message">{message}</p>}
    </div>
  );
}

export default SignupPage;