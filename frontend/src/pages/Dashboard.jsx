import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-6">
        Student Dashboard
      </h1>

      <button
        onClick={() => navigate("/feedbackform")}
        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
      >
        Give Feedback
      </button>
    </div>
  );
};

export default Dashboard;