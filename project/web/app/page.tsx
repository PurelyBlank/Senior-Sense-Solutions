"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import "./globals.css";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (email === "admin@uci.edu" && password === "admin") {
      localStorage.setItem("authToken", "dummy_token");
      router.push("/biometric-monitor"); 
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-left"></div>
      <div className="login-center"></div>
      <div className="login-right">
        <div className="title">Senior Sense Solutions</div>
        <div className="welcome">Welcome Back!</div>
        <div className="sub-text">Login to your account to continue</div>

        {/* Email Input */}
        <input
          type="email"
          className="email-slot"
          placeholder="Enter your email"
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />

        {/* Password Input */}
        <input
          type={showPassword ? "text" : "password"}
          className="password-slot"
          placeholder="Enter your password"
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />

        {/* Show Password Toggle Below */}
        <div
          className="password-visible"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
          <span>Show password</span>
        </div>

        {/* Display error message */}
        {error && <div className="error-message">{error}</div>}

        <div className="remember-forgot-container">
          <label className="remember">
            <input type="checkbox" />
            Remember me
          </label>
          <div className="forgot">Forgot your password?</div>
        </div>

        <button className="login" onClick={handleLogin}>Login</button>

        <div className="sign-up">
          Don't have an account yet? <Link href="/register">Sign up here!</Link>
        </div>

        <div className="separator">Or login with</div>

        <button className="google">
          <FcGoogle size={34} /> Google
        </button>
      </div>
    </div>
  );
}
