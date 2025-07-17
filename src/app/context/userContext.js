"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage) {
      setProfileImage(savedImage);
    } else {
      // لو مفيش صورة محفوظة في اللوكال ستوريج، نحط الصورة الافتراضية
      setProfileImage("/212.jpg");
    }
  }, []);

  useEffect(() => {
    if (profileImage) {
      localStorage.setItem("profileImage", profileImage);
    }
  }, [profileImage]);

  return (
    <UserContext.Provider value={{ profileImage, setProfileImage }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
