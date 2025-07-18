"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // ✅ حالة التحميل

  useEffect(() => {
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage) {
      setProfileImage(savedImage);
    } else {
      setProfileImage("/profile-default.jpg");
    }
    setIsLoading(false); // ✅ بعد ما تخلص تحميل
  }, []);

  useEffect(() => {
    if (profileImage) {
      localStorage.setItem("profileImage", profileImage);
    }
  }, [profileImage]);

  if (isLoading) return null; // ❌ متعرضش حاجة قبل التحميل

  return (
    <UserContext.Provider value={{ profileImage, setProfileImage }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
