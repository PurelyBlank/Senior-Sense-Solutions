"use client";

import "./login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const handleLogin = () => {
    localStorage.setItem("authToken", "dummy_token"); // Store a dummy token
    router.push("/"); // Redirect to the main layout
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
        <input type="email" className="email-slot" placeholder="Enter your email" />

        {/* Password Input */}
        <input
          type={showPassword ? "text" : "password"}
          className="password-slot"
          placeholder="Enter your password"
        />

        {/* Show Password Toggle Below */}
        <div 
          className="password-visible"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
          <span>Show password</span>
        </div>

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
