import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    localStorage.setItem("user", JSON.stringify(form));

    navigate("/");
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-lg shadow w-96">

        <h2 className="text-2xl font-bold text-center mb-6">
          Create Account
        </h2>

        {/* Google Signup */}
        <button
          onClick={handleGoogleSignup}
          className="flex items-center justify-center gap-2 w-full border py-2 rounded mb-4 hover:bg-gray-100"
        >
          <FcGoogle size={22} />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-gray-500 text-sm">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-3">
            {error}
          </p>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSignup}>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="w-full mb-3 p-2 border rounded"
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full mb-3 p-2 border rounded"
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full mb-4 p-2 border rounded"
            onChange={handleChange}
          />

          <button
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Create Account
          </button>

        </form>

        {/* Login Link */}
        <p
          className="text-center text-blue-600 mt-4 cursor-pointer"
          onClick={() => navigate("/")}
        >
          Already have an account? Login
        </p>

      </div>

    </div>
  );
};

export default Signup;