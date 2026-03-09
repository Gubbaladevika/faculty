import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FeedbackForm from "./pages/FeedbackForm";
import Signup from "./pages/Signup";

function App() {
  return (
   
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/feedbackform" element={<FeedbackForm />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
  
  );
}

export default App;