"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage && savedImage !== "null" && savedImage !== "") {
      setProfileImage(savedImage);
    } else {
      setProfileImage("/profile-default.jpg");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (profileImage) {
      localStorage.setItem("profileImage", profileImage);
    }
  }, [profileImage]);

  return (
    <UserContext.Provider value={{ profileImage, setProfileImage }}>
      {!isLoading && children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
