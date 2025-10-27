import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
  }, []);

  function signup(email, password, role = "customer") {
    const newUser = { email, password, role };
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
    setIsAuthenticated(true);
    alert("✅ Signup successful!");
    navigate("/menu");
  }

  function login(email, password) {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    // ✅ Check for hardcoded admin credentials
    if (email === "admin@example.com" && password === "admin123") {
      const adminUser = { email, password, role: "admin" };
      localStorage.setItem("user", JSON.stringify(adminUser));
      setUser(adminUser);
      setIsAuthenticated(true);
      navigate("/admin");
      return;
    }

    // ✅ Check stored user credentials
    if (
      storedUser &&
      storedUser.email === email &&
      storedUser.password === password
    ) {
      setUser(storedUser);
      setIsAuthenticated(true);
      navigate(storedUser.role === "admin" ? "/admin" : "/menu");
    } else {
      alert("Invalid credentials");
    }
  }

  function logout() {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);