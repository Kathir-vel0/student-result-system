import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";
import Fade from "@mui/material/Fade";
import Grow from "@mui/material/Grow";

import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PostAddIcon from "@mui/icons-material/PostAdd";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FactCheckIcon from "@mui/icons-material/FactCheck";

function TeacherDashboard() {
  const navigate = useNavigate();

  const [totalStudents, setTotalStudents] = useState(0);
  const [subjectsAssigned, setSubjectsAssigned] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setStatsLoading(true);

      try {
        const studentRes = await API.get("/students");
        if (!cancelled) setTotalStudents((studentRes.data || []).length);
      } catch (err) {
        console.error(err);
      }

      try {
        const teacherUserId = localStorage.getItem("userId");
        if (!teacherUserId) {
          if (!cancelled) setSubjectsAssigned(0);
          return;
        }

        const teachersRes = await API.get("/teachers/all");
        const allTeachers = teachersRes.data || [];
        const teacher = allTeachers.find(
          (t) => String(t?.user?.id) === String(teacherUserId)
        );

        const count = teacher?.subject ? 1 : 0;
        if (!cancelled) setSubjectsAssigned(count);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box>
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: "text.primary" }}>
            Teacher Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage your classes, assign grades, and review student progress.
          </Typography>
        </Box>
      </Fade>

      {/* 🌟 STATS CARDS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grow in={true} timeout={1000}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.05)", position: "relative", overflow: "hidden" }}>
              <Box sx={{ position: "absolute", right: -20, top: -20, opacity: 0.05, transform: "scale(2.5)" }}>
                <PeopleAltIcon sx={{ fontSize: 100 }} />
              </Box>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                  <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "rgba(79,70,229,0.1)", color: "primary.main", display: "flex" }}>
                    <PeopleAltIcon />
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 800 }}>Total Enrolled Students</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: "text.primary", mt: 1 }}>
                  {statsLoading ? <CircularProgress size={24} /> : totalStudents}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grow>

        <Grow in={true} timeout={1400}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.05)", position: "relative", overflow: "hidden" }}>
              <Box sx={{ position: "absolute", right: -20, top: -20, opacity: 0.05, transform: "scale(2.5)" }}>
                <MenuBookIcon sx={{ fontSize: 100 }} />
              </Box>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                  <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "rgba(16,185,129,0.1)", color: "#10b981", display: "flex" }}>
                    <MenuBookIcon />
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 800 }}>Assigned Subjects</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: "text.primary", mt: 1 }}>
                  {statsLoading ? <CircularProgress size={24} /> : subjectsAssigned}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grow>
      </Grid>

      <Grid container spacing={4}>
        {/* 🌟 QUICK ACTIONS */}
        <Grid item xs={12} md={8}>
          <Fade in={true} timeout={1800}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>Quick Actions</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card 
                    sx={{ borderRadius: 4, transition: "transform 0.2s, box-shadow 0.2s", "&:hover": { transform: "translateY(-5px)", boxShadow: "0 12px 28px rgba(0,0,0,0.08)" } }}
                  >
                    <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                      <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "rgba(79,70,229,0.1)", color: "primary.main", display: "inline-flex", alignSelf: "flex-start", mb: 2 }}>
                        <PeopleAltIcon />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>View Students</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, mt: 0.5, flexGrow: 1 }}>
                        Review the complete list of students currently enrolled in your assigned classes.
                      </Typography>
                      <Button onClick={() => navigate("/view-students")} variant="outlined" sx={{ borderRadius: 6, fontWeight: 700 }}>Open Roster</Button>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card 
                    sx={{ borderRadius: 4, transition: "transform 0.2s, box-shadow 0.2s", "&:hover": { transform: "translateY(-5px)", boxShadow: "0 12px 28px rgba(0,0,0,0.08)" } }}
                  >
                    <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                      <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "rgba(16,185,129,0.1)", color: "#10b981", display: "inline-flex", alignSelf: "flex-start", mb: 2 }}>
                        <PostAddIcon />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>Add Marks</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, mt: 0.5, flexGrow: 1 }}>
                        Input and officially publish grades and marks for the students under your supervision.
                      </Typography>
                      <Button onClick={() => navigate("/add-result")} variant="contained" sx={{ borderRadius: 6, fontWeight: 700, bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" } }}>Enter Grades</Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        </Grid>

        {/* 🌟 RECENT ACTIVITY */}
        <Grid item xs={12} md={4}>
          <Fade in={true} timeout={2200}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>System Overview</Typography>
              
              <Card sx={{ borderRadius: 4, mb: 3, bgcolor: "primary.main", color: "white", boxShadow: "0 10px 30px rgba(79,70,229,0.3)" }}>
                <CardContent sx={{ position: "relative" }}>
                  <AccountCircleIcon sx={{ position: "absolute", top: 16, right: 16, opacity: 0.2, fontSize: 60 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, opacity: 0.9 }}>Profile Notice</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, mt: 1, mb: 2 }}>
                    Keep your details up to date.
                  </Typography>
                  <Button component={Link} to="/teacher-profile" variant="contained" size="small" sx={{ borderRadius: 6, fontWeight: 800, bgcolor: "white", color: "primary.main", "&:hover": { bgcolor: "rgba(255,255,255,0.9)" } }}>
                    Manage Profile
                  </Button>
                </CardContent>
              </Card>

              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>Capabilities</Typography>
              <Paper sx={{ p: 0, borderRadius: 4, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                <List disablePadding>
                  <ListItem divider sx={{ py: 2 }}>
                    <Box sx={{ p: 1, mr: 2, borderRadius: 2, bgcolor: "rgba(16,185,129,0.1)", color: "#10b981", display: "flex" }}>
                      <FactCheckIcon fontSize="small" />
                    </Box>
                    <ListItemText primaryTypographyProps={{ fontWeight: 800 }} secondaryTypographyProps={{ variant: "caption" }} primary="Marks Entry" secondary="Update grades live for students." />
                  </ListItem>
                  <ListItem sx={{ py: 2 }}>
                    <Box sx={{ p: 1, mr: 2, borderRadius: 2, bgcolor: "rgba(79,70,229,0.1)", color: "primary.main", display: "flex" }}>
                      <PeopleAltIcon fontSize="small" />
                    </Box>
                    <ListItemText primaryTypographyProps={{ fontWeight: 800 }} secondaryTypographyProps={{ variant: "caption" }} primary="Roster Insights" secondary="Review all assigned students." />
                  </ListItem>
                </List>
              </Paper>
            </Box>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
}

export default TeacherDashboard;