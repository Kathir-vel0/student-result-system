import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import CardActionArea from "@mui/material/CardActionArea";
import Fade from "@mui/material/Fade";
import Grow from "@mui/material/Grow";


import API from "../api/api";

import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SchoolIcon from "@mui/icons-material/School";

function AdminDashboard() {
  const navigate = useNavigate();

  const [statsLoading, setStatsLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalSubjects, setTotalSubjects] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatsLoading(true);
      try {
        const [studentsRes, subjectsRes] = await Promise.allSettled([
          API.get("/students"),
          API.get("/subjects/all"),
        ]);

        if (!cancelled) {
          if (studentsRes.status === "fulfilled") {
            setTotalStudents((studentsRes.value.data || []).length);
          }
          if (subjectsRes.status === "fulfilled") {
            setTotalSubjects((subjectsRes.value.data || []).length);
          }
        }

        try {
          const teachersRes = await API.get("/teachers/all");
          if (!cancelled) setTotalTeachers((teachersRes.data || []).length);
        } catch (e) {
          console.error(e);
          if (!cancelled) setTotalTeachers(0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const quickActions = [
    {
      to: "/view-students",
      label: "View Students",
      description: "Browse and manage all registered student profiles in the system.",
      icon: <PeopleAltIcon fontSize="large" />,
      color: "primary.main",
      bgColor: "rgba(79,70,229,0.1)",
    },
    {
      to: "/view-teachers",
      label: "View Teachers",
      description: "Administer staff details, review subjects, and change active statuses.",
      icon: <AdminPanelSettingsIcon fontSize="large" />,
      color: "#10b981",
      bgColor: "rgba(16,185,129,0.1)",
    },
    {
      to: "/view-results",
      label: "Global Results",
      description: "Check, verify, and track all submitted marks and grades by class.",
      icon: <AssignmentTurnedInIcon fontSize="large" />,
      color: "#f59e0b",
      bgColor: "rgba(245,158,11,0.1)",
    },
    {
      to: "/add-student",
      label: "Enroll Student",
      description: "Create and publish a brand new student profile securely.",
      icon: <PersonAddIcon fontSize="large" />,
      color: "primary.main",
      bgColor: "rgba(79,70,229,0.1)",
      outline: true,
    },
    {
      to: "/add-teacher",
      label: "Hire Teacher",
      description: "Create a new teacher profile and explicitly assign them subjects.",
      icon: <PersonAddAlt1Icon fontSize="large" />,
      color: "#10b981",
      bgColor: "rgba(16,185,129,0.1)",
      outline: true,
    },
  ];

  return (
    <Box>
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: "text.primary" }}>
            Platform Administration
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Total oversight. Review metrics and govern the institution from one place.
          </Typography>
        </Box>
      </Fade>

      {/* 🌟 STATS METRICS */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grow in={true} timeout={1000}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.05)", position: "relative", overflow: "hidden" }}>
              <Box sx={{ position: "absolute", right: -20, top: -20, opacity: 0.05, transform: "scale(2.5)" }}>
                <PeopleAltIcon sx={{ fontSize: 100 }} />
              </Box>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                  <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "rgba(79,70,229,0.1)", color: "primary.main", display: "flex" }}>
                    <PeopleAltIcon />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 800 }}>Total Students</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: "text.primary", mt: 1 }}>
                  {statsLoading ? <CircularProgress size={24} /> : totalStudents}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grow>

        <Grow in={true} timeout={1300}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.05)", position: "relative", overflow: "hidden" }}>
              <Box sx={{ position: "absolute", right: -20, top: -20, opacity: 0.05, transform: "scale(2.5)" }}>
                <AdminPanelSettingsIcon sx={{ fontSize: 100 }} />
              </Box>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                  <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "rgba(16,185,129,0.1)", color: "#10b981", display: "flex" }}>
                    <AdminPanelSettingsIcon />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 800 }}>Active Teachers</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: "text.primary", mt: 1 }}>
                  {statsLoading ? <CircularProgress size={24} /> : totalTeachers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grow>

        <Grow in={true} timeout={1600}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.05)", position: "relative", overflow: "hidden" }}>
              <Box sx={{ position: "absolute", right: -20, top: -20, opacity: 0.05, transform: "scale(2.5)" }}>
                <SchoolIcon sx={{ fontSize: 100 }} />
              </Box>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                  <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "rgba(245,158,11,0.1)", color: "#f59e0b", display: "flex" }}>
                    <SchoolIcon />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 800 }}>Registered Subjects</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: "text.primary", mt: 1 }}>
                  {statsLoading ? <CircularProgress size={24} /> : totalSubjects}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grow>
      </Grid>

      <Fade in={true} timeout={2000}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, color: "text.primary" }}>
            Operational Commands
          </Typography>

          <Grid container spacing={3}>
            {quickActions.map((action, index) => (
              <Grid key={action.to} item xs={12} md={action.outline ? 6 : 4}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 4,
                    bgcolor: "background.paper",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.04)",
                    border: action.outline ? "2px solid" : "none",
                    borderColor: action.outline ? action.bgColor : "transparent",
                    transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                      borderColor: action.outline ? action.color : "transparent"
                    },
                  }}
                >
                  <CardActionArea onClick={() => navigate(action.to)} sx={{ height: "100%", p: 3, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start" }}>

                    <Box
                      sx={{
                        width: 60, height: 60, borderRadius: 3,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        bgcolor: action.bgColor, color: action.color, mb: 2
                      }}
                    >
                      {action.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, color: "text.primary" }}>
                      {action.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                      {action.description}
                    </Typography>

                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Fade>

    </Box>
  );
}

export default AdminDashboard;