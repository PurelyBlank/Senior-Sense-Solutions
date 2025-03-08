"use client";

import "./register.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";


export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const router = useRouter();

    const handleRegister = () => {
        router.push("/login");
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