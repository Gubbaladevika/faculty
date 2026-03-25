import { useState } from "react";

const RatingStars = ({ value, onChange }) => {
  const [hover, setHover] = useState(null);

  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-2xl cursor-pointer transition ${
            star <= (hover || value)
              ? "text-yellow-500"
              : "text-gray-300"
          }`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(null)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default RatingStars;