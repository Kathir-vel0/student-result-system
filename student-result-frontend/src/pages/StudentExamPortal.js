import { useEffect, useState } from "react";
import API from "../api/api";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import BadgeIcon from "@mui/icons-material/Badge";
import { useToast } from "../components/ToastProvider";
import ExamTimetableView from "../components/exams/ExamTimetableView";
import { StudentExamAnalytics } from "../components/exams/ExamAnalyticsPanel";
import { downloadExamReportCardPdf, downloadHallTicketPdf } from "../utils/examPdf";

function StudentExamPortal() {
  const { showToast } = useToast();
  const studentId = localStorage.getItem("studentId");
  const [tab, setTab] = useState(0);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timetable, setTimetable] = useState([]);
  const [selectedTimetableExam, setSelectedTimetableExam] = useState("");
  const [selectedResultsExam, setSelectedResultsExam] = useState("");
  const [summary, setSummary] = useState(null);
  const [results, setResults] = useState([]);
  const [profile, setProfile] = useState(null);
  const [downloadingHallTicket, setDownloadingHallTicket] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    Promise.all([
      API.get(`/exams/student/${studentId}/exams`),
      API.get("/exams/notifications"),
      API.get(`/students/user/${localStorage.getItem("userId")}`).catch(() => ({ data: null })),
    ])
      .then(([examsRes, notifRes, profileRes]) => {
        setExams(examsRes.data || []);
        setNotifications(notifRes.data || []);
        setProfile(profileRes.data);
      })
      .catch(() => showToast("Failed to load exam data.", "error"))
      .finally(() => setLoading(false));
  }, [studentId, showToast]);

  useEffect(() => {
    if (!studentId) return;
    API.get("/exams/timetable", {
      params: { className: profile?.className, section: profile?.section },
    })
      .then((res) => setTimetable(res.data || []))
      .catch(console.error);
  }, [studentId, profile]);

  useEffect(() => {
    if (!studentId || !selectedResultsExam) {
      setSummary(null);
      setResults([]);
      return;
    }
    const exam = exams.find((e) => String(e.id) === String(selectedResultsExam));
    if (!exam?.published) {
      setSummary(null);
      setResults([]);
      return;
    }
    API.get(`/exams/student/${studentId}/summary/${selectedResultsExam}`)
      .then((res) => setSummary(res.data))
      .catch(() => setSummary(null));
    API.get(`/exams/student/${studentId}/results/${selectedResultsExam}`)
      .then((res) => setResults(res.data || []))
      .catch(console.error);
  }, [studentId, selectedResultsExam, exams]);

  const handleHallTicket = async () => {
    if (!selectedTimetableExam) {
      showToast("Please select an exam first.", "warning");
      return;
    }
    const exam = exams.find((e) => String(e.id) === String(selectedTimetableExam));
    if (!exam) {
      showToast("Selected exam not found.", "error");
      return;
    }
    
    // Explicit student class & section assignment validation
    const studentClass = profile?.className;
    const studentSection = profile?.section;
    if (studentClass && studentSection && (exam.className !== studentClass || exam.section !== studentSection)) {
      showToast("You are not eligible for this exam's hall ticket.", "error");
      return;
    }

    const examTimetable = timetable.filter((t) => String(t.examId) === String(selectedTimetableExam));
    if (examTimetable.length === 0) {
      showToast("No timetable exists for this exam. Hall ticket cannot be generated.", "warning");
      return;
    }

    setDownloadingHallTicket(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const studentProfile = {
        name: profile?.name || localStorage.getItem("username") || "Student",
        studentId: profile?.studentId || studentId || localStorage.getItem("studentId") || "N/A",
        className: profile?.className || "N/A",
        section: profile?.section || "N/A"
      };

      downloadHallTicketPdf(studentProfile, exam, examTimetable);
      showToast("Hall ticket downloaded successfully.", "success");
    } catch (err) {
      console.error("Hall ticket generation failed:", err);
      showToast("Failed to generate hall ticket. Please try again.", "error");
    } finally {
      setDownloadingHallTicket(false);
    }
  };

  const publishedExams = exams.filter((e) => e.published);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>
        My Exams
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>
      ) : (
        <>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Timetable" />
            <Tab label="Results" />
            <Tab label="Analytics" />
            <Tab label={`Notifications (${notifications.length})`} />
          </Tabs>

          {tab === 0 && (
            <Box>
              <Button
                variant="outlined"
                startIcon={downloadingHallTicket ? <CircularProgress size={16} /> : <BadgeIcon />}
                sx={{ mb: 2 }}
                disabled={!selectedTimetableExam || downloadingHallTicket}
                onClick={handleHallTicket}
              >
                {downloadingHallTicket ? "Generating..." : "Download Hall Ticket"}
              </Button>
              <TextField
                select
                size="small"
                label="Exam for hall ticket"
                value={selectedTimetableExam}
                onChange={(e) => setSelectedTimetableExam(e.target.value)}
                sx={{ ml: 2, minWidth: 200, mb: 2 }}
              >
                {exams.map((e) => (
                  <MenuItem key={e.id} value={e.id}>{e.examName}</MenuItem>
                ))}
              </TextField>
              <ExamTimetableView entries={timetable} viewMode="grid" />
            </Box>
          )}

          {tab === 1 && (
            <Box>
              <TextField
                select
                fullWidth
                size="small"
                label="Published exam results"
                value={selectedResultsExam}
                onChange={(e) => setSelectedResultsExam(e.target.value)}
                sx={{ maxWidth: 400, mb: 2 }}
              >
                <MenuItem value="">Select exam...</MenuItem>
                {publishedExams.map((e) => (
                  <MenuItem key={e.id} value={e.id}>{e.examName}</MenuItem>
                ))}
              </TextField>

              {!selectedResultsExam && (
                <Paper sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    Results appear here after your admin publishes them.
                  </Typography>
                </Paper>
              )}

              {summary && (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">Total Marks</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>{summary.totalMarks} / {summary.maxMarks}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">Percentage</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>{summary.percentage}%</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">Grade / GPA</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>{summary.grade} ({summary.gpa})</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">Status</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: summary.status === "FAILED" ? "error.main" : "success.main" }}>
                          {summary.status || "N/A"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={() => downloadExamReportCardPdf(summary)}
                      sx={{ height: "100%", py: { xs: 1.5, md: 0 }, borderRadius: 3 }}
                    >
                      Report PDF
                    </Button>
                  </Grid>
                </Grid>
              )}

              {results.length > 0 && (
                <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Subject</TableCell>
                        <TableCell>Marks</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Remarks</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {results.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell>{r.subjectName}</TableCell>
                          <TableCell>{r.marksObtained}</TableCell>
                          <TableCell><Chip size="small" label={r.grade} color="primary" /></TableCell>
                          <TableCell>{r.remarks || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {tab === 2 && studentId && <StudentExamAnalytics studentId={studentId} />}

          {tab === 3 && (
            <Box>
              {notifications.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
                  <Typography color="text.secondary">No notifications yet.</Typography>
                </Paper>
              ) : (
                notifications.map((n) => (
                  <Card key={n.id} sx={{ mb: 1.5, borderRadius: 3 }}>
                    <CardContent>
                      <Typography fontWeight={800}>{n.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{n.message}</Typography>
                      <Typography variant="caption" color="text.disabled">{n.createdAt}</Typography>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default StudentExamPortal;
