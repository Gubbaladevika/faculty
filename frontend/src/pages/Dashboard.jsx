import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const goToFeedback = () => {
    navigate("/feedbackform");
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Top Navbar */}
      <div className="flex justify-between items-center bg-white shadow px-6 py-4">
        <h1 className="text-xl font-bold">
          Welcome, {user?.name}
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center mt-24">
        <h2 className="text-2xl font-semibold mb-6">
          Faculty Feedback System
        </h2>

        <button
          onClick={goToFeedback}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Give Feedback
        </button>
      </div>

    </div>
  );
};

export default Dashboard;