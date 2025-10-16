import React, { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const navigate = useNavigate();

  function signup(email, password) {
    localStorage.setItem("user", JSON.stringify({ email, password }));
    setUser({ email });
    navigate("/home");
  }

  function login(email, password) {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.email === email && storedUser.password === password) {
      setUser({ email });
      navigate("/home");
    } else {
      alert("Invalid credentials");
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
