"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const defaultImage = "/profile-default.jpg";
  const [profileImage, setProfileImage] = useState(defaultImage);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedImage = localStorage.getItem("profileImage");

    if (!savedImage || savedImage === "null" || savedImage === "") {
      setProfileImage(defaultImage);
    } else {
      setProfileImage(savedImage);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (profileImage && profileImage !== defaultImage) {
      localStorage.setItem("profileImage", profileImage);
    } else {
      localStorage.removeItem("profileImage");
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
