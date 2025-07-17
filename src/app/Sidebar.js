"use client";
import React from "react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
}) {
  const items = [
    { id: "all", label: "All Tasks" },
    { id: "add", label: "Add New" },
  ];

  const sharedStyles = `
    bg-transparent text-white 
    backdrop-blur-md border-r border-white/20 shadow-xl
  `;

  return (
    <>
      {/* ✅ Sidebar للموبايل */}
      <div
        className={`fixed top-0 left-0 h-full w-64 z-[9999] transform transition-transform duration-300 sm:hidden 
        ${sharedStyles}
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex justify-between items-center px-4 py-4 border-b border-white/30">
          <h2 className="text-xl font-bold text-white">Menu</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white text-xl"
          >
            ✕
          </button>
        </div>
        <ul className="p-4 space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <button
                className={`w-full text-left px-4 py-2 rounded-md font-medium transition ${
                  activeTab === item.id
                    ? "bg-white/20 text-white" // ✅ هنا التغيير
                    : "hover:bg-white/10 text-white"
                }`}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ✅ Sidebar للكمبيوتر */}
      <div
        className={`hidden sm:block w-64 p-6 min-h-screen sticky top-0 ${sharedStyles}`}
      >
        <h2 className="text-2xl font-bold mb-6">Menu</h2>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <button
                className={`w-full text-left px-4 py-2 rounded-md font-medium transition ${
                  activeTab === item.id
                    ? "bg-white/20 text-white" // ✅ نفس التغيير هنا
                    : "hover:bg-white/10 text-white"
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
