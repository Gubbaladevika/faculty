import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FeedbackForm from "./pages/FeedbackForm";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/admin-login" />;
  }

  return children;
};


function App() {
  return (
   
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/feedbackform" element={<ProtectedRoute><FeedbackForm /></ProtectedRoute>} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin-login" element={<AdminLogin />} />  
        <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
      </Routes>
  
  );
}

export default App;