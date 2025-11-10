import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  function validateForm() {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      await login(email, password);
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberEmail', email);
      } else {
        localStorage.removeItem('rememberEmail');
      }
    } catch (error) {
      setErrors({ general: "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }



  // Load remembered email on component mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  function togglePasswordVisibility() {
    setShowPassword(!showPassword);
  }

  return (
    <div className="login-page">
      <div className="login-header">
        <h2>🍽️ Welcome Back</h2>
        <p>Sign in to your Smart Restaurant account</p>
      </div>

      {errors.general && (
        <div className="error-message">
          ❌ {errors.general}
        </div>
      )}

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors(prev => ({ ...prev, email: null }));
            }}
            className={errors.email ? 'error' : ''}
            disabled={isLoading}
            required
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="input-group">
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors(prev => ({ ...prev, password: null }));
              }}
              className={errors.password ? 'error' : ''}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
              disabled={isLoading}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <div className="form-options">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
            />
            Remember me
          </label>
          <a href="#" className="forgot-password">Forgot Password?</a>
        </div>

        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LoadingSpinner size="small" message="" />
              Signing In...
            </div>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="signup-link">
        <p>Don't have an account? <Link to="/signup">Create Account</Link></p>
      </div>

      {/* For testing purposes only - Admin credentials: admin@example.com / admin123 */}
      {/* This comment should be removed in production */}
    </div>
  );
}

export default LoginPage;
