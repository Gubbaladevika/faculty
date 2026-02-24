import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Faculty Feedback Dashboard
      </h1>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">

        {/* View Faculty */}
        <div
          onClick={() => navigate("/faculty")}
          className="bg-white shadow-lg rounded-xl p-6 text-center cursor-pointer hover:shadow-xl transition"
        >
          <h2 className="text-xl font-semibold mb-2">View Faculty</h2>
          <p className="text-gray-600">
            See the list of faculty members.
          </p>
        </div>

        {/* Give Feedback */}
        <div
          onClick={() => navigate("/feedback")}
          className="bg-white shadow-lg rounded-xl p-6 text-center cursor-pointer hover:shadow-xl transition"
        >
          <h2 className="text-xl font-semibold mb-2">Give Feedback</h2>
          <p className="text-gray-600">
            Submit feedback for faculty.
          </p>
        </div>

      </div>

      {/* Logout Button */}
      <button
        onClick={() => navigate("/")}
        className="mt-10 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
      >
        Logout
      </button>

    </div>
  );
};

export default Dashboard;