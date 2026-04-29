import React, { useState, useEffect } from "react";
import API from "../api/api";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";

import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import { useToast } from "../components/ToastProvider";

const AddStudent = () => {
  const { showToast } = useToast();
  const [student, setStudent] = useState({
    studentId: "",
    name: "",
    photo: "",
    className: "",
    section: "",
    email: "",
    dob: "",
    userId: ""
  });

  const [users, setUsers] = useState([]);
  const [photoPreview, setPhotoPreview] = useState("");

  // 🔹 Fetch ONLY STUDENT users
  useEffect(() => {
    API.get("/users")
      .then((res) => {
        const studentUsers = res.data.filter(
          (u) => u.role?.toUpperCase() === "STUDENT"
        );
        setUsers(studentUsers);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleChange = (e) => {
    setStudent({
      ...student,
      [e.target.name]: e.target.value
    });
  };

 const handleSubmit = (e) => {
  e.preventDefault();

  const payload = {
    studentId: student.studentId,
    name: student.name,
    photo: student.photo,
    className: student.className,
    section: student.section,
    email: student.email,
    dob: student.dob
  };

  API.post(`/students/user/${student.userId}`, payload)
    .then(() => {
      showToast("Student Added Successfully", "success");
    })
    .catch((err) => {
      console.error(err);
      showToast("Error adding student", "error");
    });
};

  const handlePhotoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setStudent((prev) => ({ ...prev, photo: "" }));
      setPhotoPreview("");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || "");
      setStudent((prev) => ({ ...prev, photo: result }));
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
  };
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
        Add Student
      </Typography>

      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3} direction="column">
            <Grid item xs={12} md={12}>
              <TextField
                fullWidth
                name="studentId"
                label="Student ID"
                value={student.studentId}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={12}>
              <TextField
                fullWidth
                name="name"
                label="Name"
                value={student.name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={12}>
              <Box
                sx={{
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: 3,
                  p: 2,
                  height: "100%",
                }}
              >
                <Typography sx={{ fontWeight: 800, mb: 1 }}>
                  Student Photo
                </Typography>

                <Button
                  variant="outlined"
                  component="label"
                  sx={{ borderRadius: 3 }}
                >
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handlePhotoFile}
                  />
                </Button>

                {photoPreview ? (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={photoPreview}
                      alt="Student preview"
                      style={{
                        width: 72,
                        height: 72,
                        objectFit: "cover",
                        borderRadius: 12,
                      }}
                    />
                  </Box>
                ) : (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 2 }}
                  >
                    No photo selected
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={12}>
              <TextField
                fullWidth
                name="className"
                label="Class"
                value={student.className}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={12}>
              <TextField
                fullWidth
                name="section"
                label="Section"
                value={student.section}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={12}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                value={student.email}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={12}>
              <TextField
                fullWidth
                name="dob"
                label="Date of Birth"
                type="date"
                value={student.dob}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={12}>
              <TextField
                select
                fullWidth
                required
                name="userId"
                label="Select Student User"
                value={student.userId}
                onChange={handleChange}
              >
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.username} ({u.role})
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
                Add Student
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      </Box>
    </Box>
  );
};

export default AddStudent;