import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import Fade from "@mui/material/Fade";
import Grow from "@mui/material/Grow";

import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

function StudentDashboard() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    if (!studentId) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    API.get(`/results/student/${studentId}`)
      .then((res) => {
        setResults(res.data || []);
      })
      .catch((err) => {
        console.error(err);
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const gradeToChip = (grade) => {
    const g = String(grade || "").toUpperCase();
    if (g === "A") return <Chip size="small" label="A" color="success" sx={{ fontWeight: 800 }} />;
    if (g === "B") return <Chip size="small" label="B" color="primary" sx={{ fontWeight: 800 }} />;
    if (g === "C") return <Chip size="small" label="C" color="warning" sx={{ fontWeight: 800 }} />;
    if (g === "D") return <Chip size="small" label="D" color="error" sx={{ fontWeight: 800 }} />;
    return <Chip size="small" label={g || "N/A"} sx={{ fontWeight: 800 }} />;
  };

  const stats = useMemo(() => {
    const total = results.length;
    const marks = results
      .map((r) => Number(r.marks))
      .filter((n) => Number.isFinite(n));
      
    const subjects = new Set(
      results.map((r) => r.subject?.subjectName || r.subject?.subjectCode).filter(Boolean)
    );
    const totalMarks = marks.reduce((a, b) => a + b, 0);
    const subjectsCount = subjects.size;
    
    // Average
    const avg = marks.length > 0 ? totalMarks / marks.length : 0;

    // Best Result
    const bestResult = results.reduce((best, r) => {
      const m = Number(r?.marks);
      if (!Number.isFinite(m)) return best;
      if (!best) return r;
      return m > Number(best?.marks) ? r : best;
    }, null);
    const bestMarks = bestResult && Number.isFinite(Number(bestResult.marks)) ? Number(bestResult.marks) : 0;

    const gradeCounts = results.reduce((acc, r) => {
      const g = String(r?.grade || "").toUpperCase();
      const letter = g === "A" || g === "B" || g === "C" || g === "D" ? g : g[0];
      if (letter === "A") acc.A += 1;
      else if (letter === "B") acc.B += 1;
      else if (letter === "C") acc.C += 1;
      else if (letter === "D") acc.D += 1;
      return acc;
    }, { A: 0, B: 0, C: 0, D: 0 });

    return { total, avg, subjectsCount, bestResult, bestMarks, gradeCounts, recent: results.slice(0, 4) };
  }, [results]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: "text.primary",
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
            }}
          >
            Student Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: "0.95rem", sm: "1rem" } }}>
            Welcome back! Here's an overview of your academic performance.
          </Typography>
        </Box>
      </Fade>

      {/* 🌟 STATS CARDS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grow in={true} timeout={1000}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ borderRadius: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.05)", position: "relative", overflow: "hidden" }}>
              <Box sx={{ position: "absolute", right: -20, top: -20, opacity: 0.05, transform: "scale(2.5)" }}>
                <AssignmentTurnedInIcon sx={{ fontSize: 100 }} />
              </Box>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                  <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "rgba(79,70,229,0.1)", color: "primary.main", display: "flex" }}>
                    <AssignmentTurnedInIcon />
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 800 }}>Total Results</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: "text.primary", mt: 1 }}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grow>

        <Grow in={true} timeout={1400}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ borderRadius: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.05)", position: "relative", overflow: "hidden" }}>
              <Box sx={{ position: "absolute", right: -20, top: -20, opacity: 0.05, transform: "scale(2.5)" }}>
                <TrendingUpIcon sx={{ fontSize: 100 }} />
              </Box>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                  <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "rgba(16,185,129,0.1)", color: "#10b981", display: "flex" }}>
                    <TrendingUpIcon />
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 800 }}>Average Score</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: "text.primary", mt: 1 }}>
                  {stats.avg > 0 ? stats.avg.toFixed(1) : "N/A"}<Typography component="span" variant="h6" color="text.secondary">%</Typography>
                </Typography>
                {/* Visual Progress Bar */}
                {stats.avg > 0 && (
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.avg} 
                    sx={{ mt: 2, height: 6, borderRadius: 3, bgcolor: "rgba(16,185,129,0.1)", "& .MuiLinearProgress-bar": { bgcolor: "#10b981", borderRadius: 3 } }} 
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grow>

        <Grow in={true} timeout={1800}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ borderRadius: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.05)", position: "relative", overflow: "hidden" }}>
              <Box sx={{ position: "absolute", right: -20, top: -20, opacity: 0.05, transform: "scale(2.5)" }}>
                <MenuBookIcon sx={{ fontSize: 100 }} />
              </Box>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                  <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "rgba(245,158,11,0.1)", color: "#f59e0b", display: "flex" }}>
                    <MenuBookIcon />
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 800 }}>Subjects Active</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: "text.primary", mt: 1 }}>
                  {stats.subjectsCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grow>
      </Grid>

      <Grid container spacing={4}>
        {/* 🌟 RECENT RESULTS TABLE */}
        <Grid item xs={12} md={8}>
          <Fade in={true} timeout={2200}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>Recent Activity</Typography>
              <Paper sx={{ p: 1, borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                {stats.recent.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography color="text.secondary">No result activities imported yet.</Typography>
                  </Box>
                ) : (
                  <TableContainer
                    sx={{
                      overflowX: "auto",
                      maxWidth: "100%",
                      WebkitOverflowScrolling: "touch",
                    }}
                  >
                    <Table size="small" sx={{ minWidth: 280 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800, borderBottom: "2px solid", borderColor: "divider" }}>Subject</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 800, borderBottom: "2px solid", borderColor: "divider" }}>Marks</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 800, borderBottom: "2px solid", borderColor: "divider" }}>Grade</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats.recent.map((r, idx) => (
                          <TableRow key={idx} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                            <TableCell sx={{ fontWeight: 600 }}>{r.subject?.subjectName || r.subject?.subjectCode || "N/A"}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>{r.marks}</TableCell>
                            <TableCell align="center">{gradeToChip(r.grade)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Box>
          </Fade>
        </Grid>

        {/* 🌟 HIGHLIGHTS & QUICK ACTIONS */}
        <Grid item xs={12} md={4}>
          <Fade in={true} timeout={2600}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>Highlights</Typography>
              
              <Card sx={{ borderRadius: 4, mb: 3, bgcolor: "primary.main", color: "white", boxShadow: "0 10px 30px rgba(79,70,229,0.3)" }}>
                <CardContent sx={{ position: "relative" }}>
                  <EmojiEventsIcon sx={{ position: "absolute", top: 16, right: 16, opacity: 0.2, fontSize: 60 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, opacity: 0.9 }}>Top Performing Subject</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, mt: 1 }}>
                    {stats.bestResult ? (stats.bestResult.subject?.subjectName || stats.bestResult.subject?.subjectCode) : "N/A"}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, mt: 1 }}>
                    {stats.bestMarks > 0 ? stats.bestMarks : "-"}
                  </Typography>
                </CardContent>
              </Card>

              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>Quick Portals</Typography>
              
              <Card sx={{ borderRadius: 4, mb: 2, transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)" } }}>
                <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "16px !important" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: "rgba(6,182,212,0.1)", color: "#06b6d4", display: "flex" }}>
                      <AccountCircleIcon />
                    </Box>
                    <Typography sx={{ fontWeight: 800 }}>My Profile</Typography>
                  </Box>
                  <Button component={Link} to="/view-profile" variant="outlined" size="small" sx={{ borderRadius: 6, fontWeight: 700 }}>Open</Button>
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 4, transition: "transform 0.2s", "&:hover": { transform: "translateY(-4px)" } }}>
                <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "16px !important" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: "rgba(79,70,229,0.1)", color: "primary.main", display: "flex" }}>
                      <AssignmentTurnedInIcon />
                    </Box>
                    <Typography sx={{ fontWeight: 800 }}>Full Results</Typography>
                  </Box>
                  <Button component={Link} to="/result" variant="contained" size="small" sx={{ borderRadius: 6, fontWeight: 700 }}>View</Button>
                </CardContent>
              </Card>

            </Box>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
}

export default StudentDashboard;