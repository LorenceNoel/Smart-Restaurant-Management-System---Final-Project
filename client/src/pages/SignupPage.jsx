import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/SignupPage.css";

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const { signup } = useAuth();

  const validateForm = () => {
    if (!firstName.trim()) {
      alert("First Name is required");
      return false;
    }

    if (!lastName.trim()) {
      alert("Last Name is required");
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

    if (!phone.trim()) {
      alert("Phone number is required");
      return false;
    }

    // Phone validation
    if (!/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, ''))) {
      alert("Please enter a valid phone number");
      return false;
    }

    return true;
  };

  const handleSignup = () => {
    if (validateForm()) {
      signup(email, password, firstName, lastName, phone);
    }
  };

  return (
    <div className="signup-page">
      <h2>Create an Account</h2>
      <form className="signup-form" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
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
          type="tel"
          placeholder="Phone Number - e.g., 555 123 4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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
