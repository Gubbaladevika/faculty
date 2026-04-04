import React, { useEffect, useState } from "react";
import StarRating from "../components/StarRating";
import Navbar from "../components/Navbar";

const FeedbackForm = () => {
  const [departments, setDepartments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [submittedFaculty, setSubmittedFaculty] = useState([]);

  const [formData, setFormData] = useState({
    department: "",
    group: "",
    faculty: "",
    teaching: 0,
    knowledge: 0,
    communication: 0,
    interaction: 0,
    behaviour: 0,
    punctuality: 0,
    overall: 0,
    comments: "",
  });

  // 🔹 Load Departments
useEffect(() => {
  const token = localStorage.getItem("token");

  fetch("http://127.0.0.1:8000/api/departments/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      setDepartments(Array.isArray(data) ? data : []);
    })
    .catch((err) => {
      console.log("Department error:", err);
      setDepartments([]);
    });
}, []);

  // 🔹 Department Change
 const handleDepartmentChange = (e) => {
  const deptId = e.target.value;

  setFormData({ ...formData, department: deptId });

  const token = localStorage.getItem("token");

  fetch(`http://127.0.0.1:8000/api/groups/?department=${deptId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      setGroups(Array.isArray(data) ? data : []);
    })
    .catch((err) => {
      console.log("Group error:", err);
      setGroups([]);
    });
};
  //  Group change
  const handleGroupChange = (e) => {
  const groupId = e.target.value;

  setFormData({ ...formData, group: groupId });

  const token = localStorage.getItem("token");

  if (!token) return;

  // faculty API
  fetch(`http://127.0.0.1:8000/api/faculty/?group=${groupId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      setFaculty(Array.isArray(data) ? data : []);
    })
    .catch(() => setFaculty([]));

  // feedback status API
  fetch(`http://127.0.0.1:8000/api/feedback-status/?group=${groupId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      setSubmittedFaculty(Array.isArray(data) ? data : []);
    })
    .catch(() => setSubmittedFaculty([]));
};

  // 🔹 Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🔹 Submit Feedback
  const handleSubmit = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Login expired. Please login again.");
    return;
  }

  if (!formData.faculty) {
    alert("Select faculty first");
    return;
  }

  const payload = {
    faculty: Number(formData.faculty),
    teaching: formData.teaching,
    knowledge: formData.knowledge,
    communication: formData.communication,
    interaction: formData.interaction,
    behaviour: formData.behaviour,
    punctuality: formData.punctuality,
    overall: formData.overall,
    comments: formData.comments,
  };

  try {
    const res = await fetch("http://127.0.0.1:8000/api/submit-feedback/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    let data;

try {
  data = await res.json();
} catch {
  data = { error: "Server error" };
}

    if (res.status === 401) {
      alert("Session expired. Login again.");
      return;
    }

    if (!res.ok) {
      console.log(data);
      alert(data?.detail || "Submission failed");
      return;
    }

    alert("Feedback submitted");

    setSubmittedFaculty((prev) => [
      ...prev,
      Number(formData.faculty),
    ]);
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
};


  // 🔹 Rating Component
  const handleRatingChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const Rating = ({ label, name }) => (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <StarRating
        name={name}
        value={formData[name]}
        onChange={handleRatingChange}
      />
    </div>
  );

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg w-[500px]">

          <h2 className="text-xl font-bold text-center mb-4">
            Faculty Feedback
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Department */}
            <div>
              <label>Department</label>
              <select onChange={handleDepartmentChange} className="w-full p-2 border">
                <option>Select Department</option>
                {(Array.isArray(departments) ? departments : []).map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Group */}
            <div>
              <label>Group</label>
              <select onChange={handleGroupChange} className="w-full p-2 border">
                <option>Select Group</option>
                {(Array.isArray(groups) ? groups : []).map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} - Year {g.year}
                  </option>
                ))}
              </select>
            </div>

            {/* Faculty */}
            <div>
              <label>Faculty</label>
              <select name="faculty" onChange={handleChange} className="w-full p-2 border">
                <option>Select Faculty</option>
                {(Array.isArray(faculty) ? faculty : []).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} {submittedFaculty.includes(f.id) ? "✔" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Ratings */}
            <Rating label="Teaching" name="teaching" />
            <Rating label="Knowledge" name="knowledge" />
            <Rating label="Communication" name="communication" />
            <Rating label="Interaction" name="interaction" />
            <Rating label="Behaviour" name="behaviour" />
            <Rating label="Punctuality" name="punctuality" />
            <Rating label="Overall" name="overall" />

            {/* Comments */}
            <textarea
              name="comments"
              placeholder="Comments"
              onChange={handleChange}
              className="w-full p-2 border"
            />

            <button className="bg-blue-600 text-white p-2 w-full rounded">
              Submit Feedback
            </button>

          </form>
        </div>
      </div>
    </>
  );
};

export default FeedbackForm;