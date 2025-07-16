"use client";

import React, { useState } from "react";
import { z } from "zod";
import Link from "next/link";
import LoadingSpinner from "../LoadingSpinner";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  passwordHash: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    passwordHash: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMsg("");

    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://todoo.runasp.net/api/account/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            lang: "en",
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.passwordHash,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg("Login successful");
        setFormData({ username: "", passwordHash: "" });

        if (data.token) {
          localStorage.setItem("token", data.token);
          Cookies.set("token", data.token, { expires: 7 });
        }

        router.push("/todo");
      } else {
        setErrors({ general: data.message || "Invalid credentials" });
      }
    } catch (error) {
      console.error("Error during request:", error);
      setErrors({ general: "Server connection error" });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white/30 backdrop-blur-md border border-white/30 rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Login
        </h2>
        <form onSubmit={handleSubmit} noValidate>
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
            {loading ? <LoadingSpinner /> : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-700">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}
