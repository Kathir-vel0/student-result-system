import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

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
import AttendanceManagement from "./pages/AttendanceManagement";
import AuditLogs from "./pages/AuditLogs";

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

          {/* 🛡️ ADMIN ONLY ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="add-student" element={<AddStudent />} />
            <Route path="add-teacher" element={<AddTeacher />} />
            <Route path="add-subject" element={<AddSubject />} />
            <Route path="view-teachers" element={<ViewTeachers />} />
            <Route path="view-subjects" element={<ViewSubjects />} />
            <Route path="view-results" element={<ViewResults />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="audit-logs" element={<AuditLogs />} />
          </Route>

          {/* 🛡️ TEACHER ONLY ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={["TEACHER"]} />}>
            <Route path="teacher" element={<TeacherDashboard />} />
            <Route path="teacher-profile" element={<TeacherProfile />} />
            <Route path="add-result" element={<AddResult />} />
            <Route path="attendance" element={<AttendanceManagement />} />
          </Route>

          {/* 🛡️ STUDENT ONLY ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
            <Route path="student" element={<StudentDashboard />} />
            <Route path="result" element={<Result />} />
            <Route path="view-profile" element={<ViewProfile />} />
            <Route path="attendance" element={<AttendanceManagement />} />
          </Route>

          {/* 🛡️ SHARED ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN", "TEACHER"]} />}>
            <Route path="view-students" element={<ViewStudents />} />
          </Route>

        </Route>

      </Routes>
    </Router>
  );
}

export default App;