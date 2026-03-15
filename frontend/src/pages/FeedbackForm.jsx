import { useState, useEffect } from "react";
import RatingStars from "../components/RatingStars";
import Navbar from "../components/Navbar";

const faculties = [
  { id: 1, name: "Dr. Ramesh", subject: "Database Systems" },
  { id: 2, name: "Prof. Anitha", subject: "Web Development" },
  { id: 3, name: "Dr. Kumar", subject: "Machine Learning" },
];

const questions = [
  { key: "teaching", label: "Teaching Quality" },
  { key: "knowledge", label: "Subject Knowledge" },
  { key: "communication", label: "Communication Clarity" },
  { key: "interaction", label: "Interaction with Students" },
  { key: "behaviour", label: "Behaviour & Attitude" },
  { key: "punctuality", label: "Punctuality / Regularity" },
  { key: "overall", label: "Overall Satisfaction" },
];

const FeedbackForm = () => {

  const usermail = localStorage.getItem("userEmail");

  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [faculty, setFaculty] = useState("");

  // Check if feedback already submitted for selected faculty
  useEffect(() => {

    if (!faculty) return;

    const key = `feedback_${usermail}_${faculty}`;
    const status = localStorage.getItem(key);

    if (status === "true") {
      setSubmitted(true);
    } else {
      setSubmitted(false);
    }

  }, [faculty, usermail]);

  const handleRatingChange = (facultyId, questionKey, value) => {

    setRatings({
      ...ratings,
      [facultyId]: {
        ...ratings[facultyId],
        [questionKey]: value,
      },
    });

  };

  const handleCommentChange = (facultyId, text) => {

    setComments({
      ...comments,
      [facultyId]: text,
    });

  };

  const handleSubmit = () => {

    if (!faculty) {
      alert("Please select a faculty");
      return;
    }

    const key = `feedback_${usermail}_${faculty}`;

    localStorage.setItem(key, "true");

    setSubmitted(true);

    console.log({
      faculty,
      ratings,
      comments,
    });

  };

  return (
    <>
    <Navbar />

    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Faculty Feedback Form
        </h2>

        {/* Faculty Dropdown */}

        
        <select
  className="w-full border p-2 rounded mb-4"
  value={faculty}
  onChange={(e) => setFaculty(e.target.value)}
>

  <option value="">Select Faculty</option>

  {faculties.map((f) => {

    const key = `feedback_${usermail}_${f.name}`;
    const isSubmitted = localStorage.getItem(key) === "true";

    return (
      <option key={f.id} value={f.name}>
        {f.name} - {f.subject} {isSubmitted ? "✓ Submitted" : ""}
      </option>
    );

  })}

</select>

        {submitted && (
          <p className="text-green-600 text-center mb-4">
            You have submitted feedback for this faculty
          </p>
        )}

        {faculty &&
          faculties
            .filter((f) => f.name === faculty)
            .map((faculty) => (

              <div key={faculty.id} className="mb-8 border p-4 rounded-lg">

                <h3 className="text-lg font-semibold mb-1">
                  {faculty.name}
                </h3>

                <p className="text-gray-500 mb-4">
                  Subject: {faculty.subject}
                </p>

                {questions.map((q) => (

                  <div key={q.key} className="mb-4">

                    <p className="mb-1">{q.label}</p>

                    <RatingStars
                      value={ratings[faculty.id]?.[q.key] || 0}
                      onChange={(value) =>
                        handleRatingChange(faculty.id, q.key, value)
                      }
                    />

                  </div>

                ))}

                <textarea
                  placeholder="Any suggestions or comments..."
                  className="w-full mt-3 p-2 border rounded"
                  value={comments[faculty.id] || ""}
                  onChange={(e) =>
                    handleCommentChange(faculty.id, e.target.value)
                  }
                  disabled={submitted}
                />

              </div>

            ))}

        <button
          onClick={handleSubmit}
          disabled={submitted}
          className={`w-full py-2 rounded text-white ${
            submitted
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >

          {submitted ? "Feedback Submitted" : "Submit Feedback"}

        </button>

      </div>

    </div>
    </>
  );
};

export default FeedbackForm;