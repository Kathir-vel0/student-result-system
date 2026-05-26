import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

import { useToast } from "../components/ToastProvider";

const digitWords = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

const convertMarksToWords = (marks) => {
  if (marks === null || marks === undefined || marks === "") return "";
  const marksStr = String(marks);
  return marksStr.split('').map(char => {
    if (char >= '0' && char <= '9') {
      return digitWords[parseInt(char)];
    }
    return char;
  }).join(' ');
};

const calculateGrade = (marks) => {
  if (marks === null || marks === undefined || marks === "") return "";
  const numericMarks = parseFloat(marks);
  if (isNaN(numericMarks)) return "";
  if (numericMarks >= 90) return "A+";
  if (numericMarks >= 80) return "A";
  if (numericMarks >= 70) return "B";
  if (numericMarks >= 60) return "C";
  if (numericMarks >= 50) return "D";
  return "F";
};

function AddResult() {
  const { showToast } = useToast();
  const role = localStorage.getItem("role");
  
  const [subjects, setSubjects] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSubjectCode, setSelectedSubjectCode] = useState("");
  const [selectedClassName, setSelectedClassName] = useState("");

  const [studentsForClass, setStudentsForClass] = useState([]);
  const [entries, setEntries] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Students
        const studentRes = await API.get("/students");
        if (!cancelled) setAllStudents(studentRes.data || []);

        // 2. Fetch Subjects based on role
        const currentRole = localStorage.getItem("role");
        if (currentRole === "TEACHER") {
          const subjectsRes = await API.get("/teachers/subjects");
          const teacherSubjects = subjectsRes.data || [];
          if (!cancelled) {
            setSubjects(teacherSubjects);
            // Case A: If exactly 1 subject is assigned, automatically select it!
            if (teacherSubjects.length === 1) {
              setSelectedSubjectCode(teacherSubjects[0].subjectCode);
            }
          }
        } else {
          const allSubjectsRes = await API.get("/subjects/all");
          if (!cancelled) setSubjects(allSubjectsRes.data || []);
        }
      } catch (err) {
        console.error("Error loading resources:", err);
        showToast("Error loading required database fields.", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const classOptions = useMemo(() => {
    const set = new Set();
    for (const s of allStudents) {
      if (s?.className) set.add(String(s.className));
    }
    return Array.from(set).sort();
  }, [allStudents]);

  const handleSearch = () => {
    if (!selectedSubjectCode) {
      showToast("Please select a subject first.", "error");
      return;
    }
    if (!selectedClassName) {
      showToast("Please select a class.", "error");
      return;
    }

    const filtered = allStudents.filter(
      (s) => String(s?.className || "") === String(selectedClassName)
    );

    setStudentsForClass(filtered);

    // Initialize/keep per-student form entries
    setEntries((prev) => {
      const next = {};
      for (const s of filtered) {
        const sid = s.studentId;
        next[sid] = prev[sid] || { marks: "", grade: "", comment: "", marksInWords: "" };
      }
      return next;
    });
  };

  const handleEntryChange = (studentId, field) => (e) => {
    const value = e.target.value;
    setEntries((prev) => {
      const studentData = prev[studentId] || { marks: "", grade: "", comment: "", marksInWords: "" };
      const updatedData = { ...studentData, [field]: value };
      
      if (field === "marks") {
        updatedData.grade = calculateGrade(value);
        updatedData.marksInWords = convertMarksToWords(value);
      }
      
      return {
        ...prev,
        [studentId]: updatedData,
      };
    });
  };

  const handleSave = async () => {
    if (!selectedSubjectCode || !selectedClassName) {
      showToast("Please select subject and class first.", "error");
      return;
    }
    if (studentsForClass.length === 0) {
      showToast("No student roster found to save. Please search again.", "error");
      return;
    }

    const missingMarks = studentsForClass.filter((s) => {
      const sid = s.studentId;
      const marks = entries?.[sid]?.marks;
      return marks === undefined || marks === null || String(marks).trim() === "";
    });

    if (missingMarks.length > 0) {
      showToast("Please enter marks for all students before saving.", "error");
      return;
    }

    setSaving(true);
    try {
      for (const s of studentsForClass) {
        const sid = s.studentId;
        const entry = entries?.[sid] || {};
        const payload = {
          studentId: sid,
          subjectCode: selectedSubjectCode,
          marks: entry.marks,
          grade: entry.grade,
          comment: entry.comment,
        };
        await API.post("/results/add", payload);
      }

      showToast("All results saved successfully!", "success");
      setEntries({});
      setStudentsForClass([]);
      setSelectedClassName("");
      if (subjects.length > 1 || role !== "TEACHER") {
        setSelectedSubjectCode("");
      }
    } catch (err) {
      console.error(err);
      showToast("Error saving grades database", "error");
    } finally {
      setSaving(false);
    }
  };

  // 🔹 Render Subject Selector according to Cases A, B, and C
  const renderSubjectSelector = () => {
    // Case C: No subjects assigned
    if (subjects.length === 0) {
      return (
        <TextField
          fullWidth
          disabled
          label="Subject Specialization"
          value="No subjects assigned by admin"
          error
          helperText="⚠️ You cannot input marks until an admin assigns you a subject profile."
        />
      );
    }

    // Case A: Exactly 1 subject assigned -> Auto-selected, disabled/readonly view
    if (subjects.length === 1 && role === "TEACHER") {
      const singleSub = subjects[0];
      return (
        <TextField
          fullWidth
          disabled
          label="Assigned Subject"
          value={`${singleSub.subjectCode} - ${singleSub.subjectName || singleSub.name}`}
          helperText="Auto-Selected (Single Subject Assigned)"
        />
      );
    }

    // Case B: Multiple subjects assigned (or ADMIN user) -> Show dynamic select dropdown
    return (
      <TextField
        select
        fullWidth
        required
        label="Select Subject"
        value={selectedSubjectCode}
        onChange={(e) => setSelectedSubjectCode(e.target.value)}
      >
        <MenuItem value="">
          <em>Select Subject</em>
        </MenuItem>
        {subjects.map((sub) => (
          <MenuItem key={sub.id} value={sub.subjectCode}>
            {sub.subjectCode} - {sub.subjectName || sub.name}
          </MenuItem>
        ))}
      </TextField>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
        Add Marks
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Officially register marks, grades, and comments for students in your assigned classes.
      </Typography>

      {/* Filter Card */}
      <Paper sx={{ p: 4, borderRadius: 4, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          
          <Grid item xs={12} md={6}>
            {renderSubjectSelector()}
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              required
              disabled={subjects.length === 0}
              label="Select Class"
              value={selectedClassName}
              onChange={(e) => setSelectedClassName(e.target.value)}
            >
              <MenuItem value="">
                <em>Select Class</em>
              </MenuItem>
              {classOptions.map((c) => (
                <MenuItem key={c} value={c}>
                  Class {c}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={subjects.length === 0 || !selectedClassName}
              sx={{ borderRadius: 3, py: 1.5, px: 4, fontWeight: "bold", width: "100%" }}
            >
              Search Students
            </Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving || studentsForClass.length === 0}
                color="success"
                sx={{ borderRadius: 3, py: 1.5, px: 4, fontWeight: "bold", width: "100%" }}
              >
                {saving ? "Saving Grades..." : "Save All Marks"}
              </Button>
            </Box>
          </Grid>

        </Grid>
      </Paper>

      {/* Students Table */}
      {studentsForClass.length === 0 ? (
        <Paper sx={{ p: 4, borderRadius: 4, textAlign: "center" }}>
          {subjects.length === 0 ? (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              You do not have any subjects assigned to your profile by the system administrator. Marks entry is disabled.
            </Alert>
          ) : (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              Select an assigned subject and class, then click <strong>Search Students</strong> to load the class roster.
            </Typography>
          )}
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 4,
            overflowX: "auto",
            maxWidth: "100%",
            WebkitOverflowScrolling: "touch",
            boxShadow: "0 10px 30px rgba(0,0,0,0.02)"
          }}
        >
          <Table size="medium" aria-label="students marks roster" sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: "action.hover" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900 }}>Student details</TableCell>
                <TableCell sx={{ fontWeight: 900, width: 150 }}>Marks (0-100)</TableCell>
                <TableCell sx={{ fontWeight: 900, width: 200 }}>Marks in Words</TableCell>
                <TableCell sx={{ fontWeight: 900, width: 130 }}>Auto Grade</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Comment / Feedback</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {studentsForClass.map((s) => {
                const sid = s.studentId;
                const row = entries?.[sid] || {};
                return (
                  <TableRow key={sid} hover>
                    
                    <TableCell>
                      <Box sx={{ py: 0.5 }}>
                        <Typography sx={{ fontWeight: 800, color: "text.primary" }}>
                          {s.name || "N/A"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          ID: {s.studentId} | Class {s.className || "—"} {s.section || "—"}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <TextField
                        fullWidth
                        type="number"
                        placeholder="Marks"
                        value={row.marks ?? ""}
                        onChange={handleEntryChange(sid, "marks")}
                        inputProps={{ min: 0, max: 100 }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ color: "text.secondary", fontStyle: "italic", textTransform: "capitalize", fontSize: "0.875rem" }}>
                        {row.marksInWords || convertMarksToWords(row.marks) || "—"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <TextField
                        fullWidth
                        disabled
                        value={row.grade ?? ""}
                        placeholder="Grade"
                      />
                    </TableCell>

                    <TableCell>
                      <TextField
                        fullWidth
                        placeholder="e.g. Excellent progress"
                        value={row.comment ?? ""}
                        onChange={handleEntryChange(sid, "comment")}
                      />
                    </TableCell>

                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default AddResult;