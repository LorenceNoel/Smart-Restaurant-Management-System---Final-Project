import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import '../components/SignupPage.css';

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSignup = () => {
    if (validateForm()) {
      signup(email, password)
        .then(() => {
          localStorage.setItem("user", JSON.stringify({ email, password }));
          alert("Signup successful");
          navigate("/");
        })
        .catch((error) => {
          alert("Signup failed: " + error.message);
        });
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
        <button onClick={handleSignup}>Sign Up</button>
      </form>
    </div>
  );
}

export default SignupPage;