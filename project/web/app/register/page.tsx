"use client";

import "./register.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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

      // Make POST request to register endpoint in backend
      const response = await fetch("http://localhost:5000/api/register", {
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
    }
  };

  return (
    <div className="register-container">
      <div className="register-left"></div>
      <div className="register-center"></div>
      <div className="register-right">
        <div className="title">Senior Sense Solutions</div>
        <div className="welcome">Create your account</div>
        <div className="sub-text">Create your account here to continue</div>

        {/* First Name Input */}
        <div className="input-container">
          <input type="text" className="input-slot" placeholder="First Name" />
        </div>

        {/* Last Name Input */}
        <div className="input-container">
          <input type="text" className="input-slot" placeholder="Last Name" />
        </div>

        {/* Email Input */}
        <div className="input-container">
          <input type="email" className="input-slot" placeholder="Email" />
        </div>

        {/* Password Input */}
        <div className="input-container">
          <input
            type={showPassword ? "text" : "password"}
            className="input-slot"
            placeholder="Password"
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
          />
          <div
            className="password-visible"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
          >
            {showConfirmPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
            <span>Show password</span>
          </div>
        </div>

        {/* Register Button */}
        <button className="register" onClick={handleRegister}>Register</button>

        {/* Or Register with Google */}
        <div className="separator-container">
          <div className="separator-line"></div>
          <div className="separator-text">Or register with</div>
          <div className="separator-line"></div>
        </div>

        {/* Google Sign-In Button */}
        <button className="google">
          <FcGoogle size={34} /> Google
        </button>
      </div>
    </div>
  );
}