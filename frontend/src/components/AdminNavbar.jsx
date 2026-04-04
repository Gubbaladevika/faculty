import React from "react";
import { useNavigate } from "react-router-dom";

const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // remove token
    navigate("/admin-login");
  };

  return (
    <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
      
      <h1 className="text-xl font-bold">
        Admin Panel
      </h1>

      <div className="flex gap-4">
        <button
          onClick={() => navigate("/admin")}
          className="bg-blue-500 px-3 py-1 rounded"
        >
          Dashboard
        </button>

        <button
          onClick={handleLogout}
          className="bg-red-500 px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
      
    </div>
  );
};

export default AdminNavbar;