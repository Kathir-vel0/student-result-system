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
    <span style={{ color: "#4F46E5", display: "inline-block", minWidth: 260 }}>
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
            position: "fixed", top: 16, left: 0, right: 0, zIndex: 50, px: 2,
            display: "flex", justifyContent: "center"
          }}
        >
          <Paper
            elevation={0}
            sx={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              px: 4, py: 1.5, borderRadius: 10, bgcolor: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(12px)", width: "100%", maxWidth: 1000,
              boxShadow: "0 8px 32px rgba(0,0,0,0.05)"
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: -0.5 }}>
              ResultSys
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button component={Link} to="/login" sx={{ fontWeight: 800 }}>Sign In</Button>
              <Button component={Link} to="/register" variant="contained" sx={{ borderRadius: 8, px: 3, fontWeight: 800 }}>Start</Button>
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
                fontSize: { xs: "3rem", md: "4.5rem" },
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
              sx={{ mb: 6, color: "text.secondary", fontWeight: 400, maxWidth: 650, mx: "auto", lineHeight: 1.6 }}
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
                  px: 5,
                  py: 1.8,
                  borderRadius: 8,
                  fontWeight: 800,
                  fontSize: "1.1rem",
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
          <Container maxWidth="md" sx={{ mt: 10, position: "relative", zIndex: 2 }}>
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

      {/* 🌟 FEATURES SECTION */}
      <Box sx={{ py: { xs: 8, md: 10 }, px: 2, bgcolor: "background.default", flexGrow: 1, display: "flex", alignItems: "center" }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {features.map((feat, index) => (
              <Grow in={true} timeout={1500 + index * 500} key={index}>
                <Grid item xs={12} md={4}>
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      borderRadius: 4,
                      p: 2,
                      bgcolor: "background.paper",
                      transition: "all 0.3s ease",
                      border: "1px solid",
                      borderColor: "divider",
                      "&:hover": {
                        transform: "translateY(-10px)",
                        boxShadow: "0 24px 48px rgba(79,70,229,0.12)",
                        borderColor: "primary.main"
                      }
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          mb: 2, p: 2, bgcolor: "background.default",
                          display: "inline-flex", borderRadius: 4,
                          color: "primary.main",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.3s",
                          ".MuiCard-root:hover &": {
                            transform: "scale(1.15) rotate(8deg)",
                            bgcolor: "primary.main",
                            color: "white"
                          }
                        }}
                      >
                        {feat.icon}
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "text.primary" }}>
                        {feat.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {feat.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grow>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 🌟 FOOTER */}
      <Fade in={true} timeout={3000}>
        <Box sx={{ py: 4, textAlign: "center", borderTop: "1px solid", borderColor: "divider" }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            <SecurityIcon sx={{ fontSize: 16, verticalAlign: "middle", mr: 0.5, color: "success.main" }} />
            Student Result Management System. All rights reserved.
          </Typography>
        </Box>
      </Fade>

    </Box>
  );
}

export default Home;