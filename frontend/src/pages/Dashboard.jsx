import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const navigate = useNavigate();

  const [faculty, setFaculty] = useState([]);
  const [submittedFaculty, setSubmittedFaculty] = useState([]);
  const [studentGroup, setStudentGroup] = useState(null);
  const [error, setError] = useState("");

  const username = localStorage.getItem("username") || "Student";
  const token = localStorage.getItem("token");

  // Get student group
  useEffect(() => {
    if (!token) {
      setError("Login expired. Please login again.");
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/my-group/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.group) {
          setStudentGroup(data.group);
        } else {
          setError("Session expired. Please login again.");
        }
      })
      .catch((err) => {
        console.log("Group error:", err);
        setError("Unable to load group");
      });
  }, [token]);

  // Get faculty
  useEffect(() => {
    if (!studentGroup || !token) return;

    fetch(`${import.meta.env.VITE_API_URL}/api/faculty/?group=${studentGroup}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setFaculty(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.log("Faculty error:", err);
        setFaculty([]);
      });
  }, [studentGroup, token]);

  // Get submitted status
  useEffect(() => {
    if (!studentGroup || !token) return;

    fetch(`${import.meta.env.VITE_API_URL}/api/feedback-status/?group=${studentGroup}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setSubmittedFaculty(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.log("Status error:", err);
        setSubmittedFaculty([]);
      });
  }, [studentGroup, token]);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg p-8">
            <h1 className="text-4xl font-bold mb-2">Student Dashboard</h1>
            <p className="text-lg text-blue-100">Welcome, {username}</p>
            <p className="text-sm text-blue-200 mt-2">
              Submit feedback for your faculty members below.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow">
              {error}
            </div>
          )}

          {/* Faculty Cards */}
          <div className="bg-white rounded-2xl shadow p-8 border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Faculty Status
              </h2>
              <span className="text-sm text-gray-500">
                {faculty.length} Faculty Members
              </span>
            </div>

            {faculty.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {faculty.map((f) => (
                  <div
                    key={f.id}
                    className="bg-gray-50 border rounded-2xl p-5 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {f.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Faculty Feedback
                        </p>
                      </div>

                      {submittedFaculty.includes(f.id) ? (
                        <span className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                          Submitted
                        </span>
                      ) : (
                        <span className="bg-orange-100 text-orange-600 text-sm font-semibold px-3 py-1 rounded-full">
                          Pending
                        </span>
                      )}
                    </div>

                    {submittedFaculty.includes(f.id) ? (
                      <button
                        disabled
                        className="w-full bg-green-500 text-white py-2 rounded-xl opacity-80 cursor-not-allowed font-medium"
                      >
                        ✔ Feedback Submitted
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/feedbackform/${f.id}`)}
                        className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition font-medium"
                      >
                        Give Feedback
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-10">
                No faculty found
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;