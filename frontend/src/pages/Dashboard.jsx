import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const navigate = useNavigate();

  const [faculty, setFaculty] = useState([]);
  const [submittedFaculty, setSubmittedFaculty] = useState([]);
  const [studentGroup, setStudentGroup] = useState(null);

  const username = localStorage.getItem("username") || "Student";
  const token = localStorage.getItem("token");

  // 1) get student group first
  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:8000/api/my-group/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("GROUP DATA:", data);
        setStudentGroup(data.group);
      })
      .catch((err) => {
        console.log("Group error:", err);
        setStudentGroup(null);
      });
  }, [token]);

  // 2) load faculty only after group is available
  useEffect(() => {
    if (studentGroup === null || !token) return;

    fetch(`http://localhost:8000/api/faculty/?group=${studentGroup}`, {
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

  // 3) load submitted status only after group is available
  useEffect(() => {
    if (studentGroup === null || !token) return;

    fetch(`http://localhost:8000/api/feedback-status/?group=${studentGroup}`, {
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

      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>

          <p className="text-gray-600 mb-6">Welcome, {username}</p>

          <div className="mb-6">
            <button
              onClick={() => navigate("/feedbackform")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Go to Feedback Form
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow mt-6">
            <h3 className="text-lg font-semibold mb-3">Faculty Status</h3>

            <ul className="space-y-2">
              {faculty.map((f) => (
                <li
                  key={f.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <span>{f.name}</span>

                  {submittedFaculty.includes(f.id) ? (
                    <button
                      disabled
                      className="bg-green-500 text-white px-3 py-1 rounded opacity-70 cursor-not-allowed"
                    >
                      ✔ Submitted
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate("/feedbackform")}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Give Feedback
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;