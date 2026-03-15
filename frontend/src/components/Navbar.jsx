import { useNavigate } from "react-router-dom";

const Navbar = () => {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  return (
   <div className="bg-blue-600 text-white px-8 py-4 flex justify-between items-center shadow-md sticky top-0 z-50">
      <h1
        className="text-lg font-semibold cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        Faculty Feedback System
      </h1>

      <div className="space-x-6">

        <button onClick={() => navigate("/dashboard")}>
          Dashboard
        </button>

        <button onClick={() => navigate("/feedbackform")}>
          Give Feedback
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

export default Navbar;