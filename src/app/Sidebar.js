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

  return (
    <>
      {/* ✅ Sidebar للموبايل */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white/30 backdrop-blur-md z-[9999] shadow-lg transform transition-transform duration-300 sm:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-4 py-4 border-b border-white/40">
          <h2 className="text-xl font-bold text-blue-800">Menu</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-blue-800 text-xl"
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
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-100 text-blue-800"
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
      <div className="hidden sm:block bg-white/30 backdrop-blur-md text-blue-800 w-64 p-6 min-h-screen sticky top-0 border-r border-white/40">
        <h2 className="text-2xl font-bold mb-6">Menu</h2>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <button
                className={`w-full text-left px-4 py-2 rounded-md font-medium transition ${
                  activeTab === item.id
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-100 text-blue-800"
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
