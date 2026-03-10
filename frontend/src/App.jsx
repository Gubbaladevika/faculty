import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FeedbackForm from "./pages/FeedbackForm";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
   
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/feedbackform" element={<ProtectedRoute><FeedbackForm /></ProtectedRoute>} />
        <Route path="/signup" element={<Signup />} />
        
      </Routes>
  
  );
}

export default App;