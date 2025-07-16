"use client";

import React, { useEffect, useState, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import Sidebar from "../Sidebar";
import { FaUserCircle, FaRegUser, FaSignOutAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../LoadingSpinner";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { useUser } from "../context/userContext";

export default function TodoPage() {
  const router = useRouter();
  const dropdownRef = useRef(null);

  const { profileImage } = useUser();

  const [todos, setTodos] = useState([]);
  const [newTodoName, setNewTodoName] = useState("");
  const [newCategory, setNewCategory] = useState("Work");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newDueDate, setNewDueDate] = useState("");

  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const apiBase = "http://todoo.runasp.net/api/todo";
  const token = Cookies.get("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // دالة تنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const fetchTodos = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(apiBase, { headers });
      if (!res.ok) throw new Error("Failed to fetch todos");
      const data = await res.json();
      setTodos(data.filter((t) => t.name.toLowerCase() !== "item 1"));
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTodo = async () => {
    if (!newTodoName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const body = JSON.stringify({
        id: 0,
        name: newTodoName,
        isComplete: false,
        createdAt: new Date().toISOString(),
        dueDate: newDueDate || null,
        category: newCategory,
        priority: newPriority,
      });
      const res = await fetch(apiBase, { method: "POST", headers, body });
      if (!res.ok) throw new Error("Failed to add todo");
      setNewTodoName("");
      setNewCategory("Work");
      setNewPriority("Medium");
      setNewDueDate("");
      fetchTodos();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const deleteTodo = async (id) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Failed to delete todo");
      fetchTodos();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const saveEdit = async (id) => {
    if (!editName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const body = JSON.stringify({ id, name: editName, isComplete: false });
      const res = await fetch(`${apiBase}/${id}`, {
        method: "PUT",
        headers,
        body,
      });
      if (!res.ok) throw new Error("Failed to update todo");
      setEditId(null);
      setEditName("");
      fetchTodos();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const startEdit = (id, currentName) => {
    setEditId(id);
    setEditName(currentName);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
  };

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/login");
  };

  const filteredTodos = todos.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <style>{`
        main::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        main::-webkit-scrollbar-track {
          background: #bfdbfe;
          border-radius: 10px;
        }
        main::-webkit-scrollbar-thumb {
          background-color: #2563eb;
          border-radius: 10px;
          border: 2px solid #bfdbfe;
        }
        main {
          scrollbar-width: thin;
          scrollbar-color: #2563eb #bfdbfe;
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-tr from-blue-100 to-blue-200 p-2 sm:p-4 flex flex-col sm:flex-row relative"
      >
        <aside
          className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } sm:translate-x-0 w-64 sm:w-56 md:w-64 bg-white/30 backdrop-blur-md border-r border-white/30 shadow-xl text-blue-900 rounded-tr-3xl rounded-br-3xl`}
        >
          <Sidebar
            {...{ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }}
          />
        </aside>

        <header className="fixed top-0 h-[72px] sm:h-[84px] left-65 right-0 z-50 flex justify-between items-center mb-3 bg-white/70 backdrop-blur shadow px-3 py-2 ">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sm:hidden text-2xl text-blue-700"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-blue-800">
            Todo List
          </h1>
          <div className="relative user-menu" ref={dropdownRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="flex items-center gap-2 text-blue-600"
              aria-label="User menu"
            >
              <img
                src={profileImage}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-600"
              />
              <FaUserCircle className="hidden" />
            </button>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg overflow-hidden z-50 min-w-[140px]"
              >
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    router.push("/update");
                  }}
                  className="block w-full px-4 py-2 hover:bg-blue-100 flex items-center gap-2"
                >
                  <FaRegUser /> Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-red-600 hover:bg-red-100 flex items-center gap-2"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </motion.div>
            )}
          </div>
        </header>

        <main
          className="flex-grow pt-[72px] sm:pt-[84px] pl-64 max-w-full overflow-auto flex flex-col"
          style={{ height: "auto", minHeight: "calc(100vh - 72px)" }}
        >
          <div className="mb-6 mt-4 bg-white/70 backdrop-blur rounded-2xl shadow p-4 w-full sm:w-[480px]  mx-auto">
            <h2 className="text-xl font-bold text-blue-800 mb-3 flex items-center gap-2 justify-center">
              Manage Your Tasks <span className="animate-bounce">📝</span>
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search tasks..."
                className="w-full border border-blue-300 rounded-full pr-10 pl-4 py-2 focus:outline-none focus:ring-4 focus:ring-blue-200 text-gray-800 placeholder:text-blue-400 shadow-sm bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 text-lg" />
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-center mb-4 font-semibold">
              {error}
            </p>
          )}

          {loading && (
            <div className="flex justify-center mb-4">
              <LoadingSpinner />
            </div>
          )}

          {activeTab === "add" && (
            <div className="bg-white/70 backdrop-blur rounded-2xl shadow-lg p-5 w-full sm:w-[480px] mx-auto mb-6">
              <input
                type="text"
                placeholder="Enter new todo"
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-200 mb-4"
                value={newTodoName}
                onChange={(e) => setNewTodoName(e.target.value)}
                disabled={loading}
              />
              <div className="flex flex-col sm:flex-row sm:gap-4 gap-3 mb-4">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-200"
                  disabled={loading}
                >
                  <option>Work</option>
                  <option>Personal</option>
                  <option>Other</option>
                </select>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-200"
                  disabled={loading}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-200"
                  disabled={loading}
                />
              </div>
              <button
                onClick={addTodo}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:to-indigo-700 text-white px-10 py-3 rounded-full font-semibold shadow-lg disabled:opacity-60 w-full sm:w-auto"
              >
                Add
              </button>
            </div>
          )}

          {activeTab === "all" && (
            <div className="overflow-x-auto rounded-2xl border border-white/40 shadow-lg bg-white/30 backdrop-blur-md max-w-full mx-auto">
              <table className="w-full table-auto text-sm sm:text-base text-blue-900 min-w-[600px] md:min-w-[700px]">
                <thead className="bg-blue-100 text-blue-800">
                  <tr>
                    <th className="p-3 text-left">Task</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Priority</th>
                    <th className="p-3 text-left">Due Date</th>
                    <th className="p-3 text-left">Created At</th>
                    <th className="p-3 text-center">✔</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTodos.map((todo) => (
                    <tr
                      key={todo.id}
                      className="border-t border-blue-100 hover:bg-white/50"
                    >
                      <td className="p-3 max-w-xs break-words">
                        {editId === todo.id ? (
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full rounded px-2 py-1 border focus:outline-none focus:ring"
                          />
                        ) : (
                          todo.name
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">{todo.category}</td>
                      <td className="p-3 whitespace-nowrap">{todo.priority}</td>
                      <td className="p-3 whitespace-nowrap">
                        {todo.dueDate ? formatDate(todo.dueDate) : "-"}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {todo.createdAt ? formatDate(todo.createdAt) : "-"}
                      </td>
                      <td className="p-3 text-center align-middle">
                        <input
                          type="checkbox"
                          checked={todo.isComplete}
                          onChange={async () => {
                            setLoading(true);
                            setError("");
                            try {
                              const res = await fetch(`${apiBase}/${todo.id}`, {
                                method: "PUT",
                                headers,
                                body: JSON.stringify({
                                  ...todo,
                                  isComplete: !todo.isComplete,
                                }),
                              });
                              if (!res.ok) throw new Error("Failed to update");
                              fetchTodos();
                            } catch (err) {
                              setError(err.message);
                            }
                            setLoading(false);
                          }}
                          className="w-5 h-5 cursor-pointer accent-blue-600"
                          aria-label={`Mark task "${todo.name}" as complete`}
                        />
                      </td>
                      <td className="p-3 text-right space-x-2 whitespace-nowrap">
                        {editId === todo.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(todo.id)}
                              disabled={loading}
                              className="bg-green-500 text-white px-3 py-1 rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={loading}
                              className="bg-gray-400 text-white px-3 py-1 rounded"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(todo.id, todo.name)}
                              disabled={loading}
                              className="bg-blue-500 text-white px-3 py-1 rounded"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteTodo(todo.id)}
                              disabled={loading}
                              className="bg-red-500 text-white px-3 py-1 rounded"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </motion.div>
    </>
  );
}
