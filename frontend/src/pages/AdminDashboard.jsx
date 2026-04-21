import React, { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [activeSection, setActiveSection] = useState("dashboard");
  const [facultyData, setFacultyData] = useState([]);
  const [topFaculty, setTopFaculty] = useState([]);
  const [worstFaculty, setWorstFaculty] = useState([]);
  const [error, setError] = useState("");

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [pendingStudents, setPendingStudents] = useState([]);
  const [pendingDepartment, setPendingDepartment] = useState("");
  const [pendingYear, setPendingYear] = useState("");
  const [pendingGroup, setPendingGroup] = useState("");

  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [showResponsesModal, setShowResponsesModal] = useState(false);

  const [sendingEmailFor, setSendingEmailFor] = useState(null);

  const [totalStudents, setTotalStudents] = useState(0);
  const [completedStudents, setCompletedStudents] = useState(0);

  if (!token || role !== "admin") {
    return <Navigate to="/admin-login" replace />;
  }

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/feedback/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          console.log("FEEDBACK ERROR:", data);
          setError(data.detail || data.error || "Unable to load results");
          setFacultyData([]);
          return;
        }

        if (!Array.isArray(data)) {
          setFacultyData([]);
          return;
        }

        const grouped = {};

        data.forEach((f) => {
          const avg =
            (
              Number(f.teaching || 0) +
              Number(f.knowledge || 0) +
              Number(f.communication || 0) +
              Number(f.interaction || 0) +
              Number(f.behaviour || 0) +
              Number(f.punctuality || 0) +
              Number(f.overall || 0)
            ) / 7;

          const facultyKey = f.faculty_name;

          if (!grouped[facultyKey]) {
            grouped[facultyKey] = {
              id: f.faculty || f.id,
              name: f.faculty_name,
              responses: 1,
              average: avg,
              comments: f.comments ? [f.comments] : [],
              years: f.year ? [String(f.year)] : [],
              groups: f.group_name ? [f.group_name] : [],
              departments: f.department_name ? [f.department_name] : [],
              teachingTotal: Number(f.teaching || 0),
              knowledgeTotal: Number(f.knowledge || 0),
              communicationTotal: Number(f.communication || 0),
              interactionTotal: Number(f.interaction || 0),
              behaviourTotal: Number(f.behaviour || 0),
              punctualityTotal: Number(f.punctuality || 0),
              overallTotal: Number(f.overall || 0),
              emailSent: false,
            };
          } else {
            grouped[facultyKey].responses += 1;
            grouped[facultyKey].average += avg;

            if (f.comments) grouped[facultyKey].comments.push(f.comments);
            if (f.year) grouped[facultyKey].years.push(String(f.year));
            if (f.group_name) grouped[facultyKey].groups.push(f.group_name);
            if (f.department_name) {
              grouped[facultyKey].departments.push(f.department_name);
            }

            grouped[facultyKey].teachingTotal += Number(f.teaching || 0);
            grouped[facultyKey].knowledgeTotal += Number(f.knowledge || 0);
            grouped[facultyKey].communicationTotal += Number(
              f.communication || 0
            );
            grouped[facultyKey].interactionTotal += Number(f.interaction || 0);
            grouped[facultyKey].behaviourTotal += Number(f.behaviour || 0);
            grouped[facultyKey].punctualityTotal += Number(f.punctuality || 0);
            grouped[facultyKey].overallTotal += Number(f.overall || 0);
          }
        });

        const results = Object.values(grouped).map((item) => ({
          ...item,
          average: Number((item.average / item.responses).toFixed(1)),
          teachingAvg: Number((item.teachingTotal / item.responses).toFixed(1)),
          knowledgeAvg: Number(
            (item.knowledgeTotal / item.responses).toFixed(1)
          ),
          communicationAvg: Number(
            (item.communicationTotal / item.responses).toFixed(1)
          ),
          interactionAvg: Number(
            (item.interactionTotal / item.responses).toFixed(1)
          ),
          behaviourAvg: Number(
            (item.behaviourTotal / item.responses).toFixed(1)
          ),
          punctualityAvg: Number(
            (item.punctualityTotal / item.responses).toFixed(1)
          ),
          overallAvg: Number((item.overallTotal / item.responses).toFixed(1)),
          years: [...new Set(item.years)],
          groups: [...new Set(item.groups)],
          departments: [...new Set(item.departments)],
        }));

        setFacultyData(results);

        const sorted = [...results].sort((a, b) => b.average - a.average);
        setTopFaculty(sorted.slice(0, 3));
        setWorstFaculty(sorted.slice(-3).reverse());
      })
      .catch((err) => {
        console.log("FEEDBACK FETCH ERROR:", err);
        setError("Unable to load results");
      });
  }, [token]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/pending-students/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          console.log("PENDING STUDENTS ERROR:", data);
          setPendingStudents([]);
          return;
        }

        if (Array.isArray(data)) {
          setPendingStudents(data);
        } else {
          setPendingStudents([]);
        }
      })
      .catch((err) => {
        console.log("PENDING STUDENTS FETCH ERROR:", err);
        setPendingStudents([]);
      });
  }, [token]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/student-counts/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          console.log("STUDENT COUNTS ERROR:", data);
          setTotalStudents(0);
          setCompletedStudents(0);
          return;
        }

        setTotalStudents(data.total_students || 0);
        setCompletedStudents(data.completed_students || 0);
      })
      .catch((err) => {
        console.log("STUDENT COUNTS FETCH ERROR:", err);
        setTotalStudents(0);
        setCompletedStudents(0);
      });
  }, [token]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin-login", { replace: true });
  };

  const extractDepartment = (groupText) => {
    if (!groupText) return "";
    const match = groupText.match(/\((.*?)\)/);
    return match ? match[1] : "";
  };

  const extractYear = (groupText) => {
    if (!groupText) return "";
    if (groupText.includes("1st Year")) return "1";
    if (groupText.includes("2nd Year")) return "2";
    if (groupText.includes("3rd Year")) return "3";
    return "";
  };

  const extractGroup = (groupText) => {
    if (!groupText) return "";
    return groupText.split(" - ")[0]?.trim() || "";
  };

  const filteredFaculty = facultyData.filter((faculty) => {
    const searchMatch = faculty.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const departmentMatch = selectedDepartment
      ? faculty.departments?.includes(selectedDepartment)
      : true;

    const yearMatch = selectedYear
      ? faculty.years?.includes(String(selectedYear))
      : true;

    const groupMatch = selectedGroup
      ? faculty.groups?.includes(selectedGroup)
      : true;

    return searchMatch && departmentMatch && yearMatch && groupMatch;
  });

  const filteredPendingStudents = pendingStudents.filter((student) => {
  const studentDepartment =
    student.department_name || extractDepartment(student.group_name);

  const studentYear = student.year
    ? String(student.year)
    : extractYear(student.group_name);

  const studentGroup = extractGroup(student.group_name);

  return (
    (pendingDepartment === "" || studentDepartment === pendingDepartment) &&
    (pendingYear === "" || studentYear === pendingYear) &&
    (pendingGroup === "" || studentGroup === pendingGroup)
  );
});

  const allGroups = [...new Set(facultyData.flatMap((f) => f.groups || []))];
  const allDepartments = [
    ...new Set(facultyData.flatMap((f) => f.departments || [])),
  ];

  const pendingGroups = [
  ...new Set(
    pendingStudents
      .map((student) => extractGroup(student.group_name))
      .filter(Boolean)
  ),
];

  const pendingDepartments = [
  ...new Set(
    pendingStudents
      .map(
        (student) =>
          student.department_name || extractDepartment(student.group_name)
      )
      .filter(Boolean)
  ),
];

  const totalResponses = facultyData.reduce(
    (sum, faculty) => sum + faculty.responses,
    0
  );

  const totalPendingStudents = pendingStudents.length;

  const overallAverage =
    facultyData.length > 0
      ? (
          facultyData.reduce((sum, faculty) => sum + faculty.average, 0) /
          facultyData.length
        ).toFixed(1)
      : 0;

  const getFacultyStatus = (rating) => {
    if (rating >= 4) {
      return {
        label: "Good",
        textColor: "text-green-600",
        bgColor: "bg-green-100",
      };
    } else if (rating >= 3) {
      return {
        label: "Average",
        textColor: "text-yellow-600",
        bgColor: "bg-yellow-100",
      };
    } else {
      return {
        label: "Needs Improvement",
        textColor: "text-red-600",
        bgColor: "bg-red-100",
      };
    }
  };

  const sendImprovementEmail = async (faculty) => {
    if (sendingEmailFor === faculty.name || faculty.emailSent) return;

    const weakAreas = [];

    if (faculty.teachingAvg < 4)
      weakAreas.push(`Teaching: ${faculty.teachingAvg}`);
    if (faculty.knowledgeAvg < 4)
      weakAreas.push(`Knowledge: ${faculty.knowledgeAvg}`);
    if (faculty.communicationAvg < 4)
      weakAreas.push(`Communication: ${faculty.communicationAvg}`);
    if (faculty.interactionAvg < 4)
      weakAreas.push(`Interaction: ${faculty.interactionAvg}`);
    if (faculty.behaviourAvg < 4)
      weakAreas.push(`Behaviour: ${faculty.behaviourAvg}`);
    if (faculty.punctualityAvg < 4)
      weakAreas.push(`Punctuality: ${faculty.punctualityAvg}`);

    try {
      setSendingEmailFor(faculty.name);

      const response = await fetch(
        "http://127.0.0.1:8000/api/send-improvement-email/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            faculty_name: faculty.name,
            average: faculty.average,
            weak_areas: weakAreas,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Improvement email sent successfully");

        setFacultyData((prev) =>
          prev.map((item) =>
            item.name === faculty.name ? { ...item, emailSent: true } : item
          )
        );

        setWorstFaculty((prev) =>
          prev.map((item) =>
            item.name === faculty.name ? { ...item, emailSent: true } : item
          )
        );

        setTopFaculty((prev) =>
          prev.map((item) =>
            item.name === faculty.name ? { ...item, emailSent: true } : item
          )
        );
      } else {
        alert(data.error || "Failed to send email");
      }
    } catch (error) {
      console.log(error);
      alert("Error sending email");
    } finally {
      setSendingEmailFor(null);
    }
  };

  const downloadPDFReport = () => {
    if (!filteredFaculty || filteredFaculty.length === 0) {
      alert("No data available for selected filters");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Faculty Feedback Report", 14, 20);

    doc.setFontSize(11);
    doc.text(
      `Year: ${selectedYear || "All"} | Group: ${
        selectedGroup || "All"
      } | Department: ${selectedDepartment || "All"}`,
      14,
      30
    );

    const tableColumn = ["Faculty Name", "Responses", "Average Rating"];
    const tableRows = filteredFaculty.map((faculty) => [
      faculty.name,
      faculty.responses,
      faculty.average,
    ]);

    autoTable(doc, {
      startY: 40,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
    });

    if (filteredPendingStudents.length > 0) {
      const finalY = doc.lastAutoTable.finalY || 50;

      doc.setFontSize(14);
      doc.text("Pending Students", 14, finalY + 15);

      const pendingColumns = ["Student Name", "Department", "Year", "Group"];
      const pendingRows = filteredPendingStudents.map((student) => [
        student.name,
        student.department_name || extractDepartment(student.group_name),
        student.year || extractYear(student.group_name),
        extractGroup(student.group_name),
      ]);

      autoTable(doc, {
        startY: finalY + 22,
        head: [pendingColumns],
        body: pendingRows,
        theme: "grid",
      });
    }

    doc.save("faculty-feedback-report.pdf");
  };

  const menuItems = [
    { name: "Dashboard", value: "dashboard" },
    { name: "View Results", value: "results" },
    { name: "Bar Report", value: "chart" },
    { name: "Top / Need Improvement", value: "topworst" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 min-w-[256px] bg-slate-900 text-white p-6 flex flex-col fixed left-0 top-0 h-screen z-50">
        <h2 className="text-3xl font-bold mb-10">Admin Panel</h2>

        <div className="space-y-3 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.value}
              onClick={() => setActiveSection(item.value)}
              className={`w-full text-left px-4 py-3 rounded-xl transition ${
                activeSection === item.value
                  ? "bg-blue-600"
                  : "hover:bg-slate-800"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="mt-8 bg-red-500 hover:bg-red-600 px-4 py-3 rounded-xl font-medium"
        >
          Logout
        </button>
      </div>

      <div className="flex-1 min-w-0 p-8 overflow-y-auto ml-[256px] h-screen">
        {error && (
          <div className="mb-6 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {activeSection === "dashboard" && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Dashboard Overview
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Total Students</p>
                <h2 className="text-3xl font-bold text-purple-600">
                  {totalStudents}
                </h2>
              </div>

              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Completed Students</p>
                <h2 className="text-3xl font-bold text-green-600">
                  {completedStudents}
                </h2>
              </div>

              <div
                onClick={() => setActiveSection("pending")}
                className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 cursor-pointer hover:shadow-lg transition"
              >
                <p className="text-sm text-gray-500 mb-2">Pending Students</p>
                <h2 className="text-3xl font-bold text-red-600">
                  {totalPendingStudents}
                </h2>
                <p className="text-xs text-gray-400 mt-2">
                  Click to view pending student list
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Total Faculty</p>
                <h2 className="text-3xl font-bold text-blue-600">
                  {facultyData.length}
                </h2>
              </div>

              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Average Rating</p>
                <h2 className="text-3xl font-bold text-yellow-500">
                  {overallAverage}
                </h2>
              </div>
            </div>
          </div>
        )}

        {activeSection === "results" && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Faculty Results
            </h1>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Search faculty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-96 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3"
              >
                <option value="">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
              </select>

              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3"
              >
                <option value="">All Groups</option>
                {allGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>

              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3"
              >
                <option value="">All Departments</option>
                {allDepartments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredFaculty.map((faculty) => {
                const status = getFacultyStatus(faculty.average);

                return (
                  <div
                    key={faculty.name}
                    className="bg-white rounded-2xl shadow p-6 border"
                  >
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                      {faculty.name}
                    </h2>

                    <p className="text-gray-600 mb-2">
                      Average Rating:{" "}
                      <span className="font-semibold">{faculty.average}</span>
                    </p>

                    <div
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${status.bgColor} ${status.textColor}`}
                    >
                      {status.label}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-gray-700">
                      <p>
                        Teaching:{" "}
                        <span className="font-semibold">
                          {faculty.teachingAvg}
                        </span>
                      </p>
                      <p>
                        Knowledge:{" "}
                        <span className="font-semibold">
                          {faculty.knowledgeAvg}
                        </span>
                      </p>
                      <p>
                        Communication:{" "}
                        <span className="font-semibold">
                          {faculty.communicationAvg}
                        </span>
                      </p>
                      <p>
                        Interaction:{" "}
                        <span className="font-semibold">
                          {faculty.interactionAvg}
                        </span>
                      </p>
                      <p>
                        Behaviour:{" "}
                        <span className="font-semibold">
                          {faculty.behaviourAvg}
                        </span>
                      </p>
                      <p>
                        Punctuality:{" "}
                        <span className="font-semibold">
                          {faculty.punctualityAvg}
                        </span>
                      </p>
                      <p>
                        Overall:{" "}
                        <span className="font-semibold">
                          {faculty.overallAvg}
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedFaculty(faculty);
                        setShowResponsesModal(true);
                      }}
                      className="text-blue-600 font-semibold hover:underline mt-4 mb-4"
                    >
                      Responses: {faculty.responses}
                    </button>

                    <div className="mt-4">
                      <h3 className="font-semibold text-gray-700 mb-2">
                        Comments
                      </h3>

                      <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                        {faculty.comments && faculty.comments.length > 0 ? (
                          faculty.comments.map((comment, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 border rounded-lg p-2 text-sm text-gray-700"
                            >
                              {comment}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400 text-sm">
                            No comments available
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredFaculty.length === 0 && (
              <div className="bg-white rounded-2xl shadow border p-8 text-center text-gray-500 mt-6">
                No faculty found
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={downloadPDFReport}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl font-medium"
              >
                Download PDF Report
              </button>
            </div>
          </div>
        )}

        {activeSection === "chart" && (
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Faculty Performance Chart
            </h1>

            <div className="bg-white rounded-2xl shadow p-6 border overflow-x-auto">
              <div
                className="min-w-[1200px]"
                style={{
                  width: `${Math.max(facultyData.length * 90, 1200)}px`,
                  height: "450px",
                }}
              >
                <BarChart
                  width={Math.max(facultyData.length * 90, 1200)}
                  height={450}
                  data={facultyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar
                    dataKey="average"
                    fill="#2563eb"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </div>
            </div>
          </div>
        )}

        {activeSection === "topworst" && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Top / Need Improvement Faculty
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow p-6 border">
                <h2 className="text-xl font-bold text-green-600 mb-4">
                  Top Faculty
                </h2>

                <div className="space-y-4">
                  {topFaculty.map((faculty) => (
                    <div
                      key={faculty.name}
                      className="bg-green-50 border border-green-100 rounded-xl p-4"
                    >
                      <h3 className="font-semibold text-gray-800">
                        {faculty.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Rating: {faculty.average}
                      </p>
                      <p className="text-sm text-gray-500">
                        Responses: {faculty.responses}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow p-6 border">
                <h2 className="text-xl font-bold text-red-500 mb-4">
                  Need Improvement
                </h2>

                <div className="space-y-4">
                  {worstFaculty.map((faculty) => (
                    <div
                      key={faculty.name}
                      className="bg-red-50 border border-red-100 rounded-xl p-4"
                    >
                      <h3 className="font-semibold text-gray-800">
                        {faculty.name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        Rating: {faculty.average}
                      </p>
                      <p className="text-sm text-gray-500">
                        Responses: {faculty.responses}
                      </p>

                      <div className="mt-3 text-sm text-gray-700 space-y-1">
                        {faculty.teachingAvg < 4 && (
                          <p>Teaching needs improvement</p>
                        )}
                        {faculty.knowledgeAvg < 4 && (
                          <p>Knowledge needs improvement</p>
                        )}
                        {faculty.communicationAvg < 4 && (
                          <p>Communication needs improvement</p>
                        )}
                        {faculty.interactionAvg < 4 && (
                          <p>Interaction needs improvement</p>
                        )}
                        {faculty.behaviourAvg < 4 && (
                          <p>Behaviour needs improvement</p>
                        )}
                        {faculty.punctualityAvg < 4 && (
                          <p>Punctuality needs improvement</p>
                        )}
                      </div>

                      {faculty.emailSent ? (
                        <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm mt-4">
                          Email Sent
                        </span>
                      ) : (
                        <button
                          onClick={() => sendImprovementEmail(faculty)}
                          disabled={sendingEmailFor === faculty.name}
                          className={`mt-4 px-4 py-2 rounded-lg text-sm text-white ${
                            sendingEmailFor === faculty.name
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-red-500 hover:bg-red-600"
                          }`}
                        >
                          {sendingEmailFor === faculty.name
                            ? "Sending..."
                            : "Send Improvement Email"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "pending" && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Pending Students
            </h1>

            <div className="flex flex-wrap gap-4 mb-6">
              <select
                value={pendingDepartment}
                onChange={(e) => setPendingDepartment(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3"
              >
                <option value="">All Departments</option>
                {pendingDepartments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>

              <select
                value={pendingYear}
                onChange={(e) => setPendingYear(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3"
              >
                <option value="">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
              </select>

              <select
                value={pendingGroup}
                onChange={(e) => setPendingGroup(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3"
              >
                <option value="">All Groups</option>
                {pendingGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            {filteredPendingStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPendingStudents.map((student) => (
                  <div
                    key={student.id}
                    className="bg-white rounded-2xl shadow p-6 border"
                  >
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                      {student.name}
                    </h2>

                    <p className="text-gray-600">
                      Department:{" "}
                      {student.department_name ||
                        extractDepartment(student.group_name)}
                    </p>

                    <p className="text-gray-600">
                      Year: {student.year || extractYear(student.group_name)}
                    </p>

                    <p className="text-gray-600">
                      Group: {extractGroup(student.group_name)}
                    </p>

                    {student.submitted_count !== undefined &&
                      student.total_faculty_count !== undefined && (
                        <p className="text-sm text-gray-500 mt-2">
                          Progress: {student.submitted_count}/
                          {student.total_faculty_count}
                        </p>
                      )}

                    <p className="text-red-500 font-medium mt-3">
                      Pending Feedback
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow border p-8 text-center text-gray-500">
                No pending students found
              </div>
            )}
          </div>
        )}

        {showResponsesModal && selectedFaculty && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
              <button
                onClick={() => setShowResponsesModal(false)}
                className="absolute top-3 right-4 text-gray-500 hover:text-black text-xl"
              >
                ×
              </button>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {selectedFaculty.name} - Responses
              </h2>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Total anonymous responses received
                </p>
                <h3 className="text-3xl font-bold text-blue-600">
                  {selectedFaculty.responses}
                </h3>
              </div>

              <p className="text-sm text-gray-500 mt-4 text-center">
                Student identity is hidden to maintain privacy.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;