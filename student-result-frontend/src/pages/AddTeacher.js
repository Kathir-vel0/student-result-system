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
    name: "",
    email: "",
    phone: "",
    status: "",
    userId: "",
    subjectId: ""
  });

  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await API.get("/users");
        const subjectRes = await API.get("/subjects/all");

        const teacherUsers = userRes.data.filter(
          (u) => String(u.role).toUpperCase() === "TEACHER"
        );

        setUsers(teacherUsers);
        setSubjects(subjectRes.data);

      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setTeacher({ ...teacher, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/teachers/add", {
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        status: teacher.status,

        user: { id: parseInt(teacher.userId) },
        subject: { id: parseInt(teacher.subjectId) }   // 🔥 REQUIRED FIX
      });

      showToast("Teacher Added Successfully", "success");
    } catch (error) {
      console.error(error);
      showToast("Error adding teacher", "error");
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
        Add Teacher
      </Typography>

      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3} direction="column">
            <Grid item xs={12} md={12}>
              <TextField
                fullWidth
                name="name"
                label="Name"
                value={teacher.name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={12}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                value={teacher.email}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={12}>
              <TextField
                fullWidth
                name="phone"
                label="Phone"
                value={teacher.phone}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={12}>
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

            <Grid item xs={12} md={12}>
              <TextField
                select
                fullWidth
                required
                name="userId"
                label="Select Teacher User"
                value={teacher.userId}
                onChange={handleChange}
              >
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.username}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={12}>
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
                    {s.subjectName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                sx={{ borderRadius: 3, px: 3, py: 1.25 }}
              >
                Add Teacher
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