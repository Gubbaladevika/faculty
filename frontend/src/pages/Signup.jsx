import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
  e.preventDefault();
  setError("");

  if (!form.name || !form.email || !form.password) {
    setError("All fields are required");
    return;
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/signup/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        username: form.email,
        password: form.password,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Signup successful");
      navigate("/");
    } else {
      setError(data.error || "Signup failed");
    }
  } catch (err) {
    setError("Server error");
  }
};
  const handleGoogleSignup = () => {
    const googleUser = {
      name: "Google User",
      email: "googleuser@gmail.com",
    };

    localStorage.setItem("user", JSON.stringify(googleUser));
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-green-500 to-emerald-600 text-white items-center justify-center">
        <div className="text-center px-10">
          <h1 className="text-4xl font-bold mb-4">Join Us</h1>
          <p className="text-lg">
            Create your account and start sharing feedback.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Student Signup
          </h2>

          {/* GOOGLE */}
          {/* <button
            onClick={handleGoogleSignup}
            className="flex items-center justify-center gap-2 w-full border py-3 rounded-lg mb-4 hover:bg-gray-100 transition"
          >
            <FcGoogle size={22} />
            Continue with Google
          </button> */} 

          {/* DIVIDER */}
          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-2 text-gray-500 text-sm">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* ERROR */}
          {error && (
            <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
          )}

          {/* FORM */}
          <form onSubmit={handleSignup}>

            {/* NAME */}
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              onChange={handleChange}
            />

            {/* EMAIL */}
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              onChange={handleChange}
            />

            {/* PASSWORD WITH EYE */}
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 pr-10"
                onChange={handleChange}
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 cursor-pointer text-gray-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {/* BUTTON */}
            <button
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Create Account
            </button>

          </form>

          {/* LOGIN LINK */}
          <p
            className="text-center text-green-600 mt-4 cursor-pointer hover:underline"
            onClick={() => navigate("/")}
          >
            Already have an account? Login
          </p>

        </div>
      </div>

    </div>
  );
};

export default Signup;