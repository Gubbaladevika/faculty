import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const faculties = [
  { name: "Dr. Ramesh" },
  { name: "Prof. Anitha" },
  { name: "Dr. Kumar" },
];

const Dashboard = () => {

  const navigate = useNavigate();
  const usermail = localStorage.getItem("userEmail");

  // Calculate feedback progress
  const totalFaculty = faculties.length;

  const completed = faculties.filter((f) => {
    const key = `feedback_${usermail}_${f.name}`;
    return localStorage.getItem(key) === "true";
  }).length;

  const progress = (completed / totalFaculty) * 100;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 p-8">

        <div className="max-w-5xl mx-auto">

          {/* Welcome Section */}

          <h1 className="text-3xl font-bold mb-2">
            Student Dashboard
          </h1>

          <p className="text-gray-600 mb-6">
            Welcome, {usermail}
          </p>


          {/* Dashboard Cards */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Progress Card */}

            <div className="bg-white shadow rounded-xl p-6">

              <h2 className="text-xl font-semibold mb-4">
                📊 Feedback Progress
              </h2>

              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">

                <div
                  className="bg-green-500 h-4 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>

              </div>

              <p className="text-sm text-gray-600">
                {completed} / {totalFaculty} Completed
              </p>

            </div>


            {/* Give Feedback Card */}

            <div
              onClick={() => navigate("/feedbackform")}
              className="bg-white shadow rounded-xl p-6 cursor-pointer hover:shadow-xl transition"
            >

              <h2 className="text-xl font-semibold mb-2">
                📝 Give Feedback
              </h2>

              <p className="text-gray-500 text-sm">
                Submit feedback for your faculty members.
              </p>

            </div>

          </div>


          {/* Instructions */}

          <div className="bg-white shadow rounded-xl p-6 mt-8">

            <h2 className="text-xl font-semibold mb-3">
              Instructions
            </h2>

            <ul className="text-gray-600 text-sm space-y-2">
              <li>• Select a faculty and submit your feedback.</li>
              <li>• Each faculty can be reviewed only once.</li>
              <li>• Your feedback helps improve teaching quality.</li>
            </ul>

          </div>

        </div>

      </div>
    </>
  );
};

export default Dashboard;