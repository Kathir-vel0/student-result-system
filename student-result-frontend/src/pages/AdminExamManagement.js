import { useCallback, useEffect, useState } from "react";
import API from "../api/api";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
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
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PublishIcon from "@mui/icons-material/Publish";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import { useToast } from "../components/ToastProvider";
import ListToolbar from "../components/common/ListToolbar";
import PaginationControls from "../components/common/PaginationControls";
import usePaginatedList from "../hooks/usePaginatedList";
import ExamTimetableView from "../components/exams/ExamTimetableView";
import { AdminExamAnalytics } from "../components/exams/ExamAnalyticsPanel";
import { downloadExamTimetablePdf } from "../utils/examPdf";

const STATUSES = ["DRAFT", "SCHEDULED", "ONGOING", "COMPLETED", "PUBLISHED"];
const STATUS_COLOR = { DRAFT: "default", SCHEDULED: "info", ONGOING: "warning", COMPLETED: "secondary", PUBLISHED: "success" };

const emptyExam = {
  examName: "",
  examType: "Term",
  className: "",
  section: "",
  startDate: "",
  endDate: "",
  status: "DRAFT",
  subjects: [{ subjectId: "", teacherId: "", examDate: "", startTime: "09:00", endTime: "12:00", totalMarks: 100, maxMarks: 100, passMarks: 35, roomNumber: "" }],
};

function AdminExamManagement() {
  const { showToast } = useToast();
  const [tab, setTab] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyExam);
  const [saving, setSaving] = useState(false);
  const [timetable, setTimetable] = useState([]);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyForm, setNotifyForm] = useState({ title: "", message: "", targetRole: "ALL", examId: "" });

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [deletingExam, setDeletingExam] = useState(false);

  const [confirmPublishOpen, setConfirmPublishOpen] = useState(false);
  const [examToPublish, setExamToPublish] = useState(null);
  const [publishingExam, setPublishingExam] = useState(false);

  const paginated = usePaginatedList("/exams/page", {
    defaultSize: 10,
    extraParams: { className: "", section: "", status: "", fromDate: "", toDate: "" },
  });

  useEffect(() => {
    Promise.all([API.get("/subjects/all"), API.get("/teachers/all")])
      .then(([s, t]) => {
        setSubjects(s.data || []);
        setTeachers(t.data || []);
      })
      .catch(console.error);
  }, []);

  const loadTimetable = useCallback(async (examId) => {
    setTimetableLoading(true);
    try {
      const params = examId ? { examId } : {};
      const res = await API.get("/exams/timetable", { params });
      setTimetable(res.data || []);
    } catch {
      showToast("Failed to load timetable.", "error");
    } finally {
      setTimetableLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (tab === 1) {
      loadTimetable(selectedExamId);
    }
  }, [tab, selectedExamId, loadTimetable]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyExam);
    setDialogOpen(true);
  };

  const openEdit = async (id) => {
    setEditing(id);
    try {
      const res = await API.get(`/exams/${id}`);
      const ex = res.data;
      setForm({
        examName: ex.examName || "",
        examType: ex.examType || "Term",
        className: ex.className || "",
        section: ex.section || "",
        startDate: ex.startDate || "",
        endDate: ex.endDate || "",
        status: ex.status || "DRAFT",
        subjects: ex.subjects?.length
          ? ex.subjects.map((s) => ({
              subjectId: s.subject?.id || "",
              teacherId: s.teacher?.id || "",
              examDate: s.examDate || "",
              startTime: s.startTime?.substring(0, 5) || "09:00",
              endTime: s.endTime?.substring(0, 5) || "12:00",
              totalMarks: s.totalMarks ?? 100,
              maxMarks: s.totalMarks ?? 100,
              passMarks: s.passMarks ?? 35,
              roomNumber: s.roomNumber || "",
            }))
          : [{ subjectId: "", teacherId: "", examDate: "", startTime: "09:00", endTime: "12:00", totalMarks: 100, maxMarks: 100, passMarks: 35, roomNumber: "" }],
      });
      setDialogOpen(true);
    } catch {
      showToast("Failed to fetch exam details.", "error");
    }
  };

  const handleSave = async () => {
    if (!form.examName || !form.className) {
      showToast("Exam Name and Class are required.", "warning");
      return;
    }

    const seenSubjects = new Set();
    for (let i = 0; i < form.subjects.length; i++) {
      const s = form.subjects[i];
      
      // 1. Subject ID check
      if (!s.subjectId) {
        showToast(`Subject is required and cannot be empty at row ${i + 1}.`, "warning");
        return;
      }
      
      // 2. Duplicate check
      const subIdNum = Number(s.subjectId);
      if (seenSubjects.has(subIdNum)) {
        showToast("Duplicate subject schedules are not allowed in the same exam.", "warning");
        return;
      }
      seenSubjects.add(subIdNum);

      // 3. Subject Exam Date check
      if (s.examDate) {
        if (form.startDate && s.examDate < form.startDate) {
          showToast(`Subject exam date must be within exam duration at row ${i + 1}.`, "warning");
          return;
        }
        if (form.endDate && s.examDate > form.endDate) {
          showToast(`Subject exam date must be within exam duration at row ${i + 1}.`, "warning");
          return;
        }
      }

      // 4. Pass marks vs total marks check
      const total = s.totalMarks ?? s.maxMarks ?? 100;
      const pass = s.passMarks ?? 35;
      if (pass >= total) {
        showToast(`Pass marks (${pass}) cannot exceed or equal total marks (${total}) at row ${i + 1}.`, "warning");
        return;
      }

      // 5. Time constraint check
      if (s.startTime && s.endTime) {
        if (s.startTime >= s.endTime) {
          showToast(`Subject exam start time must be before end time at row ${i + 1}.`, "warning");
          return;
        }
      }
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        subjects: form.subjects.map((s) => {
          const total = s.totalMarks ?? s.maxMarks ?? 100;
          return {
            ...s,
            subjectId: Number(s.subjectId),
            teacherId: s.teacherId ? Number(s.teacherId) : null,
            totalMarks: total,
            maxMarks: total,
          };
        }),
      };
      if (editing) {
        await API.put(`/exams/${editing}`, payload);
        showToast("Exam updated.", "success");
      } else {
        await API.post("/exams", payload);
        showToast("Exam created.", "success");
      }
      setDialogOpen(false);
      paginated.refresh();
    } catch (err) {
      showToast(err.response?.data?.message || "Save failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const triggerDeleteConfirm = (exam) => {
    setExamToDelete(exam);
    setConfirmDeleteOpen(true);
  };

  const executeDelete = async () => {
    if (!examToDelete) return;
    setDeletingExam(true);
    try {
      await API.delete(`/exams/${examToDelete.id}`);
      showToast("Exam deleted successfully.", "success");
      paginated.refresh();
      setConfirmDeleteOpen(false);
    } catch (err) {
      console.error("DELETE EXAM FAILED:", {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
        data: err.response?.data,
      });
      showToast(err.response?.data?.message || "Delete failed. Server error while deleting exam.", "error");
    } finally {
      setDeletingExam(false);
      setExamToDelete(null);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await API.patch(`/exams/${id}/status`, { status });
      showToast(`Status set to ${status}.`, "success");
      paginated.refresh();
    } catch {
      showToast("Status update failed.", "error");
    }
  };

  const triggerPublishConfirm = (exam) => {
    setExamToPublish(exam);
    setConfirmPublishOpen(true);
  };

  const executePublish = async () => {
    if (!examToPublish) return;
    setPublishingExam(true);
    try {
      await API.post(`/exams/${examToPublish.id}/publish`);
      showToast("All exam results published successfully.", "success");
      paginated.refresh();
      setConfirmPublishOpen(false);
    } catch (err) {
      console.error("PUBLISH EXAM FAILED:", {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
        data: err.response?.data,
      });
      showToast(err.response?.data?.message || "Publish failed. Server error while publishing results.", "error");
    } finally {
      setPublishingExam(false);
      setExamToPublish(null);
    }
  };

  const sendNotification = async () => {
    try {
      await API.post("/exams/notifications", {
        ...notifyForm,
        examId: notifyForm.examId ? Number(notifyForm.examId) : null,
      });
      showToast("Announcement sent.", "success");
      setNotifyOpen(false);
    } catch {
      showToast("Failed to send notification.", "error");
    }
  };

  const updateSubjectRow = (idx, field, value) => {
    setForm((prev) => {
      const subjects = [...prev.subjects];
      subjects[idx] = { ...subjects[idx], [field]: value };
      return { ...prev, subjects };
    });
  };

  const removeSubjectRow = (idx) => {
    setForm((prev) => {
      const subjects = prev.subjects.filter((_, i) => i !== idx);
      return { ...prev, subjects };
    });
  };

  const handleStartDateChange = (newStart) => {
    setForm((prev) => {
      const updatedSubjects = prev.subjects.map((sub) => {
        if (sub.examDate && newStart && sub.examDate < newStart) {
          return { ...sub, examDate: "" };
        }
        return sub;
      });
      return { ...prev, startDate: newStart, subjects: updatedSubjects };
    });
  };

  const handleEndDateChange = (newEnd) => {
    setForm((prev) => {
      const updatedSubjects = prev.subjects.map((sub) => {
        if (sub.examDate && newEnd && sub.examDate > newEnd) {
          return { ...sub, examDate: "" };
        }
        return sub;
      });
      return { ...prev, endDate: newEnd, subjects: updatedSubjects };
    });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          Exam Management
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button variant="outlined" onClick={() => setNotifyOpen(true)} sx={{ borderRadius: 2 }}>
            Announcement
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} sx={{ borderRadius: 2 }}>
            Create Exam
          </Button>
        </Box>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Exams" />
        <Tab label="Timetable" />
        <Tab label="Analytics" />
      </Tabs>

      {tab === 0 && (
        <>
          <ListToolbar
            search={paginated.filters.search || ""}
            onSearchChange={(v) => paginated.updateFilter("search", v)}
            onSearch={paginated.refresh}
            onReset={paginated.resetFilters}
            searchPlaceholder="Search exams..."
          >
            <Grid item xs={6} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status"
                value={paginated.filters.status || ""}
                onChange={(e) => paginated.updateFilter("status", e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Class"
                value={paginated.filters.className || ""}
                onChange={(e) => paginated.updateFilter("className", e.target.value)}
              />
            </Grid>
          </ListToolbar>

          {paginated.loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Exam</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Dates</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.data.map((e) => (
                    <TableRow key={e.id} hover>
                      <TableCell>
                        <Typography fontWeight={700}>{e.examName}</Typography>
                        <Typography variant="caption" color="text.secondary">{e.examType}</Typography>
                      </TableCell>
                      <TableCell>{e.className} {e.section}</TableCell>
                      <TableCell>{e.startDate} – {e.endDate}</TableCell>
                      <TableCell>
                        <Chip size="small" label={e.status} color={STATUS_COLOR[e.status] || "default"} />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => openEdit(e.id)}><EditIcon /></IconButton>
                        <IconButton size="small" color="error" onClick={() => triggerDeleteConfirm(e)}><DeleteIcon /></IconButton>
                        {!e.published && e.status === "COMPLETED" && (
                          <IconButton size="small" color="success" onClick={() => triggerPublishConfirm(e)} title="Publish results">
                            <PublishIcon />
                          </IconButton>
                        )}
                        <TextField
                          select
                          size="small"
                          value={e.status}
                          onChange={(ev) => handleStatus(e.id, ev.target.value)}
                          sx={{ width: 120, ml: 1 }}
                        >
                          {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </TextField>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <PaginationControls
            page={paginated.page}
            totalPages={paginated.totalPages}
            totalElements={paginated.totalElements}
            onPageChange={paginated.setPage}
          />
        </>
      )}

      {tab === 1 && (
        <Box>
          <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
            <TextField
              select
              size="small"
              label="Filter by exam"
              value={selectedExamId || ""}
              onChange={(e) => setSelectedExamId(e.target.value || null)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All exams</MenuItem>
              {paginated.data.map((e) => (
                <MenuItem key={e.id} value={e.id}>{e.examName}</MenuItem>
              ))}
            </TextField>
            <Button
              variant="outlined"
              startIcon={<PictureAsPdfIcon />}
              onClick={() => downloadExamTimetablePdf(timetable, "Schedule")}
            >
              Export PDF
            </Button>
          </Box>
          <ExamTimetableView entries={timetable} loading={timetableLoading} />
        </Box>
      )}

      {tab === 2 && (
        <Box>
          <TextField
            select
            size="small"
            label="Select exam for analytics"
            value={selectedExamId || ""}
            onChange={(e) => setSelectedExamId(Number(e.target.value) || null)}
            sx={{ minWidth: 280, mb: 2 }}
          >
            <MenuItem value="">Choose exam...</MenuItem>
            {paginated.data.map((e) => (
              <MenuItem key={e.id} value={e.id}>{e.examName}</MenuItem>
            ))}
          </TextField>
          <AdminExamAnalytics examId={selectedExamId} />
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? "Edit Exam" : "Create Exam"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Exam Name" value={form.examName} onChange={(e) => setForm({ ...form, examName: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Exam Type" value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })} />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField fullWidth label="Class" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField fullWidth label="Section" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField fullWidth type="date" label="Start" InputLabelProps={{ shrink: true }} value={form.startDate} onChange={(e) => handleStartDateChange(e.target.value)} />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField fullWidth type="date" label="End" InputLabelProps={{ shrink: true }} value={form.endDate} onChange={(e) => handleEndDateChange(e.target.value)} />
            </Grid>
          </Grid>
          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, fontWeight: 800 }}>Subjects & Schedule</Typography>
          {form.subjects.map((row, idx) => (
            <Paper variant="outlined" key={idx} sx={{ p: 2, mb: 2, borderRadius: 3, bgcolor: "background.default" }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <TextField select fullWidth size="small" label="Subject" value={row.subjectId} onChange={(e) => updateSubjectRow(idx, "subjectId", e.target.value)}>
                    {subjects.map((s) => <MenuItem key={s.id} value={s.id}>{s.subjectName}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField select fullWidth size="small" label="Teacher" value={row.teacherId} onChange={(e) => updateSubjectRow(idx, "teacherId", e.target.value)}>
                    <MenuItem value="">—</MenuItem>
                    {teachers.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField fullWidth size="small" type="date" label="Exam Date" InputLabelProps={{ shrink: true }} inputProps={{ min: form.startDate, max: form.endDate }} value={row.examDate} onChange={(e) => updateSubjectRow(idx, "examDate", e.target.value)} />
                </Grid>
                <Grid item xs={6} sm={3} md={1}>
                  <TextField fullWidth size="small" label="Start" value={row.startTime} onChange={(e) => updateSubjectRow(idx, "startTime", e.target.value)} />
                </Grid>
                <Grid item xs={6} sm={3} md={1}>
                  <TextField fullWidth size="small" label="End" value={row.endTime} onChange={(e) => updateSubjectRow(idx, "endTime", e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField fullWidth size="small" label="Room" value={row.roomNumber} onChange={(e) => updateSubjectRow(idx, "roomNumber", e.target.value)} />
                </Grid>
                
                {/* Standardized configured marks inputs */}
                <Grid item xs={6} sm={4} md={2}>
                  <TextField fullWidth size="small" type="number" label="Total Marks" value={row.totalMarks ?? row.maxMarks ?? 100} onChange={(e) => {
                    updateSubjectRow(idx, "totalMarks", Number(e.target.value));
                    updateSubjectRow(idx, "maxMarks", Number(e.target.value));
                  }} />
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <TextField fullWidth size="small" type="number" label="Pass Marks" value={row.passMarks ?? 35} onChange={(e) => updateSubjectRow(idx, "passMarks", Number(e.target.value))} />
                </Grid>
                <Grid item xs={12} sm={4} md={8} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => removeSubjectRow(idx)} disabled={form.subjects.length <= 1}>
                    Remove Subject
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          ))}
          <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => setForm((p) => ({ ...p, subjects: [...p.subjects, { ...emptyExam.subjects[0] }] }))} sx={{ borderRadius: 2 }}>
            Add Subject
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={notifyOpen} onClose={() => setNotifyOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Exam Announcement</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="dense" label="Title" value={notifyForm.title} onChange={(e) => setNotifyForm({ ...notifyForm, title: e.target.value })} />
          <TextField fullWidth margin="dense" multiline rows={3} label="Message" value={notifyForm.message} onChange={(e) => setNotifyForm({ ...notifyForm, message: e.target.value })} />
          <TextField select fullWidth margin="dense" label="Target" value={notifyForm.targetRole} onChange={(e) => setNotifyForm({ ...notifyForm, targetRole: e.target.value })}>
            <MenuItem value="ALL">Everyone</MenuItem>
            <MenuItem value="STUDENT">Students</MenuItem>
            <MenuItem value="TEACHER">Teachers</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotifyOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={sendNotification}>Send</Button>
        </DialogActions>
      </Dialog>

      {/* ⚠️ DELETE EXAM CUSTOM MODAL */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => !deletingExam && setConfirmDeleteOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(6px)",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
            },
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1.5,
          },
        }}
      >
        <DialogContent sx={{ textAlign: "center", pt: 3 }}>
          <WarningAmberIcon sx={{ fontSize: 60, color: "error.main", mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Delete Exam?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
            Are you sure you want to delete the exam{" "}
            <strong>{examToDelete?.examName}</strong>? All subject configurations, timetables, and unsubmitted marks will be permanently lost. This action is irreversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setConfirmDeleteOpen(false)}
            disabled={deletingExam}
            sx={{ borderRadius: 2.5, px: 3, textTransform: "none", fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={executeDelete}
            disabled={deletingExam}
            startIcon={deletingExam && <CircularProgress size={16} color="inherit" />}
            sx={{ borderRadius: 2.5, px: 3, textTransform: "none", fontWeight: 700 }}
          >
            {deletingExam ? "Deleting..." : "Delete Exam"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 📢 PUBLISH RESULTS CUSTOM MODAL */}
      <Dialog
        open={confirmPublishOpen}
        onClose={() => !publishingExam && setConfirmPublishOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(6px)",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
            },
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1.5,
          },
        }}
      >
        <DialogContent sx={{ textAlign: "center", pt: 3 }}>
          <CheckCircleOutlinedIcon sx={{ fontSize: 60, color: "success.main", mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Publish Results?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
            Are you sure you want to publish the results for exam{" "}
            <strong>{examToPublish?.examName}</strong>? Students and teachers will receive notifications and will be able to view their final calculated semester grades immediately.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setConfirmPublishOpen(false)}
            disabled={publishingExam}
            sx={{ borderRadius: 2.5, px: 3, textTransform: "none", fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={executePublish}
            disabled={publishingExam}
            startIcon={publishingExam && <CircularProgress size={16} color="inherit" />}
            sx={{ borderRadius: 2.5, px: 3, textTransform: "none", fontWeight: 700 }}
          >
            {publishingExam ? "Publishing..." : "Publish Results"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminExamManagement;
