"use client";

import React, { useState } from "react";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../LoadingSpinner";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  passwordHash: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Register() {
  const router = useRouter();

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
      result.error.errors.forEach((err) => {
        const field = err.path[0];
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://todoo.runasp.net/api/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const text = await res.text();
      let json = {};
      try {
        json = JSON.parse(text);
      } catch {
        json = { message: text };
      }

      if (!res.ok) {
        if (res.status >= 500) {
          setErrors({
            general:
              "Something went wrong on the server. Please try again later.",
          });
        } else {
          setErrors({
            general:
              json.message || "Registration failed. Please check your data.",
          });
        }
        return;
      }

      setSuccessMsg("✅ Registration successful!");
      setFormData({ username: "", passwordHash: "" });

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      console.error("Request failed:", err);
      setErrors({ general: "Network error. Please check your connection." });
    } finally {
      setLoading(false);
    }
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
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        <form
          onSubmit={handleSubmit}
          noValidate
          autoComplete="off"
          className="space-y-5"
        >
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
            {loading ? <LoadingSpinner /> : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-white/80 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
