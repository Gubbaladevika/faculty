import { useNavigate } from "react-router-dom";

const FacultyList = () => {
  const navigate = useNavigate();

  // Temporary dummy data
  const faculty = [
    { id: 1, name: "Dr. Rao", subject: "DBMS" },
    { id: 2, name: "Ms. Priya", subject: "Java" },
    { id: 3, name: "Mr. Kumar", subject: "Python" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">Faculty List</h1>

      <div className="space-y-4">
        {faculty.map((item) => (
          <div
            key={item.id}
            className="bg-white p-5 rounded-lg shadow flex justify-between items-center"
          >
            <div>
              <h2 className="text-lg font-semibold">{item.name}</h2>
              <p className="text-gray-600">{item.subject}</p>
            </div>

            <button
              onClick={() => navigate("/feedbackform")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Give Feedback
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FacultyList;