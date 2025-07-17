"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useUser } from "../context/userContext";
import { useRouter } from "next/navigation";

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

  const fileInputRef = useRef(null);
  const API_BASE = "http://todoo.runasp.net/api/account";

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token not found");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log("📦 Profile response:", data);

        if (res.ok) {
          setFullName(data.fullName || "");
          if (data.profileImage) setProfileImage(data.profileImage);
        } else {
          setError(data.message || "Failed to fetch profile");
        }
      } catch (err) {
        console.error("❌ Profile fetch error:", err);
        setError("Connection error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [setProfileImage]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token not found. Please login again.");
        setLoading(false);
        return;
      }

      const fieldNames = [
        "file",
        "image",
        "photo",
        "profileImage",
        "formFile",
        "upload",
      ];

      let uploadSuccess = false;

      for (let name of fieldNames) {
        const formData = new FormData();
        formData.append(name, file);

        const res = await fetch(`${API_BASE}/upload-photo`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await res.json();
        console.log(`🖼️ Tried field "${name}":`, data);

        if (res.ok) {
          const newImage = data.profileImage || URL.createObjectURL(file);
          setProfileImage(newImage);
          setSuccess(`✅ Photo uploaded using field "${name}"`);
          uploadSuccess = true;
          break;
        }
      }

      if (!uploadSuccess) {
        setError("❌ Failed to upload photo with all field names.");
      }
    } catch (err) {
      console.error("❌ Upload photo error:", err);
      setError("Error uploading photo");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!fullName.trim()) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token not found");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName }),
      });

      const data = await res.json();
      console.log("✏️ Update name response:", data);

      if (res.ok) {
        setSuccess("✅ Name updated successfully");
        setTimeout(() => {
          router.push("/todo");
        }, 1500);
      } else {
        setError(data.message || "Failed to update name");
      }
    } catch (err) {
      console.error("❌ Name update error:", err);
      setError("Error updating name");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token not found");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/change-password`, {
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

      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        console.error("❌ Failed to parse response JSON:", err);
      }

      console.log("🔐 Change password response:", data);

      if (res.ok) {
        setSuccess("✅ Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          router.push("/todo");
        }, 1500);
      } else {
        setError(data.message || "Failed to change password");
      }
    } catch (err) {
      console.error("❌ Password error:", err);
      setError("Error changing password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 sm:p-12">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row gap-8">
        <div className="sm:w-1/3 flex flex-col items-center">
          <h1 className="text-3xl font-bold text-blue-800 mb-4 w-full text-left">
            Update Your Profile
          </h1>
          <div
            className="w-[250px] h-[250px] rounded-full overflow-hidden border-4 border-blue-600 cursor-pointer"
            onClick={handleImageClick}
          >
            <Image
              src={
                profileImage && profileImage.trim() !== ""
                  ? profileImage
                  : "/2221.png"
              }
              alt="Profile"
              width={250}
              height={250}
              className="object-cover"
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="sm:w-2/3">
          {error && <p className="text-red-600 mb-4">{error}</p>}
          {success && <p className="text-green-600 mb-4">{success}</p>}

          <div className="mb-4">
            <label className="block text-gray-600 mb-2 font-semibold">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
            />
            <button
              onClick={handleUpdateName}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
              disabled={loading}
            >
              Update Name
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-gray-600 mb-2 font-semibold">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-600 mb-2 font-semibold">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-600 mb-2 font-semibold">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleChangePassword}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-semibold transition"
            disabled={loading}
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}
