import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";

function Result() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");

    console.log("studentId:", studentId); // ✅ moved inside

    if (!studentId) {
      console.log("No studentId found");
      setLoading(false);
      return;
    }

    API.get(`/results/student/${studentId}`)
      .then(res => {
        console.log("Results:", res.data);
        setResults(res.data);
      })
      .catch(err => {
        console.error("Error fetching results:", err);
      })
      .finally(() => {
        setLoading(false);
      });

  }, []);

  const gradeToChip = (grade) => {
    const g = String(grade || "").toUpperCase();
    if (g === "A") return { label: g || "N/A", color: "success" };
    if (g === "B") return { label: g || "N/A", color: "primary" };
    if (g === "C") return { label: g || "N/A", color: "warning" };
    if (g === "D") return { label: g || "N/A", color: "error" };
    return { label: g || "N/A", color: "default" };
  };

  const stats = useMemo(() => {
    const marks = results
      .map((r) => Number(r?.marks))
      .filter((n) => Number.isFinite(n));

    const subjects = new Set(
      results
        .map((r) => r?.subject?.subjectName || r?.subject?.subjectCode)
        .filter(Boolean)
    );

    const totalMarks = marks.reduce((a, b) => a + b, 0);
    const subjectsCount = subjects.size;
    const maxMarks = subjectsCount * 100; // assumption: each subject is out of 100
    const percentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : null;

    const bestResult = results.reduce((best, r) => {
      const m = Number(r?.marks);
      if (!Number.isFinite(m)) return best;
      if (!best) return r;
      return m > Number(best?.marks) ? r : best;
    }, null);

    const gradeCounts = results.reduce((acc, r) => {
      const g = String(r?.grade || "").toUpperCase();
      const letter =
        g === "A" || g === "B" || g === "C" || g === "D" ? g : g[0];
      if (letter === "A") acc.A += 1;
      else if (letter === "B") acc.B += 1;
      else if (letter === "C") acc.C += 1;
      else if (letter === "D") acc.D += 1;
      return acc;
    }, { A: 0, B: 0, C: 0, D: 0 });

    const student = results[0]?.student || {};
    return {
      totalMarks,
      subjectsCount,
      maxMarks,
      percentage,
      bestResult,
      gradeCounts,
      studentMeta: {
        studentName: student?.name || "Student",
        studentId: localStorage.getItem("studentId") || student?.studentId || "N/A",
        className: student?.className || "N/A",
        section: student?.section || "",
      },
    };
  }, [results]);

  const examMeta = useMemo(() => {
    // If you later add real fields from backend, wire them here (UI only).
    return {
      examName: "Final Examination",
      academicYear: "2025-2026",
      examDate: new Date().toLocaleDateString(),
      schoolName: "School/College Name",
      teacherSignatureName: "Teacher Signature",
    };
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
        My Results
      </Typography>

      {loading ? (
        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">Loading...</Typography>
        </Paper>
      ) : results.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">No results found</Typography>
        </Paper>
      ) : (
        <>
          {/* Summary */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Total Marks
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, mt: 0.5 }}>
                    {stats.totalMarks} / {stats.maxMarks}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Percentage
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, mt: 0.5 }}>
                    {stats.percentage === null ? "N/A" : `${stats.percentage.toFixed(2)}%`}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Subjects
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, mt: 0.5 }}>
                    {stats.subjectsCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Detailed results table */}
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 4,
              mb: 3,
              overflowX: "auto",
              maxWidth: "100%",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <Table size="small" aria-label="my results table" sx={{ minWidth: 320 }}>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 900 }}>
                    Subject
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 900 }}>
                    Marks
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 900 }}>
                    Grade
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 900 }}>
                    Comment
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {results.map((r) => {
                  const chip = gradeToChip(r.grade);
                  return (
                    <TableRow key={r.id} hover>
                      <TableCell align="center">
                        {r.subject?.subjectName || r.subject?.subjectCode || "N/A"}
                      </TableCell>
                      <TableCell align="center">{r.marks}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={chip.label}
                          color={chip.color}
                          size="small"
                          sx={{ fontWeight: 900 }}
                        />
                      </TableCell>
                      <TableCell align="center">{r.comments}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Exam Marksheet + Print */}
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
            Exam Marksheet
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              onClick={() => window.print()}
              sx={{ borderRadius: 3, textTransform: "none" }}
            >
              Print / Save as PDF
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              Tip: In the print dialog, choose “Save as PDF”.
            </Typography>
          </Box>

          <style>
            {`
              @media print {
                body * { visibility: hidden !important; }
                #result-marksheet-print, #result-marksheet-print * { visibility: visible !important; }
                #result-marksheet-print {
                  display: block !important;
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  padding: 20px;
                }
              }
            `}
          </style>

          <Box id="result-marksheet-print">
            <Paper sx={{ p: 3, borderRadius: 0, border: "1px solid #e5e7eb" }}>
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  {examMeta.schoolName}
                </Typography>
                <Typography color="text.secondary">Student Marksheet</Typography>
                <Typography color="text.secondary">
                  {examMeta.examName} • {examMeta.academicYear}
                </Typography>
                <Typography color="text.secondary">{examMeta.examDate}</Typography>
              </Box>

              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">
                    Name:{" "}
                    <Box component="span" sx={{ fontWeight: 900 }}>
                      {stats.studentMeta.studentName}
                    </Box>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">
                    Student ID:{" "}
                    <Box component="span" sx={{ fontWeight: 900 }}>
                      {stats.studentMeta.studentId}
                    </Box>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">
                    Class:{" "}
                    <Box component="span" sx={{ fontWeight: 900 }}>
                      {stats.studentMeta.className}
                    </Box>
                    {stats.studentMeta.section ? (
                      <Box component="span" sx={{ fontWeight: 900 }}>
                        {" "}
                        ({stats.studentMeta.section})
                      </Box>
                    ) : null}
                  </Typography>
                </Grid>
              </Grid>

              <TableContainer
                component={Paper}
                sx={{
                  boxShadow: "none",
                  border: "1px solid #e5e7eb",
                  overflowX: "auto",
                  maxWidth: "100%",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <Table size="small" aria-label="marksheet table" sx={{ minWidth: 280 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 900 }}>Subject</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 900 }}>
                        Marks
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 900 }}>
                        Grade
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          {r.subject?.subjectName || r.subject?.subjectCode || "N/A"}
                        </TableCell>
                        <TableCell align="center">{r.marks}</TableCell>
                        <TableCell align="center">
                          {String(r.grade || "N/A").toUpperCase()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 4 }}>
                <Box sx={{ textAlign: "left" }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Marks
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    {stats.totalMarks} / {stats.maxMarks}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "left" }}>
                  <Typography variant="body2" color="text.secondary">
                    Percentage
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    {stats.percentage === null ? "N/A" : `${stats.percentage.toFixed(2)}%`}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
                <Box>
                  <Typography color="text.secondary">{examMeta.teacherSignatureName}</Typography>
                  <Box sx={{ height: 36 }} />
                </Box>
                <Box>
                  <Typography color="text.secondary">Student Signature</Typography>
                  <Box sx={{ height: 36 }} />
                </Box>
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
                (Totals assume each subject is out of 100.)
              </Typography>
            </Paper>
          </Box>
        </>
      )}
    </Box>
  );
}

export default Result;