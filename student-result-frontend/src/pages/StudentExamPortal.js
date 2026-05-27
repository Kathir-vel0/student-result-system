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
  const [selectedExam, setSelectedExam] = useState("");
  const [summary, setSummary] = useState(null);
  const [results, setResults] = useState([]);
  const [profile, setProfile] = useState(null);
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
    if (!studentId || !selectedExam) {
      setSummary(null);
      setResults([]);
      return;
    }
    const exam = exams.find((e) => String(e.id) === String(selectedExam));
    if (!exam?.published) {
      setSummary(null);
      setResults([]);
      return;
    }
    API.get(`/exams/student/${studentId}/summary/${selectedExam}`)
      .then((res) => setSummary(res.data))
      .catch(() => setSummary(null));
    API.get(`/exams/student/${studentId}/results/${selectedExam}`)
      .then((res) => setResults(res.data || []))
      .catch(console.error);
  }, [studentId, selectedExam, exams]);

  const handleHallTicket = () => {
    const exam = exams.find((e) => String(e.id) === String(selectedExam));
    const examTimetable = timetable.filter((t) => String(t.examId) === String(selectedExam));
    downloadHallTicketPdf(profile || { studentId }, exam, examTimetable);
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
                startIcon={<BadgeIcon />}
                sx={{ mb: 2 }}
                disabled={!selectedExam}
                onClick={handleHallTicket}
              >
                Download Hall Ticket
              </Button>
              <TextField
                select
                size="small"
                label="Exam for hall ticket"
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
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
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                sx={{ maxWidth: 400, mb: 2 }}
              >
                <MenuItem value="">Select exam...</MenuItem>
                {publishedExams.map((e) => (
                  <MenuItem key={e.id} value={e.id}>{e.examName}</MenuItem>
                ))}
              </TextField>

              {!selectedExam && (
                <Paper sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    Results appear here after your admin publishes them.
                  </Typography>
                </Paper>
              )}

              {summary && (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6} md={3}>
                    <Card sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">Percentage</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>{summary.percentage}%</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">Grade</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>{summary.grade}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">GPA</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>{summary.gpa}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={() => downloadExamReportCardPdf(summary)}
                      sx={{ height: "100%", borderRadius: 3 }}
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
