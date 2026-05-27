import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../api/api";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { useToast } from "../components/ToastProvider";
import { downloadExamReportCardPdf } from "../utils/examPdf";

function ViewResults() {
  const { showToast } = useToast();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingExams, setLoadingExams] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch unique classes from students
  const loadClasses = useCallback(async () => {
    setLoading(true);
    try {
      const studentsRes = await API.get("/students");
      const classSet = new Set();
      for (const s of studentsRes.data || []) {
        if (s?.className) classSet.add(String(s.className));
      }
      const classList = Array.from(classSet).sort();
      setClasses(classList);
    } catch (err) {
      console.error("ERROR loading classes:", err);
      showToast("Failed to load unique classes.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // Load published exams when class is selected
  useEffect(() => {
    if (!selectedClass) {
      setExams([]);
      setSelectedExam("");
      return;
    }
    setLoadingExams(true);
    API.get("/exams/page", {
      params: { status: "PUBLISHED", className: selectedClass, size: 100 }
    })
      .then((res) => {
        setExams(res.data?.content || []);
        setSelectedExam("");
      })
      .catch((err) => {
        console.error("ERROR loading exams:", err);
        setExams([]);
      })
      .finally(() => setLoadingExams(false));
  }, [selectedClass]);

  const handleSearch = async () => {
    if (!selectedClass || !selectedExam) {
      showToast("Please select both class and exam.", "warning");
      return;
    }
    setSearching(true);
    setSearched(false);
    try {
      const res = await API.get("/results/published", {
        params: { className: selectedClass, examId: selectedExam }
      });
      setResults(res.data || []);
      setSearched(true);
    } catch (err) {
      console.error("ERROR searching results:", err);
      showToast("Failed to fetch published results.", "error");
    } finally {
      setSearching(false);
    }
  };

  const handleViewSubjects = (studentData) => {
    setSelectedStudent(studentData);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedStudent(null);
  };

  const overallGrade = (pct) => {
    if (pct >= 90) return "A+";
    if (pct >= 80) return "A";
    if (pct >= 70) return "B";
    if (pct >= 60) return "C";
    if (pct >= 50) return "D";
    return "F";
  };

  const handleDownloadPdf = (data) => {
    const examName = exams.find(e => String(e.id) === String(selectedExam))?.examName || "Exam";
    const summary = {
      examName: examName,
      percentage: data.percentage,
      grade: overallGrade(data.percentage),
      gpa: data.gpa,
      subjects: data.results.map((r) => ({
        subjectCode: r.subject?.subjectCode || "N/A",
        subjectName: r.subject?.subjectName || "N/A",
        marksObtained: r.marks,
        maxMarks: r.maxMarks || 100,
        grade: r.grade,
        remarks: r.comments || "",
      })),
    };
    downloadExamReportCardPdf(summary);
    showToast(`PDF report card downloaded for ${data.student?.name}`, "success");
  };

  const handlePrintResult = (data) => {
    const examName = exams.find(e => String(e.id) === String(selectedExam))?.examName || "Exam";
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Student Report Card - ${data.student?.name}</title>
          <style>
            body { font-family: 'Segoe UI', Inter, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: 800; color: #4f46e5; margin: 0; }
            .subtitle { font-size: 11px; color: #64748b; margin-top: 5px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 30px 0; font-size: 14px; }
            .meta-item { line-height: 1.7; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 13px; }
            th { background-color: #f8fafc; font-weight: 700; color: #475569; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
            .badge-success { background-color: #dcfce7; color: #15803d; }
            .badge-error { background-color: #fee2e2; color: #b91c1c; }
            .signatures { display: flex; justify-content: space-between; margin-top: 80px; font-size: 13px; }
            .sig-line { border-top: 1px dashed #94a3b8; width: 200px; text-align: center; padding-top: 8px; font-weight: 600; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">ResultSys Education Network</h1>
            <div class="subtitle">OFFICIAL SEMESTER REPORT CARD</div>
          </div>
          <div class="meta-grid">
            <div class="meta-item">
              <strong>Student Name:</strong> ${data.student?.name}<br>
              <strong>Student ID:</strong> ${data.student?.studentId}<br>
              <strong>Class/Section:</strong> Class ${data.student?.className} - ${data.student?.section || "A"}
            </div>
            <div class="meta-item" style="text-align: right;">
              <strong>Exam Name:</strong> ${examName}<br>
              <strong>Percentage:</strong> ${data.percentage}%<br>
              <strong>GPA / Grade:</strong> ${data.gpa} (Grade: ${overallGrade(data.percentage)})<br>
              <strong>Status:</strong> <span class="badge ${data.status === "PASSED" ? "badge-success" : "badge-error"}">${data.status}</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Subject Code</th>
                <th>Subject Name</th>
                <th>Marks Obtained</th>
                <th>Max Marks</th>
                <th>Grade</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${data.results.map(r => `
                <tr>
                  <td>${r.subject?.subjectCode || "N/A"}</td>
                  <td>${r.subject?.subjectName || "N/A"}</td>
                  <td>${r.marks}</td>
                  <td>${r.maxMarks || 100}</td>
                  <td><strong>${r.grade}</strong></td>
                  <td>${r.comments || "—"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div class="signatures">
            <div class="sig-line">Class Teacher Signature</div>
            <div class="sig-line">Principal Signature</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    showToast(`Print layout triggered for ${data.student?.name}`, "success");
  };

  const groupedStudents = useMemo(() => {
    const map = {};
    results.forEach((r) => {
      const sId = r.student?.studentId || r.student?.id;
      if (!sId) return;
      if (!map[sId]) {
        map[sId] = {
          student: r.student,
          results: [],
          totalMarks: 0,
          totalMaxMarks: 0,
          count: 0,
        };
      }
      map[sId].results.push(r);
      const m = Number(r.marks);
      const mm = Number(r.maxMarks || 100);
      if (!isNaN(m)) {
        map[sId].totalMarks += m;
        map[sId].totalMaxMarks += mm;
      }
      map[sId].count += 1;
    });

    const studentList = Object.values(map);

    studentList.forEach((data) => {
      const percentage = data.totalMaxMarks > 0 ? (data.totalMarks / data.totalMaxMarks) * 100 : 0;
      data.percentage = Number(percentage.toFixed(2));
      data.gpa = Number((percentage / 25).toFixed(2));
      
      const hasFailedSubject = data.results.some(r => Number(r.marks) < Number(r.passMarks || 35));
      data.status = hasFailedSubject ? "FAILED" : "PASSED";
    });

    studentList.sort((a, b) => b.percentage - a.percentage);
    let currentRank = 1;
    for (let i = 0; i < studentList.length; i++) {
      if (i > 0 && studentList[i].percentage < studentList[i - 1].percentage) {
        currentRank = i + 1;
      }
      studentList[i].rank = currentRank;
    }

    return studentList;
  }, [results]);

  const examName = exams.find(e => String(e.id) === String(selectedExam))?.examName || "Exam";

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 900,
          mb: 2,
          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
        }}
      >
        Published Results Dashboard
      </Typography>

      {/* Cascading Filter Bar */}
      <Paper sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 4, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Select Class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              sx={{ bgcolor: 'background.paper' }}
              disabled={loading}
            >
              <MenuItem value="" disabled>
                <em>Select Class</em>
              </MenuItem>
              {classes.map((c) => (
                <MenuItem key={c} value={c}>
                  Class {c}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Select Exam"
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              sx={{ bgcolor: 'background.paper' }}
              disabled={loadingExams || !selectedClass}
            >
              <MenuItem value="" disabled>
                <em>Select Exam</em>
              </MenuItem>
              {exams.map((ex) => (
                <MenuItem key={ex.id} value={ex.id}>
                  {ex.examName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{ borderRadius: 3, px: 3, py: 1.75, width: "100%", fontWeight: 800 }}
              disabled={searching || !selectedClass || !selectedExam}
            >
              {searching ? <CircularProgress size={24} color="inherit" /> : "Search"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Roster Table Presentation */}
      {!searched ? (
        <Paper sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
          <Typography>Select Class, Published Exam, and click Search to view student results.</Typography>
        </Paper>
      ) : groupedStudents.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
          <Typography sx={{ fontWeight: 700, color: "error.main" }}>No published results found</Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 4,
            overflowX: "auto",
            maxWidth: "100%",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          <Table size="medium" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell align="left" sx={{ fontWeight: 800 }}>Student Name</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>Exam Name</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>Percentage</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>GPA</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>Rank</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>Published Badge</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {groupedStudents.map((data, index) => (
                <TableRow key={index} hover>
                  <TableCell align="left" sx={{ fontWeight: 600 }}>{data.student?.name || "N/A"}</TableCell>
                  <TableCell align="center">{examName}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>{data.percentage}%</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>{data.gpa}</TableCell>
                  <TableCell align="center">
                    <Chip label={`Rank ${data.rank}`} variant="outlined" color="primary" size="small" sx={{ fontWeight: 800 }} />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={data.status}
                      color={data.status === "PASSED" ? "success" : "error"}
                      size="small"
                      sx={{ fontWeight: 900, borderRadius: 2 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip label="Published" color="success" size="small" variant="contained" sx={{ fontWeight: 800 }} />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "inline-flex", gap: 1 }}>
                      <Button variant="outlined" size="small" onClick={() => handleViewSubjects(data)} sx={{ borderRadius: 2 }}>
                        View
                      </Button>
                      <Button variant="contained" size="small" color="primary" onClick={() => handleDownloadPdf(data)} sx={{ borderRadius: 2 }}>
                        PDF
                      </Button>
                      <Button variant="outlined" size="small" color="secondary" onClick={() => handlePrintResult(data)} sx={{ borderRadius: 2 }}>
                        Print
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Granular Marks Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>
          {selectedStudent?.student?.name}'s Subject Marks
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer component={Paper} elevation={0} sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Subject Code</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Subject Name</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Marks Obtained</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Max Marks</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Grade</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedStudent?.results.map((r, i) => {
                  const gradeColor = r.grade === "F" ? "error" : "success";
                  return (
                    <TableRow key={i}>
                      <TableCell>{r.subject?.subjectCode || "N/A"}</TableCell>
                      <TableCell>{r.subject?.subjectName || "N/A"}</TableCell>
                      <TableCell>{r.marks}</TableCell>
                      <TableCell>{r.maxMarks || 100}</TableCell>
                      <TableCell>
                        <Chip label={r.grade || "N/A"} color={gradeColor} size="small" sx={{ fontWeight: 900 }} />
                      </TableCell>
                      <TableCell>{r.comments || "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDownloadPdf(selectedStudent)} variant="outlined" size="small">
            Download PDF
          </Button>
          <Button onClick={() => handlePrintResult(selectedStudent)} variant="outlined" size="small">
            Print Result
          </Button>
          <Button onClick={closeDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ViewResults;