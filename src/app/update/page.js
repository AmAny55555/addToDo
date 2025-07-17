"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useUser } from "../context/userContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();
  const { profileImage, setProfileImage } = useUser();

  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fileInputRef = useRef(null);
  const API_BASE = "http://todoo.runasp.net/api/account";

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token not found");

        const res = await fetch(`${API_BASE}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          setFullName(data.fullName || "");
          if (data.profileImage) setProfileImage(data.profileImage);
        } else {
          setError(data.message || "Failed to fetch profile");
        }
      } catch (err) {
        setError("Connection error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [setProfileImage]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found");

      const fieldNames = [
        "file",
        "image",
        "photo",
        "profileImage",
        "formFile",
        "upload",
      ];
      for (let name of fieldNames) {
        const formData = new FormData();
        formData.append(name, file);

        const res = await fetch(`${API_BASE}/upload-photo`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await res.json();
        if (res.ok) {
          const newImage = data.profileImage || URL.createObjectURL(file);
          setProfileImage(newImage);
          setSuccess(`✅ Photo uploaded`);
          return;
        }
      }

      setError("❌ Failed to upload photo");
    } catch {
      setError("Error uploading photo");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = () => {
    if (!fullName.trim()) return setError("Name is required");
    if (newPassword && newPassword !== confirmPassword)
      return setError("Passwords do not match");
    setShowConfirmModal(true);
  };

  const confirmProfileUpdate = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      const nameRes = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName }),
      });

      const nameData = await nameRes.json();
      if (!nameRes.ok)
        throw new Error(nameData.message || "Failed to update name");

      if (currentPassword && newPassword && confirmPassword) {
        const passwordRes = await fetch(`${API_BASE}/change-password`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        });

        const text = await passwordRes.text();
        let passwordData = {};
        try {
          passwordData = text ? JSON.parse(text) : {};
        } catch {}

        if (!passwordRes.ok)
          throw new Error(passwordData.message || "Failed to change password");
      }

      setSuccess("✅ Profile updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => router.push("/todo"), 1500);
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex justify-center items-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-blue-700">
          Update Profile
        </h2>

        <div className="flex justify-center">
          <div
            className="w-40 h-40 overflow-hidden cursor-pointer rounded-xl border border-gray-300"
            onClick={() => fileInputRef.current.click()}
          >
            <Image
              src={profileImage || "/212.jpg"}
              alt="Profile"
              width={160}
              height={160}
              className="object-cover w-full h-full"
              onError={(e) => {
                e.target.src = "/212.jpg";
              }}
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              disabled={loading}
            />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        {success && (
          <p className="text-green-600 text-sm text-center">{success}</p>
        )}

        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
          disabled={loading}
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
          disabled={loading}
        />

        <button
          onClick={handleUpdateProfile}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          Update Profile
        </button>
      </motion.div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-2xl shadow-lg space-y-4 max-w-sm w-full"
          >
            <h3 className="text-lg font-bold text-blue-700 text-center">
              Are you sure you want to update your profile?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmProfileUpdate}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Yes, Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
