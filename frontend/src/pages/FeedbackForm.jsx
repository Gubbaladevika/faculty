import { useState } from "react";
import RatingStars from "../components/RatingStars";

const faculties = [
  { id: 1, name: "Dr. Ramesh" },
  { id: 2, name: "Prof. Anitha" },
  { id: 3, name: "Dr. Kumar" },
];

const FeedbackForm = () => {
  const [ratings, setRatings] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleRatingChange = (facultyId, value) => {
    setRatings({
      ...ratings,
      [facultyId]: value,
    });
  };

  const handleSubmit = () => {
    console.log(ratings);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Faculty Feedback Form
        </h2>

        {faculties.map((faculty) => (
          <div
            key={faculty.id}
            className="mb-6 p-4 border rounded-lg"
          >
            <h3 className="font-semibold mb-3">
              {faculty.name}
            </h3>

            <RatingStars
              value={ratings[faculty.id] || 0}
              onChange={(value) =>
                handleRatingChange(faculty.id, value)
              }
            />
          </div>
        ))}

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Submit Feedback
        </button>

        {submitted && (
          <p className="text-green-600 mt-4 text-center">
            Feedback Submitted Successfully!
          </p>
        )}
      </div>
    </div>
  );
};

export default FeedbackForm;