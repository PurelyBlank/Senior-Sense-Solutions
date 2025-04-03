"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Replace with actual API call
      if (!email || !password) {
        throw new Error("Please fill in all fields.");
      }

      // Hard-coded authentication (replace with real auth)
      if (email === "admin@uci.edu" && password === "admin") {
        localStorage.setItem("authToken", "dummy_token");
        router.push("/biometric-monitor"); 

      } else {
        setError("Invalid email or password.");
      }
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
          <input
            type="email"
            className="email-slot"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />

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

          <div className="remember-forgot-container">
            <label className="remember">
              <input type="checkbox" disabled={isLoading} />
              <span>Remember me</span>
            </label>
            <Link href="/forgot-password" className="forgot">
              <span>Forgot your password?</span>
            </Link>
          </div>

          <button 
            type="submit" 
            className="login" 
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="sign-up">
          Don&apos;t have an account yet?{" "}
          <Link href="/register">Sign up here!</Link>
        </p>

        <div className="separator">
          <span className="fw-bold">Or continue with:</span>
        </div>

        <button 
          className="google fw-bold" 
          disabled={isLoading}
        >
          <FcGoogle size={48} /> Google
        </button>
      </div>
    </div>
  );
}
