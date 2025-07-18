"use client";
import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../Sidebar";
import { FiSearch } from "react-icons/fi";
import { FaRegUser, FaUser, FaSignOutAlt, FaUserCircle } from "react-icons/fa";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "../context/userContext";

export default function TodoPage() {
  const router = useRouter();
  const dropdownRef = useRef(null);
  const { profileImage } = useUser();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [todoIdToDelete, setTodoIdToDelete] = useState(null);

  const [todos, setTodos] = useState([]);
  const [filteredTodos, setFilteredTodos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTodoName, setNewTodoName] = useState("");
  const [newCategory, setNewCategory] = useState("Work");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editTodoData, setEditTodoData] = useState({});

  const confirmDelete = (id) => {
    setTodoIdToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!todoIdToDelete) return;
    await deleteTodo(todoIdToDelete);
    setShowDeleteModal(false);
    setTodoIdToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setTodoIdToDelete(null);
  };

  const apiBase = "http://todoo.runasp.net/api/todo";
  const token = Cookies.get("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchTodos = async () => {
    try {
      const res = await fetch(apiBase, { headers });

      if (!res.ok) {
        console.error("❌ Fetch error: status ", res.status);
        return;
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("❌ Invalid or empty JSON response");
        return;
      }

      const data = await res.json();
      const filtered = data.filter((t) => t.name.toLowerCase() !== "item 1");
      setTodos(filtered);
      setFilteredTodos(filtered);
    } catch (err) {
      console.error("❌ fetchTodos error:", err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = todos.filter((todo) =>
      todo.name.toLowerCase().includes(term)
    );
    setFilteredTodos(filtered);
  }, [searchTerm, todos]);

  const addTodo = async () => {
    if (!newTodoName.trim()) return;
    const newTodo = {
      id: 0,
      name: newTodoName,
      isComplete: false,
      createdAt: new Date().toISOString(),
      dueDate: newDueDate || null,
      category: newCategory,
      priority: newPriority,
    };
    try {
      const res = await fetch(apiBase, {
        method: "POST",
        headers,
        body: JSON.stringify(newTodo),
      });
      if (!res.ok) {
        console.error("❌ Add todo failed with status:", res.status);
        return;
      }
      setNewTodoName("");
      setNewCategory("Work");
      setNewPriority("Medium");
      setNewDueDate("");
      fetchTodos();
      setActiveTab("all");
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const res = await fetch(`${apiBase}/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) {
        console.error("❌ Delete todo failed with status:", res.status);
        return;
      }
      fetchTodos();
    } catch (err) {
      console.error(err);
    }
  };

  const updateTodo = async (todo) => {
    try {
      const res = await fetch(`${apiBase}/${todo.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(todo),
      });
      if (!res.ok) {
        console.error("❌ Update todo failed with status:", res.status);
        return;
      }
      fetchTodos();
      setEditingId(null);
      setEditTodoData({});
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComplete = (todo) => {
    const updated = { ...todo, isComplete: !todo.isComplete };
    updateTodo(updated);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen flex flex-col sm:flex-row text-white"
    >
      <div
        className="fixed inset-0 z-0 bg-[#0a0a23]"
        style={{
          backgroundImage: "url('/21.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>

      <div className="fixed inset-0 z-0 bg-black/60 backdrop-blur-sm"></div>

      <aside
        className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 sm:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-64 bg-transparent backdrop-blur-md border-r border-white/20`}
      >
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </aside>

      <header className="fixed top-0 z-50 h-[64px] px-4 sm:px-6 flex items-center justify-between text-white bg-white/10 backdrop-blur-lg border-b border-white/20 w-full sm:left-[274px] sm:w-[calc(100%-274px)]">
        <button
          className="sm:hidden text-white text-2xl"
          onClick={() => setSidebarOpen((prev) => !prev)}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <h1 className="text-xl font-bold">Todo List</h1>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            aria-label="User menu"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 border border-white/40"
          >
            {profileImage && profileImage !== "null" && profileImage !== "" ? (
              <img
                src={profileImage}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/212.jpg";
                }}
                className="w-10 h-10 rounded-full object-cover shadow-lg"
                alt="profile"
              />
            ) : (
              <img
                src="/212.jpg"
                className="w-10 h-10 rounded-full object-cover shadow-lg"
                alt="default profile"
              />
            )}
          </button>

          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-0 mt-2 w-44 bg-white text-gray-800 rounded-lg shadow-lg z-50"
            >
              <button
                onClick={() => router.push("/update")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
              >
                <FaRegUser /> Profile
              </button>
              <button
                onClick={() => {
                  Cookies.remove("token");
                  localStorage.removeItem("profileImage"); // امسح صورة المستخدم القديم
                  router.push("/login");
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-500 flex items-center gap-2"
              >
                <FaSignOutAlt /> Logout
              </button>
            </motion.div>
          )}
        </div>
      </header>
      <main className="relative z-10 flex-1 pt-24 sm:pt-20 pl-0 sm:pl-[274px] px-4 py-6 overflow-auto">
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-white/10 backdrop-blur-lg shadow-lg p-4 rounded-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-md bg-white/20 text-white placeholder:text-white/70 border border-white/30 focus:outline-none"
                autoComplete="off"
              />
              <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 text-lg" />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-lg shadow-lg p-6 rounded-3xl">
          <div className="space-y-3 max-w-full overflow-x-auto sm:overflow-x-visible">
            {activeTab === "add" ? (
              <>
                <input
                  value={newTodoName}
                  onChange={(e) => setNewTodoName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 text-white border border-white/30 placeholder:text-white/60 focus:outline-none mb-4"
                  placeholder="Enter task name"
                  autoComplete="off"
                />
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/20 text-white border border-white/30"
                  >
                    <option className="text-black">Work</option>
                    <option className="text-black">Personal</option>
                    <option className="text-black">Other</option>
                  </select>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/20 text-white border border-white/30"
                  >
                    <option className="text-black">High</option>
                    <option className="text-black">Medium</option>
                    <option className="text-black">Low</option>
                  </select>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/20 text-white border border-white/30"
                  />
                </div>
                <button
                  onClick={addTodo}
                  className="px-4 py-2 bg-white/20 text-white rounded-md hover:bg-white/30 transition duration-300"
                >
                  Add Task
                </button>
              </>
            ) : (
              <>
                {filteredTodos.length > 0 && (
                  <div className="min-w-[700px] grid grid-cols-7 gap-4 font-semibold text-white/80 mb-2 text-xs sm:text-sm md:text-base">
                    <span>Task</span>
                    <span>Created At</span>
                    <span>Due Date</span>
                    <span>Priority</span>
                    <span>Category</span>
                    <span>Is Complete</span>
                    <span>Actions</span>
                  </div>
                )}
                {filteredTodos.map((todo) => {
                  const isEditing = editingId === todo.id;
                  return (
                    <div
                      key={todo.id}
                      className={`min-w-[700px] grid grid-cols-7 gap-4 items-center rounded-xl p-3 border border-white/20 text-sm sm:text-base ${
                        todo.isComplete
                          ? "bg-green-600 bg-opacity-30"
                          : "bg-white/10"
                      }`}
                    >
                      <div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editTodoData.name || ""}
                            onChange={(e) =>
                              setEditTodoData({
                                ...editTodoData,
                                name: e.target.value,
                              })
                            }
                            className="w-full rounded-md px-2 py-1 text-black"
                          />
                        ) : (
                          <span>{todo.name}</span>
                        )}
                      </div>
                      <div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={
                              editTodoData.createdAt
                                ? formatDate(editTodoData.createdAt)
                                : ""
                            }
                            readOnly
                            className="w-full rounded-md px-2 py-1 text-black bg-gray-200 cursor-not-allowed"
                          />
                        ) : (
                          <span>{formatDate(todo.createdAt)}</span>
                        )}
                      </div>
                      <div>
                        {isEditing ? (
                          <input
                            type="date"
                            value={
                              editTodoData.dueDate
                                ? editTodoData.dueDate.split("T")[0]
                                : ""
                            }
                            onChange={(e) =>
                              setEditTodoData({
                                ...editTodoData,
                                dueDate: e.target.value,
                              })
                            }
                            className="w-full rounded-md px-2 py-1 text-black"
                          />
                        ) : (
                          <span>{formatDate(todo.dueDate)}</span>
                        )}
                      </div>
                      <div>
                        {isEditing ? (
                          <select
                            value={editTodoData.priority || ""}
                            onChange={(e) =>
                              setEditTodoData({
                                ...editTodoData,
                                priority: e.target.value,
                              })
                            }
                            className="w-full rounded-md px-2 py-1 text-black"
                          >
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                          </select>
                        ) : (
                          <span>{todo.priority}</span>
                        )}
                      </div>
                      <div>
                        {isEditing ? (
                          <select
                            value={editTodoData.category || ""}
                            onChange={(e) =>
                              setEditTodoData({
                                ...editTodoData,
                                category: e.target.value,
                              })
                            }
                            className="w-full rounded-md px-2 py-1 text-black"
                          >
                            <option>Work</option>
                            <option>Personal</option>
                            <option>Other</option>
                          </select>
                        ) : (
                          <span>{todo.category}</span>
                        )}
                      </div>
                      <div className="flex justify-center">
                        {isEditing ? (
                          <input
                            type="checkbox"
                            checked={!!editTodoData.isComplete}
                            onChange={(e) =>
                              setEditTodoData({
                                ...editTodoData,
                                isComplete: e.target.checked,
                              })
                            }
                            className="cursor-pointer"
                            aria-label="Toggle complete status"
                          />
                        ) : (
                          <input
                            type="checkbox"
                            checked={todo.isComplete}
                            onChange={() => toggleComplete(todo)}
                            className="cursor-pointer"
                            aria-label="Toggle complete status"
                          />
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => updateTodo(editTodoData)}
                              className="px-3 py-1 bg-green-600 rounded text-white hover:bg-green-700 transition"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditTodoData({});
                              }}
                              className="px-3 py-1 bg-red-600 rounded text-white hover:bg-red-700 transition"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(todo.id);
                                setEditTodoData(todo);
                              }}
                              className="px-3 py-1 bg-blue-600 rounded text-white hover:bg-blue-700 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDelete(todo.id)}
                              className="px-3 py-1 bg-red-600 rounded text-white hover:bg-red-700 transition"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </main>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white/10 text-white p-6 rounded-2xl shadow-xl w-[90%] max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-center">
              Are you sure you want to delete this task?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition"
              >
                Yes, Delete
              </button>
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 rounded bg-white/20 hover:bg-white/30 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
