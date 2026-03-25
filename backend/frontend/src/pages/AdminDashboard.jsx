import { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {

  const [data, setData] = useState([]);

  // 1️⃣ Fetch data
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/feedback/")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  // 2️⃣ Group + calculate average
  const grouped = {};

  data.forEach(item => {
    if (!grouped[item.faculty_name]) {
      grouped[item.faculty_name] = {
        total: 0,
        count: 0,
        comments: []
      };
    }

    grouped[item.faculty_name].total += item.overall;
    grouped[item.faculty_name].count += 1;

    if (item.comments) {
      grouped[item.faculty_name].comments.push(item.comments);
    }
  });

  // ⭐ star function
  const getStars = (rating) => {
    return "⭐".repeat(Math.round(rating));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Faculty Feedback Dashboard</h2>

      {Object.keys(grouped).map((name) => {

        const avg = grouped[name].total / grouped[name].count;

        return (
          <div
            key={name}
            style={{
              border: "1px solid gray",
              padding: "15px",
              margin: "15px 0",
              borderRadius: "10px"
            }}
          >
            <h3>{name}</h3>

            <p>Average Rating: {avg.toFixed(1)}</p>
            <p>{getStars(avg)}</p>

            <p>Total Responses: {grouped[name].count}</p>

            <h4>Comments:</h4>
            {grouped[name].comments.length > 0 ? (
              grouped[name].comments.map((c, i) => (
                <p key={i}>• {c}</p>
              ))
            ) : (
              <p>No comments</p>
            )}
          </div>
        );

      })}

    </div>
  );
};

export default AdminDashboard;