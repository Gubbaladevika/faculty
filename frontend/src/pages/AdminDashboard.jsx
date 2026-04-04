import React, { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "admin") {
    return <Navigate to="/admin-login" replace />;
  }

  const [allData, setAllData] = useState([]);
  const [groupedData, setGroupedData] = useState([]);

  const [departments, setDepartments] = useState([]);
  const [groups, setGroups] = useState([]);

  const [selectedDept, setSelectedDept] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const [topFaculty, setTopFaculty] = useState(null);
  const [worstFaculty, setWorstFaculty] = useState(null);

  const [pendingStudents, setPendingStudents] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/departments/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setDepartments(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDepartments([]));
  }, [token]);

  useEffect(() => {
    if (!selectedDept) {
      setGroups([]);
      setSelectedGroup("");
      return;
    }

    fetch(`http://127.0.0.1:8000/api/groups/?department=${selectedDept}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setGroups(Array.isArray(data) ? data : []))
      .catch(() => setGroups([]));
  }, [selectedDept, token]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/feedback/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAllData(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAllData([]));
  }, [token]);

  useEffect(() => {
    if (!selectedGroup || !selectedYear) {
      setPendingStudents([]);
      return;
    }

    const matchedGroup = groups.find(
      (g) => g.name === selectedGroup && String(g.year) === String(selectedYear)
    );

    if (!matchedGroup) {
      setPendingStudents([]);
      return;
    }

    fetch(
      `http://127.0.0.1:8000/api/pending-students/?group=${matchedGroup.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => res.json())
      .then((data) => setPendingStudents(Array.isArray(data) ? data : []))
      .catch(() => setPendingStudents([]));
  }, [selectedGroup, selectedYear, groups, token]);

  useEffect(() => {
    const grouped = {};

    allData.forEach((f) => {
      if (selectedDept && Number(f.department) !== Number(selectedDept)) return;
      if (selectedYear && Number(f.year) !== Number(selectedYear)) return;
      if (selectedGroup && f.group_name !== selectedGroup) return;

      if (!grouped[f.faculty_name]) {
        grouped[f.faculty_name] = {
          faculty: f.faculty_name,
          responses: 0,
          totalRating: 0,
          comments: [],
        };
      }

      const avg =
        (f.teaching +
          f.knowledge +
          f.communication +
          f.interaction +
          f.behaviour +
          f.punctuality +
          f.overall) / 7;

      grouped[f.faculty_name].responses += 1;
      grouped[f.faculty_name].totalRating += avg;

      if (f.comments) {
        grouped[f.faculty_name].comments.push(f.comments);
      }
    });

    const result = Object.values(grouped).map((f) => ({
      ...f,
      avgRating: Number((f.totalRating / f.responses).toFixed(1)),
    }));

    setGroupedData(result);

    if (result.length > 0) {
      const sorted = [...result].sort((a, b) => b.avgRating - a.avgRating);
      setTopFaculty(sorted[0]);
      setWorstFaculty(sorted[sorted.length - 1]);
    } else {
      setTopFaculty(null);
      setWorstFaculty(null);
    }
  }, [allData, selectedDept, selectedGroup, selectedYear]);

  const handleDownload = () => {
    if (!selectedGroup || !selectedYear) {
      alert("Select group and year first");
      return;
    }

    const matchedGroup = groups.find(
      (g) => g.name === selectedGroup && String(g.year) === String(selectedYear)
    );

    if (!matchedGroup) {
      alert("Valid group not found");
      return;
    }

    fetch(
      `http://127.0.0.1:8000/api/download-report/?group=${matchedGroup.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "report.xlsx";
        a.click();
      });
  };

  const uniqueGroups = [...new Map(groups.map((g) => [g.name, g])).values()];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-center mb-6">
          Admin Dashboard
        </h1>

        <div className="flex gap-4 mb-6 justify-center flex-wrap">
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setSelectedGroup("");
              setSelectedYear("");
            }}
            className="p-2 border rounded"
          >
            <option value="">Department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Group</option>
            {uniqueGroups.map((g) => (
              <option key={g.name} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Year</option>
            <option value="1">1st</option>
            <option value="2">2nd</option>
            <option value="3">3rd</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {topFaculty && (
            <div className="bg-green-100 p-5 rounded-xl shadow">
              <h2 className="font-bold text-green-700">Top Faculty</h2>
              <p className="text-xl">{topFaculty.faculty}</p>
              <p>⭐ {topFaculty.avgRating}</p>
            </div>
          )}

          {worstFaculty && (
            <div className="bg-red-100 p-5 rounded-xl shadow">
              <h2 className="font-bold text-red-700">Needs Improvement</h2>
              <p className="text-xl">{worstFaculty.faculty}</p>
              <p>⭐ {worstFaculty.avgRating}</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow max-w-3xl mx-auto mb-6">
          <h3 className="font-semibold mb-4 text-center">
            Faculty Performance
          </h3>

          {groupedData.length <= 1 ? (
            <p className="text-center text-gray-500">
              Not enough data to display chart
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={groupedData} barCategoryGap="40%">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="faculty" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar
                  dataKey="avgRating"
                  fill="#3b82f6"
                  barSize={30}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupedData.map((f, i) => (
            <div key={i} className="bg-white p-5 rounded-xl shadow">
              <h2 className="text-blue-600 font-semibold">{f.faculty}</h2>
              <p>Responses: {f.responses}</p>
              <p>⭐ {f.avgRating}</p>

              <div className="mt-2">
                {f.comments.map((c, idx) => (
                  <p key={idx} className="text-sm">
                    • {c}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-5 mt-6 rounded-xl shadow">
          <h3 className="font-semibold mb-2">Pending Students</h3>

          {pendingStudents.length > 0 ? (
            <ul>
              {pendingStudents.map((s) => (
                <li key={s.id}>{s.name}</li>
              ))}
            </ul>
          ) : (
            <p>No pending students</p>
          )}
        </div>

        <button
          onClick={handleDownload}
          className="bg-green-600 text-white px-4 py-2 mt-4 rounded"
        >
          Download Report
        </button>
      </div>
    </>
  );
};

export default AdminDashboard;