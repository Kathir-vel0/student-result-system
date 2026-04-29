import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDasboard";
import StudentDashboard from "./pages/StudentDashboard";

import AddStudent from "./pages/AddStudent";
import AddTeacher from "./pages/AddTeacher";
import AddSubject from "./pages/AddSubject";
import AddResult from "./pages/AddResult";

import ViewProfile from "./pages/ViewProfile";
import TeacherProfile from "./pages/TeacherProfile";
import ViewStudents from "./pages/ViewStudents";
import ViewResults from "./pages/ViewResults";
import ViewTeachers from "./pages/ViewTeachers";
import ViewSubjects from "./pages/ViewSubjects";
import Result from "./pages/Result";

function App() {
  return (
    <Router>
      <Routes>

        {/* 🔓 PUBLIC (NO SIDEBAR) */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔐 DASHBOARD (WITH SIDEBAR + NAVBAR) */}
        <Route path="/" element={<Layout />}>

          {/* DASHBOARDS */}
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="teacher" element={<TeacherDashboard />} />
          <Route path="student" element={<StudentDashboard />} />

          {/* ADMIN FEATURES */}
          <Route path="add-student" element={<AddStudent />} />
          <Route path="add-teacher" element={<AddTeacher />} />
          <Route path="add-subject" element={<AddSubject />} />
          <Route path="view-students" element={<ViewStudents />} />
          <Route path="view-teachers" element={<ViewTeachers />} />
          <Route path="view-subjects" element={<ViewSubjects />} />

          {/* RESULTS */}
          <Route path="add-result" element={<AddResult />} />
          <Route path="view-results" element={<ViewResults />} />
          <Route path="result" element={<Result />} />

          {/* PROFILE */}
          <Route path="view-profile" element={<ViewProfile />} />
          <Route path="teacher-profile" element={<TeacherProfile />} />

        </Route>

      </Routes>
    </Router>
  );
}

export default App;