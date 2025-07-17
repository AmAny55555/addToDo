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
      } else if (response.status >= 500) {
        setErrors({ general: "Server error. Please try again later." });
      } else {
        setErrors({ general: data.message || "Invalid username or password." });
      }
    } catch (error) {
      console.error("Error during request:", error);
      setErrors({ general: "Something went wrong. Please try again later." });
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <div
        className="fixed inset-0 z-0 bg-[#0a0a23]"
        style={{
          backgroundImage: "url('/21.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>
      <div className="fixed inset-0 z-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl p-8 w-full max-w-md text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="username" className="block mb-1 text-white/80">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className={`w-full px-4 py-3 rounded-md bg-white/20 text-white placeholder:text-white/70 border ${
                errors.username
                  ? "border-red-500"
                  : "border-white/30 focus:border-white"
              } focus:outline-none`}
            />
            {errors.username && (
              <p className="text-red-400 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="passwordHash" className="block mb-1 text-white/80">
              Password
            </label>
            <input
              type="password"
              id="passwordHash"
              name="passwordHash"
              value={formData.passwordHash}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`w-full px-4 py-3 rounded-md bg-white/20 text-white placeholder:text-white/70 border ${
                errors.passwordHash
                  ? "border-red-500"
                  : "border-white/30 focus:border-white"
              } focus:outline-none`}
            />
            {errors.passwordHash && (
              <p className="text-red-400 text-sm mt-1">{errors.passwordHash}</p>
            )}
          </div>

          {errors.general && (
            <p className="text-red-400 text-center">{errors.general}</p>
          )}

          {successMsg && (
            <p className="text-green-400 text-center">{successMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white/20 hover:bg-white/30 transition text-white font-semibold py-3 rounded-lg"
          >
            {loading ? <LoadingSpinner /> : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-white/80 text-sm">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-400 hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}
