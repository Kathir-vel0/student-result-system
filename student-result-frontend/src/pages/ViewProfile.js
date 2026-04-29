import React, { useEffect, useState } from "react";
import API from "../api/api";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";

function ViewProfile() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    
    setLoading(true);
    API.get(`/students/user/${userId}`)
      .then((res) => {
        setStudent(res.data);
      })
      .catch((err) => {
        console.error(err);
        setStudent(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!student) {
    return (
      <Box>
        <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, color: 'text.secondary' }}>
            Profile Not Found
          </Typography>
          <Typography color="text.secondary">
            Your student profile details could not be retrieved. Please contact the administrator.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
        Student Profile
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", justifyContent: { xs: "center", md: "flex-start" } }}>
              <Avatar
                src={student.photo || "https://via.placeholder.com/150"}
                alt="Student"
                sx={{ width: 120, height: 120 }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: "grid", gap: 1.5 }}>
              <Typography>
                <Box component="span" sx={{ fontWeight: 900 }}>
                  Student ID:
                </Box>{" "}
                {student.studentId}
              </Typography>
              <Typography>
                <Box component="span" sx={{ fontWeight: 900 }}>
                  Name:
                </Box>{" "}
                {student.name}
              </Typography>
              <Typography>
                <Box component="span" sx={{ fontWeight: 900 }}>
                  Class:
                </Box>{" "}
                {student.className}
              </Typography>
              <Typography>
                <Box component="span" sx={{ fontWeight: 900 }}>
                  Section:
                </Box>{" "}
                {student.section}
              </Typography>
              <Typography>
                <Box component="span" sx={{ fontWeight: 900 }}>
                  Email:
                </Box>{" "}
                {student.email}
              </Typography>
              <Typography>
                <Box component="span" sx={{ fontWeight: 900 }}>
                  Date of Birth:
                </Box>{" "}
                {student.dob}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default ViewProfile;