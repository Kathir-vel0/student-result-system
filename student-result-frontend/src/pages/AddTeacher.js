import { useState, useEffect } from "react";
import API from "../api/api";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import { useToast } from "../components/ToastProvider";

function AddTeacher() {
  const { showToast } = useToast();
  const [teacher, setTeacher] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    phone: "",
    status: "ACTIVE",
    subjectId: ""
  });

  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const subjectRes = await API.get("/subjects/all");
        setSubjects(subjectRes.data || []);
      } catch (err) {
        console.error("Error loading subjects:", err);
        showToast("Error loading subjects from database", "error");
      }
    };
    fetchSubjects();
  }, [showToast]);

  const handleChange = (e) => {
    setTeacher({ ...teacher, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!teacher.username || !teacher.password || !teacher.name || !teacher.email || !teacher.subjectId) {
      showToast("Please fill all required fields", "warning");
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
        subjectId: parseInt(teacher.subjectId, 10)
      });

      showToast("Teacher and credentials created successfully", "success");
      
      // Reset form
      setTeacher({
        username: "",
        password: "",
        name: "",
        email: "",
        phone: "",
        status: "ACTIVE",
        subjectId: ""
      });
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Error adding teacher";
      showToast(errorMsg, "error");
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
        Create Teacher Account
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Admin panel to manually configure login credentials and details for a new teacher.
      </Typography>

      <Box sx={{ maxWidth: 700, mx: "auto" }}>
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              
              {/* Account Section Title */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main", mb: 1 }}>
                  1. Login Credentials
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  name="username"
                  label="Username"
                  value={teacher.username}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="password"
                  name="password"
                  label="Password"
                  value={teacher.password}
                  onChange={handleChange}
                />
              </Grid>

              {/* Profile Details Section Title */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main", mt: 1, mb: 1 }}>
                  2. Profile Details
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  name="name"
                  label="Name"
                  value={teacher.name}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="email"
                  name="email"
                  label="Email"
                  value={teacher.email}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Phone"
                  value={teacher.phone}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
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

              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  required
                  name="subjectId"
                  label="Select Subject"
                  value={teacher.subjectId}
                  onChange={handleChange}
                >
                  {subjects.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.subjectName} ({s.subjectCode})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{ borderRadius: 3, px: 5, py: 1.5, fontWeight: "bold" }}
                >
                  Create Teacher Account
                </Button>
              </Grid>

            </Grid>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default AddTeacher;