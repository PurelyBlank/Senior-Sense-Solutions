"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Receive success parameter sent from successful account registration & activate Snackbar
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setOpenSnackbar(true);
    }
  }, [searchParams]);

  // Fetch POST request to handle login attempt
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Please fill in all fields.");
      }

      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const apiUrl = `${baseApiUrl}/login`;

      // Make POST request to login endpoint in backend
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store auth token and redirect to Biometric Monitor page
      localStorage.setItem("authToken", data.token);
      router.push("/biometric-monitor");

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left" />
      <div className="login-center" />
      <div className="login-right">
        <h1 className="title">Senior Sense Solutions</h1>
        <h2 className="welcome">Welcome back!</h2>
        <p className="sub-text">Log in to your account to continue</p>

        <form className="login-form" onSubmit={handleLogin}>
          {/* Email input */}
          <input
            type="email"
            className="email-slot"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />

          {/* Password input */}
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              className="password-slot"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
              <span>Show password</span>
            </button>
          </div>

          {error && <div className="error-message" role="alert">{error}</div>}

          {/* Remember Me & Forgot Your Password? container */}
          <div className="remember-forgot-container">
            <label className="remember">
              <input type="checkbox" disabled={isLoading} />
              <span>Remember me</span>
            </label>
            <Link href="/forgot-password" className="forgot">
              <span>Forgot your password?</span>
            </Link>
          </div>

          {/* Submit button */}
          <button 
            type="submit" 
            className="login" 
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register link */}
        <p className="sign-up">
          Don&apos;t have an account yet?{" "}
          <Link href="/register">Sign up here!</Link>
        </p>

        <div className="separator">
          <span className="fw-bold">Or continue with:</span>
        </div>

        {/* Google login button */}
        <button 
          className="google fw-bold" 
          disabled={isLoading}
        >
          <FcGoogle size={48} /> Google
        </button>
      </div>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Account successfully created!
        </Alert>
      </Snackbar>
    </div>
  );
}
