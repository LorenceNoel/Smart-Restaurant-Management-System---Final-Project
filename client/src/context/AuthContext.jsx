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

  async function signup(email, password, firstName = "", lastName = "", phone = "") {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          phone
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newUser = {
          userId: data.data.userId,
          email: data.data.email,
          firstName,
          lastName,
          role: data.data.role
        };
        localStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);
        setIsAuthenticated(true);
        alert("✅ Signup successful!");
        navigate("/menu");
      } else {
        alert("❌ " + data.error);
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert("❌ Signup failed. Please try again.");
    }
  }

  async function login(email, password) {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      const data = await response.json();

      if (data.success) {
        const userData = {
          userId: data.data.userId,
          email: data.data.email,
          firstName: data.data.firstName,
          lastName: data.data.lastName,
          role: data.data.role
        };
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        navigate(userData.role === "admin" ? "/admin" : "/menu");
      } else {
        alert("❌ " + data.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert("❌ Login failed. Please check your connection and try again.");
    }
  }

  function logout() {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    
    // Clear cart on logout (will be handled by CartContext)
    const logoutEvent = new CustomEvent('user-logout');
    window.dispatchEvent(logoutEvent);
    
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
