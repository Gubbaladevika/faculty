import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {FaEye, FaEyeSlash} from "react-icons/fa";
const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
const handleLogin = async () => {
  setError("");
  setLoading(true);

  try {
    const res = await fetch("http://127.0.0.1:8000/api/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: email,
        password: password,
      }),
    });

    const data = await res.json();
     console.log("LOGIN RESPONSE:", data);
    if (res.ok && data.access) {
      localStorage.setItem("token", data.access);

      // ✅ ADD THIS LINE (IMPORTANT)
      localStorage.setItem("role", "data.role"); // Assuming backend sends role in response 

      localStorage.setItem("username", email);

      // ✅ REDIRECT BASED ON ROLE
      if (data.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }

    } else {
      setError("Invalid email or password");
    }
  } catch (err) {
    setError("Server error. Try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-green-500 to-emerald-600 text-white items-center justify-center">
        <div className="text-center px-10">
          <h1 className="text-4xl font-bold mb-4">Student Portal</h1>
          <p className="text-lg">
            Submit feedback and improve faculty performance.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Student Login
          </h2>

          {/* ERROR MESSAGE */}
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Enter Email"
            className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* PASSWORD WITH SHOW/HIDE */}
          <div className="relative mb-4">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Enter Password"
    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 pr-10"
    onChange={(e) => setPassword(e.target.value)}
  />

  <span
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-3 cursor-pointer text-gray-600"
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </span>
</div>

          {/* LOGIN BUTTON */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* SIGNUP */}
          <p
            className="text-sm text-green-600 mt-4 text-center cursor-pointer hover:underline"
            onClick={() => navigate("/signup")}
          >
            Don't have an account? Signup
          </p>

        </div>
      </div>

    </div>
  );
};

export default Login;