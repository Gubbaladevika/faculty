import React, { useState } from "react";
import { useParams } from "react-router-dom";

const FeedbackForm = () => {
  const { id } = useParams(); // faculty id from URL

  const [formData, setFormData] = useState({
    subject: "",
    rating: "",
    comments: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Feedback:", {
      facultyId: id,
      ...formData,
    });

    alert("Feedback Submitted Successfully!");
    
    // later we connect backend here
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-xl p-8">
        
        <h2 className="text-2xl font-bold text-center mb-6">
          Give Feedback (Faculty ID: {id})
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Subject */}
          <div>
            <label className="block mb-2 font-medium">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter subject name"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block mb-2 font-medium">Rating</label>
            <select
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Rating</option>
              <option value="1">1 - Poor</option>
              <option value="2">2 - Average</option>
              <option value="3">3 - Good</option>
              <option value="4">4 - Very Good</option>
              <option value="5">5 - Excellent</option>
            </select>
          </div>

          {/* Comments */}
          <div>
            <label className="block mb-2 font-medium">Comments</label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              required
              rows="4"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Write your feedback..."
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Submit Feedback
          </button>

        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;