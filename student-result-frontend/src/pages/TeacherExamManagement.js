import { useEffect, useState } from "react";
import API from "../api/api";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CircularProgress from "@mui/material/CircularProgress";
import SendIcon from "@mui/icons-material/Send";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useToast } from "../components/ToastProvider";
import ExamTimetableView from "../components/exams/ExamTimetableView";
import { TeacherExamAnalytics } from "../components/exams/ExamAnalyticsPanel";
import { downloadExamTimetablePdf } from "../utils/examPdf";

function TeacherExamManagement() {
  const { showToast } = useToast();
  const [tab, setTab] = useState(0);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examDetail, setExamDetail] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [marksRows, setMarksRows] = useState([]);
  const [marksLoading, setMarksLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [timetable, setTimetable] = useState([]);
  const [entries, setEntries] = useState({});

  useEffect(() => {
    API.get("/exams/teacher/my-exams")
      .then((res) => setExams(res.data || []))
      .catch(() => showToast("Failed to load exams.", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => {
    if (!selectedExam) return;
    API.get(`/exams/${selectedExam}`)
      .then((res) => {
        setExamDetail(res.data);
        const mySubjects = (res.data.subjects || []).filter((s) => s.teacherId);
        if (mySubjects.length && !selectedSubjectId) {
          setSelectedSubjectId(String(mySubjects[0].subjectId));
        }
      })
      .catch(console.error);
    API.get("/exams/timetable", { params: { examId: selectedExam } })
      .then((res) => setTimetable(res.data || []))
      .catch(console.error);
  }, [selectedExam, selectedSubjectId]);

  useEffect(() => {
    if (!selectedExam || !selectedSubjectId || tab !== 1) return;
    setMarksLoading(true);
    API.get(`/exams/${selectedExam}/marks`, { params: { subjectId: selectedSubjectId, includeUnpublished: true } })
      .then((res) => {
        setMarksRows(res.data || []);
        const init = {};
        (res.data || []).forEach((r) => {
          init[r.studentId] = { marksObtained: r.marksObtained ?? "", remarks: r.remarks ?? "" };
        });
        setEntries(init);
      })
      .catch(() => showToast("Failed to load marks.", "error"))
      .finally(() => setMarksLoading(false));
  }, [selectedExam, selectedSubjectId, tab, showToast]);

  const handleSaveMarks = async () => {
    if (!selectedExam || !selectedSubjectId) return;
    setSaving(true);
    try {
      const marks = Object.entries(entries).map(([studentId, v]) => ({
        studentId,
        marksObtained: v.marksObtained === "" ? null : Number(v.marksObtained),
        remarks: v.remarks || "",
      }));
      await API.post("/exams/marks", {
        examId: Number(selectedExam),
        subjectId: Number(selectedSubjectId),
        marks,
      });
      showToast("Marks saved as draft.", "success");
    } catch {
      showToast("Failed to save marks.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedExam) return;
    try {
      await API.post(`/exams/${selectedExam}/submit-review`);
      showToast("Marks submitted for admin review.", "success");
    } catch {
      showToast("Submit failed.", "error");
    }
  };

  const mySubjects = (examDetail?.subjects || []);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>
        My Exams
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>
      ) : (
        <>
          <TextField
            select
            fullWidth
            size="small"
            label="Select exam"
            value={selectedExam || ""}
            onChange={(e) => {
              setSelectedExam(e.target.value);
              setSelectedSubjectId("");
            }}
            sx={{ maxWidth: 400, mb: 2 }}
          >
            <MenuItem value="">Choose an exam...</MenuItem>
            {exams.map((e) => (
              <MenuItem key={e.id} value={e.id}>
                {e.examName} — {e.className} {e.section}
              </MenuItem>
            ))}
          </TextField>

          {selectedExam && (
            <>
              <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                <Chip label={examDetail?.status} color="primary" size="small" />
                {examDetail?.published && <Chip label="Published" color="success" size="small" />}
              </Box>

              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label="Schedule" />
                <Tab label="Enter Marks" />
                <Tab label="Analytics" />
              </Tabs>

              {tab === 0 && (
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<PictureAsPdfIcon />}
                    sx={{ mb: 2 }}
                    onClick={() => downloadExamTimetablePdf(timetable, examDetail?.examName)}
                  >
                    Download Timetable PDF
                  </Button>
                  <ExamTimetableView entries={timetable} viewMode="grid" />
                </Box>
              )}

              {tab === 1 && (
                <Box>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Subject"
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                      >
                        {mySubjects.map((s) => (
                          <MenuItem key={s.subjectId} value={s.subjectId}>{s.subjectName}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={8} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Button variant="contained" onClick={handleSaveMarks} disabled={saving || examDetail?.published}>
                        {saving ? <CircularProgress size={20} /> : "Save Draft"}
                      </Button>
                      <Button variant="outlined" startIcon={<SendIcon />} onClick={handleSubmitReview} disabled={examDetail?.published}>
                        Submit for Review
                      </Button>
                    </Grid>
                  </Grid>

                  {marksLoading ? (
                    <CircularProgress />
                  ) : (
                    <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Student ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Marks</TableCell>
                            <TableCell>Remarks</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {marksRows.map((r) => (
                            <TableRow key={r.studentId}>
                              <TableCell>{r.studentId}</TableCell>
                              <TableCell>{r.name}</TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={entries[r.studentId]?.marksObtained ?? ""}
                                  onChange={(e) =>
                                    setEntries((prev) => ({
                                      ...prev,
                                      [r.studentId]: { ...prev[r.studentId], marksObtained: e.target.value },
                                    }))
                                  }
                                  sx={{ width: 90 }}
                                  disabled={examDetail?.published}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  value={entries[r.studentId]?.remarks ?? ""}
                                  onChange={(e) =>
                                    setEntries((prev) => ({
                                      ...prev,
                                      [r.studentId]: { ...prev[r.studentId], remarks: e.target.value },
                                    }))
                                  }
                                  disabled={examDetail?.published}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}

              {tab === 2 && (
                <TeacherExamAnalytics
                  examId={Number(selectedExam)}
                  subjectId={Number(selectedSubjectId)}
                />
              )}
            </>
          )}

          {!exams.length && (
            <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
              <Typography color="text.secondary">No exams assigned to you yet.</Typography>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}

export default TeacherExamManagement;
