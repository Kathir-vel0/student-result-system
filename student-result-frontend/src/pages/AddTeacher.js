import React, { useState, useEffect } from "react";
import API from "../api/api";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { useToast } from "../components/ToastProvider";

const AddTeacher = () => {
  const { showToast } = useToast();
  
  // 🔹 Form State with precise default values to prevent undefined behaviors
  const initialFormState = {
    username: "",
    password: "",
    email: "",
    name: "",
    phone: "",
    gender: "Male",
    status: "ACTIVE",
    subjectId: ""
  };

  const [teacher, setTeacher] = useState(initialFormState);
  const [subjects, setSubjects] = useState([]);
  const [errors, setErrors] = useState({});

  // 🔹 Fetch Subjects dynamically with a fallback
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res = await API.get("/subjects/all");
        const subjectList = res.data || [];
        setSubjects(subjectList);
        
        // Auto-select first subject if available to make it easier for the admin
        if (subjectList.length > 0) {
          setTeacher(prev => ({ ...prev, subjectId: String(subjectList[0].id) }));
        }
      } catch (err) {
        console.error("Error loading subjects:", err);
        showToast("Error loading subjects database", "error");
      }
    };
    loadSubjects();
  }, [showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTeacher((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when user begins typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // 🔹 Form Reset
  const handleReset = () => {
    setTeacher(initialFormState);
    if (subjects.length > 0) {
      setTeacher(prev => ({ ...prev, subjectId: String(subjects[0].id) }));
    }
    setErrors({});
    showToast("Form cleared successfully", "info");
  };

  // 🔹 Custom Validation Logic
  const validateForm = () => {
    const newErrors = {};

    // Section 1 Validation
    if (!teacher.username.trim()) newErrors.username = "Username is required";
    if (!teacher.password) {
      newErrors.password = "Password is required";
    } else if (teacher.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }
    
    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!teacher.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(teacher.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Section 2 Validation
    if (!teacher.name.trim()) newErrors.name = "Full Name is required";
    
    // Phone Validation
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (!teacher.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(teacher.phone.replace(/[\s-()]/g, ""))) {
      newErrors.phone = "Please enter a valid phone number (7-15 digits)";
    }

    if (!teacher.subjectId) {
      newErrors.subjectId = "Please select a Subject. If list is empty, create a subject first.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please correct the errors in the form.", "warning");
      return;
    }

    try {
      await API.post("/teachers/create-full", {
        username: teacher.username.trim(),
        password: teacher.password,
        name: teacher.name.trim(),
        email: teacher.email.trim(),
        phone: teacher.phone.trim(),
        status: teacher.status,
        gender: teacher.gender,
        subjectId: parseInt(teacher.subjectId, 10)
      });

      showToast("Teacher Account and Profile Created Successfully!", "success");
      
      // Clear form except loading initial subject default
      setTeacher({
        ...initialFormState,
        subjectId: subjects.length > 0 ? String(subjects[0].id) : ""
      });
      setErrors({});
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Error adding teacher account";
      showToast(errorMsg, "error");
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
        Add Teacher
      </Typography>

      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3} direction="column">
              
              {/* ===== SECTION 1: ACCOUNT INFORMATION ===== */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "primary.main", mb: 1 }}>
                  1. Account Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  name="username"
                  label="Username"
                  value={teacher.username}
                  onChange={handleChange}
                  error={!!errors.username}
                  helperText={errors.username}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  type="password"
                  name="password"
                  label="Password"
                  value={teacher.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  type="email"
                  name="email"
                  label="Email"
                  value={teacher.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>

              {/* ===== SECTION 2: TEACHER INFORMATION ===== */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "primary.main", mb: 1 }}>
                  2. Teacher Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  name="name"
                  label="Full Name"
                  value={teacher.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  name="phone"
                  label="Phone Number"
                  value={teacher.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                />
              </Grid>

              {/* Gender Dropdown - Pre-populated to guarantee no empty selects */}
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  required
                  name="gender"
                  label="Gender"
                  value={teacher.gender}
                  onChange={handleChange}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>

              {/* Subject Dropdown - Prevents broken required inputs if empty */}
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  required
                  name="subjectId"
                  label="Select Subject"
                  value={teacher.subjectId}
                  onChange={handleChange}
                  error={!!errors.subjectId}
                  helperText={errors.subjectId}
                >
                  {subjects.length === 0 ? (
                    <MenuItem value="" disabled>
                      ❌ No subjects available. Create one first!
                    </MenuItem>
                  ) : (
                    subjects.map((s) => (
                      <MenuItem key={s.id} value={String(s.id)}>
                        {s.subjectName} ({s.subjectCode})
                      </MenuItem>
                    ))
                  )}
                </TextField>
              </Grid>

              {/* Status Dropdown - Pre-populated to prevent empty selections */}
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  required
                  name="status"
                  label="Status"
                  value={teacher.status}
                  onChange={handleChange}
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </TextField>
              </Grid>

              {/* ===== SECTION 3: ACTIONS ===== */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      sx={{ borderRadius: 3, py: 1.25, fontWeight: "bold" }}
                    >
                      Create Teacher
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={handleReset}
                      sx={{ borderRadius: 3, py: 1.25, fontWeight: "bold" }}
                    >
                      Reset Form
                    </Button>
                  </Grid>
                </Grid>
              </Grid>

            </Grid>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default AddTeacher;