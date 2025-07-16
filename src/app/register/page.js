"use client";

import React, { useState } from "react";
import { z } from "zod";
import Link from "next/link";
import LoadingSpinner from "../LoadingSpinner";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  passwordHash: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    passwordHash: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMsg("");

    const result = registerSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = {};
      if (Array.isArray(result.error.errors)) {
        result.error.errors.forEach((err) => {
          const field = err.path[0];
          fieldErrors[field] = err.message;
        });
      } else {
        fieldErrors.general = "Validation error occurred";
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      console.log("📤 Sending data to backend:", formData);

      const res = await fetch("http://todoo.runasp.net/api/account/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("📥 Response Status:", res.status);
      console.log("📥 Response Headers:", Array.from(res.headers.entries()));

      const responseText = await res.text();
      console.log("📥 Raw Response Text:", responseText);

      let responseJson = {};
      try {
        responseJson = JSON.parse(responseText);
        console.log("📦 Parsed JSON:", responseJson);
      } catch {
        console.warn("⚠️ Response is not valid JSON");
        responseJson = { message: responseText };
      }

      if (!res.ok) {
        throw new Error(responseJson.message || "❌ Registration failed");
      }

      setSuccessMsg("✅ Registered successfully!");
      setFormData({ username: "", passwordHash: "" });
    } catch (err) {
      console.error("🔥 Error:", err.message);
      if (err.message.includes("CORS")) {
        console.warn("🚫 CORS issue detected");
      }
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Register
        </h2>

        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.username
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
              }`}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="passwordHash" className="block text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="passwordHash"
              name="passwordHash"
              value={formData.passwordHash}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.passwordHash
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
              }`}
            />
            {errors.passwordHash && (
              <p className="text-red-500 text-sm mt-1">{errors.passwordHash}</p>
            )}
          </div>

          {errors.general && (
            <p className="text-red-600 text-center mb-4">{errors.general}</p>
          )}

          {successMsg && (
            <p className="text-green-600 text-center mb-4">{successMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-md transition"
          >
            {loading ? <LoadingSpinner /> : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-700">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login here.
          </Link>
        </p>
      </div>
    </div>
  );
}
