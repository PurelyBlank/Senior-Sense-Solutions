"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import Alert from '@mui/material/Alert';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';

import "bootstrap/dist/css/bootstrap.min.css";
import "./register.css";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        throw new Error("Please fill in all fields.");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const apiUrl = `${baseApiUrl}/register`;

      // Make POST request to register endpoint in backend
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // On success, redirect to Login page
      router.push("/");

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");

    } finally {
      setIsLoading(false);
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenSnackbar(false);
  };

  return (
    <div className="register-container">
      <div className="register-left"></div>
      <div className="register-center"></div>
      <div className="register-right">
        <div className="title">Senior Sense Solutions</div>
        <div className="welcome">Create a new account</div>
        <div className="sub-text">Create your account to continue</div>

        <form className="register-form" onSubmit={handleRegister}>
          {/* First Name Input */}
          <div className="input-container">
            <input 
              type="text" 
              className="input-slot" 
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Last Name Input */}
          <div className="input-container">
            <input 
              type="text" 
              className="input-slot" 
              placeholder="Last Name" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Email Input */}
          <div className="input-container">
            <input 
              type="email" 
              className="input-slot" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Password Input */}
          <div className="input-container">
            <input
              type={showPassword ? "text" : "password"}
              className="input-slot"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <div
              className="password-visible"
              onClick={() => setShowPassword(!showPassword)} 
            >
              {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
              <span>Show password</span>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="input-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="input-slot"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <div
              className="password-visible"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
            >
              {showConfirmPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
              <span>Show password</span>
            </div>
          </div>

          {/* Error Message */}
          {error && <div className="error-message" role="alert">{error}</div>}

          {/* Register Button */}
          <button type="submit" className="register" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </button>

          {/* Snackbar */}
          <Snackbar
            open={openSnackbar} 
            autoHideDuration={6000} 
            onClose={handleCloseSnackbar}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity="success"
              variant="filled"
              sx={{ width: '100%' }}
            >
              Account successfully created!
            </Alert>
          </Snackbar>
        </form>

        {/* Login link */}
        <p className="log-in">
          Already have an account?{" "}
          <Link href="/">Log in here!</Link>
        </p>

        {/* Or Register with Google */}
        <div className="separator-container">
          <div className="separator-line"></div>
          <div className="separator-text">
            <span className="fw-bold">Or register with:</span>
          </div>
          <div className="separator-line"></div>
        </div>

        {/* Google Sign-In Button */}
        <button className="google fw-bold">
          <FcGoogle size={48} /> Google
        </button>
      </div>
    </div>
  );
}