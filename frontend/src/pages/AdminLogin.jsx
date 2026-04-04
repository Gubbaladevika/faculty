import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post("http://127.0.0.1:8000/api/login/", {
      username,
      password,
    });
    console.log("ADMIN LOGIN RESPONSE:", res.data);
    localStorage.setItem("token", res.data.access);

    // ✅ ADD THIS LINE (THIS IS YOUR MISSING PIECE)
   localStorage.setItem("role", res.data.role || "admin");

    navigate("/admin", { replace: true });

  } catch (err) {
    alert("Invalid credentials");
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600">

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Admin Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">

          <div>
            <label className="block text-gray-600 mb-1">Username</label>
            <input
              type="text"
              placeholder="Enter username"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>

        </form>

      </div>

    </div>
  );
};

export default AdminLogin;