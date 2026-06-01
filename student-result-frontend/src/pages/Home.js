import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import SchoolIcon from "@mui/icons-material/School";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SecurityIcon from "@mui/icons-material/Security";
import TimelineIcon from "@mui/icons-material/Timeline";
import CheckIcon from "@mui/icons-material/Check";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import LockIcon from "@mui/icons-material/Lock";
import SpeedIcon from "@mui/icons-material/Speed";
import BarChartIcon from "@mui/icons-material/BarChart";
import DevicesIcon from "@mui/icons-material/Devices";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import BadgeIcon from "@mui/icons-material/Badge";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import HistoryIcon from "@mui/icons-material/History";
import CampaignIcon from "@mui/icons-material/Campaign";

import Fade from "@mui/material/Fade";
import Grow from "@mui/material/Grow";
import Slide from "@mui/material/Slide";
import { keyframes } from "@mui/system";

// Smooth floating animation logic
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
  100% { transform: translateY(0px); }
`;

// Glowing border animation for premium look
const borderGlow = keyframes`
  0% { box-shadow: 0 0 10px rgba(79,70,229,0.3); }
  50% { box-shadow: 0 0 25px rgba(79,70,229,0.6); }
  100% { box-shadow: 0 0 10px rgba(79,70,229,0.3); }
`;

// Simple Typewriter Effect Component
function Typewriter({ words }) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      setTimeout(() => setReverse(true), 2000);
      return;
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, Math.max(reverse ? 50 : 100, parseInt(Math.random() * 200)));

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, words]);

  return (
    <span
      style={{
        color: "#4F46E5",
        display: "inline-block",
        minWidth: "min(100%, 12rem)",
      }}
    >
      {`${words[index].substring(0, subIndex)}`}
      <span style={{ animation: "blink 1s step-end infinite", borderRight: "3px solid #4F46E5" }} />
      <style>{"@keyframes blink { 50% { border-color: transparent } }"}</style>
    </span>
  );
}

// Simple Counter Component (Animated Numbers)
function AnimatedCounter({ end, duration = 2000 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const current = Math.min(Math.floor((progress / duration) * end), end);
      setCount(current);
      if (progress < duration) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
}

function Home() {
  const words = ["Streamlined.", "Secure.", "Intelligent.", "Perfected."];

  const features = [
    {
      title: "For Admins",
      description: "Complete oversight: seamlessly manage students, teachers, subjects, and globally administer the platform.",
      icon: <PeopleAltIcon sx={{ fontSize: 40 }} />
    },
    {
      title: "For Teachers",
      description: "Dedicated dashboard to intuitively review your classes, manage students, and input precise grades instantly.",
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />
    },
    {
      title: "For Students",
      description: "Instant access to your comprehensive digital report cards, grades, and academic performance history securely.",
      icon: <SchoolIcon sx={{ fontSize: 40 }} />
    }
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column", overflowX: "hidden" }}>

      {/* 🌟 FLOATING NAVBAR */}
      <Slide direction="down" in={true} timeout={800}>
        <Box
          sx={{
            position: "fixed",
            top: { xs: 8, sm: 16 },
            left: 0,
            right: 0,
            zIndex: 50,
            px: { xs: 1.5, sm: 2 },
            display: "flex",
            justifyContent: "center",
            pt: "env(safe-area-inset-top, 0px)",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: { xs: "wrap", sm: "nowrap" },
              rowGap: 1.5,
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 1.25, sm: 1.5 },
              borderRadius: { xs: 6, sm: 10 },
              bgcolor: (t) =>
                t.palette.mode === "dark"
                  ? "rgba(15,23,42,0.75)"
                  : "rgba(255,255,255,0.72)",
              backdropFilter: "blur(12px)",
              width: "100%",
              maxWidth: 1000,
              boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                color: "primary.main",
                letterSpacing: -0.5,
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              ResultSys
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: { xs: 1, sm: 2 },
                width: { xs: "100%", sm: "auto" },
                justifyContent: { xs: "flex-end", sm: "flex-start" },
              }}
            >
              <Button
                component={Link}
                to="/login"
                size="small"
                sx={{ fontWeight: 800, flex: { xs: 1, sm: "unset" } }}
              >
                Sign In
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                size="small"
                sx={{
                  borderRadius: 8,
                  px: { xs: 2, sm: 3 },
                  fontWeight: 800,
                  flex: { xs: 1, sm: "unset" },
                }}
              >
                Start
              </Button>
            </Box>
          </Paper>
        </Box>
      </Slide>

      {/* 🌟 HERO SECTION */}
      <Box
        sx={{
          pt: { xs: 18, md: 24 },
          pb: { xs: 8, md: 10 },
          px: 2,
          textAlign: "center",
          background: "linear-gradient(180deg, rgba(79,70,229,0.06) 0%, rgba(255,255,255,0) 100%)",
          position: "relative",
        }}
      >
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 2 }}>
          <Fade in={true} timeout={1000}>
            <Typography
              variant="overline"
              sx={{ fontWeight: 800, color: "primary.main", letterSpacing: 2, mb: 1, display: "inline-flex", alignItems: "center", gap: 1, bgcolor: "rgba(79,70,229,0.1)", px: 2, py: 0.5, borderRadius: 8 }}
            >
              <TimelineIcon fontSize="small" /> THE UPGRADE YOU DESERVE
            </Typography>
          </Fade>

          <Slide direction="up" in={true} timeout={1200}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                mb: 3,
                mt: 3,
                color: "text.primary",
                fontSize: { xs: "2.25rem", sm: "3rem", md: "4.5rem" },
                letterSpacing: -1,
                lineHeight: 1.1
              }}
            >
              Academic Results, <br />
              <Typewriter words={words} />
            </Typography>
          </Slide>

          <Fade in={true} timeout={1800}>
            <Typography
              variant="h6"
              sx={{
                mb: { xs: 4, md: 6 },
                color: "text.secondary",
                fontWeight: 400,
                maxWidth: 650,
                mx: "auto",
                lineHeight: 1.6,
                fontSize: { xs: "1rem", sm: "1.25rem" },
                px: { xs: 0.5, sm: 0 },
              }}
            >
              A beautifully crafted, intelligent gateway to manage school performance. Say goodbye to spreadsheets and rigid legacy systems.
            </Typography>
          </Fade>

          <Fade in={true} timeout={2200}>
            <Box sx={{ display: "flex", gap: 3, justifyContent: "center", flexWrap: "wrap", animation: `${float} 6s ease-in-out infinite` }}>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                size="large"
                sx={{
                  px: { xs: 3, sm: 5 },
                  py: { xs: 1.4, sm: 1.8 },
                  borderRadius: 8,
                  fontWeight: 800,
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                  width: { xs: "100%", sm: "auto" },
                  maxWidth: { xs: 360, sm: "none" },
                  animation: `${borderGlow} 3s infinite`,
                  transition: "transform 0.2s",
                  "&:hover": { transform: "translateY(-3px)", bgcolor: "primary.dark" }
                }}
              >
                Access Dashboard
              </Button>
            </Box>
          </Fade>
        </Container>

        {/* 🌟 STATS SECTION */}
        <Fade in={true} timeout={2800}>
          <Container maxWidth="md" sx={{ mt: { xs: 6, md: 10 }, position: "relative", zIndex: 2 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 4,
                bgcolor: "background.paper",
                boxShadow: "0 20px 40px rgba(0,0,0,0.04)",
                display: "flex", flexWrap: "wrap", justifyContent: "space-around", gap: 4
              }}
            >
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: "primary.main" }}>
                  <AnimatedCounter end={100} duration={2500} />%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 800, mt: 0.5, letterSpacing: 1 }}>
                  SECURE & FAST
                </Typography>
              </Box>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: "primary.main" }}>
                  <AnimatedCounter end={1250} duration={3000} />+
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 800, mt: 0.5, letterSpacing: 1 }}>
                  STUDENTS MANAGED
                </Typography>
              </Box>
            </Paper>
          </Container>
        </Fade>

        {/* Floating gradient orb logic in background */}
        <Box
          sx={{
            position: "absolute", top: -100, right: -100, width: 400, height: 400,
            background: "radial-gradient(circle, rgba(79,70,229,0.15) 0%, rgba(255,255,255,0) 70%)",
            borderRadius: "50%", zIndex: 1, animation: `${float} 8s ease-in-out infinite`
          }}
        />

      {/* 🌟 SECTION 1: BUILT FOR EVERY ROLE */}
      <Box
        sx={{
          py: { xs: 12, md: 16 },
          px: 2,
          bgcolor: "background.default",
          position: "relative",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 10 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 950,
                mb: 2.5,
                letterSpacing: -1.2,
                color: "text.primary",
                fontSize: { xs: "2.25rem", md: "3.25rem" },
                lineHeight: 1.1,
              }}
            >
              Built For Every Role
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                fontWeight: 400,
                maxWidth: 600,
                mx: "auto",
                lineHeight: 1.6,
                fontSize: { xs: "1.05rem", md: "1.25rem" },
              }}
            >
              Manage the entire academic workflow from one intelligent platform.
            </Typography>
          </Box>

          <Grid container spacing={5} alignItems="stretch">
            {/* Card 1: Admin Portal */}
            <Grid item xs={12} md={4}>
              <Card
                elevation={0}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  borderRadius: 6,
                  p: { xs: 4, md: 5 },
                  bgcolor: (t) =>
                    t.palette.mode === "dark"
                      ? "rgba(30, 41, 59, 0.45)"
                      : "rgba(255, 255, 255, 0.45)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.02), 0 1px 8px rgba(0,0,0,0.01)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "translateY(-10px)",
                    boxShadow: "0 24px 48px rgba(79,70,229,0.14), 0 4px 16px rgba(79,70,229,0.04)",
                    borderColor: "primary.main",
                  },
                }}
              >
                <Box
                  sx={{
                    mb: 4,
                    p: 2,
                    display: "inline-flex",
                    borderRadius: 4,
                    color: "primary.main",
                    alignSelf: "flex-start",
                    background: "linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(79,70,229,0.02) 100%)",
                    border: "1px solid",
                    borderColor: "rgba(79,70,229,0.1)",
                  }}
                >
                  <AdminPanelSettingsIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, color: "text.primary", letterSpacing: -0.5 }}>
                  Admin Portal
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flexGrow: 1, mb: 4 }}>
                  {[
                    "Manage Students",
                    "Manage Teachers",
                    "Manage Subjects",
                    "Audit Logs",
                    "Announcements"
                  ].map((item, idx) => (
                    <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          bgcolor: "rgba(79,70,229,0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CheckIcon sx={{ fontSize: 13, color: "primary.main", fontWeight: 900 }} />
                      </Box>
                      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, fontSize: "0.95rem" }}>
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Button
                  component={Link}
                  to="/login"
                  variant="text"
                  color="primary"
                  sx={{
                    justifyContent: "flex-start",
                    p: 0,
                    fontWeight: 800,
                    textTransform: "none",
                    fontSize: "0.95rem",
                    transition: "gap 0.2s",
                    "& .arrow": { transition: "transform 0.2s" },
                    "&:hover": {
                      bgcolor: "transparent",
                      color: "primary.dark",
                      "& .arrow": { transform: "translateX(4px)" },
                    },
                  }}
                >
                  Explore Portal <span className="arrow" style={{ marginLeft: "4px" }}>&rarr;</span>
                </Button>
              </Card>
            </Grid>

            {/* Card 2: Teacher Portal */}
            <Grid item xs={12} md={4}>
              <Card
                elevation={0}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  borderRadius: 6,
                  p: { xs: 4, md: 5 },
                  bgcolor: (t) =>
                    t.palette.mode === "dark"
                      ? "rgba(30, 41, 59, 0.45)"
                      : "rgba(255, 255, 255, 0.45)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.02), 0 1px 8px rgba(0,0,0,0.01)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "translateY(-10px)",
                    boxShadow: "0 24px 48px rgba(79,70,229,0.14), 0 4px 16px rgba(79,70,229,0.04)",
                    borderColor: "primary.main",
                  },
                }}
              >
                <Box
                  sx={{
                    mb: 4,
                    p: 2,
                    display: "inline-flex",
                    borderRadius: 4,
                    color: "primary.main",
                    alignSelf: "flex-start",
                    background: "linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(79,70,229,0.02) 100%)",
                    border: "1px solid",
                    borderColor: "rgba(79,70,229,0.1)",
                  }}
                >
                  <AssignmentIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, color: "text.primary", letterSpacing: -0.5 }}>
                  Teacher Portal
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flexGrow: 1, mb: 4 }}>
                  {[
                    "Mark Attendance",
                    "Upload Results",
                    "Manage Exams",
                    "Track Student Performance"
                  ].map((item, idx) => (
                    <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          bgcolor: "rgba(79,70,229,0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CheckIcon sx={{ fontSize: 13, color: "primary.main", fontWeight: 900 }} />
                      </Box>
                      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, fontSize: "0.95rem" }}>
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Button
                  component={Link}
                  to="/login"
                  variant="text"
                  color="primary"
                  sx={{
                    justifyContent: "flex-start",
                    p: 0,
                    fontWeight: 800,
                    textTransform: "none",
                    fontSize: "0.95rem",
                    transition: "gap 0.2s",
                    "& .arrow": { transition: "transform 0.2s" },
                    "&:hover": {
                      bgcolor: "transparent",
                      color: "primary.dark",
                      "& .arrow": { transform: "translateX(4px)" },
                    },
                  }}
                >
                  Explore Portal <span className="arrow" style={{ marginLeft: "4px" }}>&rarr;</span>
                </Button>
              </Card>
            </Grid>

            {/* Card 3: Student Portal */}
            <Grid item xs={12} md={4}>
              <Card
                elevation={0}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  borderRadius: 6,
                  p: { xs: 4, md: 5 },
                  bgcolor: (t) =>
                    t.palette.mode === "dark"
                      ? "rgba(30, 41, 59, 0.45)"
                      : "rgba(255, 255, 255, 0.45)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.02), 0 1px 8px rgba(0,0,0,0.01)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "translateY(-10px)",
                    boxShadow: "0 24px 48px rgba(79,70,229,0.14), 0 4px 16px rgba(79,70,229,0.04)",
                    borderColor: "primary.main",
                  },
                }}
              >
                <Box
                  sx={{
                    mb: 4,
                    p: 2,
                    display: "inline-flex",
                    borderRadius: 4,
                    color: "primary.main",
                    alignSelf: "flex-start",
                    background: "linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(79,70,229,0.02) 100%)",
                    border: "1px solid",
                    borderColor: "rgba(79,70,229,0.1)",
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, color: "text.primary", letterSpacing: -0.5 }}>
                  Student Portal
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flexGrow: 1, mb: 4 }}>
                  {[
                    "View Results",
                    "Attendance Tracking",
                    "Announcements",
                    "Academic History"
                  ].map((item, idx) => (
                    <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          bgcolor: "rgba(79,70,229,0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CheckIcon sx={{ fontSize: 13, color: "primary.main", fontWeight: 900 }} />
                      </Box>
                      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, fontSize: "0.95rem" }}>
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Button
                  component={Link}
                  to="/login"
                  variant="text"
                  color="primary"
                  sx={{
                    justifyContent: "flex-start",
                    p: 0,
                    fontWeight: 800,
                    textTransform: "none",
                    fontSize: "0.95rem",
                    transition: "gap 0.2s",
                    "& .arrow": { transition: "transform 0.2s" },
                    "&:hover": {
                      bgcolor: "transparent",
                      color: "primary.dark",
                      "& .arrow": { transform: "translateX(4px)" },
                    },
                  }}
                >
                  Explore Portal <span className="arrow" style={{ marginLeft: "4px" }}>&rarr;</span>
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 🌟 SECTION 2: HOW IT WORKS */}
      <Box
        sx={{
          py: { xs: 12, md: 16 },
          px: 2,
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderBottom: "1px solid",
          borderColor: "divider",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Box sx={{ textAlign: "center", mb: 10 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 950,
                mb: 2.5,
                letterSpacing: -1.2,
                color: "text.primary",
                fontSize: { xs: "2.25rem", md: "3.25rem" },
                lineHeight: 1.1,
              }}
            >
              How It Works
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                fontWeight: 400,
                maxWidth: 600,
                mx: "auto",
                lineHeight: 1.6,
                fontSize: { xs: "1.05rem", md: "1.25rem" },
              }}
            >
              A seamless flow of academic details from creation to publication.
            </Typography>
          </Box>

          <Box sx={{ position: "relative" }}>
            {/* Desktop connecting dashed line */}
            <Box
              sx={{
                position: "absolute",
                top: "135px",
                left: "15%",
                right: "15%",
                height: 0,
                borderTop: "2px dashed",
                borderColor: "rgba(79,70,229,0.2)",
                display: { xs: "none", md: "block" },
                zIndex: 1,
              }}
            />

            <Grid container spacing={4} justifyContent="center" alignItems="stretch">
              {/* Step 1: Admin */}
              <Grid item xs={12} md={4} sx={{ zIndex: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                  {/* Circle Indicator */}
                  <Box
                    sx={{
                      width: 54,
                      height: 54,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: "1.15rem",
                      boxShadow: "0 8px 20px rgba(79,70,229,0.3)",
                      border: "4px solid",
                      borderColor: "background.paper",
                      mb: 3,
                    }}
                  >
                    1
                  </Box>

                  <Card
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 5,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.default",
                      textAlign: "center",
                      width: "100%",
                      height: "100%",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 16px 32px rgba(0,0,0,0.04)",
                        borderColor: "rgba(79,70,229,0.3)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        mx: "auto",
                        mb: 2.5,
                        p: 2,
                        bgcolor: "rgba(79,70,229,0.06)",
                        display: "inline-flex",
                        borderRadius: "50%",
                        color: "primary.main",
                      }}
                    >
                      <AdminPanelSettingsIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "text.primary" }}>
                      Admin
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.6, fontSize: "0.95rem" }}>
                      Creates students, teachers, and subjects
                    </Typography>
                  </Card>
                </Box>
              </Grid>

              {/* Step 2: Teacher */}
              <Grid item xs={12} md={4} sx={{ zIndex: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                  {/* Circle Indicator */}
                  <Box
                    sx={{
                      width: 54,
                      height: 54,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: "1.15rem",
                      boxShadow: "0 8px 20px rgba(79,70,229,0.3)",
                      border: "4px solid",
                      borderColor: "background.paper",
                      mb: 3,
                    }}
                  >
                    2
                  </Box>

                  <Card
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 5,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.default",
                      textAlign: "center",
                      width: "100%",
                      height: "100%",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 16px 32px rgba(0,0,0,0.04)",
                        borderColor: "rgba(79,70,229,0.3)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        mx: "auto",
                        mb: 2.5,
                        p: 2,
                        bgcolor: "rgba(79,70,229,0.06)",
                        display: "inline-flex",
                        borderRadius: "50%",
                        color: "primary.main",
                      }}
                    >
                      <AssignmentIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "text.primary" }}>
                      Teacher
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.6, fontSize: "0.95rem" }}>
                      Records attendance and publishes results
                    </Typography>
                  </Card>
                </Box>
              </Grid>

              {/* Step 3: Student */}
              <Grid item xs={12} md={4} sx={{ zIndex: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                  {/* Circle Indicator */}
                  <Box
                    sx={{
                      width: 54,
                      height: 54,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: "1.15rem",
                      boxShadow: "0 8px 20px rgba(79,70,229,0.3)",
                      border: "4px solid",
                      borderColor: "background.paper",
                      mb: 3,
                    }}
                  >
                    3
                  </Box>

                  <Card
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 5,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.default",
                      textAlign: "center",
                      width: "100%",
                      height: "100%",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 16px 32px rgba(0,0,0,0.04)",
                        borderColor: "rgba(79,70,229,0.3)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        mx: "auto",
                        mb: 2.5,
                        p: 2,
                        bgcolor: "rgba(79,70,229,0.06)",
                        display: "inline-flex",
                        borderRadius: "50%",
                        color: "primary.main",
                      }}
                    >
                      <SchoolIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "text.primary" }}>
                      Student
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.6, fontSize: "0.95rem" }}>
                      Views results, attendance, and announcements
                    </Typography>
                  </Card>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* 🌟 SECTION 3: PLATFORM HIGHLIGHTS */}
      <Box sx={{ py: { xs: 12, md: 16 }, px: 2, bgcolor: "background.default" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 10 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 950,
                mb: 2.5,
                letterSpacing: -1.2,
                color: "text.primary",
                fontSize: { xs: "2.25rem", md: "3.25rem" },
                lineHeight: 1.1,
              }}
            >
              Platform Highlights
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                fontWeight: 400,
                maxWidth: 600,
                mx: "auto",
                lineHeight: 1.6,
                fontSize: { xs: "1.05rem", md: "1.25rem" },
              }}
            >
              Engineered for absolute reliability, performance, and responsive speed.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Highlight 1: Secure Authentication */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  p: 4,
                  height: "100%",
                  borderRadius: 5,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 8px 24px rgba(79,70,229,0.03)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 20px 40px rgba(79,70,229,0.12)",
                    borderColor: "primary.main",
                  },
                }}
              >
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    bgcolor: "rgba(79,70,229,0.06)",
                    display: "inline-flex",
                    borderRadius: "50%",
                    color: "primary.main",
                    background: "linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(79,70,229,0.02) 100%)",
                  }}
                >
                  <LockIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, color: "text.primary" }}>
                  Secure Authentication
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
                  JWT-based secure login and session verification.
                </Typography>
              </Card>
            </Grid>

            {/* Highlight 2: Fast Performance */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  p: 4,
                  height: "100%",
                  borderRadius: 5,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 8px 24px rgba(79,70,229,0.03)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 20px 40px rgba(79,70,229,0.12)",
                    borderColor: "primary.main",
                  },
                }}
              >
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    bgcolor: "rgba(79,70,229,0.06)",
                    display: "inline-flex",
                    borderRadius: "50%",
                    color: "primary.main",
                    background: "linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(79,70,229,0.02) 100%)",
                  }}
                >
                  <SpeedIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, color: "text.primary" }}>
                  Fast Performance
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
                  Optimized PostgreSQL queries through Supabase endpoints.
                </Typography>
              </Card>
            </Grid>

            {/* Highlight 3: Analytics & Reports */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  p: 4,
                  height: "100%",
                  borderRadius: 5,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 8px 24px rgba(79,70,229,0.03)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 20px 40px rgba(79,70,229,0.12)",
                    borderColor: "primary.main",
                  },
                }}
              >
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    bgcolor: "rgba(79,70,229,0.06)",
                    display: "inline-flex",
                    borderRadius: "50%",
                    color: "primary.main",
                    background: "linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(79,70,229,0.02) 100%)",
                  }}
                >
                  <BarChartIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, color: "text.primary" }}>
                  Analytics & Reports
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
                  Centralized academic dashboards and visual report lists.
                </Typography>
              </Card>
            </Grid>

            {/* Highlight 4: Responsive Design */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  p: 4,
                  height: "100%",
                  borderRadius: 5,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 8px 24px rgba(79,70,229,0.03)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 20px 40px rgba(79,70,229,0.12)",
                    borderColor: "primary.main",
                  },
                }}
              >
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    bgcolor: "rgba(79,70,229,0.06)",
                    display: "inline-flex",
                    borderRadius: "50%",
                    color: "primary.main",
                    background: "linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(79,70,229,0.02) 100%)",
                  }}
                >
                  <DevicesIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, color: "text.primary" }}>
                  Responsive Design
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
                  Optimized interfaces displaying flawlessly on phone and desktop.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 🌟 SECTION 4: EXPLORE THE PLATFORM */}
      <Box
        sx={{
          py: { xs: 12, md: 16 },
          px: 2,
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 10 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 950,
                mb: 2.5,
                letterSpacing: -1.2,
                color: "text.primary",
                fontSize: { xs: "2rem", md: "3rem" },
                lineHeight: 1.1,
              }}
            >
              Explore the Platform
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                fontWeight: 400,
                maxWidth: 600,
                mx: "auto",
                lineHeight: 1.6,
                fontSize: { xs: "1rem", md: "1.25rem" },
              }}
            >
              Experience rich, fully-responsive dashboard designs tailored for each user role.
            </Typography>
          </Box>

          <Grid container spacing={5}>
            {/* Preview 1: Admin */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: "text.primary", px: 1, letterSpacing: -0.5 }}>
                  Admin Dashboard
                </Typography>
                {/* Browser Mockup */}
                <Box
                  sx={{
                    borderRadius: 5,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.05), 0 1px 10px rgba(0,0,0,0.02)",
                    bgcolor: "background.default",
                    height: 280,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 30px 60px rgba(79,70,229,0.12)",
                      borderColor: "rgba(79,70,229,0.3)",
                    },
                  }}
                >
                  {/* Browser Bar */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      px: 2.5,
                      py: 1.5,
                      bgcolor: "background.paper",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 0.75 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#FF5F56" }} />
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#FFBD2E" }} />
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#27C93F" }} />
                    </Box>
                    <Box
                      sx={{
                        flexGrow: 1,
                        mx: 2,
                        py: 0.5,
                        px: 2,
                        bgcolor: "background.default",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontSize: 10,
                          fontWeight: 500,
                          letterSpacing: 0.5,
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                        }}
                      >
                        resultsys.edu/admin/dashboard
                      </Typography>
                    </Box>
                  </Box>
                  {/* Browser Content - Mock Admin UI */}
                  <Box sx={{ p: 2.5, display: "flex", height: "calc(100% - 44px)", gap: 2 }}>
                    {/* Mock Sidebar */}
                    <Box
                      sx={{
                        width: 50,
                        bgcolor: "background.paper",
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        p: 1,
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ width: 24, height: 24, borderRadius: "55%", bgcolor: "primary.main", opacity: 0.9 }} />
                      <Box sx={{ width: 24, height: 8, borderRadius: 1, bgcolor: "divider" }} />
                      <Box sx={{ width: 24, height: 8, borderRadius: 1, bgcolor: "divider" }} />
                      <Box sx={{ width: 24, height: 8, borderRadius: 1, bgcolor: "divider" }} />
                    </Box>
                    {/* Mock Main Area */}
                    <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Box sx={{ flex: 1, height: 44, bgcolor: "background.paper", borderRadius: 3, border: "1px solid", borderColor: "divider", p: 1 }}>
                          <Box sx={{ width: "40%", height: 6, bgcolor: "divider", mb: 0.75 }} />
                          <Box sx={{ width: "70%", height: 12, bgcolor: "primary.main", opacity: 0.8, borderRadius: 0.5 }} />
                        </Box>
                        <Box sx={{ flex: 1, height: 44, bgcolor: "background.paper", borderRadius: 3, border: "1px solid", borderColor: "divider", p: 1 }}>
                          <Box sx={{ width: "45%", height: 6, bgcolor: "divider", mb: 0.75 }} />
                          <Box sx={{ width: "80%", height: 12, bgcolor: "success.main", opacity: 0.8, borderRadius: 0.5 }} />
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          flexGrow: 1,
                          bgcolor: "background.paper",
                          borderRadius: 3,
                          border: "1px solid",
                          borderColor: "divider",
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        <Box sx={{ width: "35%", height: 8, bgcolor: "divider", mb: 1 }} />
                        <Box sx={{ width: "100%", height: 18, bgcolor: "background.default", borderRadius: 1, border: "1px solid", borderColor: "divider" }} />
                        <Box sx={{ width: "100%", height: 18, bgcolor: "background.default", borderRadius: 1, border: "1px solid", borderColor: "divider" }} />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Preview 2: Teacher */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: "text.primary", px: 1, letterSpacing: -0.5 }}>
                  Teacher Dashboard
                </Typography>
                {/* Browser Mockup */}
                <Box
                  sx={{
                    borderRadius: 5,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.05), 0 1px 10px rgba(0,0,0,0.02)",
                    bgcolor: "background.default",
                    height: 280,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 30px 60px rgba(79,70,229,0.12)",
                      borderColor: "rgba(79,70,229,0.3)",
                    },
                  }}
                >
                  {/* Browser Bar */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      px: 2.5,
                      py: 1.5,
                      bgcolor: "background.paper",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 0.75 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#FF5F56" }} />
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#FFBD2E" }} />
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#27C93F" }} />
                    </Box>
                    <Box
                      sx={{
                        flexGrow: 1,
                        mx: 2,
                        py: 0.5,
                        px: 2,
                        bgcolor: "background.default",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontSize: 10,
                          fontWeight: 500,
                          letterSpacing: 0.5,
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                        }}
                      >
                        resultsys.edu/teacher/dashboard
                      </Typography>
                    </Box>
                  </Box>
                  {/* Browser Content - Mock Teacher UI */}
                  <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", height: "calc(100% - 44px)", gap: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box sx={{ width: "35%", height: 14, bgcolor: "divider", borderRadius: 0.5 }} />
                      <Box sx={{ width: 50, height: 18, bgcolor: "primary.main", borderRadius: 1.5, opacity: 0.9 }} />
                    </Box>
                    <Box
                      sx={{
                        flexGrow: 1,
                        bgcolor: "background.paper",
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      {/* Attendance Mock Grid */}
                      <Box sx={{ display: "flex", gap: 1.5 }}>
                        <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: "primary.main", opacity: 0.7 }} />
                        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                          <Box sx={{ width: "40%", height: 6, bgcolor: "divider" }} />
                          <Box sx={{ width: "20%", height: 5, bgcolor: "divider" }} />
                        </Box>
                        <Box sx={{ width: 40, height: 14, bgcolor: "success.main", opacity: 0.15, borderRadius: 1 }} />
                      </Box>
                      <Box sx={{ display: "flex", gap: 1.5 }}>
                        <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: "primary.main", opacity: 0.7 }} />
                        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                          <Box sx={{ width: "50%", height: 6, bgcolor: "divider" }} />
                          <Box sx={{ width: "25%", height: 5, bgcolor: "divider" }} />
                        </Box>
                        <Box sx={{ width: 40, height: 14, bgcolor: "error.main", opacity: 0.15, borderRadius: 1 }} />
                      </Box>
                      <Box sx={{ display: "flex", gap: 1.5 }}>
                        <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: "primary.main", opacity: 0.7 }} />
                        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                          <Box sx={{ width: "45%", height: 6, bgcolor: "divider" }} />
                          <Box sx={{ width: "30%", height: 5, bgcolor: "divider" }} />
                        </Box>
                        <Box sx={{ width: 40, height: 14, bgcolor: "success.main", opacity: 0.15, borderRadius: 1 }} />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Preview 3: Student */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: "text.primary", px: 1, letterSpacing: -0.5 }}>
                  Student Dashboard
                </Typography>
                {/* Browser Mockup */}
                <Box
                  sx={{
                    borderRadius: 5,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.05), 0 1px 10px rgba(0,0,0,0.02)",
                    bgcolor: "background.default",
                    height: 280,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 30px 60px rgba(79,70,229,0.12)",
                      borderColor: "rgba(79,70,229,0.3)",
                    },
                  }}
                >
                  {/* Browser Bar */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      px: 2.5,
                      py: 1.5,
                      bgcolor: "background.paper",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 0.75 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#FF5F56" }} />
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#FFBD2E" }} />
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#27C93F" }} />
                    </Box>
                    <Box
                      sx={{
                        flexGrow: 1,
                        mx: 2,
                        py: 0.5,
                        px: 2,
                        bgcolor: "background.default",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontSize: 10,
                          fontWeight: 500,
                          letterSpacing: 0.5,
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                        }}
                      >
                        resultsys.edu/student/dashboard
                      </Typography>
                    </Box>
                  </Box>
                  {/* Browser Content - Mock Student UI */}
                  <Box sx={{ p: 2.5, display: "flex", height: "calc(100% - 44px)", gap: 2 }}>
                    {/* Left Mini details */}
                    <Box
                      sx={{
                        flex: 1,
                        bgcolor: "background.paper",
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          border: "4px solid",
                          borderColor: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 900, color: "primary.main", fontSize: 10 }}>
                          94%
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "center", width: "100%" }}>
                        <Box sx={{ width: "60%", height: 6, bgcolor: "divider", mx: "auto", mb: 0.5 }} />
                        <Box sx={{ width: "35%", height: 5, bgcolor: "divider", mx: "auto" }} />
                      </Box>
                    </Box>
                    {/* Right Grades Summary */}
                    <Box sx={{ flex: 1.2, display: "flex", flexDirection: "column", gap: 2 }}>
                      <Box
                        sx={{
                          flexGrow: 1,
                          bgcolor: "background.paper",
                          borderRadius: 3,
                          border: "1px solid",
                          borderColor: "divider",
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1.5,
                        }}
                      >
                        <Box sx={{ width: "50%", height: 8, bgcolor: "divider" }} />
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Box sx={{ width: "40%", height: 6, bgcolor: "divider" }} />
                          <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: "success.main", opacity: 0.8 }} />
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Box sx={{ width: "50%", height: 6, bgcolor: "divider" }} />
                          <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: "success.main", opacity: 0.8 }} />
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Box sx={{ width: "45%", height: 6, bgcolor: "divider" }} />
                          <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: "primary.main", opacity: 0.8 }} />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 🌟 SECTION 5: WHY SCHOOLS CHOOSE RESULTSYS (NEW SECTION) */}
      <Box
        sx={{
          py: { xs: 12, md: 16 },
          px: 2,
          bgcolor: "background.default",
          position: "relative",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 10 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 950,
                mb: 2.5,
                letterSpacing: -1.2,
                color: "text.primary",
                fontSize: { xs: "2.25rem", md: "3.25rem" },
                lineHeight: 1.1,
              }}
            >
              Why Schools Choose ResultSys
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                fontWeight: 400,
                maxWidth: 600,
                mx: "auto",
                lineHeight: 1.6,
                fontSize: { xs: "1.05rem", md: "1.25rem" },
              }}
            >
              Everything required to manage modern academic operations from a single platform.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                title: "Attendance Management",
                desc: "Real-time records of attendance logs and reports.",
                icon: <CalendarTodayIcon sx={{ fontSize: 28 }} />,
              },
              {
                title: "Result Management",
                desc: "Calculate grades, pass thresholds, and academic statistics.",
                icon: <AssignmentTurnedInIcon sx={{ fontSize: 28 }} />,
              },
              {
                title: "Student Records",
                desc: "Comprehensive profiles containing historical and academic records.",
                icon: <BadgeIcon sx={{ fontSize: 28 }} />,
              },
              {
                title: "Teacher Management",
                desc: "Coordinate courses, schedules, and class assignments dynamically.",
                icon: <SupervisorAccountIcon sx={{ fontSize: 28 }} />,
              },
              {
                title: "Audit Logs",
                desc: "Complete operational tracking for secure, authenticated revisions.",
                icon: <HistoryIcon sx={{ fontSize: 28 }} />,
              },
              {
                title: "Announcements",
                desc: "Broadcast important guidelines, timetables, and notification files.",
                icon: <CampaignIcon sx={{ fontSize: 28 }} />,
              },
            ].map((item, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card
                  elevation={0}
                  sx={{
                    p: 4,
                    height: "100%",
                    borderRadius: 5,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.02)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 20px 40px rgba(79,70,229,0.08)",
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <Box
                    sx={{
                      mb: 2.5,
                      p: 1.75,
                      bgcolor: "rgba(79,70,229,0.06)",
                      display: "inline-flex",
                      borderRadius: 4,
                      color: "primary.main",
                      background: "linear-gradient(135deg, rgba(79,70,229,0.1) 0%, rgba(79,70,229,0.02) 100%)",
                      border: "1px solid",
                      borderColor: "rgba(79,70,229,0.05)",
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, color: "text.primary", letterSpacing: -0.3 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.6, fontSize: "0.9rem" }}>
                    {item.desc}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 🌟 SECTION 6: PROFESSIONAL FOOTER */}
      <Box
        sx={{
          py: 10,
          px: { xs: 3, md: 4 },
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} justifyContent="space-between">
            {/* Branding Column */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 950,
                  color: "primary.main",
                  letterSpacing: -0.8,
                  mb: 2,
                  fontSize: "1.35rem",
                }}
              >
                ResultSys
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontWeight: 500,
                  lineHeight: 1.7,
                  mb: 4,
                  maxWidth: 400,
                  fontSize: "0.95rem",
                }}
              >
                A beautifully crafted, intelligent gateway to manage school performance. Delivering optimized result workflows for schools, teachers, and students.
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  fontWeight: 500,
                  fontSize: "0.8rem",
                  letterSpacing: 0.2,
                }}
              >
                &copy; {new Date().getFullYear()} ResultSys. Academic Result Management Platform. All rights reserved.
              </Typography>
            </Grid>

            {/* Links Column */}
            <Grid
              item
              xs={12}
              md={4}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                justifyContent: "flex-start",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: "text.primary",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  mb: 1.5,
                  fontSize: "0.8rem",
                }}
              >
                Quick Links
              </Typography>
              <Button
                component={Link}
                to="/"
                variant="text"
                sx={{
                  color: "text.secondary",
                  alignSelf: "flex-start",
                  p: 0,
                  minWidth: "unset",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "0.95rem",
                  "&:hover": { color: "primary.main", bgcolor: "transparent" },
                }}
              >
                Home
              </Button>
              <Button
                component={Link}
                to="/login"
                variant="text"
                sx={{
                  color: "text.secondary",
                  alignSelf: "flex-start",
                  p: 0,
                  minWidth: "unset",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "0.95rem",
                  "&:hover": { color: "primary.main", bgcolor: "transparent" },
                }}
              >
                Sign In
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="text"
                sx={{
                  color: "text.secondary",
                  alignSelf: "flex-start",
                  p: 0,
                  minWidth: "unset",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "0.95rem",
                  "&:hover": { color: "primary.main", bgcolor: "transparent" },
                }}
              >
                Start Registration
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

    </Box>
  );
}

export default Home;