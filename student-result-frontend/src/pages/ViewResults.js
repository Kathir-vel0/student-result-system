import { useEffect, useMemo, useState } from "react";
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

function ViewResults() {
  const { showToast } = useToast();
  const [allResults, setAllResults] = useState([]);
  const [results, setResults] = useState([]);

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Publish dialog state
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [resultsRes, studentsRes] = await Promise.all([
          API.get("/results/all"),
          API.get("/students"),
        ]);

        if (cancelled) return;

        setAllResults(resultsRes.data || []);

        const classSet = new Set();
        for (const s of studentsRes.data || []) {
          if (s?.className) classSet.add(String(s.className));
        }
        const classList = Array.from(classSet).sort();
        setClasses(classList);
      } catch (err) {
        console.error("ERROR:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const gradeToChip = (grade) => {
    const g = String(grade || "").toUpperCase();
    if (g === "A") return { label: g || "N/A", color: "success" };
    if (g === "B") return { label: g || "N/A", color: "primary" };
    if (g === "C") return { label: g || "N/A", color: "warning" };
    if (g === "D") return { label: g || "N/A", color: "error" };
    return { label: g || "N/A", color: "default" };
  };

  const handleSearch = () => {
    if (!selectedClass) {
      setResults([]);
      setSearched(true);
      return;
    }

    const filtered = allResults.filter(
      (r) => String(r?.student?.className || "") === String(selectedClass)
    );
    setResults(filtered);
    setSearched(true);
  };

  const handleViewSubjects = (studentData) => {
    setSelectedStudent(studentData);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedStudent(null);
  };

  const groupedToPublishPayload = () => {
    // Backend can generate the PDF + email based on this structure.
    return groupedStudents.map((data) => {
      const student = data.student || {};
      const studentId = student?.studentId || student?.id;
      const studentEmail = student?.email || student?.user?.email;
      const studentName = student?.name || student?.user?.name || "Student";

      return {
        studentId,
        studentEmail,
        studentName,
        totalMarks: data.totalMarks,
        subjectMarks: data.results.map((r) => ({
          subjectCode: r?.subject?.subjectCode,
          subjectName: r?.subject?.subjectName,
          marks: r?.marks,
          grade: r?.grade,
          comments: r?.comments,
        })),
      };
    });
  };

  const handlePublish = async () => {
    if (!selectedClass) {
      showToast("Please select a class first.", "error");
      return;
    }
    if (!groupedStudents.length) {
      showToast("No student results found to publish.", "error");
      return;
    }

    setPublishing(true);
    try {
      // NOTE: Actual email + PDF generation must be done by backend.
      const res = await API.post("/results/publish", {
        className: selectedClass,
        students: groupedToPublishPayload(),
      });

      const successCount = Number(res?.data?.success || 0);
      const failedCount = Number(res?.data?.failed || 0);
      const totalAttempted = Number(res?.data?.totalAttempted || groupedStudents.length);

      if (failedCount === 0 && successCount > 0) {
        showToast(
          `Results published. Emails sent to ${successCount}/${totalAttempted} student(s).`,
          "success"
        );
        setPublishOpen(false);
      } else if (successCount > 0 && failedCount > 0) {
        showToast(
          `Partial publish: ${successCount} sent, ${failedCount} failed. Check backend logs/errors.`,
          "warning"
        );
      } else {
        const firstError =
          Array.isArray(res?.data?.errors) && res.data.errors.length > 0
            ? res.data.errors[0]
            : res?.data?.firstError;
        const msg =
          firstError ||
          res?.data?.message ||
          "No emails were sent.";
        showToast(msg, "error");
      }
    } catch (err) {
      console.error(err);
      const data = err?.response?.data;
      const successCount = Number(data?.success || 0);
      const failedCount = Number(data?.failed || 0);
      const firstError =
        Array.isArray(data?.errors) && data.errors.length > 0
          ? data.errors[0]
          : data?.firstError;
      const serverMsg = firstError || data?.message;

      if (successCount > 0 && failedCount > 0) {
        showToast(
          `Partial publish: ${successCount} sent, ${failedCount} failed. Check backend logs/errors.`,
          "warning"
        );
      } else {
        showToast(serverMsg || "Failed to publish results. Please try again.", "error");
      }
    } finally {
      setPublishing(false);
    }
  };

  // Group results by student
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
          count: 0,
        };
      }
      map[sId].results.push(r);
      const m = Number(r.marks);
      if (!isNaN(m)) {
        map[sId].totalMarks += m;
      }
      map[sId].count += 1;
    });

    return Object.values(map);
  }, [results]);

  const filteredCount = groupedStudents.length;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
        Student Results
      </Typography>

      {/* Filter bar */}
      <Paper sx={{ p: 2.5, borderRadius: 4, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="">
                <em>Select class</em>
              </MenuItem>
              {classes.map((c) => (
                <MenuItem key={c} value={c}>
                  Class {c}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{ borderRadius: 3, px: 3, py: 1.25, width: "100%" }}
              disabled={loading}
            >
              Search
            </Button>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" }, mt: { xs: 1, md: 0 } }}>
              {loading ? (
                <CircularProgress size={22} />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {searched ? `${filteredCount} student(s)` : "Select class and search"}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Publish */}
      {searched && groupedStudents.length > 0 && (
        <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ borderRadius: 3 }}
            onClick={() => setPublishOpen(true)}
            disabled={publishing || loading}
          >
            {publishing ? "Publishing..." : "Publish Results"}
          </Button>
        </Box>
      )}

      {/* Results */}
      {!searched ? (
        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">
            Select a class and click Search to view results.
          </Typography>
        </Paper>
      ) : groupedStudents.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">
            No results found for this class.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
          <Table size="small" aria-label="results table">
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: 900 }}>
                  Student Name
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900 }}>
                  Total Percentage
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 900 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {groupedStudents.map((data, index) => {
                const percentage = data.count > 0 ? (data.totalMarks / data.count).toFixed(2) : 0;
                return (
                  <TableRow
                    key={index}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell align="center">
                      {data.student?.name || "N/A"}
                    </TableCell>
                    <TableCell align="center">
                      {percentage}%
                    </TableCell>
                    <TableCell align="center">
                      <Button variant="outlined" size="small" onClick={() => handleViewSubjects(data)}>
                        View Marks
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Publish confirm dialog */}
      <Dialog
        open={publishOpen}
        onClose={() => (!publishing ? setPublishOpen(false) : null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Publish & Send Emails</DialogTitle>
        <DialogContent dividers>
          <Typography color="text.secondary">
            This will email marksheets (PDF) to all students in <b>{selectedClass}</b>.
            Please confirm.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPublishOpen(false)}
            disabled={publishing}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePublish}
            disabled={publishing}
          >
            Send Emails
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subjects Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>
          {selectedStudent?.student?.name}'s Subject Marks
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Subject Code</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Marks</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Grade</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Comments</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedStudent?.results.map((r, i) => {
                  const chip = gradeToChip(r.grade);
                  return (
                    <TableRow key={i}>
                      <TableCell>{r.subject?.subjectCode || "N/A"}</TableCell>
                      <TableCell>{r.marks}</TableCell>
                      <TableCell>
                        <Chip label={chip.label} color={chip.color} size="small" sx={{ fontWeight: 900 }} />
                      </TableCell>
                      <TableCell>{r.comments}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Close</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default ViewResults;