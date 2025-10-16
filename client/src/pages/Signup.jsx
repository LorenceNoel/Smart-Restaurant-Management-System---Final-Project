import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Signup() {
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
    <div>
      <h2>Signup</h2>
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button onClick={handleSignup}>Sign Up</button>
    </div>
  );
}

export default Signup;