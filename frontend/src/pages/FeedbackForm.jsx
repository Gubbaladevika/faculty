import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";

const StarRating = ({ value, onChange }) => {
  return (
    <div className="flex gap-1 text-2xl">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`transition ${
            star <= value ? "text-yellow-400" : "text-gray-300"
          } hover:scale-110`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

const FeedbackForm = () => {
  const token = localStorage.getItem("token");
  const { facultyId } = useParams();

  console.log("facultyId from URL:", facultyId);

  const [groupInfo, setGroupInfo] = useState(null);
  const [faculty, setFaculty] = useState([]);
  const [submittedFaculty, setSubmittedFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    teaching: 0,
    knowledge: 0,
    communication: 0,
    interaction: 0,
    behaviour: 0,
    punctuality: 0,
    overall: 0,
    comments: "",
  });

  const selectedFaculty = faculty.find(
    (f) => String(f.id) === String(facultyId)
  );

  console.log("Faculty List:", faculty);
  console.log("Selected Faculty:", selectedFaculty);

  useEffect(() => {
    if (!token) {
      setError("Login expired. Please login again.");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        // Student Group
        const groupRes = await fetch("http://127.0.0.1:8000/api/my-group/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const groupData = await groupRes.json();

        if (!groupRes.ok) {
          setError(groupData.error || "Unable to load group");
          setLoading(false);
          return;
        }

        setGroupInfo(groupData);

        // Faculty List
        const facultyRes = await fetch(
          `http://127.0.0.1:8000/api/faculty/?group=${groupData.group}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const facultyData = await facultyRes.json();

        if (Array.isArray(facultyData)) {
          setFaculty(facultyData);
        } else {
          setFaculty([]);
        }

        // Submitted Faculty Status
        const statusRes = await fetch(
          `http://127.0.0.1:8000/api/feedback-status/?group=${groupData.group}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const statusData = await statusRes.json();

        if (Array.isArray(statusData)) {
          setSubmittedFaculty(statusData);
        } else {
          setSubmittedFaculty([]);
        }
      } catch (err) {
        console.log(err);
        setError("Server error while loading form");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, facultyId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRatingChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!selectedFaculty) {
      setError("Faculty not found");
      return;
    }

    if (submittedFaculty.includes(Number(facultyId))) {
      setError("You already submitted feedback for this faculty");
      return;
    }

    const payload = {
      faculty: Number(facultyId),
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

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.detail || "Submission failed");
        return;
      }

      setMessage("Feedback submitted successfully");

      setSubmittedFaculty((prev) => [...prev, Number(facultyId)]);

      setFormData({
        teaching: 0,
        knowledge: 0,
        communication: 0,
        interaction: 0,
        behaviour: 0,
        punctuality: 0,
        overall: 0,
        comments: "",
      });

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.log(err);
      setError("Server error");
    }
  };

  const RatingField = ({ label, field }) => (
    <div className="bg-gray-50 border rounded-xl p-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <StarRating
        value={formData[field]}
        onChange={(value) => handleRatingChange(field, value)}
      />
    </div>
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-2xl shadow-lg text-lg font-semibold">
            Loading feedback form...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 py-10 px-4">
        <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
          
          <div className="bg-blue-600 text-white px-8 py-6">
            <h1 className="text-3xl font-bold">Faculty Feedback Form</h1>
            <p className="text-blue-100 mt-2">
              Submit feedback for your assigned faculty only
            </p>
          </div>

          <div className="p-8">

            {message && (
              <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {groupInfo && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-semibold">{groupInfo.department}</p>
                </div>

                <div className="bg-gray-50 border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Group</p>
                  <p className="font-semibold">{groupInfo.group_name}</p>
                </div>

                <div className="bg-gray-50 border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Year</p>
                  <p className="font-semibold">{groupInfo.year}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Faculty
                </label>

                <div className="w-full border border-gray-300 rounded-xl p-3 bg-gray-100 font-medium text-gray-800">
                  {selectedFaculty
                    ? selectedFaculty.name
                    : "Faculty not found"}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RatingField label="Teaching" field="teaching" />
                <RatingField label="Knowledge" field="knowledge" />
                <RatingField label="Communication" field="communication" />
                <RatingField label="Interaction" field="interaction" />
                <RatingField label="Behaviour" field="behaviour" />
                <RatingField label="Punctuality" field="punctuality" />
              </div>

              <RatingField label="Overall" field="overall" />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Comments
                </label>

                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Write your feedback here..."
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <button
                type="submit"
                disabled={submittedFaculty.includes(Number(facultyId))}
                className={`w-full py-3 rounded-xl font-semibold text-white transition ${
                  submittedFaculty.includes(Number(facultyId))
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {submittedFaculty.includes(Number(facultyId))
                  ? "Already Submitted"
                  : "Submit Feedback"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeedbackForm;