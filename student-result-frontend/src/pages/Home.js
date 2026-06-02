import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import SchoolIcon from "@mui/icons-material/School";
import TimelineIcon from "@mui/icons-material/Timeline";
import CheckIcon from "@mui/icons-material/Check";
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

// Subtle animated background glow behind icons
// eslint-disable-next-line no-unused-vars
const glowPulse = keyframes`
  0% { box-shadow: 0 0 10px rgba(79,70,229,0.15); }
  50% { box-shadow: 0 0 25px rgba(79,70,229,0.45); }
  100% { box-shadow: 0 0 10px rgba(79,70,229,0.15); }
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
      </Box>

      {/* 🌟 SECTION 1: BUILT FOR EVERY ROLE */}
      <Box sx={{ py: "50px", bgcolor: "background.default", position: "relative" }}>
        <Container sx={{ maxWidth: "1200px !important", margin: "0 auto", px: 3 }}>
          <Box sx={{ textAlign: "center", mb: "32px" }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 950,
                mb: 1.5,
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

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "stretch",
              gap: 4,
            }}
          >
            {/* Card 1: Admin Portal */}
            <Card
              elevation={0}
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "340px",
                maxWidth: "100%",
                minHeight: "380px",
                borderRadius: "24px",
                p: 4,
                bgcolor: "background.paper",
                border: "1px solid rgba(79, 70, 229, 0.08)",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.04)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-10px)",
                  boxShadow: "0 20px 40px rgba(79, 70, 229, 0.12)",
                  borderColor: "primary.main",
                },
                "&:hover .feature-item": {
                  transform: "translateX(6px)",
                },
              }}
            >
              <Box
                sx={{
                  mb: 2.5,
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "primary.main",
                  background: "linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(79,70,229,0.02) 100%)",
                  border: "1px solid",
                  borderColor: "rgba(79,70,229,0.1)",
                }}
              >
                <AdminPanelSettingsIcon sx={{ fontSize: 28 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 2, color: "text.primary", letterSpacing: -0.5 }}>
                Admin Portal
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flexGrow: 1, mb: 3 }}>
                {[
                  "Manage Students",
                  "Manage Teachers",
                  "Manage Subjects",
                  "Audit Logs",
                  "Announcements"
                ].map((item, idx) => (
                  <Box
                    key={idx}
                    className="feature-item"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      transitionDelay: `${idx * 40}ms`,
                    }}
                  >
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        bgcolor: "rgba(79,70,229,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <CheckIcon sx={{ fontSize: 12, color: "primary.main", fontWeight: 900 }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
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
                  fontSize: "0.9rem",
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

            {/* Card 2: Teacher Portal */}
            <Card
              elevation={0}
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "340px",
                maxWidth: "100%",
                minHeight: "380px",
                borderRadius: "24px",
                p: 4,
                bgcolor: "background.paper",
                border: "1px solid rgba(79, 70, 229, 0.08)",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.04)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-10px)",
                  boxShadow: "0 20px 40px rgba(79, 70, 229, 0.12)",
                  borderColor: "primary.main",
                },
                "&:hover .feature-item": {
                  transform: "translateX(6px)",
                },
              }}
            >
              <Box
                sx={{
                  mb: 2.5,
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "primary.main",
                  background: "linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(79,70,229,0.02) 100%)",
                  border: "1px solid",
                  borderColor: "rgba(79,70,229,0.1)",
                }}
              >
                <AssignmentIcon sx={{ fontSize: 28 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 2, color: "text.primary", letterSpacing: -0.5 }}>
                Teacher Portal
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flexGrow: 1, mb: 3 }}>
                {[
                  "Mark Attendance",
                  "Upload Results",
                  "Manage Exams",
                  "Track Student Performance"
                ].map((item, idx) => (
                  <Box
                    key={idx}
                    className="feature-item"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      transitionDelay: `${idx * 40}ms`,
                    }}
                  >
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        bgcolor: "rgba(79,70,229,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <CheckIcon sx={{ fontSize: 12, color: "primary.main", fontWeight: 900 }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
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
                  fontSize: "0.9rem",
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

            {/* Card 3: Student Portal */}
            <Card
              elevation={0}
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "340px",
                maxWidth: "100%",
                minHeight: "380px",
                borderRadius: "24px",
                p: 4,
                bgcolor: "background.paper",
                border: "1px solid rgba(79, 70, 229, 0.08)",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.04)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-10px)",
                  boxShadow: "0 20px 40px rgba(79, 70, 229, 0.12)",
                  borderColor: "primary.main",
                },
                "&:hover .feature-item": {
                  transform: "translateX(6px)",
                },
              }}
            >
              <Box
                sx={{
                  mb: 2.5,
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "primary.main",
                  background: "linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(79,70,229,0.02) 100%)",
                  border: "1px solid",
                  borderColor: "rgba(79,70,229,0.1)",
                }}
              >
                <SchoolIcon sx={{ fontSize: 28 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 2, color: "text.primary", letterSpacing: -0.5 }}>
                Student Portal
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flexGrow: 1, mb: 3 }}>
                {[
                  "View Results",
                  "Attendance Tracking",
                  "Announcements",
                  "Academic History"
                ].map((item, idx) => (
                  <Box
                    key={idx}
                    className="feature-item"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      transitionDelay: `${idx * 40}ms`,
                    }}
                  >
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        bgcolor: "rgba(79,70,229,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <CheckIcon sx={{ fontSize: 12, color: "primary.main", fontWeight: 900 }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
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
                  fontSize: "0.9rem",
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
          </Box>
        </Container>
      </Box>

      {/* 🌟 SECTION 2: HOW IT WORKS */}
      <Box
        sx={{
          py: "50px",
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderBottom: "1px solid",
          borderColor: "divider",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container sx={{ maxWidth: "1200px !important", margin: "0 auto", px: 3, position: "relative", zIndex: 2 }}>
          <Box sx={{ textAlign: "center", mb: "32px" }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 950,
                mb: 1.5,
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

          <Box
            sx={{
              position: "relative",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              maxWidth: "900px",
              mx: "auto",
              pt: 3,
              pb: 3,
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 4, sm: 2 },
            }}
          >
            {/* Desktop connecting progress line */}
            <Box
              sx={{
                position: "absolute",
                top: { xs: "auto", sm: "18px" },
                left: { xs: "18px", sm: "15%" },
                right: { xs: "auto", sm: "15%" },
                bottom: { xs: "18px", sm: "auto" },
                width: { xs: "2px", sm: "auto" },
                height: { xs: "calc(100% - 36px)", sm: "2px" },
                borderTop: { xs: "none", sm: "2px dashed rgba(79,70,229,0.25)" },
                borderLeft: { xs: "2px dashed rgba(79,70,229,0.25)", sm: "none" },
                zIndex: 1,
              }}
            />

            {/* Step 1: Admin */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "row", sm: "column" },
                alignItems: "center",
                flex: 1,
                zIndex: 2,
                textAlign: { xs: "left", sm: "center" },
                gap: { xs: 2.5, sm: 2 },
                px: 2,
              }}
            >
              {/* Circular Indicator */}
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: "0.95rem",
                  boxShadow: "0 4px 10px rgba(79,70,229,0.2)",
                  border: "4px solid",
                  borderColor: "background.paper",
                }}
              >
                1
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", alignItems: { xs: "flex-start", sm: "center" } }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, color: "text.primary" }}>
                  Admin
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.4, fontSize: "0.85rem", maxWidth: 220 }}>
                  Creates students, teachers, and subjects
                </Typography>
              </Box>
            </Box>

            {/* Step 2: Teacher */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "row", sm: "column" },
                alignItems: "center",
                flex: 1,
                zIndex: 2,
                textAlign: { xs: "left", sm: "center" },
                gap: { xs: 2.5, sm: 2 },
                px: 2,
              }}
            >
              {/* Circular Indicator */}
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: "0.95rem",
                  boxShadow: "0 4px 10px rgba(79,70,229,0.2)",
                  border: "4px solid",
                  borderColor: "background.paper",
                }}
              >
                2
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", alignItems: { xs: "flex-start", sm: "center" } }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, color: "text.primary" }}>
                  Teacher
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.4, fontSize: "0.85rem", maxWidth: 220 }}>
                  Records attendance and publishes results
                </Typography>
              </Box>
            </Box>

            {/* Step 3: Student */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "row", sm: "column" },
                alignItems: "center",
                flex: 1,
                zIndex: 2,
                textAlign: { xs: "left", sm: "center" },
                gap: { xs: 2.5, sm: 2 },
                px: 2,
              }}
            >
              {/* Circular Indicator */}
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: "0.95rem",
                  boxShadow: "0 4px 10px rgba(79,70,229,0.2)",
                  border: "4px solid",
                  borderColor: "background.paper",
                }}
              >
                3
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", alignItems: { xs: "flex-start", sm: "center" } }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, color: "text.primary" }}>
                  Student
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.4, fontSize: "0.85rem", maxWidth: 220 }}>
                  Views results, attendance, and announcements
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 🌟 SECTION 3: PLATFORM HIGHLIGHTS */}
      <Box sx={{ py: { xs: 8, md: 10 }, background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(79,70,229,0.02) 100%)", position: "relative" }}>
        <Container sx={{ maxWidth: "1200px !important", margin: "0 auto", px: 3 }}>
          <Box sx={{ textAlign: "center", mb: "48px" }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 950,
                mb: 1.5,
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

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 3,
            }}
          >
            {[
              {
                title: "Secure Authentication",
                desc: "JWT-based secure login and session verification.",
                icon: <LockIcon className="highlight-icon" sx={{ fontSize: 18, transition: "transform 0.3s ease" }} />,
                badge: "✓ Enterprise Ready",
              },
              {
                title: "Fast Performance",
                desc: "Optimized PostgreSQL queries through Supabase endpoints.",
                icon: <SpeedIcon className="highlight-icon" sx={{ fontSize: 18, transition: "transform 0.3s ease" }} />,
                badge: "✓ Optimized",
              },
              {
                title: "Analytics & Reports",
                desc: "Centralized academic dashboards and visual report lists.",
                icon: <BarChartIcon className="highlight-icon" sx={{ fontSize: 18, transition: "transform 0.3s ease" }} />,
                badge: "✓ Real-Time",
              },
              {
                title: "Responsive Design",
                desc: "Optimized interfaces displaying flawlessly on phone and desktop.",
                icon: <DevicesIcon className="highlight-icon" sx={{ fontSize: 18, transition: "transform 0.3s ease" }} />,
                badge: "✓ Cross Platform",
              },
            ].map((item, idx) => (
              <Card
                key={idx}
                elevation={0}
                sx={{
                  p: 2.5,
                  width: 280,
                  height: 180,
                  borderRadius: "20px",
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid rgba(79, 70, 229, 0.08)",
                  boxShadow: "0 8px 30px rgba(79, 70, 229, 0.08)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 50px rgba(79, 70, 229, 0.18)",
                  },
                  "&:hover .highlight-icon": {
                    transform: "scale(1.1)",
                  },
                }}
              >
                {/* Top Row: Icon + Badge */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "primary.main",
                      background: "linear-gradient(135deg, rgba(79,70,229,0.15) 0%, rgba(79,70,229,0.03) 100%)",
                      border: "1px solid rgba(79, 70, 229, 0.12)",
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box
                    sx={{
                      px: 1.25,
                      py: 0.5,
                      borderRadius: "20px",
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      bgcolor: "rgba(79,70,229,0.08)",
                      color: "primary.main",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {item.badge}
                  </Box>
                </Box>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, color: "text.primary", fontSize: "0.95rem" }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.4, fontSize: "0.75rem" }}>
                  {item.desc}
                </Typography>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* 🌟 SECTION 4: EXPLORE THE PLATFORM */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderBottom: "1px solid",
          borderColor: "divider",
          background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(79,70,229,0.01) 50%, rgba(255,255,255,0) 100%)",
        }}
      >
        <Container sx={{ maxWidth: "1200px !important", margin: "0 auto", px: 3 }}>
          <Box sx={{ textAlign: "center", mb: "48px" }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 950,
                mb: 1.5,
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

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              gap: 4,
            }}
          >
            {/* Showcase 1: Admin */}
            <Card
              elevation={0}
              sx={{
                width: "100%",
                maxWidth: "360px",
                height: "260px",
                borderRadius: "24px",
                bgcolor: "#ffffff",
                border: "1px solid rgba(79, 70, 229, 0.08)",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.04)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-12px)",
                  boxShadow: "0 20px 45px rgba(79, 70, 229, 0.15)",
                  borderColor: "primary.main",
                },
              }}
            >
              {/* Header Bar */}
              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  bgcolor: "rgba(79, 70, 229, 0.03)",
                  borderBottom: "1px solid rgba(79, 70, 229, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", gap: 0.75 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#FF5F56" }} />
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#FFBD2E" }} />
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#27C93F" }} />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: "primary.main",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                  }}
                >
                  Admin Dashboard
                </Typography>
              </Box>

              {/* Mock Dashboard Widgets */}
              <Box sx={{ p: 2, display: "flex", gap: 2, height: "calc(100% - 44px)", bgcolor: "background.paper" }}>
                {/* Left metrics column */}
                <Box sx={{ flex: 1.1, display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {/* First row of small cards */}
                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <Box sx={{ flex: 1, p: 1, border: "1px solid rgba(0,0,0,0.06)", borderRadius: "12px", bgcolor: "rgba(0,0,0,0.01)" }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: "0.65rem" }}>STUDENTS</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1, mt: 0.25, color: "primary.main" }}>1,250</Typography>
                    </Box>
                    <Box sx={{ flex: 1, p: 1, border: "1px solid rgba(0,0,0,0.06)", borderRadius: "12px", bgcolor: "rgba(0,0,0,0.01)" }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: "0.65rem" }}>TEACHERS</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1, mt: 0.25, color: "success.main" }}>48</Typography>
                    </Box>
                  </Box>
                  {/* Pass Rate Metric with progress bar */}
                  <Box sx={{ p: 1.25, border: "1px solid rgba(0,0,0,0.06)", borderRadius: "12px", bgcolor: "rgba(0,0,0,0.01)" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5, alignItems: "center" }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: "0.7rem" }}>PASS RATE</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: "primary.main" }}>94%</Typography>
                    </Box>
                    <Box sx={{ width: "100%", height: 6, bgcolor: "rgba(79,70,229,0.1)", borderRadius: 3, overflow: "hidden" }}>
                      <Box sx={{ width: "94%", height: "100%", bgcolor: "primary.main", borderRadius: 3 }} />
                    </Box>
                  </Box>
                </Box>

                {/* Right activity column */}
                <Box sx={{ flex: 0.9, p: 1.5, border: "1px solid rgba(0,0,0,0.06)", borderRadius: "12px", bgcolor: "rgba(0,0,0,0.01)", display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, fontSize: "0.65rem", letterSpacing: 0.5, mb: 0.25 }}>RECENT ACTIVITY</Typography>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "primary.main", mt: 0.75 }} />
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, display: "block", fontSize: "0.7rem", lineHeight: 1.1 }}>Exam Published</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem" }}>Grade 10 Maths</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "success.main", mt: 0.75 }} />
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, display: "block", fontSize: "0.7rem", lineHeight: 1.1 }}>Teacher Added</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem" }}>Sarah Connor</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Card>

            {/* Showcase 2: Teacher */}
            <Card
              elevation={0}
              sx={{
                width: "100%",
                maxWidth: "360px",
                height: "260px",
                borderRadius: "24px",
                bgcolor: "#ffffff",
                border: "1px solid rgba(79, 70, 229, 0.08)",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.04)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-12px)",
                  boxShadow: "0 20px 45px rgba(79, 70, 229, 0.15)",
                  borderColor: "primary.main",
                },
              }}
            >
              {/* Header Bar */}
              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  bgcolor: "rgba(79, 70, 229, 0.03)",
                  borderBottom: "1px solid rgba(79, 70, 229, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", gap: 0.75 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#FF5F56" }} />
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#FFBD2E" }} />
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#27C93F" }} />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: "primary.main",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                  }}
                >
                  Teacher Dashboard
                </Typography>
              </Box>

              {/* Mock Dashboard Widgets */}
              <Box sx={{ p: 2, display: "flex", gap: 2, height: "calc(100% - 44px)", bgcolor: "background.paper" }}>
                {/* Left Column: Attendance mini chart */}
                <Box sx={{ flex: 1, p: 1.5, border: "1px solid rgba(0,0,0,0.06)", borderRadius: "12px", bgcolor: "rgba(0,0,0,0.01)", display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, fontSize: "0.65rem", letterSpacing: 0.5 }}>WEEKLY ATTENDANCE</Typography>
                  <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around", flexGrow: 1, pt: 1, pb: 0.5 }}>
                    {[
                      { day: "M", val: 85 },
                      { day: "T", val: 92 },
                      { day: "W", val: 78 },
                      { day: "T", val: 96 },
                      { day: "F", val: 88 },
                    ].map((item, idx) => (
                      <Box key={idx} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                        <Box sx={{ width: 14, height: 60, bgcolor: "rgba(79,70,229,0.1)", borderRadius: "4px", display: "flex", alignItems: "flex-end" }}>
                          <Box sx={{ width: "100%", height: `${item.val}%`, bgcolor: "primary.main", borderRadius: "4px" }} />
                        </Box>
                        <Typography variant="caption" sx={{ fontSize: "0.6rem", fontWeight: 700, color: "text.secondary" }}>{item.day}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Right Column: Exam Status & Performance */}
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {/* Exam Status with progress bar */}
                  <Box sx={{ p: 1.25, border: "1px solid rgba(0,0,0,0.06)", borderRadius: "12px", bgcolor: "rgba(0,0,0,0.01)" }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, fontSize: "0.65rem", letterSpacing: 0.5, display: "block", mb: 0.5 }}>EXAM STATUS</Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.25, alignItems: "center" }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.7rem" }}>Physics Midterm</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "success.main" }}>85% Done</Typography>
                    </Box>
                    <Box sx={{ width: "100%", height: 5, bgcolor: "rgba(79,70,229,0.1)", borderRadius: 3, overflow: "hidden" }}>
                      <Box sx={{ width: "85%", height: "100%", bgcolor: "success.main", borderRadius: 3 }} />
                    </Box>
                  </Box>

                  {/* Class Performance */}
                  <Box sx={{ p: 1.25, border: "1px solid rgba(0,0,0,0.06)", borderRadius: "12px", bgcolor: "rgba(0,0,0,0.01)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, fontSize: "0.65rem", letterSpacing: 0.5 }}>CLASS PERFORMANCE</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "text.primary", mt: 0.25 }}>Average: 82.4%</Typography>
                    </Box>
                    <Box sx={{ bgcolor: "rgba(39,201,63,0.1)", color: "success.main", px: 1, py: 0.25, borderRadius: "6px", display: "inline-flex", alignItems: "center" }}>
                      <Typography variant="caption" sx={{ fontWeight: 900, fontSize: "0.65rem" }}>+4.2%</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Card>

            {/* Showcase 3: Student */}
            <Card
              elevation={0}
              sx={{
                width: "100%",
                maxWidth: "360px",
                height: "260px",
                borderRadius: "24px",
                bgcolor: "#ffffff",
                border: "1px solid rgba(79, 70, 229, 0.08)",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.04)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-12px)",
                  boxShadow: "0 20px 45px rgba(79, 70, 229, 0.15)",
                  borderColor: "primary.main",
                },
              }}
            >
              {/* Header Bar */}
              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  bgcolor: "rgba(79, 70, 229, 0.03)",
                  borderBottom: "1px solid rgba(79, 70, 229, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", gap: 0.75 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#FF5F56" }} />
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#FFBD2E" }} />
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#27C93F" }} />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: "primary.main",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                  }}
                >
                  Student Dashboard
                </Typography>
              </Box>

              {/* Mock Dashboard Widgets */}
              <Box sx={{ p: 2, display: "flex", gap: 2, height: "calc(100% - 44px)", bgcolor: "background.paper" }}>
                {/* Left Column: GPA score display */}
                <Box sx={{ flex: 0.9, p: 1.5, border: "1px solid rgba(0,0,0,0.06)", borderRadius: "12px", bgcolor: "rgba(0,0,0,0.01)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, fontSize: "0.65rem", letterSpacing: 0.5 }}>CUMULATIVE GPA</Typography>
                  <Box sx={{ width: 64, height: 64, borderRadius: "50%", border: "4px solid rgba(79,70,229,0.1)", borderTopColor: "primary.main", display: "flex", alignItems: "center", justifyContent: "center", my: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "primary.main", fontSize: "0.85rem" }}>3.85</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem", fontWeight: 600 }}>Scale: 4.0</Typography>
                </Box>

                {/* Right Column: Attendance & Latest Results */}
                <Box sx={{ flex: 1.1, display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {/* Attendance */}
                  <Box sx={{ p: 1.25, border: "1px solid rgba(0,0,0,0.06)", borderRadius: "12px", bgcolor: "rgba(0,0,0,0.01)" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5, alignItems: "center" }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, fontSize: "0.65rem", letterSpacing: 0.5 }}>ATTENDANCE</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: "primary.main" }}>96%</Typography>
                    </Box>
                    <Box sx={{ width: "100%", height: 5, bgcolor: "rgba(79,70,229,0.1)", borderRadius: 3, overflow: "hidden" }}>
                      <Box sx={{ width: "96%", height: "100%", bgcolor: "primary.main", borderRadius: 3 }} />
                    </Box>
                  </Box>

                  {/* Latest Results */}
                  <Box sx={{ p: 1.25, border: "1px solid rgba(0,0,0,0.06)", borderRadius: "12px", bgcolor: "rgba(0,0,0,0.01)", display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, fontSize: "0.65rem", letterSpacing: 0.5 }}>LATEST RESULTS</Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      {[
                        { sub: "Mathematics", grade: "A+" },
                        { sub: "Chemistry", grade: "A" },
                        { sub: "English Literature", grade: "B+" },
                      ].map((item, idx) => (
                        <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "0.7rem", color: "text.secondary" }}>{item.sub}</Typography>
                          <Box sx={{ bgcolor: item.grade === "B+" ? "rgba(79,70,229,0.1)" : "rgba(39,201,63,0.1)", color: item.grade === "B+" ? "primary.main" : "success.main", px: 0.75, py: 0.1, borderRadius: "4px" }}>
                            <Typography variant="caption" sx={{ fontWeight: 900, fontSize: "0.6rem" }}>{item.grade}</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* 🌟 SECTION 5: WHY SCHOOLS CHOOSE RESULTSYS (NEW SECTION) */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(79,70,229,0.015) 100%)",
          position: "relative",
        }}
      >
        <Container sx={{ maxWidth: "1200px !important", margin: "0 auto", px: 3 }}>
          <Box sx={{ textAlign: "center", mb: "48px" }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 950,
                mb: 1.5,
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

          <Grid container spacing={3} justifyContent="center">
            {[
              {
                title: "Attendance Management",
                desc: "Real-time attendance tracking",
                stat: "99% Accuracy",
                icon: <CalendarTodayIcon className="choose-icon" sx={{ fontSize: 24, transition: "transform 0.3s ease" }} />,
              },
              {
                title: "Result Management",
                desc: "Automated grade calculations",
                stat: "1000+ Results Processed",
                icon: <AssignmentTurnedInIcon className="choose-icon" sx={{ fontSize: 24, transition: "transform 0.3s ease" }} />,
              },
              {
                title: "Student Records",
                desc: "Centralized student profiles",
                stat: "1250+ Students",
                icon: <BadgeIcon className="choose-icon" sx={{ fontSize: 24, transition: "transform 0.3s ease" }} />,
              },
              {
                title: "Teacher Management",
                desc: "Faculty administration tools",
                stat: "50+ Teachers",
                icon: <SupervisorAccountIcon className="choose-icon" sx={{ fontSize: 24, transition: "transform 0.3s ease" }} />,
              },
              {
                title: "Audit Logs",
                desc: "Complete activity history",
                stat: "100% Traceability",
                icon: <HistoryIcon className="choose-icon" sx={{ fontSize: 24, transition: "transform 0.3s ease" }} />,
              },
              {
                title: "Announcements",
                desc: "Instant communication",
                stat: "Real-Time Delivery",
                icon: <CampaignIcon className="choose-icon" sx={{ fontSize: 24, transition: "transform 0.3s ease" }} />,
              },
            ].map((item, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    height: 220,
                    borderRadius: "20px",
                    background: "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(79, 70, 229, 0.03) 100%) border-box",
                    border: "1px solid transparent",
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.02)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": {
                      transform: "translateY(-10px)",
                      boxShadow: "0 20px 50px rgba(79, 70, 229, 0.18)",
                      animation: `${borderGlow} 2s infinite ease-in-out`,
                      background: "linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(135deg, rgba(79, 70, 229, 0.4) 0%, rgba(79, 70, 229, 0.1) 100%) border-box",
                    },
                    "&:hover .choose-icon": {
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      mb: 2,
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "primary.main",
                      background: "linear-gradient(135deg, rgba(79,70,229,0.15) 0%, rgba(79,70,229,0.03) 100%)",
                      border: "1px solid rgba(79, 70, 229, 0.12)",
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5, color: "text.primary", letterSpacing: -0.3 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.4, fontSize: "0.85rem", mb: 1 }}>
                    {item.desc}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "primary.main", mt: "auto", fontSize: "1.1rem", letterSpacing: "-0.3px" }}>
                    {item.stat}
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
          py: "50px",
          px: { xs: 3, md: 4 },
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container sx={{ maxWidth: "1200px !important", margin: "0 auto", px: 3 }}>
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