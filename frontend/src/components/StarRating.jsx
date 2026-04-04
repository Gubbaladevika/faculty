import React from "react";

const StarRating = ({ name, value = 0, onChange }) => {
  return (
    <div>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => onChange(name, star)}
          style={{
            fontSize: "30px",
            cursor: "pointer",
            color: star <= value ? "gold" : "gray",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;