import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useToast } from "../components/ToastProvider";
import ListToolbar from "../components/common/ListToolbar";
import PaginationControls from "../components/common/PaginationControls";
import usePaginatedList from "../hooks/usePaginatedList";

const STATUS_COLORS = {
  PRESENT: "success",
  ABSENT: "error",
  LATE: "warning",
};

function AttendanceManagement() {
  const role = localStorage.getItem("role");
  const studentId = localStorage.getItem("studentId");
  const { showToast } = useToast();

  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [bulkStatus, setBulkStatus] = useState({});
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const paginated = usePaginatedList("/attendance/page", {
    defaultSize: 10,
    extraParams: { className: "", date: "", status: "", search: "" },
  });

  useEffect(() => {
    if (role === "STUDENT" && studentId) {
      setHistoryLoading(true);
      Promise.all([
        API.get(`/attendance/student/${studentId}/summary`),
        API.get(`/attendance/student/${studentId}`),
      ])
        .then(([sumRes, histRes]) => {
          setSummary(sumRes.data);
          setHistory(histRes.data || []);
        })
        .catch(console.error)
        .finally(() => setHistoryLoading(false));
      return;
    }

    API.get("/students")
      .then((res) => setStudents(res.data || []))
      .catch(console.error);
  }, [role, studentId]);

  const classes = useMemo(() => {
    const set = new Set(students.map((s) => s.className).filter(Boolean));
    return Array.from(set).sort();
  }, [students]);

  const classStudents = useMemo(
    () => students.filter((s) => !selectedClass || s.className === selectedClass),
    [students, selectedClass]
  );

  const handleBulkSave = async () => {
    if (!selectedClass) {
      showToast("Select a class first.", "warning");
      return;
    }
    setSaving(true);
    try {
      const entries = classStudents.map((s) => ({
        studentId: s.studentId,
        status: bulkStatus[s.studentId] || "PRESENT",
      }));
      await API.post("/attendance/bulk", { date: selectedDate, entries });
      showToast("Attendance saved successfully.", "success");
      paginated.refresh();
    } catch (err) {
      console.error(err);
      showToast("Failed to save attendance.", "error");
    } finally {
      setSaving(false);
    }
  };

  const setAllStatus = (status) => {
    const next = {};
    classStudents.forEach((s) => {
      next[s.studentId] = status;
    });
    setBulkStatus(next);
  };

  if (role === "STUDENT") {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 3 }}>
          My Attendance
        </Typography>
        {historyLoading ? (
          <CircularProgress />
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ borderRadius: 4 }}>
                  <CardContent>
                    <Typography color="text.secondary" sx={{ fontWeight: 800 }}>
                      Attendance %
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: "primary.main" }}>
                      {summary?.percentage ?? 0}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Card sx={{ borderRadius: 4 }}>
                  <CardContent>
                    <Typography color="text.secondary" sx={{ fontWeight: 800 }}>
                      Present Days
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900 }}>
                      {summary?.presentDays ?? 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Card sx={{ borderRadius: 4 }}>
                  <CardContent>
                    <Typography color="text.secondary" sx={{ fontWeight: 800 }}>
                      Total Days
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900 }}>
                      {summary?.totalDays ?? 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Paper sx={{ borderRadius: 4, overflow: "hidden" }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Marked By</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No attendance records yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      history.map((a) => (
                        <TableRow key={a.id} hover>
                          <TableCell>{a.date}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={a.status}
                              color={STATUS_COLORS[a.status] || "default"}
                              sx={{ fontWeight: 800 }}
                            />
                          </TableCell>
                          <TableCell>{a.markedBy}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
        Attendance Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Mark daily attendance and review class reports.
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 4, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
          Bulk Mark — {selectedDate}
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <MenuItem value="">Select class</MenuItem>
              {classes.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Date"
              InputLabelProps={{ shrink: true }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button size="small" onClick={() => setAllStatus("PRESENT")}>
              All Present
            </Button>
            <Button size="small" color="error" onClick={() => setAllStatus("ABSENT")}>
              All Absent
            </Button>
            <Button variant="contained" disabled={saving} onClick={handleBulkSave} sx={{ fontWeight: 800 }}>
              {saving ? "Saving..." : "Save Attendance"}
            </Button>
          </Grid>
        </Grid>

        {selectedClass && (
          <TableContainer sx={{ maxHeight: 360 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classStudents.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.studentId}</TableCell>
                    <TableCell>
                      <ToggleButtonGroup
                        exclusive
                        size="small"
                        value={bulkStatus[s.studentId] || "PRESENT"}
                        onChange={(_, val) => {
                          if (val) setBulkStatus((prev) => ({ ...prev, [s.studentId]: val }));
                        }}
                      >
                        <ToggleButton value="PRESENT">P</ToggleButton>
                        <ToggleButton value="ABSENT">A</ToggleButton>
                        <ToggleButton value="LATE">L</ToggleButton>
                      </ToggleButtonGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
        Attendance Records
      </Typography>

      <ListToolbar
        search={paginated.filters.search}
        onSearchChange={(v) => paginated.updateFilter("search", v)}
        onSearch={() => paginated.setPage(0)}
        onReset={paginated.resetFilters}
      >
        <Grid item xs={6} md={2}>
          <TextField
            select
            fullWidth
            size="small"
            label="Class"
            value={paginated.filters.className || ""}
            onChange={(e) => paginated.updateFilter("className", e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {classes.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={6} md={2}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Date"
            InputLabelProps={{ shrink: true }}
            value={paginated.filters.date || ""}
            onChange={(e) => paginated.updateFilter("date", e.target.value)}
          />
        </Grid>
      </ListToolbar>

      {paginated.loading ? (
        <CircularProgress />
      ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Class</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.data.map((a) => (
                    <TableRow key={a.id} hover>
                      <TableCell>{a.date}</TableCell>
                      <TableCell>{a.student?.name || "—"}</TableCell>
                      <TableCell>{a.className}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={a.status}
                          color={STATUS_COLORS[a.status] || "default"}
                          sx={{ fontWeight: 800 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <PaginationControls
            page={paginated.page}
            totalPages={paginated.totalPages}
            totalElements={paginated.totalElements}
            size={paginated.size}
            onPageChange={paginated.setPage}
            onSizeChange={(s) => {
              paginated.setSize(s);
              paginated.setPage(0);
            }}
          />
        </>
      )}
    </Box>
  );
}

export default AttendanceManagement;
