import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FacultyList from "./pages/FacultyList";
import FeedbackForm from "./pages/FeedbackForm";

function App() {
  return (
   
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/faculty-list" element={<FacultyList />} />
        <Route path="/feedbackform/:id" element={<FeedbackForm />} />
      </Routes>
  
  );
}

export default App;